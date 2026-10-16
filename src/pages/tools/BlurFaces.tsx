import React, { useState, useRef, useEffect } from 'react';
import { Download, Shield, ShieldAlert, Sparkles, Trash2, Plus, Sliders } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface BlurRegion {
  id: string;
  x: number; // normalized [0..1]
  y: number;
  w: number;
  h: number;
}

export const BlurFaces: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurredUrl, setBlurredUrl] = useState<string | null>(null);

  const [style, setStyle] = useState<'pixelate' | 'blur'>('pixelate');
  const [intensity, setIntensity] = useState<number>(18);
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setBlurredUrl(null);

    // Initial default center face region
    const initialRegion: BlurRegion = {
      id: `region_${Date.now()}`,
      x: 0.35,
      y: 0.2,
      w: 0.3,
      h: 0.3,
    };
    setRegions([initialRegion]);
    setSelectedRegionId(initialRegion.id);
  };

  const autoDetectFaces = () => {
    // Detect standard face portrait quadrant heuristics
    const detected: BlurRegion[] = [
      { id: `face_1_${Date.now()}`, x: 0.35, y: 0.18, w: 0.28, h: 0.32 },
    ];
    setRegions(detected);
    showToast('Face privacy mask estimated and positioned', 'info');
  };

  const addRegion = () => {
    const newReg: BlurRegion = {
      id: `reg_${Date.now()}`,
      x: 0.2 + Math.random() * 0.4,
      y: 0.2 + Math.random() * 0.4,
      w: 0.25,
      h: 0.25,
    };
    setRegions((prev) => [...prev, newReg]);
    setSelectedRegionId(newReg.id);
  };

  const renderObfuscatedCanvas = () => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base image
      ctx.drawImage(img, 0, 0);

      // Apply blur/pixelation to each region
      regions.forEach((r) => {
        const rx = Math.max(0, Math.round(r.x * canvas.width));
        const ry = Math.max(0, Math.round(r.y * canvas.height));
        const rw = Math.min(canvas.width - rx, Math.round(r.w * canvas.width));
        const rh = Math.min(canvas.height - ry, Math.round(r.h * canvas.height));

        if (rw <= 0 || rh <= 0) return;

        if (style === 'pixelate') {
          // Pixelation technique: draw small, then scale back up without smoothing
          const pixelSize = Math.max(4, Math.round((intensity / 100) * 40));
          const smallW = Math.max(1, Math.round(rw / pixelSize));
          const smallH = Math.max(1, Math.round(rh / pixelSize));

          const offscreen = document.createElement('canvas');
          offscreen.width = smallW;
          offscreen.height = smallH;
          const offCtx = offscreen.getContext('2d');
          if (!offCtx) return;

          offCtx.drawImage(canvas, rx, ry, rw, rh, 0, 0, smallW, smallH);

          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(offscreen, 0, 0, smallW, smallH, rx, ry, rw, rh);
          ctx.imageSmoothingEnabled = true;
        } else {
          // Gaussian blur filter
          ctx.save();
          ctx.beginPath();
          ctx.rect(rx, ry, rw, rh);
          ctx.clip();
          ctx.filter = `blur(${Math.max(2, Math.round(intensity / 3))}px)`;
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const outUrl = URL.createObjectURL(blob);
        setBlurredUrl(outUrl);
      }, 'image/jpeg', 0.94);
    };
    img.src = previewUrl;
  };

  useEffect(() => {
    if (previewUrl) {
      renderObfuscatedCanvas();
    }
  }, [previewUrl, regions, style, intensity]);

  const handleDownload = async () => {
    if (!blurredUrl || !file) return;

    const allowed = await checkCanProcess({ toolType: 'blur-faces', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    const a = document.createElement('a');
    a.href = blurredUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-anonymized.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    recordJob({
      toolType: 'blur-faces',
      inputName: file.name,
      inputSize: file.size,
      outputSize: file.size,
      format: 'jpg',
    });

    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolFaceBlurTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolFaceBlurDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to obfuscate faces or private data"
          subtitle="Pixelate or blur personal faces, identity cards, license plates, and sensitive documents"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Privacy Controls
              </span>

              {/* Style: Mosaic vs Blur */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStyle('pixelate')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    style === 'pixelate'
                      ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                      : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                  }`}
                >
                  Mosaic Pixelation
                </button>
                <button
                  onClick={() => setStyle('blur')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    style === 'blur'
                      ? 'border-[#36D6C5] bg-[#36D6C5]/20 text-[#36D6C5] font-bold'
                      : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                  }`}
                >
                  Gaussian Blur
                </button>
              </div>

              {/* Obfuscation Intensity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#9AA8BD]">
                  <span>Mask Strength</span>
                  <span>{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                />
              </div>

              {/* Regions manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                  <span>Privacy Regions ({regions.length})</span>
                  <button
                    onClick={addRegion}
                    className="text-[#6C63FF] hover:text-[#A78BFA] flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Box</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {regions.map((reg, idx) => (
                    <div
                      key={reg.id}
                      className="p-2 rounded-xl bg-[#0D1220] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="text-[#F4F7FF] font-medium">Region #{idx + 1}</span>
                      <button
                        onClick={() => setRegions((prev) => prev.filter((r) => r.id !== reg.id))}
                        className="text-[#9AA8BD] hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto detect helper */}
              <button
                onClick={autoDetectFaces}
                className="w-full py-2 px-3 rounded-xl bg-[#182338] hover:bg-white/5 text-xs text-[#F4F7FF] border border-white/5 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
                <span>Estimate Face Position</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Anonymized Photo</span>
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
                  <p className="text-xs text-[#9AA8BD]">Permanent client-side raster obfuscation</p>
                </div>

                {blurredUrl && (
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden flex items-center justify-center p-4 min-h-[420px]">
                <canvas ref={canvasRef} className="max-h-[500px] max-w-full object-contain rounded-lg shadow-xl" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
