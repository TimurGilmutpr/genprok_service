import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiPaperclip, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import { uploadDocuments } from '../entities/document/api/documentApi';

interface FileUploadProps {
  onUploadSuccess: (sessionId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setUploaded(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadDocuments(files);
      const { session_id } = res.data;
      setUploaded(true);
      setTimeout(() => {
        onUploadSuccess(session_id);
        setFiles([]);
        setUploaded(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-5 pb-4 pt-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          {...getRootProps()}
          type="button"
          title="Прикрепить файл"
          className={`group inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${isDragActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          <input {...getInputProps()} />
          <FiPaperclip className="h-4 w-4 transition group-hover:-rotate-12" />
          Прикрепить файл
        </button>
        <span className="text-[11px] text-slate-400">PDF, DOCX, TXT · до 10 МБ</span>
        {files.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || uploaded}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Загрузка...' : uploaded ? 'Загружено' : 'Добавить'}
            {uploaded && <FiCheckCircle className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 text-xs text-blue-800">
              <FiFile className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <span className="max-w-52 truncate">{file.name}</span>
              <button type="button" onClick={() => removeFile(index)} disabled={uploading} aria-label={`Удалить ${file.name}`} className="text-blue-400 transition hover:text-red-500 disabled:opacity-50">
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;