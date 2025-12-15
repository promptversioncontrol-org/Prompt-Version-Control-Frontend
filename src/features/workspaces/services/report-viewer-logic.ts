import {
  ReportSession,
  TimelineItem,
  SessionAnalysis,
  ToolCall,
  TokenPoint,
  FileEdit,
  ConversationItem,
  TurnContextInfo,
  TokenUsage,
} from '../types/report-viewer.types';

export function analyzeSession(session: ReportSession): SessionAnalysis {
  type EventPayload = {
    type?: string;
    message?: string;
    text?: string;
    role?: string;
    content?: { text: string }[];
    name?: string;
    call_id?: string;
    input?: string;
    arguments?: string;
    rate_limits?: unknown;
    info?: {
      total_token_usage?: { total_tokens: number };
      last_token_usage?: unknown;
      model_context_window?: number;
    };
    summary?: { text: string }[];
    ghost_commit?: { id: string };
    output?: string;
    [key: string]: unknown;
  };

  const timeline: TimelineItem[] = [];
  const conversation: ConversationItem[] = [];
  const events = session.events || [];

  // Counters & Accumulators
  let totalTokens = 0;
  const modelCounts: Record<string, number> = {};
  const tokenPoints: TokenPoint[] = [];
  const toolCalls: ToolCall[] = [];
  const fileEdits: FileEdit[] = [];
  const turnContexts: unknown[] = [];
  let sessionMeta: unknown = null;
  let rateLimits: unknown = null;
  let maxContextWindow = 0;

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    return (
      new Date(a.timestamp || 0).getTime() -
      new Date(b.timestamp || 0).getTime()
    );
  });

  sortedEvents.forEach((evt, index) => {
    const tsMs = new Date(evt.timestamp || 0).getTime();
    const key = `${evt.type}-${index}`;

    let timelineItem: TimelineItem | null = {
      key,
      tsMs,
      category: 'other',
      title: evt.type,
      raw: evt,
    };

    switch (evt.type) {
      case 'session_meta':
        sessionMeta = evt.payload as unknown as Record<string, unknown>;
        timelineItem.category = 'meta';
        timelineItem.title = 'Session Started';
        timelineItem.subtitle = (evt.payload as Record<string, unknown>)
          ?.originator as string;
        break;

      case 'turn_context': {
        turnContexts.push({
          tsMs,
          ...(evt.payload as Record<string, unknown>),
        } as TurnContextInfo);
        const model = (evt.payload as Record<string, unknown>)?.model as string;
        if (model) {
          modelCounts[model] = (modelCounts[model] || 0) + 1;
        }
        timelineItem.category = 'meta';
        timelineItem.title = 'Context Update';
        timelineItem.subtitle = model;
        break;
      }

      case 'event_msg': {
        const p = evt.payload as EventPayload;
        if (p?.type === 'user_message') {
          timelineItem.category = 'messages';
          timelineItem.title = 'User Message';
          timelineItem.preview = p.message;
          conversation.push({
            key,
            tsMs,
            role: 'user',
            text: p.message || '',
            source: 'events',
          });
        } else if (p?.type === 'agent_message') {
          timelineItem.category = 'messages';
          timelineItem.title = 'Agent Message';
          timelineItem.preview = p.message;
          conversation.push({
            key,
            tsMs,
            role: 'assistant',
            text: p.message || '',
            source: 'events',
          });
        } else if (p?.type === 'agent_reasoning') {
          timelineItem.category = 'reasoning';
          timelineItem.title = 'Thinking...';
          timelineItem.preview = p.text;
          conversation.push({
            key,
            tsMs,
            role: 'reasoning',
            text: p.text || '',
            source: 'events',
          });
        } else if (p?.type === 'token_count') {
          timelineItem.category = 'tokens';
          timelineItem.title = 'Token Usage';
          rateLimits = p.rate_limits;

          const info = p.info || {};
          const total = info.total_token_usage;
          const last = info.last_token_usage;

          if (total?.total_tokens && total.total_tokens > totalTokens)
            totalTokens = total.total_tokens;
          if (
            info.model_context_window &&
            info.model_context_window > maxContextWindow
          )
            maxContextWindow = info.model_context_window;

          if (total?.total_tokens) {
            tokenPoints.push({
              tsMs,
              total: total as TokenUsage,
              last: (last as TokenUsage) || {},
              modelContextWindow: info.model_context_window,
            });
          }

          timelineItem = null; // Don't spam timeline with token updates
        }
        break;
      }

      case 'response_item': {
        const p = evt.payload as EventPayload;
        if (p?.type === 'message') {
          if (p.role === 'user') {
            const txt = p.content?.map((c) => c.text).join('\n') || '';
            timelineItem.category = 'messages';
            timelineItem.title = 'User Input';
            timelineItem.preview = txt;
            // Deduplicate if event_msg already captured it
          } else if (p.role === 'assistant') {
            const txt = p.content?.map((c) => c.text).join('\n') || '';
            timelineItem.category = 'messages';
            timelineItem.title = 'Assistant Response';
            timelineItem.preview = txt;
          }
        } else if (
          p?.type === 'function_call' ||
          p?.type === 'custom_tool_call'
        ) {
          timelineItem.category = 'tools';
          timelineItem.title = `Used Tool: ${p.name}`;
          timelineItem.subtitle = p.call_id;

          toolCalls.push({
            kind: p.type as 'function_call' | 'custom_tool_call',
            callId: p.call_id || '',
            name: p.name || '',
            tsMs: tsMs, // Approximate
            status: 'called',
            input: p.input || p.arguments,
          });
        } else if (
          p?.type === 'function_call_output' ||
          p?.type === 'custom_tool_call_output'
        ) {
          timelineItem.category = 'tools';
          timelineItem.title = 'Tool Output';
          timelineItem.subtitle = p.call_id;

          // Find existing call to update
          const existing = toolCalls.find((t) => t.callId === p.call_id);
          if (existing) {
            existing.outputRaw = p.output;
            existing.status = 'completed';
          }
        } else if (p?.type === 'ghost_snapshot') {
          timelineItem.category = 'files';
          timelineItem.title = 'File Snapshot';
          timelineItem.subtitle = `Ghost Commit: ${p.ghost_commit?.id?.slice(0, 8)}`;

          // In a real implementation we would parse diffs here
          // For now just track it
          fileEdits.push({
            timestamp: evt.timestamp,
            isNewFile: false, // simplified
            path: 'Multiple files (snapshot)',
          });
        } else if (p?.type === 'reasoning') {
          const txt = p.summary?.map((s) => s.text).join('\n');
          if (txt) {
            timelineItem.category = 'reasoning';
            timelineItem.title = 'Reasoning';
            timelineItem.preview = txt;
          }
        }
        break;
      }
    }

    if (timelineItem) {
      timeline.push(timelineItem);
    }
  });

  // Sort logic for token points
  tokenPoints.sort((a, b) => a.tsMs - b.tsMs);

  return {
    sessionMeta,
    turnContexts,
    models: Object.entries(modelCounts).map(([name, count]) => ({
      name,
      count,
    })),
    tokenPoints,
    lastTokenTotal: tokenPoints.length
      ? tokenPoints[tokenPoints.length - 1].total
      : undefined,
    maxModelContextWindow: maxContextWindow,
    rateLimits,
    toolCalls,
    timeline,
    conversation,
    fileEdits,
  };
}
