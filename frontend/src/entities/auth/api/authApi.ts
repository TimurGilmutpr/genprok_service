import http from '../../../shared/api/http';

export interface RegisterPayload {
  username: string;
  password: string;
  full_name?: string;
}

export const login = (username: string, password: string) =>
  http.post<{ access_token: string }>('/login', { username, password });

export const register = (payload: RegisterPayload) =>
  http.post('/register', payload);
