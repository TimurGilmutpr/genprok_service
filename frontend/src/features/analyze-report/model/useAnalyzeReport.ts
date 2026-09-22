import { useState } from 'react';
import { analyzeReport } from '../../../entities/report/api/reportApi';

export const useAnalyzeReport = () => {
  const [report, setReport] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyze = async (sessionId: string | null, prompt: string): Promise<boolean> => {
    if (!sessionId && !prompt.trim()) {
      setError('Загрузите документы или напишите запрос');
      return false;
    }

    if (!sessionId) {
      setError('Текстовый анализ пока недоступен: сервер ожидает session_id. Загрузите хотя бы один файл или обновите backend.');
      return false;
    }

    setIsAnalyzing(true);
    setError('');
    setReport('');

    try {
      const response = await analyzeReport(sessionId, prompt);
      setReport(response.data.report);
      return true;
    } catch (cause: any) {
      console.error(cause);
      const detail = cause?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : cause?.message || 'Ошибка при анализе');
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { report, setReport, isAnalyzing, error, analyze };
};
