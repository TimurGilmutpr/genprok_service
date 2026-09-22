import axios, { AxiosError } from 'axios';

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 сек — чтобы не висеть при недоступном бэке
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Класс ошибки с осмысленной классификацией.
 * kind:
 *   'network'      — сервер недоступен (ECONNREFUSED, timeout, DNS)
 *   'unauthorized' — 401
 *   'forbidden'    — 403
 *   'not_found'    — 404
 *   'server'       — 5xx
 *   'client'       — прочие 4xx
 *   'unknown'
 */
export class ApiError extends Error {
  kind:
    | 'network'
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'server'
    | 'client'
    | 'unknown';
  status?: number;

  constructor(kind: ApiError['kind'], message: string, status?: number) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.name = 'ApiError';
  }
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Сетевая ошибка / timeout / нет соединения
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new ApiError('network', 'Сервер не отвечает. Проверьте соединение.'),
        );
      }
      return Promise.reject(
        new ApiError('network', 'Сервис временно недоступен. Идут технические работы.'),
      );
    }

    const { status, data } = error.response;
    // FastAPI кладёт сообщение в { detail: "..." }
    const detail =
      (typeof data === 'object' && data && 'detail' in data
        ? String((data as any).detail)
        : '') || error.message || `Ошибка ${status}`;

    if (status === 401) {
      return Promise.reject(new ApiError('unauthorized', detail, 401));
    }
    if (status === 403) {
      return Promise.reject(new ApiError('forbidden', detail, 403));
    }
    if (status === 404) {
      return Promise.reject(new ApiError('not_found', detail, 404));
    }
    if (status >= 500) {
      return Promise.reject(
        new ApiError('server', 'Сервис временно недоступен. Попробуйте позже.', status),
      );
    }
    return Promise.reject(new ApiError('client', detail, status));
  },
);

export default http;
