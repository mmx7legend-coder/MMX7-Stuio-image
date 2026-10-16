import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqList = [
    {
      category: 'General',
      q: 'What is MMX7 Image Studio?',
      a: 'MMX7 Image Studio is an online image processing suite featuring 10 active core tools (compressor, resizer, cropper, format converter, AI background remover, object inpainting, super-resolution upscaler, watermark applicator, privacy masking, and meme canvas editor), alongside 5 upcoming specialized labs.',
    },
    {
      category: 'Privacy & Security',
      q: 'Are my uploaded images saved or used for AI training?',
      a: 'No. Local operations (compression, resizing, cropping, converting, watermarking, obfuscation) run strictly on your machine using your browser canvas. When external AI tools are invoked, temporary image memory is discarded after processing. We never sell, retain, or train AI models on user assets.',
    },
    {
      category: 'Tools & Capabilities',
      q: 'Which image formats are supported?',
      a: 'We fully support modern image formats including PNG, JPEG/JPG, WebP, GIF, and standard web assets. Format conversion handles alpha channels properly and alerts you before exporting transparent art into JPEG.',
    },
    {
      category: 'Plans & Billing',
      q: 'Can I cancel or switch my subscription at any time?',
      a: 'Yes. Upgrading to Pro ($5/month or $48/year) or Studio ($12/month or $108/year) can be changed or canceled at any time directly through your user dashboard with zero penalties.',
    },
    {
      category: 'Batch Processing',
      q: 'How many images can I process in a single batch?',
      a: 'Free plan accounts process single images. Pro accounts can process multiple files up to 100MB per file and download all assets compiled into a ZIP archive. Studio accounts enjoy expanded queues up to 50 files simultaneously.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">Frequently Asked Questions</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7FF]">{t('faq')}</h1>
        <p className="text-xs text-[#9AA8BD]">Everything you need to know about MMX7 Image Studio tools and memberships.</p>
      </div>

      <div className="space-y-3">
        {faqList.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#121A2A] border border-white/8 overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold text-[#36D6C5] uppercase tracking-wider block mb-1">
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-[#F4F7FF]">{item.q}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#9AA8BD] shrink-0 transition-transform ${
                  openIndex === idx ? 'rotate-180 text-[#6C63FF]' : ''
                }`}
              />
            </button>

            {openIndex === idx && (
              <div className="px-5 pb-5 pt-1 text-xs text-[#9AA8BD] leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
