import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Sparkles, Crown, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Pricing: React.FC = () => {
  const { user, upgradePlan } = useAuth();
  const { t } = useLanguage();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: 'free' | 'pro' | 'studio') => {
    if (planId === 'free') return;
    setLoadingPlan(planId);
    try {
      const success = await upgradePlan(planId, billingInterval);
      if (success) {
        confetti({ particleCount: 70, spread: 60 });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#36D6C5]">
          Transparent Creative Investment
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F4F7FF] tracking-tight">
          {t('pricingTitle')}
        </h1>
        <p className="text-sm text-[#9AA8BD]">
          {t('pricingSubtitle')}
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-[#121A2A] rounded-2xl border border-white/5 mt-4">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
              billingInterval === 'month' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'
            }`}
          >
            {t('monthlyBilling')}
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all ${
              billingInterval === 'year' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'
            }`}
          >
            {t('annualBilling')}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {/* FREE */}
        <div className="p-8 rounded-3xl bg-[#121A2A]/50 border border-white/8 flex flex-col justify-between">
          <div>
            <div className="text-sm font-semibold text-[#9AA8BD] uppercase tracking-wider">Free</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#F4F7FF]">$0</span>
              <span className="text-xs text-[#9AA8BD]">/forever</span>
            </div>
            <p className="text-xs text-[#9AA8BD] mt-2">Essential utilities for casual creators and students.</p>

            <ul className="mt-8 space-y-3 text-xs text-[#F4F7FF]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>10 operations per day</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Max 15MB file size limit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Browser-based local compression</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Format conversion & cropping</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Full access to tutorials & blog</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-white/5">
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-white/5 text-[#9AA8BD] text-xs font-semibold cursor-default"
            >
              {user?.plan === 'free' ? 'Your Current Plan' : 'Free Tier'}
            </button>
          </div>
        </div>

        {/* PRO */}
        <div className="relative p-8 rounded-3xl bg-[#182338] border-2 border-[#6C63FF] shadow-2xl flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#6C63FF] text-white text-[11px] font-extrabold uppercase tracking-wide">
            Most Popular
          </div>

          <div>
            <div className="flex items-center gap-2 text-[#6C63FF] text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Pro Plan</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#F4F7FF]">
                ${billingInterval === 'year' ? '48' : '5'}
              </span>
              <span className="text-xs text-[#9AA8BD]">
                /{billingInterval === 'year' ? 'year ($4/mo)' : 'month'}
              </span>
            </div>
            <p className="text-xs text-[#9AA8BD] mt-2">For freelance designers, photographers, and active creators.</p>

            <ul className="mt-8 space-y-3 text-xs text-[#F4F7FF]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span className="font-semibold">150 operations per day</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Multi-file batch processing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Batch ZIP archive downloads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>AI Background removal & inpainting</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Max 100MB file size limit</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Processing history cloud tracking</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-white/5">
            <button
              onClick={() => handleSelectPlan('pro')}
              disabled={loadingPlan !== null || user?.plan === 'pro'}
              className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all shadow-lg shadow-[#6C63FF]/30 disabled:opacity-50"
            >
              {loadingPlan === 'pro' ? 'Activating...' : user?.plan === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {/* STUDIO */}
        <div className="p-8 rounded-3xl bg-[#121A2A]/50 border border-white/8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#36D6C5] text-sm font-bold uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              <span>Studio Plan</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#F4F7FF]">
                ${billingInterval === 'year' ? '108' : '12'}
              </span>
              <span className="text-xs text-[#9AA8BD]">
                /{billingInterval === 'year' ? 'year ($9/mo)' : 'month'}
              </span>
            </div>
            <p className="text-xs text-[#9AA8BD] mt-2">Unlimited power for studios, agencies, and large creative teams.</p>

            <ul className="mt-8 space-y-3 text-xs text-[#F4F7FF]">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span className="font-semibold">Unlimited daily operations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>50-file bulk batch queues</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>AI 8x Super-Resolution Upscaling</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Max 500MB raw image uploads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                <span>Priority email support & commercial rights</span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-6 border-t border-white/5">
            <button
              onClick={() => handleSelectPlan('studio')}
              disabled={loadingPlan !== null || user?.plan === 'studio'}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {loadingPlan === 'studio' ? 'Activating...' : user?.plan === 'studio' ? 'Active Plan' : 'Get Studio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
