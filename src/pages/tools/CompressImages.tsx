import React, { useState } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Trash2, Sliders, CheckCircle, FileArchive, ArrowRight } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { BeforeAfterSlider } from '../../components/ui/BeforeAfterSlider';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface CompressedItem {
  id: string;
  originalFile: File;
  originalUrl: string;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number;
  savingPercent: number;
  status: 'idle' | 'compressing' | 'done' | 'error';
}

export const CompressImages: React.FC = () => {
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [isCompressingAll, setIsCompressingAll] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    const newItems: CompressedItem[] = files.map((file) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedBlob: null,
      compressedUrl: null,
      compressedSize: 0,
      savingPercent: 0,
      status: 'idle',
    }));

    setItems((prev) => [...prev, ...newItems]);
    if (!selectedItemId && newItems.length > 0) {
      setSelectedItemId(newItems[0].id);
    }
  };

  const compressSingleItem = async (item: CompressedItem, currentQuality: number, format: string): Promise<CompressedItem> => {
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

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ ...item, status: 'error' });
              return;
            }

            const compressedSize = blob.size;
            const savingPercent = Math.max(0, Math.round(((item.originalSize - compressedSize) / item.originalSize) * 100));
            const compressedUrl = URL.createObjectURL(blob);

            recordJob({
              toolType: 'compress-images',
              inputName: item.originalFile.name,
              inputSize: item.originalSize,
              outputSize: compressedSize,
              format: format.split('/')[1] || 'webp',
            });

            resolve({
              ...item,
              compressedBlob: blob,
              compressedUrl,
              compressedSize,
              savingPercent,
              status: 'done',
            });
          },
          format,
          currentQuality / 100
        );
      };
      img.onerror = () => resolve({ ...item, status: 'error' });
      img.src = item.originalUrl;
    });
  };

  const handleCompressAll = async () => {
    if (items.length === 0) return;

    const allowed = await checkCanProcess({
      toolType: 'compress-images',
      batchCount: items.length,
    });
    if (!allowed) return;

    setIsCompressingAll(true);

    const updatedItems = [...items];
    for (let i = 0; i < updatedItems.length; i++) {
      updatedItems[i].status = 'compressing';
      setItems([...updatedItems]);
      const processed = await compressSingleItem(updatedItems[i], quality, outputFormat);
      updatedItems[i] = processed;
      setItems([...updatedItems]);
    }

    setIsCompressingAll(false);
    showToast('Compression completed successfully!', 'success');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  const handleDownloadSingle = (item: CompressedItem) => {
    if (!item.compressedUrl) return;
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    const ext = outputFormat.split('/')[1] || 'webp';
    const baseName = item.originalFile.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`, 'success');
  };

  const handleDownloadZip = async () => {
    const readyItems = items.filter((i) => i.status === 'done' && i.compressedBlob);
    if (readyItems.length === 0) {
      showToast('No compressed images ready for download yet.', 'warning');
      return;
    }

    const zip = new JSZip();
    const ext = outputFormat.split('/')[1] || 'webp';

    readyItems.forEach((item) => {
      const baseName = item.originalFile.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}-compressed.${ext}`, item.compressedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `mmx7-compressed-images-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('Batch ZIP archive downloaded!', 'success');
    confetti({ particleCount: 70, spread: 60 });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolCompressTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolCompressDesc')}</p>
      </div>

      {items.length === 0 ? (
        <UploadDropzone
          multiple={true}
          onFilesSelected={handleFiles}
          title="Drop one or multiple images to compress"
          subtitle="Supports JPG, PNG, and WebP · Batch processing available"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#6C63FF]" />
                  Compression Settings
                </span>
                <span className="text-xs font-bold text-[#36D6C5]">{quality}%</span>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                  <span>Smaller File</span>
                  <span>Better Quality</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-[#9AA8BD]/70">
                  Recommended: 80% for perfect balance between file size and sharpness.
                </p>
              </div>

              {/* Format selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#F4F7FF]">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP' },
                    { id: 'image/jpeg', label: 'JPEG' },
                    { id: 'image/png', label: 'PNG' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setOutputFormat(fmt.id as any)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        outputFormat === fmt.id
                          ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                          : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Process Action */}
              <button
                onClick={handleCompressAll}
                disabled={isCompressingAll}
                className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCompressingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compressing {items.length} Files...</span>
                  </>
                ) : (
                  <>
                    <span>Compress All ({items.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Batch ZIP Download */}
              {items.some((i) => i.status === 'done') && (
                <button
                  onClick={handleDownloadZip}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#36D6C5]/20 hover:bg-[#36D6C5]/30 border border-[#36D6C5]/40 text-[#36D6C5] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              )}

              {/* Add more files or clear */}
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
                  <span>Clear Queue</span>
                </button>
              </div>
            </div>

            {/* Queue List */}
            <div className="p-4 rounded-2xl bg-[#121A2A] border border-white/10 space-y-2 max-h-72 overflow-y-auto">
              <span className="text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider block mb-2">
                Queue ({items.length})
              </span>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    selectedItemId === item.id
                      ? 'border-[#6C63FF] bg-[#182338]'
                      : 'border-white/5 bg-[#0D1220] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.originalUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#F4F7FF] truncate max-w-[130px]">
                        {item.originalFile.name}
                      </p>
                      <p className="text-[10px] text-[#9AA8BD]">
                        {formatBytes(item.originalSize)}
                        {item.status === 'done' && (
                          <span className="text-[#36D6C5] font-semibold ml-1">
                            &rarr; {formatBytes(item.compressedSize)} (-{item.savingPercent}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === 'done' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(item);
                        }}
                        className="p-1 rounded-lg text-[#36D6C5] hover:bg-[#36D6C5]/20"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItems((prev) => prev.filter((i) => i.id !== item.id));
                      }}
                      className="p-1 rounded-lg text-[#9AA8BD] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedItem && (
              <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F4F7FF]">{selectedItem.originalFile.name}</h3>
                    <p className="text-xs text-[#9AA8BD]">
                      Original: {formatBytes(selectedItem.originalSize)}
                      {selectedItem.status === 'done' && (
                        <span className="text-[#36D6C5] font-bold ml-2">
                          Compressed: {formatBytes(selectedItem.compressedSize)} (Saved {selectedItem.savingPercent}%)
                        </span>
                      )}
                    </p>
                  </div>

                  {selectedItem.status === 'done' && (
                    <button
                      onClick={() => handleDownloadSingle(selectedItem)}
                      className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('downloadImage')}</span>
                    </button>
                  )}
                </div>

                {/* Visual Preview */}
                {selectedItem.compressedUrl ? (
                  <BeforeAfterSlider
                    originalUrl={selectedItem.originalUrl}
                    processedUrl={selectedItem.compressedUrl}
                    originalLabel={`Original (${formatBytes(selectedItem.originalSize)})`}
                    processedLabel={`Compressed (${formatBytes(selectedItem.compressedSize)})`}
                  />
                ) : (
                  <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden aspect-video flex items-center justify-center">
                    <img
                      src={selectedItem.originalUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-sm font-semibold text-[#F4F7FF]">Ready for Compression</p>
                      <p className="text-xs text-[#9AA8BD] mt-1 max-w-xs">
                        Adjust quality on the left and click "Compress All" to generate the optimized file.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
