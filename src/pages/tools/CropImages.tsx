import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Download, Crop as CropIcon, RefreshCw } from 'lucide-react';
import { UploadDropzone } from '../../components/ui/UploadDropzone';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const CropImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = freeform
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  // Normalized crop coordinates [0..1]
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const { checkCanProcess, recordJob } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setCroppedUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });

    const img = new Image();
    img.onload = () => {
      imageObjRef.current = img;
    };
    img.src = url;
  };

  const applyCropRatio = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (!ratio) return;

    // Adjust crop box to match ratio
    setCrop((prev) => {
      const newH = Math.min(0.9, prev.w / ratio);
      return { ...prev, h: newH };
    });
  };

  const executeCrop = async () => {
    if (!file || !imageObjRef.current) return;
    const img = imageObjRef.current;

    const allowed = await checkCanProcess({ toolType: 'crop-images', fileSizeMb: file.size / (1024 * 1024) });
    if (!allowed) return;

    const canvas = document.createElement('canvas');
    const nativeCropX = Math.round(crop.x * img.naturalWidth);
    const nativeCropY = Math.round(crop.y * img.naturalHeight);
    const nativeCropW = Math.max(10, Math.round(crop.w * img.naturalWidth));
    const nativeCropH = Math.max(10, Math.round(crop.h * img.naturalHeight));

    // Support rotation
    const isRotated90 = Math.abs(rotation % 180) === 90;
    canvas.width = isRotated90 ? nativeCropH : nativeCropW;
    canvas.height = isRotated90 ? nativeCropW : nativeCropH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    ctx.drawImage(
      img,
      nativeCropX,
      nativeCropY,
      nativeCropW,
      nativeCropH,
      -nativeCropW / 2,
      -nativeCropH / 2,
      nativeCropW,
      nativeCropH
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const outUrl = URL.createObjectURL(blob);
      setCroppedUrl(outUrl);

      recordJob({
        toolType: 'crop-images',
        inputName: file.name,
        inputSize: file.size,
        outputSize: blob.size,
        format: 'png',
      });

      showToast(`Image cropped to ${canvas.width}x${canvas.height}px`, 'success');
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!croppedUrl || !file) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}-cropped.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded ${a.download}`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-[#F4F7FF] tracking-tight">{t('toolCropTitle')}</h1>
        <p className="text-sm text-[#9AA8BD] mt-2">{t('toolCropDesc')}</p>
      </div>

      {!file ? (
        <UploadDropzone
          onFilesSelected={handleFiles}
          title="Drop image here to crop & rotate"
          subtitle="Supports standard aspect ratios, zoom, rotation and mirroring"
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9AA8BD] block pb-3 border-b border-white/5">
                Crop & Orientation
              </span>

              {/* Aspect Ratio Presets */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9AA8BD] block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { label: 'Free', ratio: null },
                    { label: '1:1 Square', ratio: 1 },
                    { label: '4:5 Portrait', ratio: 4 / 5 },
                    { label: '16:9 Landscape', ratio: 16 / 9 },
                    { label: '4:3 Standard', ratio: 4 / 3 },
                    { label: '9:16 Story', ratio: 9 / 16 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyCropRatio(p.ratio)}
                      className={`py-2 px-2 rounded-xl text-center font-medium border transition-colors ${
                        aspectRatio === p.ratio
                          ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white font-bold'
                          : 'border-white/5 bg-[#182338] text-[#9AA8BD] hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transform Actions */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#9AA8BD] block">Rotate & Flip</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setRotation((r) => (r - 90) % 360)}
                    className="p-2.5 rounded-xl bg-[#182338] hover:bg-white/5 text-[#F4F7FF] flex items-center justify-center border border-white/5"
                    title="Rotate -90°"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2.5 rounded-xl bg-[#182338] hover:bg-white/5 text-[#F4F7FF] flex items-center justify-center border border-white/5"
                    title="Rotate +90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                      flipH ? 'border-[#36D6C5] bg-[#36D6C5]/20 text-[#36D6C5]' : 'border-white/5 bg-[#182338] text-[#F4F7FF]'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                      flipV ? 'border-[#36D6C5] bg-[#36D6C5]/20 text-[#36D6C5]' : 'border-white/5 bg-[#182338] text-[#F4F7FF]'
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#9AA8BD]">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    className="p-2 rounded-lg bg-[#182338] hover:bg-white/5 text-[#9AA8BD]"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#6C63FF] h-2 bg-[#182338] rounded-lg"
                  />
                  <button
                    onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                    className="p-2 rounded-lg bg-[#182338] hover:bg-white/5 text-[#9AA8BD]"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Execute */}
              <button
                onClick={executeCrop}
                className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2"
              >
                <CropIcon className="w-4 h-4" />
                <span>Apply Crop</span>
              </button>

              <button
                onClick={() => setFile(null)}
                className="w-full py-2 text-xs text-[#9AA8BD] hover:text-white"
              >
                Upload Different Image
              </button>
            </div>
          </div>

          {/* Interactive Workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#F4F7FF]">Crop Canvas Preview</h3>
                {croppedUrl && (
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 rounded-xl bg-[#36D6C5] hover:bg-[#2bc4b4] text-[#080B14] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Crop</span>
                  </button>
                )}
              </div>

              <div className="relative rounded-2xl bg-[#080B14] border border-white/5 overflow-hidden flex items-center justify-center p-6 min-h-[400px]">
                {previewUrl && (
                  <div
                    className="relative inline-block transition-transform duration-150"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Crop source"
                      className="max-h-[460px] max-w-full select-none pointer-events-none rounded-lg"
                    />

                    {/* Interactive crop overlay */}
                    <div
                      className="absolute border-2 border-[#6C63FF] bg-[#6C63FF]/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move"
                      style={{
                        left: `${crop.x * 100}%`,
                        top: `${crop.y * 100}%`,
                        width: `${crop.w * 100}%`,
                        height: `${crop.h * 100}%`,
                      }}
                      onMouseDown={(e) => {
                        setIsDragging(true);
                        setDragStart({ x: e.clientX, y: e.clientY });
                      }}
                    >
                      {/* Grid guidelines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                        <div className="border-r border-b border-white/20"></div>
                        <div className="border-r border-b border-white/20"></div>
                        <div className="border-b border-white/20"></div>
                        <div className="border-r border-b border-white/20"></div>
                        <div className="border-r border-b border-white/20"></div>
                        <div className="border-b border-white/20"></div>
                        <div className="border-r border-white/20"></div>
                        <div className="border-r border-white/20"></div>
                        <div></div>
                      </div>

                      {/* Resize handles */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-[#6C63FF] rounded-sm"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-[#6C63FF] rounded-sm"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-[#6C63FF] rounded-sm"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#6C63FF] rounded-sm"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
