// src/features/chat/model/useChat.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../api/client';
import type { ChatMessage } from '../../../api/types';

const LS_KEY = 'active_chat_id';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(
    () => localStorage.getItem(LS_KEY),
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // При смене chatId — подгружаем историю с бэкенда
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    api
      .getChatMessages(chatId)
      .then((res) => {
        if (cancelled) return;
        setMessages(
          res.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        );
      })
      .catch(() => {
        // Если чат не найден или бэк не ответил — просто очищаем
        if (!cancelled) setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  // При смене chatId — сохраняем в localStorage
  useEffect(() => {
    if (chatId) localStorage.setItem(LS_KEY, chatId);
    else localStorage.removeItem(LS_KEY);
  }, [chatId]);

  /**
   * Переключиться на чат, привязанный к конкретной сессии (session_id).
   * Если такого чата нет — сбрасываем chatId в null,
   * новый чат будет создан бэкендом при первом сообщении.
   */
  const openChatBySession = useCallback(async (sessionId: string | null) => {
    if (!sessionId) {
      // Сессия не задана — начинаем «свободный» чат
      setChatId(null);
      setMessages([]);
      localStorage.removeItem(LS_KEY);
      return;
    }
    try {
      const res = await api.listChats();
      const existing = res.chats.find((c) => c.session_id === sessionId);
      if (existing) {
        setChatId(existing.chat_id);
      } else {
        setChatId(null);
        setMessages([]);
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      setChatId(null);
      setMessages([]);
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      question: string,
      sessionId: string | null,
      opts: { useDocuments?: boolean; useRag?: boolean; stream?: boolean } = {},
    ): Promise<boolean> => {
      const trimmed = question.trim();
      if (!trimmed || isSending) return false;

      setError(null);
      setIsSending(true);

      // Оптимистично добавляем сообщение пользователя и пустое сообщение ассистента
      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      const assistantIdxRef = { idx: -1 };
      setMessages((prev) => {
        const next = [...prev, userMsg, { role: 'assistant', content: '' }];
        assistantIdxRef.idx = next.length - 1;
        return next;
      });

      const history = [...messages, userMsg];
      let receivedChatId: string | null = chatId;

      try {
        if (opts.stream) {
          abortRef.current = new AbortController();
          await api.askStream(
            {
              question: trimmed,
              session_id: sessionId,
              chat_id: chatId,
              history,
              use_documents: opts.useDocuments ?? true,
              use_rag: opts.useRag ?? true,
            },
            (delta) => {
              // --- Служебный чанк с chat_id ---
              // Может прийти склеенным с началом ответа:
              //   "__CHAT_ID__:Timur_xxx\n\nПривет! Чем я могу помочь?"
              const CHAT_MARKER = '__CHAT_ID__:';

              // Ищем маркер в первых 30 символах чанка (запас на \n/пробелы)
              const head = delta.slice(0, 30);
              const markerPos = head.indexOf(CHAT_MARKER);

              if (markerPos !== -1) {
                const afterMarker = delta.slice(
                  markerPos + CHAT_MARKER.length,
                );
                const nl = afterMarker.indexOf('\n');
                const id =
                  nl === -1
                    ? afterMarker.trim()
                    : afterMarker.slice(0, nl).trim();

                // Простая валидация формата: "username_hex"
                const looksLikeChatId =
                  /^[A-Za-z0-9_]+_[a-f0-9]{6,}$/.test(id);
                if (looksLikeChatId && id !== chatId) {
                  receivedChatId = id;
                  setChatId(id);
                }

                // Если после \n уже идёт текст — клеим его к ответу
                if (nl !== -1) {
                  const rest = afterMarker
                    .slice(nl + 1)
                    .replace(/^\n+/, '');
                  if (rest) {
                    setMessages((prev) => {
                      const next = [...prev];
                      const i = assistantIdxRef.idx;
                      if (i >= 0 && next[i]) {
                        next[i] = {
                          ...next[i],
                          content: next[i].content + rest,
                        };
                      }
                      return next;
                    });
                  }
                }
                return;
              }

              // --- Обычный чанк ответа ---
              setMessages((prev) => {
                const next = [...prev];
                const i = assistantIdxRef.idx;
                if (i >= 0 && next[i]) {
                  next[i] = { ...next[i], content: next[i].content + delta };
                }
                return next;
              });
            },
            abortRef.current.signal,
          );
        } else {
          const res = await api.ask({
            question: trimmed,
            session_id: sessionId,
            chat_id: chatId,
            history,
            use_documents: opts.useDocuments ?? true,
            use_rag: opts.useRag ?? true,
          });
          if (res.chat_id && res.chat_id !== chatId) setChatId(res.chat_id);
          setMessages((prev) => {
            const next = [...prev];
            const i = assistantIdxRef.idx;
            if (i >= 0 && next[i]) {
              next[i] = { ...next[i], content: res.answer };
            }
            return next;
          });
        }
        return true;
      } catch (e: any) {
        setError(e?.message || 'Ошибка запроса');
        // Убираем пустое сообщение ассистента
        setMessages((prev) => {
          const next = [...prev];
          const i = assistantIdxRef.idx;
          if (i >= 0 && next[i] && !next[i].content) next.splice(i, 1);
          return next;
        });
        return false;
      } finally {
        setIsSending(false);
        abortRef.current = null;
      }
    },
    [messages, isSending, chatId],
  );

  const startNewChat = useCallback(() => {
    setChatId(null);
    setMessages([]);
    localStorage.removeItem(LS_KEY);
  }, []);

  const openChat = useCallback((id: string) => {
    setChatId(id);
  }, []);

  const clearChat = startNewChat;

  return {
    messages,
    chatId,
    isSending,
    error,
    sendMessage,
    startNewChat,
    openChat,
    openChatBySession,   // <-- новое
    clearChat,
  };
}