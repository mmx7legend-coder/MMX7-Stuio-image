import React from 'react';
import { Compass, ArrowRight, Home } from 'lucide-react';

interface NotFoundProps {
  navigate: (path: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ navigate }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      <div className="space-y-2">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-[#F4F7FF] tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-[#F4F7FF]">Page Not Found</h2>
        <p className="text-xs text-[#9AA8BD] max-w-sm mx-auto">
          The image studio tool or page you requested does not exist or has been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>
        <button
          onClick={() => navigate('/tools')}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#F4F7FF] text-xs font-semibold border border-white/10"
        >
          Explore All Tools &rarr;
        </button>
      </div>
    </div>
  );
};
