import http from '../../../shared/api/http';

export const uploadDocuments = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return http.post<{ session_id: string }>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
