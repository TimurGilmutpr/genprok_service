export { login, register } from '../entities/auth/api/authApi';

// src/api/documents.ts
export const uploadFiles = (sessionId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  // если нужно передать sessionId? В текущем API сессия создаётся внутри upload
  // Поэтому просто передаём файлы
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const analyze = (sessionId: string) =>
  api.post('/analyze', { session_id: sessionId });

export const getReports = () =>
  api.get('/reports');

export const getReport = (id: number) =>
  api.get(`/report/${id}`);