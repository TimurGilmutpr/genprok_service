import React, { useState } from 'react';
import {
  FiArrowUp,
  FiFolder,
  FiAlertCircle,
  FiMessageCircle,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi';
import FileUpload from '../features/upload-documents/ui/FileUpload';
import { useChat } from '../features/chat/model/useChat';
import DashboardHeader from '../widgets/dashboard-header/ui/DashboardHeader';
import DashboardStats from '../widgets/dashboard-stats/ui/DashboardStats';
import ReportsHistory from '../widgets/reports-history/ui/ReportsHistory';
import ChatsHistory from '../widgets/chats-history/ui/ChatsHistory';
import ReportViewer from '../widgets/report-viewer/ui/ReportViewer';
import { useAuth } from '../entities/auth/model/AuthContext';
import { api } from '../api/client';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState(0);

  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const {
    messages,
    chatId,
    isSending,
    error,
    sendMessage,
    startNewChat,
    openChat,
    openChatBySession,
    clearChat,
  } = useChat();

  // Обновлятор списка чатов — дергаем после успешной отправки,
  // чтобы сайдбар "Диалоги" перечитал /chats
  const [chatsRefreshKey, setChatsRefreshKey] = useState(0);

  // Обновлятор списка отчётов — дергаем после analyze или удаления
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const handleUploadSuccess = (sid: string, count = 1) => {
    setSessionId(sid);
    setUploadedCount((prev) => prev + count);
    setReport('');
    setReportError(null);
    startNewChat(); // новый анализ = новый чат
  };

  const handleSelectReport = async (
    reportText: string,
    sessionIdFromReport: string,
  ) => {
    setReport(reportText);
    if (sessionIdFromReport) {
      setSessionId(sessionIdFromReport);
      setUploadedCount((prev) => (prev > 0 ? prev : 1));
      // Переключаем чат на сессию этого отчёта
      await openChatBySession(sessionIdFromReport);
    } else {
      startNewChat();
    }
  };

  const handleReportDeleted = (deletedId: number) => {
    // Если удалён открытый отчёт — очистить окно результата
    setReport('');
    // Обновить список
    setReportsRefreshKey((k) => k + 1);
  };

  const handleClear = () => {
    setPrompt('');
    setSessionId(null);
    setUploadedCount(0);
    setReport('');
    setReportError(null);
    startNewChat();
  };

  const handleGenerateReport = async () => {
    if (!sessionId || isGeneratingReport) return;
    setIsGeneratingReport(true);
    setReportError(null);
    try {
      const res = await api.analyze(sessionId);
      setReport(res.report);
      // Обновляем список отчётов, чтобы новый отчёт сразу появился в истории
      setReportsRefreshKey((k) => k + 1);
    } catch (e: any) {
      setReportError(e?.message || 'Не удалось сформировать отчёт');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSend = async () => {
    const question =
      prompt.trim() ||
      (sessionId
        ? 'Проанализируй загруженные документы и подготовь краткое заключение.'
        : 'Дай краткий обзор порядка выдачи лиц для уголовного преследования.');
    const ok = await sendMessage(question, sessionId, { stream: true });
    if (ok) {
      setPrompt('');
      // Обновляем список чатов в сайдбаре
      setChatsRefreshKey((k) => k + 1);
    }
  };

  // Клик по чату из сайдбара "Диалоги"
  const handleSelectChat = (id: string, sessionIdFromChat: string | null) => {
    openChat(id);
    if (sessionIdFromChat) {
      setSessionId(sessionIdFromChat);
      setUploadedCount((prev) => (prev > 0 ? prev : 1));
    }
  };

  const canSend = Boolean(prompt.trim() || sessionId) && !isSending;
  const canGenerateReport = Boolean(sessionId) && !isGeneratingReport;
  const hasDocuments = uploadedCount > 0 && Boolean(sessionId);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} onLogout={logout} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Центр управления
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Подготовьте документы к анализу
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Загрузите материалы, сформируйте отчёт и задавайте уточняющие вопросы ассистенту.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]" />
            Система готова
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* === БЛОК 1: ДИАЛОГ === */}
            {messages.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <FiMessageCircle className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                        Диалог
                      </p>
                      <h3 className="mt-1 text-base font-bold text-slate-900">
                        Обсуждение анализа
                      </h3>
                    </div>
                  </div>
                  {hasDocuments && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Документы подключены
                    </span>
                  )}
                </div>
                <div className="max-h-155 space-y-4 overflow-y-auto p-5 sm:p-6">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === 'user'
                            ? 'rounded-br-md bg-blue-600 text-white shadow-sm'
                            : 'rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                          {message.role === 'user' ? 'Вы' : 'Ассистент'}
                        </p>
                        <div className="whitespace-pre-wrap">
                          {message.content || '…'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="text-xs font-medium text-slate-400">
                      Ассистент готовит ответ...
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* === БЛОК 2: НОВЫЙ АНАЛИЗ === */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <FiFolder className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Новый анализ</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Загрузите документы и сформируйте отчёт
                    </p>
                  </div>
                </div>
                {hasDocuments && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Документы загружены ({uploadedCount})
                  </span>
                )}
              </div>

              <div className="px-5 pt-5 sm:px-6">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        if (canSend) handleSend();
                      }
                    }}
                    placeholder="Напишите вопрос по документам или по экстрадиционному праву..."
                    aria-label="Текст запроса"
                    rows={4}
                    className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between px-3 pb-3 pt-2">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      Можно задать вопрос и без загрузки файлов
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Ctrl + Enter
                    </span>
                  </div>
                </div>
              </div>

              <FileUpload onUploadSuccess={handleUploadSuccess} />

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                <button
                  onClick={handleGenerateReport}
                  disabled={!canGenerateReport}
                  className={`
                    flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-in-out
                    ${
                      !canGenerateReport
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-linear-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-200 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
                    }
                  `}
                  title={
                    !sessionId
                      ? 'Сначала загрузите документы'
                      : 'Сформировать отчёт по документам'
                  }
                >
                  {isGeneratingReport ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Формирование...
                    </>
                  ) : (
                    <>
                      <FiFileText className="h-5 w-5" />
                      Сформировать отчёт
                    </>
                  )}
                </button>

                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`
                    flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 ease-in-out
                    ${
                      !canSend
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-linear-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg'
                    }
                  `}
                >
                  {isSending ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <FiArrowUp className="h-5 w-5" />
                      Отправить сообщение
                    </>
                  )}
                </button>

                {(sessionId || prompt || messages.length > 0) && (
                  <button
                    onClick={handleClear}
                    className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
                  >
                    Очистить
                  </button>
                )}
              </div>

              {error && (
                <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 sm:mx-6">
                  <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
              {reportError && (
                <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 sm:mx-6">
                  <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <span className="text-sm text-red-700">{reportError}</span>
                </div>
              )}
            </section>

            {/* === БЛОК 3: ОТЧЁТ === */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">
                    Результат
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    Сформированный отчёт
                  </h3>
                </div>
                {report && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    <FiCheckCircle className="h-3.5 w-3.5" />
                    Готово
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <ReportViewer report={report} isLoading={isGeneratingReport} />
              </div>
            </section>
          </div>

          {/* === САЙДБАР: История отчётов + Диалоги === */}
          <aside className="space-y-6 lg:col-span-1">
            <ReportsHistory
              onSelectReport={handleSelectReport}
              onReportDeleted={handleReportDeleted}
              refreshKey={reportsRefreshKey}
            />
            <ChatsHistory
              activeChatId={chatId}
              onSelectChat={handleSelectChat}
              filterSessionId={sessionId}
              refreshKey={chatsRefreshKey}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;