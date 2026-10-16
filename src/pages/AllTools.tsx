import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Clock, Bell } from 'lucide-react';
import { CORE_TOOLS, COMING_SOON_TOOLS, CATEGORIES } from '../data/tools';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { Modal } from '../components/ui/Modal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface AllToolsProps {
  navigate: (path: string) => void;
  initialCategory?: string;
}

export const AllTools: React.FC<AllToolsProps> = ({ navigate, initialCategory = 'all' }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [loadingNotify, setLoadingNotify] = useState(false);

  const filteredCore = CORE_TOOLS.filter((tool) => {
    const matchesSearch =
      t(tool.nameKey).toLowerCase().includes(search.toLowerCase()) ||
      t(tool.descriptionKey).toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      (selectedCategory === 'popular' && tool.isPopular) ||
      tool.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const filteredComing = COMING_SOON_TOOLS.filter((tool) => {
    const matchesSearch =
      t(tool.nameKey).toLowerCase().includes(search.toLowerCase()) ||
      t(tool.descriptionKey).toLowerCase().includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'all' ||
      tool.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setLoadingNotify(true);
    try {
      const res = await fetch('/api/tools/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail, toolId: selectedTool }),
      });
      if (res.ok) {
        showToast(t('notifySuccess'), 'success');
        setNotifyModalOpen(false);
        setNotifyEmail('');
      }
    } catch {
      showToast('Error registering notification request', 'error');
    } finally {
      setLoadingNotify(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7FF] tracking-tight">
          All Studio Tools
        </h1>
        <p className="text-sm text-[#9AA8BD]">
          Explore our complete suite of browser-native and AI-accelerated image utilities.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                  : 'bg-[#121A2A] text-[#9AA8BD] hover:text-white border border-white/5'
              }`}
            >
              {language === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all 15 tools..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121A2A] border border-white/10 text-xs text-[#F4F7FF] focus:border-[#6C63FF] outline-none"
          />
        </div>
      </div>

      {/* Core Tools */}
      <div>
        <h2 className="text-lg font-bold text-[#F4F7FF] mb-4">
          Active Core Tools ({filteredCore.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCore.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="group p-6 rounded-3xl bg-[#121A2A] hover:bg-[#182338] border border-white/8 hover:border-[#6C63FF]/40 transition-all cursor-pointer flex flex-col justify-between shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#36D6C5]/20 border border-white/10 flex items-center justify-center text-[#6C63FF] group-hover:scale-110 group-hover:text-[#36D6C5] transition-transform">
                    <DynamicIcon name={tool.iconName} className="w-6 h-6" />
                  </div>
                  {tool.isAi && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/30 uppercase">
                      AI
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#F4F7FF] group-hover:text-white">
                  {t(tool.nameKey)}
                </h3>
                <p className="text-xs text-[#9AA8BD] mt-2 line-clamp-3 leading-relaxed">
                  {t(tool.descriptionKey)}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#6C63FF] group-hover:text-[#36D6C5] transition-colors">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Tools */}
      {filteredComing.length > 0 && (
        <div className="pt-8 border-t border-white/8">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-[#F4F7FF]">
              Upcoming Labs ({filteredComing.length})
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredComing.map((tool) => (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-[#0D1220]/60 border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#182338] border border-white/5 flex items-center justify-center text-[#9AA8BD]">
                      <DynamicIcon name={tool.iconName} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {t('comingSoonBadge')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F4F7FF]">{t(tool.nameKey)}</h4>
                  <p className="text-[11px] text-[#9AA8BD] mt-1 line-clamp-2">
                    {t(tool.descriptionKey)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setNotifyModalOpen(true);
                  }}
                  className="mt-4 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-[#F4F7FF] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('notifyMe')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notify Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title="Notify Me on Launch"
      >
        <form onSubmit={handleNotifySubmit} className="space-y-4">
          <p className="text-xs text-[#9AA8BD]">
            Enter your email to receive early access when this tool is deployed:
          </p>
          <input
            type="email"
            required
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none"
          />
          <button
            type="submit"
            disabled={loadingNotify}
            className="w-full py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {loadingNotify ? 'Submitting...' : 'Register for Alerts'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
