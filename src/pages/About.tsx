import React from 'react';
import { Shield, Sparkles, Zap, Layers, Cpu, Heart } from 'lucide-react';

interface AboutProps {
  navigate: (path: string) => void;
}

export const About: React.FC<AboutProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#36D6C5]">
          Engineering &amp; Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F4F7FF] tracking-tight">
          About MMX7 Image Studio
        </h1>
        <p className="text-sm text-[#9AA8BD] leading-relaxed">
          Built for creators, designers, and privacy-conscious users who need fast, uncompromised image manipulation without heavyweight desktop software.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F4F7FF]">Browser-Native Performance</h3>
          <p className="text-xs text-[#9AA8BD] leading-relaxed">
            We believe you shouldn't have to send your 50-megabyte raw photos to a distant server farm just to crop or compress them. MMX7 executes core raster operations directly in your browser's hardware-accelerated canvas engine.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#36D6C5]/20 text-[#36D6C5] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F4F7FF]">Privacy by Design</h3>
          <p className="text-xs text-[#9AA8BD] leading-relaxed">
            Your family photos, identity documents, and creative mockups remain strictly on your local machine. When our AI tools run inference, temporary buffers are cleared immediately without permanent telemetry retention.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F4F7FF]">Creator-First Batch Tools</h3>
          <p className="text-xs text-[#9AA8BD] leading-relaxed">
            Whether you are preparing 50 product photos for an e-commerce catalog or resizing YouTube thumbnails, MMX7 provides seamless multi-file batch processing and instant ZIP bundling.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[#F4F7FF]">No Bloat, No Clutter</h3>
          <p className="text-xs text-[#9AA8BD] leading-relaxed">
            No endless intrusive popups, no fake timers, and no forced desktop installers. Every tool is clean, responsive, and available in one creative studio.
          </p>
        </div>
      </div>
    </div>
  );
};
