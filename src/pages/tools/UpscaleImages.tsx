import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Sparkles, RefreshCw, Maximize2, AlertCircle } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { BeforeAfterSlider } from '../../components/ui/BeforeAfterSlider';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const UpscaleImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);
  const [scaleFactor, setScaleFactor] = useState<2 | 4 | 8>(2);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sharpenAmount, setSharpenAmount] = useState<number>(40);

  const { checkCanProcess, recordJob, user, openUpgradeModal } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setOriginalUrl(url);
    setUpscaledUrl(null);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const executeUpscale = async () => {
    if (!file || !originalUrl || !originalDims) return;

    if (scaleFactor === 8 && user?.plan !== 'studio') {
      openUpgradeModal('8x Ultra Super-Resolution is available exclusively on the Studio plan.');
      return;
    }

    const allowed = await checkCanProcess({ toolType: 'upscale-images', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    setIsProcessing(true);

    const targetW = originalDims.width * scaleFactor;
    const targetH = originalDims.height * scaleFactor;

    // Canvas bicubic super-resolution + unsharp masking
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Unsharp masking filter for edge detail synthesis
        try {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          const factor = (sharpenAmount / 100) * 0.4;

          // 3x3 Laplacian sharpening convolution kernel:
          // [ 0, -1,  0 ]
          // [-1,  5, -1 ]
          // [ 0, -1,  0 ]
          const copy = new Uint8ClampedArray(data);
          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const i = (y * targetW + x) * 4;
              for (let c = 0; c < 3; c++) {
                const val = copy[i + c] * (1 + 4 * factor) -
                  (copy[((y - 1) * targetW + x) * 4 + c] +
                    copy[((y + 1) * targetW + x) * 4 + c] +
                    copy[(y * targetW + (x - 1)) * 4 + c] +
                    copy[(y * targetW + (x + 1)) * 4 + c]) * factor;
                data[i + c] = Math.max(0, Math.min(255, val));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          // In case of any cross-origin restrictions, fallback cleanly
          console.warn('Unsharp masking pass fallback:', e);
        }

        canvas.toBlob((blob) => {
          setIsProcessing(false);
          if (!blob) return;

          const outUrl = URL.createObjectURL(blob);
          setUpscaledUrl(outUrl);

          recordJob({
            toolType: 'upscale-images',
            inputName: file.name,
            inputSize: file.size,
            outputSize: blob.size,
            format: 'png',
          });

          showToast(`Upscaled to ${targetW}x${targetH}px!`, 'success');
          confetti({ particleCount: 50, spread: 60 });
        }, 'image/png');
      };
      img.src = originalUrl;
    }, 400);
  };

  const handleDownload = () => {
    if (!upscaledUrl || !file || !originalDims) return;
    const a = document.createElement('a');
    a.href = upscaledUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-${scaleFactor}x-upscaled.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolUpscaleTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolUpscaleDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to upscale & enhance details"
          subtitle="Enlarge 2x, 4x, or 8x without pixelation"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Upscaling Factors
              </span>

              {/* Multiplier buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { factor: 2, label: '2x HD' },
                  { factor: 4, label: '4x Ultra' },
                  { factor: 8, label: '8x Max', studioOnly: true },
                ].map((s) => (
                  <button
                    key={s.factor}
                    onClick={() => setScaleFactor(s.factor as any)}
                    className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                      scaleFactor === s.factor
                        ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                        : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                    }`}
                  >
                    <div className="text-base font-extrabold">{s.factor}x</div>
                    <div className="text-[10px] opacity-75">{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Dimensions comparison */}
              {originalDims && (
                <div className="p-3.5 rounded-2xl bg-[#0D1220] border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-[#9AA8BD]">
                    <span>Original Resolution:</span>
                    <span className="text-[#F4F7FF] font-medium">
                      {originalDims.width} &times; {originalDims.height}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9AA8BD]">
                    <span>Upscaled Target:</span>
                    <span className="text-[#36D6C5] font-bold">
                      {originalDims.width * scaleFactor} &times; {originalDims.height * scaleFactor}
                    </span>
                  </div>
                </div>
              )}

              {/* Detail Enhancement Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                  <span>Detail Sharpening</span>
                  <span>{sharpenAmount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpenAmount}
                  onChange={(e) => setSharpenAmount(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                />
              </div>

              {/* Upscale Action */}
              <button
                onClick={executeUpscale}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#36D6C5] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing High-Res Details...</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Upscale Image ({scaleFactor}x)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setFile(null)}
                className="w-full py-2 text-xs text-[#9AA8BD] hover:text-white"
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F7FF]">{file.name}</h3>
                  <p className="text-xs text-[#9AA8BD]">
                    {upscaledUrl
                      ? `Enhanced resolution: ${originalDims?.width! * scaleFactor}x${originalDims?.height! * scaleFactor} px`
                      : 'Drag slider below after processing to compare detail sharpness'}
                  </p>
                </div>

                {upscaledUrl && (
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {scaleFactor}x Image</span>
                  </button>
                )}
              </div>

              {upscaledUrl && originalUrl ? (
                <BeforeAfterSlider
                  originalUrl={originalUrl}
                  processedUrl={upscaledUrl}
                  originalLabel={`Original (${originalDims?.width}x${originalDims?.height})`}
                  processedLabel={`Super-Resolution (${originalDims?.width! * scaleFactor}x${originalDims?.height! * scaleFactor})`}
                />
              ) : (
                <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden flex items-center justify-center p-6 min-h-[380px]">
                  <img
                    src={originalUrl || ''}
                    alt="Original preview"
                    className="max-h-[460px] max-w-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                    <Maximize2 className="w-8 h-8 text-[#6C63FF] mb-2 animate-pulse" />
                    <p className="text-sm font-semibold text-[#F4F7FF]">Ready for Super-Resolution</p>
                    <p className="text-xs text-[#9AA8BD] mt-1 max-w-xs">
                      Enlarge low-resolution photos and recover crisp edge geometry using bicubic reconstruction.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
