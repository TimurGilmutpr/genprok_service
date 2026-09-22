// src/widgets/chats-history/ui/ChatsHistory.tsx
import React, { useEffect, useState } from 'react';
import { FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { api } from '../../../api/client';
import type { ChatListItem } from '../../../api/client';

interface Props {
  onSelectChat: (chatId: string, sessionId: string | null) => void;
  activeChatId: string | null;
  refreshKey?: number;
}

const ChatsHistory: React.FC<Props> = ({
  onSelectChat,
  activeChatId,
  refreshKey = 0,
}) => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const res = await api.listChats();
      setChats(res.chats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!confirm('Удалить диалог?')) return;
    await api.deleteChat(chatId);
    reload();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-24px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-bold text-slate-900">Диалоги</h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {chats.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2 p-3" aria-live="polite">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-slate-100 p-3"
            >
              <div className="h-3 w-3/5 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-2/5 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <FiMessageCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Пока нет диалогов</p>
          <p className="mt-1 text-xs text-slate-400">
            Задайте вопрос — диалог появится здесь
          </p>
        </div>
      ) : (
        <div className="max-h-80 space-y-1.5 overflow-y-auto p-2">
          {chats.map((c) => (
            <button
              key={c.chat_id}
              onClick={() => onSelectChat(c.chat_id, c.session_id)}
              className={`group relative flex w-full items-start gap-2 rounded-lg border p-3 text-left transition-all duration-150 ${
                activeChatId === c.chat_id
                  ? 'border-blue-200 bg-blue-50 shadow-sm'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FiMessageCircle
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  activeChatId === c.chat_id ? 'text-blue-600' : 'text-slate-400'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {c.title || 'Диалог'}
                </p>

                {/* Бейдж: с документами / без документов */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {c.session_id ? (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-100">
                      С документами
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                      Без документов
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {c.messages_count} сообщ.
                  </span>
                </div>

                <p className="mt-1 text-[11px] text-slate-400">
                  {new Date(c.updated_at).toLocaleString('ru-RU')}
                </p>
              </div>

              <FiTrash2
                onClick={(e) => handleDelete(e, c.chat_id)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                aria-label="Удалить диалог"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default ChatsHistory;