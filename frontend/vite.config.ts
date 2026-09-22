import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'timur-deskmini-series',   // ваш текущий хост
      'localhost',
      '127.0.0.1',
      'extradition.vdi.mipt.ru',
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

// frontend/
// ├── src/
// │   ├── api/                # функции для запросов к бэкенду
// │   │   └── client.ts
// │   ├── components/         # переиспользуемые компоненты
// │   │   ├── AuthForm.tsx
// │   │   ├── FileUpload.tsx
// │   │   ├── ReportViewer.tsx
// │   │   ├── ReportsHistory.tsx
// │   │   └── ...
// │   ├── contexts/           # React Context (аутентификация)
// │   │   └── AuthContext.tsx
// │   ├── pages/              # страницы
// │   │   ├── LoginPage.tsx
// │   │   ├── RegisterPage.tsx
// │   │   ├── DashboardPage.tsx   # основная страница после входа
// │   │   └── ...
// │   ├── App.tsx             # корневой компонент с маршрутизацией
// │   ├── main.tsx
// │   └── App.css
// ├── index.html
// └── vite.config.ts          # добавим proxy для API