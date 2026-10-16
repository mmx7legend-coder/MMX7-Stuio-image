import React, { useState, useRef, useEffect } from 'react';
import { Download, Stamp, Image as ImageIcon, Type, Grid, Sliders } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const WatermarkImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('© MMX7 STUDIO');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [fontSize, setFontSize] = useState<number>(36);
  const [opacity, setOpacity] = useState<number>(75);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'tile'>('bottom-right');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(30);

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
    setWatermarkedUrl(null);
  };

  const renderWatermark = () => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base photo
      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (mode === 'text') {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.textBaseline = 'middle';

        if (position === 'tile') {
          const metrics = ctx.measureText(watermarkText);
          const stepX = metrics.width + 120;
          const stepY = fontSize + 100;

          for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
            for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate((-30 * Math.PI) / 180);
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
        } else {
          const metrics = ctx.measureText(watermarkText);
          const padding = 40;
          let posX = canvas.width / 2;
          let posY = canvas.height / 2;

          if (position === 'bottom-right') {
            posX = canvas.width - metrics.width - padding;
            posY = canvas.height - padding - fontSize / 2;
          } else if (position === 'bottom-left') {
            posX = padding;
            posY = canvas.height - padding - fontSize / 2;
          } else if (position === 'top-right') {
            posX = canvas.width - metrics.width - padding;
            posY = padding + fontSize / 2;
          } else if (position === 'top-left') {
            posX = padding;
            posY = padding + fontSize / 2;
          }

          ctx.save();
          ctx.translate(posX + metrics.width / 2, posY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(watermarkText, -metrics.width / 2, 0);
          ctx.restore();
        }
      } else if (mode === 'image' && logoUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const maxLogoW = (canvas.width * (logoScale / 100));
          const aspect = logoImg.naturalHeight / logoImg.naturalWidth;
          const targetW = maxLogoW;
          const targetH = maxLogoW * aspect;

          const padding = 40;
          let posX = (canvas.width - targetW) / 2;
          let posY = (canvas.height - targetH) / 2;

          if (position === 'bottom-right') {
            posX = canvas.width - targetW - padding;
            posY = canvas.height - targetH - padding;
          } else if (position === 'top-right') {
            posX = canvas.width - targetW - padding;
            posY = padding;
          }

          ctx.drawImage(logoImg, posX, posY, targetW, targetH);
          ctx.restore();
          updateBlob(canvas);
        };
        logoImg.src = logoUrl;
        return;
      }

      ctx.restore();
      updateBlob(canvas);
    };
    img.src = previewUrl;
  };

  const updateBlob = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setWatermarkedUrl(url);
    }, 'image/png');
  };

  useEffect(() => {
    if (previewUrl) {
      renderWatermark();
    }
  }, [previewUrl, mode, watermarkText, textColor, fontSize, opacity, rotation, position, logoUrl, logoScale]);

  const handleDownload = async () => {
    if (!watermarkedUrl || !file) return;

    const allowed = await checkCanProcess({ toolType: 'watermark-images', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    const a = document.createElement('a');
    a.href = watermarkedUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-watermarked.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    recordJob({
      toolType: 'watermark-images',
      inputName: file.name,
      inputSize: file.size,
      outputSize: file.size,
      format: 'png',
    });

    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolWatermarkTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolWatermarkDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to add watermark"
          subtitle="Add text stamps, logos, or diagonal anti-theft tiling patterns"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Watermark Style
              </span>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('text')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    mode === 'text'
                      ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                      : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text Stamp</span>
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    mode === 'image'
                      ? 'border-[#36D6C5] bg-[#36D6C5]/20 text-[#36D6C5]'
                      : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Logo PNG</span>
                </button>
              </div>

              {/* Text Controls */}
              {mode === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Stamp Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-sm text-[#F4F7FF] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#9AA8BD] mb-1 block">Font Size ({fontSize}px)</label>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#9AA8BD] mb-1 block">Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs text-[#9AA8BD] block">Select Logo (PNG with Alpha)</label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const lF = e.target.files[0];
                        setLogoFile(lF);
                        setLogoUrl(URL.createObjectURL(lF));
                      }
                    }}
                    className="text-xs text-[#9AA8BD]"
                  />
                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Logo Size ({logoScale}%)</label>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={logoScale}
                      onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                      className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#9AA8BD]">
                  <span>Opacity</span>
                  <span>{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                />
              </div>

              {/* Position Presets */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9AA8BD] block">Placement</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'center', label: 'Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                    { id: 'tile', label: 'Repeat Tile' },
                    { id: 'bottom-right', label: 'Bottom Right' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id as any)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-colors ${
                        position === pos.id
                          ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                          : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export Watermarked Image</span>
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
                  <p className="text-xs text-[#9AA8BD]">Live watermark preview</p>
                </div>

                {watermarkedUrl && (
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
