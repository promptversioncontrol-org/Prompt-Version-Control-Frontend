export interface ReportFinding {
  type: string;
  message: string;
  severity: string;
  ruleId: string;
  snippet?: string;
}

export interface SessionEventPayload {
  // Common fields loosely typed to avoid 'any' but cover various event types
  type?: string;
  role?: string;
  message?: string;
  text?: string;
  content?: Array<{ text: string }>;
  summary?: Array<{ text: string }>;

  // Meta / Context
  model_provider?: string;
  source?: string;
  cli_version?: string;
  cwd?: string;

  // Turn Context
  model?: string;
  sandbox_policy?: { type: string };
  effort?: string;
  approval_policy?: string;

  // Ghost Snapshot
  ghost_commit?: {
    id: string;
    parent: string;
    preexisting_untracked_files?: string[];
  };

  // Token Usage / Rate Limits
  info?: {
    total_token_usage?: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
    };
  };
  rate_limits?: {
    primary?: {
      used_percent: number;
      resets_at: number;
    };
    credits?: {
      balance: number;
      has_credits: boolean;
    };
  };

  [key: string]: unknown; // Allow other properties but force checking
}

export interface SessionEvent {
  type: string;
  timestamp: string;
  payload: SessionEventPayload;
  findings?: ReportFinding[];
}

export interface ReportSession {
  sessionId: string;
  generatedAt: string;
  cwd?: string;
  events: SessionEvent[];
}

// The root data structure can be just the updates array or wrapped
export interface ReportDataContent {
  updates: ReportSession[];
}

export interface WorkspaceReportMessage {
  timestamp?: string;
  text?: string;
}

export interface WorkspaceReportUpdate extends ReportSession {
  userPrompts: WorkspaceReportMessage[];
  assistantMessages: WorkspaceReportMessage[];
}

// For the wrapper "data" field if present
export interface WorkspaceReport {
  ok: boolean;
  userId: string;
  workspaceName: string;
  date: string;
  data?: ReportDataContent | null;
}
