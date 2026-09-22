import React from 'react';
import { FiCheckCircle, FiFileText, FiInfo } from 'react-icons/fi';

interface ReportViewerProps {
  report: string;
  isLoading?: boolean;
}

interface ReportSection {
  title: string;
  lines: string[];
}

const sectionPattern = /^[IVXLCDM]+\.\s/;

const parseSections = (report: string): { intro: string[]; sections: ReportSection[] } => {
  const intro: string[] = [];
  const sections: ReportSection[] = [];
  let activeSection: ReportSection | null = null;

  report.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    const heading = trimmedLine.replace(/^\*\*(.*?)\*\*$/, '$1');

    if (sectionPattern.test(heading)) {
      activeSection = { title: heading, lines: [] };
      sections.push(activeSection);
      return;
    }

    if (activeSection) {
      activeSection.lines.push(trimmedLine);
    } else {
      intro.push(trimmedLine);
    }
  });

  return { intro, sections };
};

const renderInlineText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>;
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

const getTone = (label: string) => {
  if (label.toLowerCase().includes('критичес')) return 'critical';
  if (label.toLowerCase().includes('существен')) return 'significant';
  if (label.toLowerCase().includes('рекоменд')) return 'recommendation';
  return 'default';
};

const renderLines = (lines: string[]) => {
  const content: React.ReactNode[] = [];
  let currentTone = 'default';
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line) {
      index += 1;
      continue;
    }

    if (/^[*-]\s/.test(line)) {
      const listItems: string[] = [];
      while (index < lines.length && /^[*-]\s/.test(lines[index])) {
        listItems.push(lines[index].slice(2));
        index += 1;
      }

      const toneStyles = {
        critical: 'border-red-200 bg-red-50/70 marker:text-red-500',
        significant: 'border-amber-200 bg-amber-50/70 marker:text-amber-500',
        recommendation: 'border-blue-200 bg-blue-50/70 marker:text-blue-500',
        default: 'border-slate-200 bg-slate-50/70 marker:text-blue-500',
      };

      content.push(
        <ul key={`list-${index}`} className={`my-3 list-disc space-y-2 rounded-xl border p-4 pl-8 text-sm leading-6 text-slate-600 marker:font-bold ${toneStyles[currentTone as keyof typeof toneStyles]}`}>
          {listItems.map((item, itemIndex) => <li key={itemIndex}>{renderInlineText(item)}</li>)}
        </ul>,
      );
      continue;
    }

    const spacedBoldField = line.match(/^\*\*(.+?):\s*\*\*\s*(.+)$/);
    if (spacedBoldField) {
      content.push(
        <p key={`field-${index}`} className="border-b border-slate-100 py-2 text-sm leading-6 text-slate-600 last:border-0">
          <span className="font-semibold text-slate-800">{spacedBoldField[1]}:</span>{' '}
          {renderInlineText(spacedBoldField[2])}
        </p>,
      );
      index += 1;
      continue;
    }

    const boldLabel = line.match(/^\*\*(.*?)\*\*:?$/);
    if (boldLabel) {
      currentTone = getTone(boldLabel[1]);
      content.push(
        <p key={`label-${index}`} className="mb-2 mt-4 text-sm font-bold text-slate-800">
          {boldLabel[1]}
        </p>,
      );
      index += 1;
      continue;
    }

    const labelMatch = line.match(/^([^:]{2,80}):\s*(.+)$/);
    if (labelMatch) {
      content.push(
        <p key={`field-${index}`} className="border-b border-slate-100 py-2 text-sm leading-6 text-slate-600 last:border-0">
          <span className="font-semibold text-slate-800">{renderInlineText(`${labelMatch[1]}:`)}</span>{' '}
          {renderInlineText(labelMatch[2])}
        </p>,
      );
    } else {
      content.push(
        <p key={`paragraph-${index}`} className="my-3 text-sm leading-7 text-slate-600">
          {renderInlineText(line)}
        </p>,
      );
    }

    index += 1;
  }

  return content;
};

const ReportViewer: React.FC<ReportViewerProps> = ({ report, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <FiFileText className="h-5 w-5 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Генерация отчёта</p>
        <p className="mt-1 text-xs text-slate-400">Пожалуйста, подождите, анализируем документы</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200">
          <FiInfo className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Отчёт ещё не сформирован</p>
        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">Загрузите документы и нажмите «Сформировать отчёт», чтобы увидеть результат анализа.</p>
      </div>
    );
  }

  const { intro, sections } = parseSections(report);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <FiCheckCircle className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Отчёт обработан</p>
          <p className="mt-0.5 text-xs text-slate-500">Структурированные данные и выводы готовы к просмотру</p>
        </div>
      </div>

      {intro.length > 0 && <div>{renderLines(intro)}</div>}

      {sections.map((section) => (
        <article key={section.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
            <h4 className="text-sm font-bold text-slate-900">{section.title}</h4>
          </div>
          <div className="px-4 py-2 sm:px-5">{renderLines(section.lines)}</div>
        </article>
      ))}

      {sections.length === 0 && <div className="text-sm leading-7 text-slate-600">{renderLines(intro)}</div>}
    </div>
  );
};

export default ReportViewer;