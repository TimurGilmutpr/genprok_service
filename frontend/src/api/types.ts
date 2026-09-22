// src/api/types.ts
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AskResponse {
  answer: string;
  used_rag: boolean;
  used_documents: boolean;
  rag_sources: string[];
}

export interface ReportItem {
  id: number;
  session_id: string;
  created_at: string;
  preview: string;
  user_seq: number;   // <-- новое
}

export interface StatsResponse {
  total_reports: number;
  reports_this_week: number;
  total_documents: number;
  total_sessions: number;
}
