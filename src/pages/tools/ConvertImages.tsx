import React, { useState } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Trash2, ArrowRight, FileArchive, AlertTriangle } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface ConvertItem {
  id: string;
  file: File;
  previewUrl: string;
  originalFormat: string;
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp';
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  status: 'idle' | 'converting' | 'done' | 'error';
}

export const ConvertImages: React.FC = () => {
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [quality, setQuality] = useState<number>(90);
  const [bgColorForJpeg, setBgColorForJpeg] = useState<string>('#FFFFFF');
  const [isConvertingAll, setIsConvertingAll] = useState(false);

  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    const newItems: ConvertItem[] = files.map((file) => ({
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      originalFormat: file.type || 'image/jpeg',
      targetFormat: globalTargetFormat,
      convertedBlob: null,
      convertedUrl: null,
      status: 'idle',
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const convertSingle = (item: ConvertItem, targetFmt: string, q: number, bg: string): Promise<ConvertItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...item, status: 'error' });
          return;
        }

        // Fill background if JPEG since JPEG lacks alpha transparency
        if (targetFmt === 'image/jpeg') {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...item, status: 'error' });
              return;
            }

            const outUrl = URL.createObjectURL(blob);
            recordJob({
              toolType: 'convert-images',
              inputName: item.file.name,
              inputSize: item.file.size,
              outputSize: blob.size,
              format: targetFmt.split('/')[1] || 'webp',
            });

            resolve({
              ...item,
              convertedBlob: blob,
              convertedUrl: outUrl,
              status: 'done',
            });
          },
          targetFmt,
          q / 100
        );
      };
      img.onerror = () => resolve({ ...item, status: 'error' });
      img.src = item.previewUrl;
    });
  };

  const handleConvertAll = async () => {
    if (items.length === 0) return;

    const allowed = await checkCanProcess({
      toolType: 'convert-images',
      batchCount: items.length,
    });
    if (!allowed) return;

    setIsConvertingAll(true);

    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'converting';
      setItems([...updated]);
      const res = await convertSingle(updated[i], globalTargetFormat, quality, bgColorForJpeg);
      updated[i] = res;
      setItems([...updated]);
    }

    setIsConvertingAll(false);
    showToast('Batch conversion completed!', 'success');
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleDownloadSingle = (item: ConvertItem) => {
    if (!item.convertedUrl) return;
    const ext = item.targetFormat.split('/')[1] || 'webp';
    const baseName = item.file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    const ready = items.filter((i) => i.status === 'done' && i.convertedBlob);
    if (ready.length === 0) return;

    const zip = new JSZip();
    ready.forEach((item) => {
      const ext = item.targetFormat.split('/')[1] || 'webp';
      const baseName = item.file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}.${ext}`, item.convertedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `mmx7-converted-images-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Batch ZIP downloaded!', 'success');
  };

  const isConvertingToJpeg = globalTargetFormat === 'image/jpeg';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolConvertTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolConvertDesc')}</p>
      </div>

      {items.length === 0 ? (
        <UploadDropzone
          multiple={true}
          onFilesSelected={handleFiles}
          title="Drop images here to convert"
          subtitle="Supports PNG, JPG, WebP · Convert singly or in batches"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Target Format
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WebP' },
                  { id: 'image/png', label: 'PNG' },
                  { id: 'image/jpeg', label: 'JPEG' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setGlobalTargetFormat(fmt.id as any)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      globalTargetFormat === fmt.id
                        ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                        : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Transparency Warning for JPEG */}
              {isConvertingToJpeg && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>JPEG Transparency Note</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    JPEG does not support alpha transparency. Any transparent background will be filled with the selected color below:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={bgColorForJpeg}
                      onChange={(e) => setBgColorForJpeg(e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-[#F4F7FF]">{bgColorForJpeg}</span>
                  </div>
                </div>
              )}

              {/* Quality */}
              {globalTargetFormat !== 'image/png' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                    <span>Encoding Quality</span>
                    <span>{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                  />
                </div>
              )}

              <button
                onClick={handleConvertAll}
                disabled={isConvertingAll}
                className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isConvertingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Converting {items.length} Files...</span>
                  </>
                ) : (
                  <>
                    <span>Convert All to {globalTargetFormat.split('/')[1].toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {items.some((i) => i.status === 'done') && (
                <button
                  onClick={handleDownloadZip}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#36D6C5]/20 hover:bg-[#36D6C5]/30 border border-[#36D6C5]/40 text-[#36D6C5] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <label className="text-xs text-[#6C63FF] hover:text-[#A78BFA] cursor-pointer font-medium">
                  + Add More
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                  />
                </label>
                <button
                  onClick={() => setItems([])}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-2 border-b border-white/5">
                Files Queue ({items.length})
              </span>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#0D1220] border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.previewUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#F4F7FF] truncate max-w-xs">{item.file.name}</p>
                        <p className="text-[11px] text-[#9AA8BD] mt-0.5">
                          {item.originalFormat.split('/')[1]?.toUpperCase() || 'IMAGE'} &rarr;{' '}
                          <span className="text-[#36D6C5] font-bold">
                            {globalTargetFormat.split('/')[1]?.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'done' ? (
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="py-1.5 px-3 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#9AA8BD]">
                          {item.status === 'converting' ? 'Converting...' : 'Pending'}
                        </span>
                      )}

                      <button
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="p-1.5 rounded-lg text-[#9AA8BD] hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
