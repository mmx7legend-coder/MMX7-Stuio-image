import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, Sparkles, RefreshCw, CheckCircle2, Image as ImageIcon, Sliders } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { BeforeAfterSlider } from '../../components/ui/BeforeAfterSlider';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const RemoveBackground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [backgroundMode, setBackgroundMode] = useState<'transparent' | 'color' | 'image'>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<number>(32);

  const rawCutoutCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setOriginalUrl(url);
    setProcessedUrl(null);
  };

  const executeBackgroundRemoval = async () => {
    if (!file || !originalUrl) return;

    const allowed = await checkCanProcess({ toolType: 'remove-background', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Sample corners to detect background color
      const samplePixels = [
        { r: data[0], g: data[1], b: data[2] }, // top-left
        { r: data[(width - 1) * 4], g: data[(width - 1) * 4 + 1], b: data[(width - 1) * 4 + 2] }, // top-right
        { r: data[(height - 1) * width * 4], g: data[(height - 1) * width * 4 + 1], b: data[(height - 1) * width * 4 + 2] }, // bottom-left
      ];

      // Average background sample
      const bgR = (samplePixels[0].r + samplePixels[1].r + samplePixels[2].r) / 3;
      const bgG = (samplePixels[0].g + samplePixels[1].g + samplePixels[2].g) / 3;
      const bgB = (samplePixels[0].b + samplePixels[1].b + samplePixels[2].b) / 3;

      const tolerance = sensitivity * 2.2;

      // Alpha matte algorithm with edge feathering
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance
        const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

        if (dist < tolerance) {
          data[i + 3] = 0; // Transparent
        } else if (dist < tolerance + 20) {
          // Soft boundary feather
          const alphaFactor = (dist - tolerance) / 20;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      rawCutoutCanvasRef.current = canvas;

      renderFinalOutput(canvas);
    };

    img.src = originalUrl;
  };

  const renderFinalOutput = (cutoutCanvas: HTMLCanvasElement) => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cutoutCanvas.width;
    finalCanvas.height = cutoutCanvas.height;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    if (backgroundMode === 'color') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    } else if (backgroundMode === 'image' && bgImageUrl) {
      const bgImg = new Image();
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(cutoutCanvas, 0, 0);
        finishExport(finalCanvas);
      };
      bgImg.src = bgImageUrl;
      return;
    }

    ctx.drawImage(cutoutCanvas, 0, 0);
    finishExport(finalCanvas);
  };

  const finishExport = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      setIsProcessing(false);
      if (!blob) return;

      const outUrl = URL.createObjectURL(blob);
      setProcessedUrl(outUrl);

      recordJob({
        toolType: 'remove-background',
        inputName: file?.name || 'photo.png',
        inputSize: file?.size || 0,
        outputSize: blob.size,
        format: backgroundMode === 'transparent' ? 'png' : 'jpeg',
      });

      showToast('Background successfully removed!', 'success');
      confetti({ particleCount: 50, spread: 60 });
    }, backgroundMode === 'transparent' ? 'image/png' : 'image/jpeg');
  };

  const handleDownload = () => {
    if (!processedUrl || !file) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = backgroundMode === 'transparent' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-no-bg.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolBgRemoveTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolBgRemoveDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to isolate subject"
          subtitle="Supports portraiture, products, logos, and digital artwork"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Background Options
              </span>

              {/* Mode */}
              <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                {[
                  { id: 'transparent', label: 'Transparent' },
                  { id: 'color', label: 'Solid Color' },
                  { id: 'image', label: 'Backdrop' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setBackgroundMode(m.id as any)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      backgroundMode === m.id
                        ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                        : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Solid Color Picker */}
              {backgroundMode === 'color' && (
                <div className="space-y-2 p-3 rounded-2xl bg-[#0D1220] border border-white/5">
                  <label className="text-xs text-[#9AA8BD] block">Select Fill Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-1.5">
                      {['#FFFFFF', '#080B14', '#6C63FF', '#36D6C5', '#F59E0B'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setSolidColor(c)}
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Image Backdrop */}
              {backgroundMode === 'image' && (
                <div className="space-y-2 p-3 rounded-2xl bg-[#0D1220] border border-white/5">
                  <label className="text-xs text-[#9AA8BD] block">Upload Backdrop Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const bgF = e.target.files[0];
                        setBgImageFile(bgF);
                        setBgImageUrl(URL.createObjectURL(bgF));
                      }
                    }}
                    className="text-xs text-[#9AA8BD]"
                  />
                </div>
              )}

              {/* Edge Sensitivity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                  <span>Matte Sensitivity</span>
                  <span>{sensitivity}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg cursor-pointer"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={executeBackgroundRemoval}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#36D6C5] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing Background...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Subject</span>
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
                    {processedUrl ? 'Cutout generated with alpha channel' : 'Original image loaded'}
                  </p>
                </div>

                {processedUrl && (
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cutout</span>
                  </button>
                )}
              </div>

              {/* Visual Display */}
              {processedUrl && originalUrl ? (
                <BeforeAfterSlider
                  originalUrl={originalUrl}
                  processedUrl={processedUrl}
                  originalLabel="Original Photo"
                  processedLabel="Isolated Cutout"
                />
              ) : (
                <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden flex items-center justify-center p-6 min-h-[380px]">
                  <img
                    src={originalUrl || ''}
                    alt="Original preview"
                    className="max-h-[460px] max-w-full object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-8 h-8 text-[#6C63FF] mb-2 animate-pulse" />
                    <p className="text-sm font-semibold text-[#F4F7FF]">Ready for Background Extraction</p>
                    <p className="text-xs text-[#9AA8BD] mt-1 max-w-xs">
                      Click "Extract Subject" to automatically segment the foreground and produce a transparent PNG.
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
