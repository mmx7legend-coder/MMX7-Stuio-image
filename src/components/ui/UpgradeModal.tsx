import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, Sparkles, Zap, Shield, Crown } from 'lucide-react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const UpgradeModal: React.FC = () => {
  const { upgradeModalOpen, closeUpgradeModal, upgradeFeatureReason, upgradePlan, user } = useAuth();
  const { t, isRtl } = useLanguage();
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: 'pro' | 'studio') => {
    setLoadingPlan(planId);
    try {
      const success = await upgradePlan(planId, billingInterval);
      if (success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Modal isOpen={upgradeModalOpen} onClose={closeUpgradeModal} title="Unlock Premium Power" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {upgradeFeatureReason && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
            <Zap className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium">Plan Limit Reached</p>
              <p className="text-amber-300/80 text-xs mt-0.5">{upgradeFeatureReason}</p>
            </div>
          </div>
        )}

        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-[#F4F7FF]">Choose Your Creative Studio Plan</h2>
          <p className="text-[#9AA8BD] text-sm mt-1">Supercharge your image workflow with batch processing, AI tools, and higher limits.</p>

          <div className="inline-flex items-center gap-1 p-1 bg-[#182338] rounded-xl border border-white/5 mt-4">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${billingInterval === 'month' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'}`}
            >
              {t('monthlyBilling')}
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${billingInterval === 'year' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#9AA8BD] hover:text-white'}`}
            >
              {t('annualBilling')}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 pt-2">
          {/* Pro Plan */}
          <div className="relative p-5 rounded-2xl bg-[#182338]/80 border border-[#6C63FF]/30 flex flex-col justify-between hover:border-[#6C63FF]/60 transition-all">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-[#6C63FF] text-white text-[11px] font-bold tracking-wide uppercase">
              Most Popular
            </div>

            <div>
              <div className="flex items-center gap-2 text-[#6C63FF] font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Pro Plan</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#F4F7FF]">
                  ${billingInterval === 'year' ? '48' : '5'}
                </span>
                <span className="text-xs text-[#9AA8BD]">
                  /{billingInterval === 'year' ? 'year ($4/mo)' : 'month'}
                </span>
              </div>
              <p className="text-xs text-[#9AA8BD] mt-2">For creators and freelancers needing regular speed, AI capabilities, and batch downloads.</p>

              <ul className="mt-4 space-y-2 text-xs text-[#F4F7FF]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>150 daily image operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Multi-file batch processing & ZIP download</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>AI background removal & object inpainting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Up to 100MB per single image</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Priority fast processing queue</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loadingPlan !== null || user?.plan === 'pro'}
                className="w-full py-2.5 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#6C63FF]/20"
              >
                {loadingPlan === 'pro' ? 'Activating Pro...' : user?.plan === 'pro' ? 'Active Plan' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {/* Studio Plan */}
          <div className="p-5 rounded-2xl bg-[#182338]/40 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center gap-2 text-[#36D6C5] font-semibold text-sm">
                <Crown className="w-4 h-4" />
                <span>Studio Plan</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#F4F7FF]">
                  ${billingInterval === 'year' ? '108' : '12'}
                </span>
                <span className="text-xs text-[#9AA8BD]">
                  /{billingInterval === 'year' ? 'year ($9/mo)' : 'month'}
                </span>
              </div>
              <p className="text-xs text-[#9AA8BD] mt-2">For studios, agencies, and heavy power users handling bulk commercial assets.</p>

              <ul className="mt-4 space-y-2 text-xs text-[#F4F7FF]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Unlimited daily image operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Large batch queues (50 files at once)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>AI 8x Super-Resolution Upscaling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Up to 500MB raw file uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#36D6C5] shrink-0" />
                  <span>Team collaboration & Commercial license</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-white/5">
              <button
                onClick={() => handleUpgrade('studio')}
                disabled={loadingPlan !== null || user?.plan === 'studio'}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {loadingPlan === 'studio' ? 'Activating Studio...' : user?.plan === 'studio' ? 'Active Plan' : 'Get Studio'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#9AA8BD]/70">
          Safe Sandbox Mode: Testing instant activation without real credit cards. Cancel or switch plans anytime.
        </p>
      </div>
    </Modal>
  );
};
