export type ReportMeta = {
  ok?: boolean;
  userId?: string;
  workspaceName?: string;
  date?: string;
};

export type ReportEvent = {
  timestamp?: string;
  type: string;
  payload?: unknown; // Changed from any to unknown for safety
  findings?: unknown[];
};

export type TextSnippet = {
  timestamp?: string;
  text?: string;
};

export type FileEdit = {
  timestamp?: string;
  path?: string;
  oldContent?: string;
  newContent?: string;
  isNewFile?: boolean;
};

export type ReportSession = {
  sessionId: string;
  cwd?: string;
  generatedAt?: string;
  events: ReportEvent[];
  userPrompts?: TextSnippet[];
  assistantMessages?: TextSnippet[];
  reasonings?: TextSnippet[];
  patches?: TextSnippet[];
  shellCommands?: TextSnippet[];
  fileEdits?: FileEdit[];
};

export type NormalizedReport = {
  meta: ReportMeta;
  updates: ReportSession[];
  format: 'wrapped' | 'bare' | 'unknown';
};

export type TokenUsage = {
  input_tokens?: number;
  cached_input_tokens?: number;
  output_tokens?: number;
  reasoning_output_tokens?: number;
  total_tokens?: number;
};

export type TokenPoint = {
  tsMs: number;
  total: TokenUsage;
  last: TokenUsage;
  modelContextWindow?: number;
};

export type ToolCall = {
  kind: 'function_call' | 'custom_tool_call';
  callId: string;
  name: string;
  tsMs: number;
  status?: string;
  argumentsRaw?: string;
  argumentsParsed?: unknown;
  input?: string;
  outputRaw?: string;
  outputParsed?: unknown;
};

export type TimelineCategory =
  | 'all'
  | 'messages'
  | 'reasoning'
  | 'tools'
  | 'tokens'
  | 'meta'
  | 'files'
  | 'other';

export type TimelineItem = {
  key: string;
  tsMs: number;
  category: TimelineCategory;
  title: string;
  subtitle?: string;
  preview?: string;
  raw: ReportEvent;
};

export type TurnContextInfo = {
  tsMs: number;
  cwd?: string;
  approvalPolicy?: string;
  sandboxPolicy?: string;
  model?: string;
  effort?: string;
  summary?: string;
};

export type ModelStat = {
  name: string;
  count: number;
};

export type ConversationItem = {
  key: string;
  tsMs: number;
  role: 'user' | 'assistant' | 'reasoning';
  text: string;
  source: 'session' | 'events';
  model?: string;
};

export type SessionAnalysis = {
  sessionMeta?: Record<string, unknown>;
  turnContexts: TurnContextInfo[];
  models: ModelStat[];
  tokenPoints: TokenPoint[];
  lastTokenTotal?: TokenUsage;
  maxModelContextWindow?: number;
  rateLimits?: unknown;
  toolCalls: ToolCall[];
  timeline: TimelineItem[];
  conversation: ConversationItem[];
  fileEdits: FileEdit[];
};
