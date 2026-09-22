import React from 'react';
import { FiActivity, FiLogOut, FiPieChart } from 'react-icons/fi';

interface DashboardHeaderProps {
  user: string | null | undefined;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  const initials = user?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_8px_24px_-24px_rgba(15,23,42,0.8)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200/60">
              <FiPieChart className="h-5 w-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">RAG Экстрадиционный анализатор</h1>
                {/* <span className="hidden rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100 sm:inline">v2.0</span> */}
              </div>
              <div className="hidden items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:flex">
                <FiActivity className="h-3 w-3 text-blue-500" />
                Рабочее пространство аналитики
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="group flex h-12 items-center gap-2 rounded-2xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 p-1 shadow-lg shadow-slate-300/40 transition hover:shadow-blue-200/50 sm:gap-3 sm:pr-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-blue-700 shadow-md ring-2 ring-blue-300/30 sm:h-10 sm:w-10 sm:rounded-[13px] sm:text-sm">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.2)]" />
              </div>
              <div className="hidden min-w-0 leading-none sm:block">
                <p className="max-w-32 truncate text-sm font-bold text-white">{user || 'Пользователь'}</p>
                {/* <p className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  В сети
                </p> */}
              </div>
              <span className="hidden h-6 w-px bg-white/10 sm:block" />
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-blue-200/80 transition group-hover:text-blue-100 sm:block">Аналитик</span>
            </div>
            <button
              onClick={onLogout}
              aria-label="Выйти из аккаунта"
              title="Выйти"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
