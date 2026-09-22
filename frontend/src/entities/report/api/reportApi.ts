// src/entities/report/api/reportApi.ts
import http from '../../../shared/api/http';

export interface ReportPreview {
  id: number;              // глобальный id (для /report/{id})
  session_id: string;      // пригодится, если хотите сразу подтянуть документы
  created_at: string;
  preview: string;
  user_seq: number;        // <-- порядковый номер для конкретного юзера
}

export interface ReportDetail {
  id: number;
  session_id: string;
  created_at: string;
  report: string;
}

export const fetchReports = () =>
  http.get<{ reports: ReportPreview[] }>('/reports');

export const fetchReport = (id: number) =>
  http.get<ReportDetail>(`/report/${id}`);

export const analyzeReport = (sessionId: string | null, prompt: string) =>
  http.post<{ report: string }>('/analyze', {
    ...(sessionId ? { session_id: sessionId } : {}),
    ...(prompt.trim() ? { prompt: prompt.trim() } : {}),
  });