import React, { useState } from 'react';
import { useAuth } from '../entities/auth/model/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiCheck, FiLock, FiMail, FiPieChart, FiUser } from 'react-icons/fi';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await register(username, password, email);
      navigate('/');
    } catch (err) {
      setError('Ошибка регистрации. Попробуйте другой логин.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="order-2 flex items-center justify-center px-4 py-8 sm:px-8 lg:order-1 lg:bg-white/3 lg:px-12">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-9">
            <div className="mb-7 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white"><FiPieChart className="h-5 w-5" /></div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">RAG Анализатор</p>
            </div>
            <div className="mb-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Новый рабочий профиль</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">Создайте аккаунт</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Настройте защищённый доступ к аналитическому пространству.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Имя пользователя</span>
                <span className="relative block"><FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Например, analyst_01" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></span>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <span className="relative block"><FiMail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                <span className="relative block"><FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Подтверждение</span>
                <span className="relative block"><FiCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="password" placeholder="Повторите пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></span>
              </label>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2">{error}</div>}

              <button type="submit" disabled={isLoading} className="group mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
                {isLoading ? 'Создание профиля...' : 'Создать аккаунт'}
                {!isLoading && <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">Уже есть аккаунт? <Link to="/login" className="font-bold text-emerald-600 transition hover:text-emerald-800">Войти в систему</Link></div>
          </div>
        </div>

        <div className="order-1 hidden flex-col justify-between p-10 lg:order-2 lg:flex xl:p-16">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-950"><FiPieChart className="h-5 w-5" /></div>
            <span className="text-sm font-bold tracking-tight">RAG Экстрадиционный анализатор</span>
          </div>
          <div className="max-w-lg">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300"><FiActivity className="h-4 w-4" /> Начните с чистого листа</p>
            <h2 className="text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">Ваша аналитика. В одном месте.</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">Сохраняйте отчёты, отслеживайте расхождения и превращайте документы в ясные решения.</p>
            <div className="mt-10 space-y-4 text-sm text-slate-300">
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><FiCheck className="h-3.5 w-3.5" /></span> Единая история отчётов</div>
              <div className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><FiCheck className="h-3.5 w-3.5" /></span> Структурированный правовой анализ</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Ваши материалы остаются в защищённом пространстве</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;