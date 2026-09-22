import React, { useEffect, useState } from 'react';
import {
  FiClock,
  FiRefreshCw,
  FiFileText,
  FiChevronRight,
  FiTrash2,
} from 'react-icons/fi';
import { fetchReport, fetchReports as getReports } from '../entities/report/api/reportApi';
import { api } from '../api/client';

interface Report {
  id: number;
  session_id: string;
  created_at: string;
  preview: string;
  user_seq: number;
}

interface ReportsHistoryProps {
  onSelectReport: (report: string, sessionId: string) => void;
  onReportDeleted?: (id: number) => void;
  refreshKey?: number;
}

const ReportsHistory: React.FC<ReportsHistoryProps> = ({
  onSelectReport,
  onReportDeleted,
  refreshKey = 0,
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getReports();
      setReports(res.data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleSelect = async (id: number) => {
    setSelectedId(id);
    try {
      const res = await fetchReport(id);
      onSelectReport(res.data.report, res.data.session_id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Удалить отчёт?')) return;
    try {
      await api.deleteReport(id);
      onReportDeleted?.(id);
      await fetchReports();
    } catch (err) {
      console.error(err);
      alert('Не удалось удалить отчёт');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-24px_rgba(15,23,42,0.45)]">
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-blue-100/70 blur-2xl" />
      <div className="relative border-b border-slate-100 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-5 py-5 text-white sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <FiClock className="h-5 w-5 text-blue-200" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">История отчётов</h2>
                <span className="rounded-full bg-blue-400/15 px-2 py-0.5 text-xs font-semibold text-blue-100 ring-1 ring-inset ring-blue-300/20">
                  {reports.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">Ваши последние аналитические сессии</p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            aria-label="Обновить историю отчётов"
            title="Обновить историю"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.15)]" />
          Синхронизировано с хранилищем
        </div>
      </div>

      <div>
        {loading ? (
          <div className="space-y-3 py-3" aria-live="polite">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-xl border border-slate-100 p-4">
                <div className="h-4 w-2/5 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-slate-400">Загрузка истории...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
              <FiFileText className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Нет сохранённых отчётов</p>
            <p className="mx-auto mt-1 max-w-55 text-xs leading-5 text-slate-400">
              Загрузите документы и создайте первый отчёт
            </p>
          </div>
        ) : (
          <div className="custom-scrollbar max-h-125 space-y-3 overflow-y-auto p-3 sm:p-4">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleSelect(report.id)}
                type="button"
                className={`
                  group relative w-full rounded-xl border p-4 text-left transition-all duration-200 ease-out
                  hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-[0_10px_22px_-18px_rgba(37,99,235,0.8)]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${selectedId === report.id
                    ? 'border-blue-400 bg-blue-50 shadow-[0_10px_22px_-18px_rgba(37,99,235,0.8)]'
                    : 'border-slate-200 bg-slate-50/70'
                  }
                `}
              >
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, report.id)}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-white/80 text-slate-300 opacity-60 shadow-sm transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Удалить отчёт"
                  title="Удалить отчёт"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>

                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-8">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          selectedId === report.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 ring-1 ring-slate-200'
                        }`}
                      >
                        <FiFileText className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        Отчёт #{report.user_seq}
                      </span>
                    </div>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <FiClock className="h-3 w-3" />
                      {formatDate(report.created_at)}
                    </p>
                    <p className="line-clamp-2 mt-2 text-sm leading-5 text-slate-600">
                      {report.preview}...
                    </p>
                  </div>
                  <FiChevronRight
                    className={`ml-3 h-5 w-5 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-500 ${
                      selectedId === report.id ? 'translate-x-1 text-blue-500' : ''
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReportsHistory;