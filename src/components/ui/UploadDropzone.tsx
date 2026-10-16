import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  multiple = false,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxFiles = 20,
  className = '',
  title,
  subtitle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, openUpgradeModal } = useAuth();
  const { t } = useLanguage();

  const maxMb = user?.plan === 'studio' ? 500 : user?.plan === 'pro' ? 100 : 15;

  const validateAndProcess = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage(null);

    const filesArray = Array.from(filesList);

    if (filesArray.length > 1 && !multiple) {
      setErrorMessage('Please select only a single image for this tool.');
      return;
    }

    if (filesArray.length > 1 && user?.plan === 'free') {
      openUpgradeModal('Batch processing is available on Pro and Studio plans.');
      return;
    }

    if (filesArray.length > maxFiles) {
      setErrorMessage(`Maximum of ${maxFiles} files can be processed at once.`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of filesArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" is not a valid image file.`);
        return;
      }

      // Validate file size
      const fileMb = file.size / (1024 * 1024);
      if (fileMb > maxMb) {
        setErrorMessage(`"${file.name}" (${fileMb.toFixed(1)}MB) exceeds your plan limit of ${maxMb}MB.`);
        openUpgradeModal(`File size exceeds your ${user?.plan || 'Free'} limit of ${maxMb}MB.`);
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndProcess(e.dataTransfer.files);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragOver
            ? 'border-[#6C63FF] bg-[#6C63FF]/10 scale-[1.01]'
            : 'border-white/15 bg-[#121A2A]/50 hover:border-[#6C63FF]/50 hover:bg-[#121A2A]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => validateAndProcess(e.target.files)}
        />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#36D6C5]/20 border border-white/10 flex items-center justify-center text-[#6C63FF] group-hover:scale-110 group-hover:text-[#36D6C5] transition-all shadow-lg mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-[#F4F7FF] tracking-tight">
          {title || t('dragDropTitle')}
        </h3>

        <p className="text-xs text-[#9AA8BD] mt-1 max-w-sm">
          {subtitle || `${t('dragDropSubtitle')} · Up to ${maxMb}MB`}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-6 px-6 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold shadow-lg shadow-[#6C63FF]/20 transition-all hover:scale-102 flex items-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t('selectImage')}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
