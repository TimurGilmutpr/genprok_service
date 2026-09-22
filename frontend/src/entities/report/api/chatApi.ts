import http from '../../../shared/api/http';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AskResponse {
  answer: string;
  used_rag: boolean;
  used_documents: boolean;
  rag_sources: string[];
}

const buildAskPayload = (question: string, sessionId: string | null, history: ChatMessage[]) => ({
  question: question.trim(),
  ...(sessionId ? { session_id: sessionId } : {}),
  history,
  use_documents: Boolean(sessionId),
  use_rag: true,
});

export const askQuestion = async (question: string, sessionId: string | null, history: ChatMessage[]) => {
  const payload = buildAskPayload(question, sessionId, history);

  try {
    return await http.post<AskResponse>('/ask', payload);
  } catch (cause: any) {
    if (cause?.response?.status !== 404) throw cause;

    const streamResponse = await http.post<string>('/ask_stream', payload, {
      responseType: 'text',
    });

    return {
      ...streamResponse,
      data: {
        answer: streamResponse.data,
        used_rag: false,
        used_documents: Boolean(sessionId),
        rag_sources: [],
      },
    };
  }
};
