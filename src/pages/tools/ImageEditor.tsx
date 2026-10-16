import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Type,
  Smile,
  Sliders,
  RotateCcw,
  Save,
  Trash2,
  Square,
  Circle,
  Sparkles,
} from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface EditorTextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  isMemeHeader?: boolean;
  isMemeFooter?: boolean;
}

interface EditorSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export const ImageEditor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Active tab in sidebar
  const [activeTab, setActiveTab] = useState<'text' | 'stickers' | 'filters'>('text');

  // Meme text inputs
  const [topText, setTopText] = useState<string>('TOP MEME TEXT');
  const [bottomText, setBottomText] = useState<string>('BOTTOM MEME TEXT');
  const [memeTextColor, setMemeTextColor] = useState<string>('#FFFFFF');
  const [memeFontSize, setMemeFontSize] = useState<number>(44);

  // Stickers on canvas
  const [stickers, setStickers] = useState<EditorSticker[]>([]);

  // Filter adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { checkCanProcess, recordJob, user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setExportedUrl(null);
    setTopText('WHEN YOU FIND');
    setBottomText('THE PERFECT TOOL');
  };

  const STICKER_LIST = ['🔥', '✨', '🚀', '💯', '⭐', '❤️', '🏆', '🎯', '👑', '🎉', '💡', '😎'];

  const addSticker = (emoji: string) => {
    const s: EditorSticker = {
      id: `stick_${Date.now()}_${Math.random()}`,
      emoji,
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      size: 48,
    };
    setStickers((prev) => [...prev, s]);
  };

  const renderCanvas = () => {
    if (!previewUrl) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS-like canvas filters to base image
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // Draw Top Meme Text
      if (topText.trim()) {
        drawMemeText(ctx, topText.toUpperCase(), canvas.width / 2, 30 + memeFontSize, memeFontSize, memeTextColor);
      }

      // Draw Bottom Meme Text
      if (bottomText.trim()) {
        drawMemeText(ctx, bottomText.toUpperCase(), canvas.width / 2, canvas.height - 30, memeFontSize, memeTextColor);
      }

      // Draw Stickers
      stickers.forEach((s) => {
        ctx.font = `${s.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji, s.x * canvas.width, s.y * canvas.height);
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const outUrl = URL.createObjectURL(blob);
        setExportedUrl(outUrl);
      }, 'image/png');
    };
    img.src = previewUrl;
  };

  const drawMemeText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.font = `900 ${size}px Impact, "Arial Black", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black stroke border around letters
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.round(size / 9));
    ctx.strokeText(text, x, y);

    // Main fill text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  useEffect(() => {
    if (previewUrl) {
      renderCanvas();
    }
  }, [previewUrl, topText, bottomText, memeTextColor, memeFontSize, stickers, brightness, contrast, saturation, grayscale, sepia]);

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!exportedUrl || !file) return;

    const allowed = await checkCanProcess({ toolType: 'image-editor', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    const a = document.createElement('a');
    a.href = exportedUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-edited.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    recordJob({
      toolType: 'image-editor',
      inputName: file.name,
      inputSize: file.size,
      outputSize: file.size,
      format,
    });

    showToast(`Exported ${a.download}`, 'success');
  };

  const handleSaveProject = async () => {
    if (!user) {
      showToast('Please sign in to save projects to your cloud workspace.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('mmx7_auth_token')}`,
        },
        body: JSON.stringify({
          title: `Meme Project - ${file?.name || 'Untitled'}`,
          projectType: 'image-editor',
          thumbnail: exportedUrl || '',
          metadata: {
            topText,
            bottomText,
            memeFontSize,
            stickersCount: stickers.length,
          },
        }),
      });

      if (res.ok) {
        showToast('Project saved to your dashboard!', 'success');
      }
    } catch {
      showToast('Error saving project', 'error');
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setSepia(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolEditorTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolEditorDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to edit or generate memes"
          subtitle="Add meme headlines, viral stickers, adjust lighting and color curves"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              {/* Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#182338] rounded-xl border border-white/5">
                {[
                  { id: 'text', label: 'Meme Text', icon: Type },
                  { id: 'stickers', label: 'Stickers', icon: Smile },
                  { id: 'filters', label: 'Filters', icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#6C63FF] text-white shadow-sm'
                          : 'text-[#9AA8BD] hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Text Tab */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Top Caption</label>
                    <input
                      type="text"
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                      placeholder="TOP TEXT..."
                      className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#9AA8BD] mb-1 block">Bottom Caption</label>
                    <input
                      type="text"
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                      placeholder="BOTTOM TEXT..."
                      className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#9AA8BD] mb-1 block">Font Size ({memeFontSize}px)</label>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={memeFontSize}
                        onChange={(e) => setMemeFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#9AA8BD] mb-1 block">Text Color</label>
                      <input
                        type="color"
                        value={memeTextColor}
                        onChange={(e) => setMemeTextColor(e.target.value)}
                        className="w-full h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stickers Tab */}
              {activeTab === 'stickers' && (
                <div className="space-y-3">
                  <span className="text-xs text-[#9AA8BD] block">Click an emoji badge to stamp onto canvas:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {STICKER_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="h-12 text-2xl rounded-xl bg-[#182338] hover:bg-white/10 border border-white/5 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {stickers.length > 0 && (
                    <button
                      onClick={() => setStickers([])}
                      className="w-full py-1.5 text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 mt-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Stickers ({stickers.length})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === 'filters' && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[#9AA8BD]">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[#9AA8BD]">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[#9AA8BD]">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                      className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[#9AA8BD]">
                      <span>Grayscale</span>
                      <span>{grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(parseInt(e.target.value, 10))}
                      className="w-full accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                    />
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full py-1.5 text-xs text-[#9AA8BD] hover:text-white flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Lighting</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleExport('png')}
                    className="py-2.5 px-3 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export PNG</span>
                  </button>
                  <button
                    onClick={() => handleExport('jpeg')}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JPG</span>
                  </button>
                </div>

                <button
                  onClick={handleSaveProject}
                  className="w-full py-2 px-3 rounded-xl bg-[#6C63FF]/20 hover:bg-[#6C63FF]/30 border border-[#6C63FF]/40 text-[#A78BFA] text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Project to Account</span>
                </button>
              </div>

              <button
                onClick={() => setFile(null)}
                className="w-full py-1.5 text-xs text-[#9AA8BD] hover:text-white"
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Canvas Workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F7FF]">{file.name}</h3>
                  <p className="text-xs text-[#9AA8BD]">Interactive studio composition</p>
                </div>

                {exportedUrl && (
                  <button
                    onClick={() => handleExport('png')}
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
