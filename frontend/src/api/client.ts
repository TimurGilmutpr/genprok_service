// src/api/client.ts
import type { ChatMessage, AskResponse, ReportItem, StatsResponse } from './types';
export type { ChatMessage, AskResponse, ReportItem, StatsResponse };

const API_BASE = '/api';

// ---------- типы чатов ----------
export interface ChatListItem {
  chat_id: string;
  session_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
export type { ChatListItem as ChatListItemType, ChatMessageItem as ChatMessageItemType };

// ---------- инфраструктура ----------
function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json() as Promise<T>;
  return (await res.text()) as unknown as T;
}

// ---------- api ----------
export const api = {
  // --- auth ---
  async login(username: string, password: string) {
    return request<{ access_token: string; token_type: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  async register(payload: {
    username: string;
    password: string;
    full_name?: string;
    organization?: string;
    position?: string;
  }) {
    return request<{ msg: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // --- upload ---
  async uploadDocuments(files: File[]): Promise<{ session_id: string; files: string[] }> {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return request('/upload', { method: 'POST', body: fd });
  },

  async deleteReport(id: number): Promise<{ ok: boolean }> {
    return request(`/report/${id}`, { method: 'DELETE' });
  },
    
  // --- analyze ---
  async analyze(sessionId: string): Promise<{ report: string }> {
    return request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },

  // --- reports ---
  async listReports(): Promise<{ reports: ReportItem[] }> {
    return request('/reports');
  },
  async getReport(id: number): Promise<{ report: string }> {
    return request(`/report/${id}`);
  },
  async getStats(): Promise<StatsResponse> {
    return request('/stats');
  },

  // --- chats ---
  async listChats(): Promise<{ chats: ChatListItem[] }> {
    return request('/chats');
  },
  async getChatMessages(chatId: string): Promise<{ messages: ChatMessageItem[] }> {
    return request(`/chats/${chatId}/messages`);
  },
  async createChat(
    payload: { session_id?: string | null; title?: string } = {},
  ): Promise<{ chat_id: string }> {
    return request('/chats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async deleteChat(chatId: string): Promise<{ ok: boolean }> {
    return request(`/chats/${chatId}`, { method: 'DELETE' });
  },

  // --- ask ---
  async ask(payload: {
    question: string;
    session_id?: string | null;
    chat_id?: string | null;      // <-- новое
    history?: ChatMessage[];
    use_documents?: boolean;
    use_rag?: boolean;
  }): Promise<AskResponse & { chat_id?: string }> {   // <-- бэк вернёт chat_id
    return request('/ask', {
      method: 'POST',
      body: JSON.stringify({
        use_documents: true,
        use_rag: true,
        ...payload,
        session_id: payload.session_id ?? null,
        chat_id: payload.chat_id ?? null,
      }),
    });
  },

  // --- ask_stream ---
  async askStream(
    payload: {
      question: string;
      session_id?: string | null;
      chat_id?: string | null;    // <-- новое
      history?: ChatMessage[];
      use_documents?: boolean;
      use_rag?: boolean;
    },
    onChunk: (delta: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const token = getToken();
    const res = await fetch(`${API_BASE}/ask_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        use_documents: true,
        use_rag: true,
        ...payload,
        session_id: payload.session_id ?? null,
        chat_id: payload.chat_id ?? null,
      }),
      signal,
    });
    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || `HTTP ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
  },
};