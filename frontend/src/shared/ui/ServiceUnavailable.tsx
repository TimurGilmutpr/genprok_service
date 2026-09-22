import React from 'react';
import { FiTool, FiRefreshCw } from 'react-icons/fi';
import { useBackendHealth } from '../api/useBackendHealth';

const ServiceUnavailable: React.FC = () => {
  const { status, lastCheck, recheck } = useBackendHealth(10000);

  if (status === 'ok' || status === 'checking') return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(15,23,42,0.5)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <FiTool className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Ведутся технические работы</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Сервис временно недоступен. Мы уже работаем над восстановлением.
          Попробуйте зайти чуть позже — страница автоматически проверит доступность.
        </p>

        <button
          type="button"
          onClick={recheck}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <FiRefreshCw className="h-4 w-4" />
          Проверить сейчас
        </button>

        {lastCheck && (
          <p className="mt-4 text-[11px] text-slate-400">
            Последняя проверка: {lastCheck.toLocaleTimeString('ru-RU')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceUnavailable;
