import React, { useState } from 'react';
import { useAuth } from '../entities/auth/model/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiLock, FiPieChart, FiUser } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Неверный логин или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden flex-col justify-between p-10 lg:flex xl:p-16">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950">
              <FiPieChart className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold tracking-tight">RAG Экстрадиционный анализатор</span>
          </div>
          <div className="max-w-lg">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300"><FiActivity className="h-4 w-4" /> Аналитика документов</p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white xl:text-6xl">Решения, которым можно доверять.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">Единое пространство для проверки материалов, перекрёстного анализа и подготовки юридически значимых отчётов.</p>
            <div className="mt-10 flex items-center gap-3 text-sm text-slate-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,0.1)]" /> Система готова к работе</div>
          </div>
          <p className="text-xs text-slate-500">Защищённое рабочее пространство аналитика</p>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-8 lg:bg-white/5 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-9">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white"><FiPieChart className="h-5 w-5" /></div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">RAG Анализатор</p>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">С возвращением</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Войти в систему</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Продолжите работу с вашими аналитическими отчётами.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Имя пользователя</span>
                <span className="relative block">
                  <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Введите имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                <span className="relative block">
                  <FiLock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </span>
              </label>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

              <button type="submit" disabled={isLoading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Вход...' : 'Войти'}
                {!isLoading && <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">Нет аккаунта? <Link to="/register" className="font-bold text-blue-600 transition hover:text-blue-800">Зарегистрироваться</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;