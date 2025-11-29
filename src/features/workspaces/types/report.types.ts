export interface WorkspaceReportMessage {
  timestamp?: string;
  text?: string;
}

export interface WorkspaceReportUpdate {
  sessionId: string;
  cwd: string;
  generatedAt: string;
  events: unknown[];
  userPrompts: WorkspaceReportMessage[];
  assistantMessages: WorkspaceReportMessage[];
}

export interface WorkspaceReportData {
  updates: WorkspaceReportUpdate[];
}

export interface WorkspaceReport {
  ok: boolean;
  userId: string;
  workspaceName: string;
  date: string;
  data?: WorkspaceReportData | null;
}
