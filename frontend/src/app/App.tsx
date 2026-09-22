import React from 'react';
import AppRouter from './router/AppRouter';
import { useBackendHealth } from '../shared/api/useBackendHealth';
import ServiceUnavailable from '../shared/ui/ServiceUnavailable';

const App: React.FC = () => {
  const { status } = useBackendHealth(10000);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-400">
        Проверяем соединение...
      </div>
    );
  }

  if (status === 'down') {
    return <ServiceUnavailable />;
  }

  return <AppRouter />;
};

export default App;
