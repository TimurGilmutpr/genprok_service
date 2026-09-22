import React, { useEffect, useState } from 'react';
import { FiFolder, FiPieChart } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { api } from '../api/client';
import type { StatsResponse } from '../api/types';

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: IconType;
  iconClassName: string;
  detailClassName: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  detail,
  icon: Icon,
  iconClassName,
  detailClassName,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.7)]">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <Icon className={`h-4 w-4 ${iconClassName}`} />
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    <p className={`mt-1 text-xs ${detailClassName}`}>{detail}</p>
  </div>
);

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getStats()
      .then((s) => { if (!cancelled) setStats(s); })
      .catch((e) => console.error('stats error:', e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const dash = loading ? '—' : '0';
  const fmt = (n?: number) => (loading ? '—' : String(n ?? 0));

  return (
    <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Статистика">
      <StatCard
        label="Всего отчётов"
        value={fmt(stats?.total_reports)}
        detail={`+${stats?.reports_this_week ?? 0} за эту неделю`}
        icon={FiPieChart}
        iconClassName="text-blue-500"
        detailClassName="text-emerald-600"
      />
      <StatCard
        label="Загружено документов"
        value={fmt(stats?.total_documents)}
        detail="За всё время"
        icon={FiFolder}
        iconClassName="text-emerald-500"
        detailClassName="text-slate-400"
      />
    </section>
  );
};

export default DashboardStats;
