import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  ChevronDown,
  Layers,
  Bell,
  Mail,
} from 'lucide-react';
import { CORE_TOOLS, COMING_SOON_TOOLS, CATEGORIES } from '../data/tools';
import { UploadDropzone } from '../components/ui/UploadDropzone';
import { DynamicIcon } from '../components/ui/DynamicIcon';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { BlogPost } from '../types';

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { user, openUpgradeModal } = useAuth();
  const { showToast } = useToast();
  const { t, language, isRtl } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Notify Me Modal for Coming Soon tools
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedComingSoonTool, setSelectedComingSoonTool] = useState<string>('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [submittingNotify, setSubmittingNotify] = useState(false);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) setBlogPosts(data.posts.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const handleHeroFiles = (files: File[]) => {
    if (files.length === 0) return;
    navigate('/tools/compress-images');
    showToast('Image loaded into Compression Studio', 'info');
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setSubmittingNotify(true);

    try {
      const res = await fetch('/api/tools/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notifyEmail, toolId: selectedComingSoonTool }),
      });

      if (res.ok) {
        showToast(t('notifySuccess'), 'success');
        setNotifyModalOpen(false);
        setNotifyEmail('');
      }
    } catch {
      showToast('Network error, please try again.', 'error');
    } finally {
      setSubmittingNotify(false);
    }
  };

  const filteredCoreTools = CORE_TOOLS.filter((tool) => {
    const matchesSearch =
      t(tool.nameKey).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(tool.descriptionKey).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'popular' && tool.isPopular) ||
      tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const faqs = [
    {
      q: 'Is image processing really performed locally in my browser?',
      a: 'Yes. Core utilities such as compression, cropping, resizing, privacy masking, and format conversion execute directly in your browser using high-performance HTML5 Canvas and WebAssembly. Your images never leave your computer for local operations.',
    },
    {
      q: 'What are the limits on the Free plan?',
      a: 'Free users enjoy 10 image operations daily with single files up to 15MB. Upgrading to Pro unlocks 150 operations daily, 100MB file limits, batch multi-file conversion, and ZIP archiving.',
    },
    {
      q: 'How does batch processing and ZIP download work?',
      a: 'Pro and Studio users can drag dozens of images into our tools simultaneously. The studio processes each file asynchronously and compiles the results into a single clean ZIP archive with one click.',
    },
    {
      q: 'Are payments and subscriptions secure?',
      a: 'All payment flows are processed securely without ever storing credit card credentials on our servers. You can cancel or switch billing intervals anytime with zero lock-in.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Anti-slop clean typography kicker */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#36D6C5] uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Next-Generation Online Image Studio</span>
          <span aria-hidden="true">·</span>
          <span>Fast &amp; Privacy-First</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F4F7FF] max-w-4xl mx-auto leading-[1.1]">
          {t('heroTitle')}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#9AA8BD] max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/tools')}
            className="px-6 py-3.5 rounded-2xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-sm font-bold shadow-xl shadow-[#6C63FF]/25 transition-all hover:scale-102 flex items-center gap-2"
          >
            <span>{t('exploreTools')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/tools/compress-images')}
            className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#F4F7FF] text-sm font-semibold transition-all hover:scale-102"
          >
            {t('tryFree')}
          </button>
        </div>

        {/* Interactive Hero Dropzone */}
        <div className="mt-14 max-w-2xl mx-auto">
          <UploadDropzone
            onFilesSelected={handleHeroFiles}
            title={t('dragDropTitle')}
            subtitle={t('dragDropSubtitle')}
          />
        </div>
      </section>

      {/* Tool Discovery & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-8 border-b border-white/8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FF] tracking-tight">
              Powerful Image Tools
            </h2>
            <p className="text-xs text-[#9AA8BD] mt-1">
              Select any tool below to launch its dedicated editor.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (crop, compress...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121A2A] border border-white/10 text-xs text-[#F4F7FF] focus:border-[#6C63FF] outline-none"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-4 scrollbar-none">
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

        {/* Working Core Tools Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4">
          {filteredCoreTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="group p-6 rounded-3xl bg-[#121A2A]/70 hover:bg-[#182338] border border-white/8 hover:border-[#6C63FF]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C63FF]/20 to-[#36D6C5]/20 border border-white/10 flex items-center justify-center text-[#6C63FF] group-hover:scale-110 group-hover:text-[#36D6C5] transition-transform">
                    <DynamicIcon name={tool.iconName} className="w-6 h-6" />
                  </div>
                  {tool.isAi && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6C63FF]/20 text-[#A78BFA] border border-[#6C63FF]/30 uppercase">
                      AI Powered
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

        {/* 5 Coming Soon Tools Section */}
        <div className="mt-16 pt-12 border-t border-white/8">
          <div className="mb-6">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Upcoming Studio Labs
            </span>
            <h3 className="text-2xl font-extrabold text-[#F4F7FF] mt-1">Coming Soon Tools</h3>
            <p className="text-xs text-[#9AA8BD] mt-1">
              Be the first to know when these advanced AI utilities launch.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {COMING_SOON_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-[#0D1220]/60 border border-white/5 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
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
                  <p className="text-[11px] text-[#9AA8BD] mt-1.5 line-clamp-2">
                    {t(tool.descriptionKey)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedComingSoonTool(tool.id);
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
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
            Streamlined Creative Flow
          </span>
          <h2 className="text-3xl font-extrabold text-[#F4F7FF] mt-1">How It Works</h2>
          <p className="text-xs text-[#9AA8BD] mt-2">
            No software installation required. Professional image processing in five simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 text-center">
          {[
            { step: '01', title: 'Select Image', desc: 'Drag and drop or select files directly from your computer.' },
            { step: '02', title: 'Configure Tool', desc: 'Set target quality, dimensions, aspect ratio, or AI filters.' },
            { step: '03', title: 'Process', desc: 'High-speed local canvas synthesis or cloud acceleration.' },
            { step: '04', title: 'Preview Result', desc: 'Inspect before-and-after split view with millimeter accuracy.' },
            { step: '05', title: 'Download', desc: 'Export your pristine single asset or multi-file ZIP archive.' },
          ].map((item) => (
            <div key={item.step} className="p-6 rounded-3xl bg-[#121A2A]/50 border border-white/5 relative">
              <span className="text-2xl font-black text-[#6C63FF]/30 block mb-2">{item.step}</span>
              <h4 className="text-sm font-bold text-[#F4F7FF]">{item.title}</h4>
              <p className="text-xs text-[#9AA8BD] mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why MMX7 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#121A2A] to-[#0D1220] border border-white/10 grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#36D6C5]/20 text-[#36D6C5] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F4F7FF]">Client-Side Privacy</h3>
            <p className="text-xs text-[#9AA8BD] leading-relaxed">
              Your photos process directly in your browser. Sensitive documents, ID cards, and photos remain strictly on your local machine.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C63FF]/20 text-[#6C63FF] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F4F7FF]">Batch Processing</h3>
            <p className="text-xs text-[#9AA8BD] leading-relaxed">
              Save hours of manual effort. Upload dozens of files at once, compress or convert them simultaneously, and grab a neat ZIP.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#F4F7FF]">Transparent Quotas</h3>
            <p className="text-xs text-[#9AA8BD] leading-relaxed">
              No hidden fees or bait-and-switch limits. Free users enjoy real utility, and Pro tiers offer predictable, unthrottled power.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Blog Articles */}
      {blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">
                Knowledge &amp; Tutorials
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FF] mt-1">
                Latest from the Blog
              </h2>
            </div>
            <button
              onClick={() => navigate('/blog')}
              className="text-xs font-semibold text-[#36D6C5] hover:underline flex items-center gap-1"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group rounded-3xl bg-[#121A2A] border border-white/8 overflow-hidden hover:border-[#6C63FF]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full overflow-hidden bg-[#0D1220]">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[11px] text-[#9AA8BD] mb-2">
                      <span className="text-[#36D6C5] font-semibold">{post.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#F4F7FF] group-hover:text-[#6C63FF] transition-colors line-clamp-2">
                      {language === 'ar' ? post.titleAr || post.title : post.title}
                    </h3>
                    <p className="text-xs text-[#9AA8BD] mt-2 line-clamp-2">
                      {language === 'ar' ? post.excerptAr || post.excerpt : post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 text-xs font-semibold text-[#6C63FF] flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">Help &amp; Answers</span>
          <h2 className="text-3xl font-extrabold text-[#F4F7FF] mt-1">{t('faq')}</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#121A2A] border border-white/8 overflow-hidden transition-all"
            >
              <button
                onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <span className="text-sm font-semibold text-[#F4F7FF]">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#9AA8BD] transition-transform ${
                    faqOpenIndex === idx ? 'rotate-180 text-[#6C63FF]' : ''
                  }`}
                />
              </button>

              {faqOpenIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#9AA8BD] leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Notify Me Modal */}
      <Modal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        title="Notify Me on Launch"
      >
        <form onSubmit={handleNotifySubmit} className="space-y-4">
          <p className="text-xs text-[#9AA8BD]">
            Enter your email to receive priority access and release notifications when this tool goes live:
          </p>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
            <input
              type="email"
              required
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
            />
          </div>

          <button
            type="submit"
            disabled={submittingNotify}
            className="w-full py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            {submittingNotify ? 'Registering...' : 'Get Launch Alert'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
