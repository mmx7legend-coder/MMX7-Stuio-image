import React from 'react';
import { CORE_TOOLS, COMING_SOON_TOOLS } from '../../data/tools';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, Sparkles, Layers } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#06080F] border-t border-white/8 text-[#9AA8BD] text-xs pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-white/8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#36D6C5] flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
                  <span className="font-extrabold text-xs text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#36D6C5]">
                    M7
                  </span>
                </div>
              </div>
              <span className="font-bold text-base tracking-tight text-[#F4F7FF]">
                MMX7 <span className="font-normal text-[#9AA8BD] text-xs">IMAGE STUDIO</span>
              </span>
            </div>

            <p className="text-xs text-[#9AA8BD] leading-relaxed max-w-sm">
              {t('footerDesc')}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-[#9AA8BD]/70 pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#36D6C5]" />
                Client-Side Privacy
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
                Lossless Quality
              </span>
            </div>
          </div>

          {/* Core Tools Column 1 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#F4F7FF] uppercase tracking-wider text-[11px]">
              Image Utilities
            </h4>
            <ul className="space-y-2">
              {CORE_TOOLS.slice(0, 5).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => navigate(tool.path)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t(tool.nameKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Tools Column 2 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#F4F7FF] uppercase tracking-wider text-[11px]">
              AI & Creative
            </h4>
            <ul className="space-y-2">
              {CORE_TOOLS.slice(5, 10).map((tool) => (
                <li key={tool.id}>
                  <button
                    onClick={() => navigate(tool.path)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {t(tool.nameKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#F4F7FF] uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">
                  {t('navPricing')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/blog')} className="hover:text-white transition-colors">
                  {t('navBlog')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  About MMX7
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition-colors">
                  {t('faq')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                  {t('privacyPolicy')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                  {t('termsOfService')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9AA8BD]/70">
          <div>
            &copy; {new Date().getFullYear()} MMX7 Image Studio. {t('allRightsReserved')}
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#F4F7FF]">
              {t('privacyPolicy')}
            </button>
            <button onClick={() => navigate('/terms')} className="hover:text-[#F4F7FF]">
              {t('termsOfService')}
            </button>
            <button onClick={() => navigate('/cookies')} className="hover:text-[#F4F7FF]">
              {t('cookiePreferences')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
