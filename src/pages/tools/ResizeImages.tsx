import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Lock, Unlock, Sliders, CheckCircle2 } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const ResizeImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);

  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setResizedUrl(null);

    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalDimensions && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalDimensions && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const applyPercentage = (pct: number) => {
    if (!originalDimensions) return;
    const newW = Math.round((originalDimensions.width * pct) / 100);
    const newH = Math.round((originalDimensions.height * pct) / 100);
    setWidth(newW);
    setHeight(newH);
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setWidth(presetW);
    setHeight(presetH);
    setLockAspect(false);
  };

  const handleResize = async () => {
    if (!file || !previewUrl || width <= 0 || height <= 0) return;

    if (width > 10000 || height > 10000) {
      showToast('Maximum dimension allowed is 10,000 pixels', 'error');
      return;
    }

    const allowed = await checkCanProcess({ toolType: 'resize-images', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (!blob) {
            showToast('Failed generating resized image', 'error');
            return;
          }

          const outUrl = URL.createObjectURL(blob);
          setResizedUrl(outUrl);
          setResizedSize(blob.size);

          recordJob({
            toolType: 'resize-images',
            inputName: file.name,
            inputSize: file.size,
            outputSize: blob.size,
            format: outputFormat.split('/')[1] || 'webp',
          });

          showToast(`Resized to ${width}x${height}px`, 'success');
        },
        outputFormat,
        0.92
      );
    };
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = outputFormat.split('/')[1] || 'webp';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-${width}x${height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolResizeTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolResizeDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to resize"
          subtitle="Supports JPG, PNG, and WebP · Exact pixel and preset scaling"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD]">Resize Controls</span>
                {originalDimensions && (
                  <span className="text-[11px] text-[#9AA8BD]">
                    Original: {originalDimensions.width} &times; {originalDimensions.height}
                  </span>
                )}
              </div>

              {/* Dimension Inputs */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Width (px)</label>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={width}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] text-sm focus:border-[#6C63FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Height (px)</label>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={height}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] text-sm focus:border-[#6C63FF] outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    lockAspect
                      ? 'border-[#36D6C5]/40 bg-[#36D6C5]/10 text-[#36D6C5]'
                      : 'border-white/10 bg-[#182338] text-[#9AA8BD]'
                  }`}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>
              </div>

              {/* Quick Percentages */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9AA8BD] block">Scale by Percentage</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => applyPercentage(pct)}
                      className="py-1.5 rounded-lg bg-[#182338] hover:bg-[#6C63FF]/20 text-xs font-semibold text-[#F4F7FF] border border-white/5 transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Media Presets */}
              <div className="space-y-2">
                <label className="text-xs text-[#9AA8BD] block">Social Media Presets</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => applyPreset(1080, 1080)}
                    className="p-2 rounded-xl bg-[#182338] hover:bg-white/5 text-left border border-white/5"
                  >
                    <div className="font-semibold text-[#F4F7FF]">Instagram Square</div>
                    <div className="text-[10px] text-[#9AA8BD]">1080 x 1080 (1:1)</div>
                  </button>
                  <button
                    onClick={() => applyPreset(1080, 1920)}
                    className="p-2 rounded-xl bg-[#182338] hover:bg-white/5 text-left border border-white/5"
                  >
                    <div className="font-semibold text-[#F4F7FF]">Story / Reel</div>
                    <div className="text-[10px] text-[#9AA8BD]">1080 x 1920 (9:16)</div>
                  </button>
                  <button
                    onClick={() => applyPreset(1280, 720)}
                    className="p-2 rounded-xl bg-[#182338] hover:bg-white/5 text-left border border-white/5"
                  >
                    <div className="font-semibold text-[#F4F7FF]">YouTube Thumb</div>
                    <div className="text-[10px] text-[#9AA8BD]">1280 x 720 (16:9)</div>
                  </button>
                  <button
                    onClick={() => applyPreset(1500, 500)}
                    className="p-2 rounded-xl bg-[#182338] hover:bg-white/5 text-left border border-white/5"
                  >
                    <div className="font-semibold text-[#F4F7FF]">Twitter Header</div>
                    <div className="text-[10px] text-[#9AA8BD]">1500 x 500 (3:1)</div>
                  </button>
                </div>
              </div>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9AA8BD] block">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP' },
                    { id: 'image/jpeg', label: 'JPEG' },
                    { id: 'image/png', label: 'PNG' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOutputFormat(f.id as any)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        outputFormat === f.id
                          ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                          : 'border-white/5 bg-[#182338] text-[#9AA8BD]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize Action */}
              <button
                onClick={handleResize}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Resample...</span>
                  </>
                ) : (
                  <span>Apply Resize</span>
                )}
              </button>

              <button
                onClick={() => setFile(null)}
                className="w-full py-2 text-xs text-[#9AA8BD] hover:text-white transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F7FF]">{file.name}</h3>
                  <p className="text-xs text-[#9AA8BD]">
                    Target: {width} &times; {height} px
                    {resizedSize > 0 && <span className="text-[#36D6C5] ml-2">({(resizedSize / 1024).toFixed(1)} KB)</span>}
                  </p>
                </div>

                {resizedUrl && (
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden flex items-center justify-center p-4 min-h-[360px] max-h-[560px]">
                <img
                  src={resizedUrl || previewUrl || ''}
                  alt="Resized output"
                  className="max-h-[500px] max-w-full object-contain rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
