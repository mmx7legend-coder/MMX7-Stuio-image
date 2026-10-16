import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs leading-relaxed text-[#9AA8BD]">
      <div className="space-y-2 border-b border-white/8 pb-6">
        <span className="font-bold text-[#6C63FF] uppercase tracking-wider text-[11px]">Legal Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FF]">Terms of Service</h1>
        <p className="text-[11px] text-[#9AA8BD]">Effective Date: October 2026 &middot; MMX7 Image Studio</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">1. Acceptance of Terms</h2>
        <p>
          By accessing or using MMX7 Image Studio ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">2. Intellectual Property &amp; Content Ownership</h2>
        <p>
          You retain 100% intellectual property ownership of all images, graphics, and assets uploaded, edited, or exported using MMX7 Image Studio. We claim no ownership, licensing rights, or commercial copyright over your processed assets.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">3. Commercial Usage &amp; Subscriptions</h2>
        <p>
          Free tier usage is provided for personal and standard creative projects within daily quota bounds. Pro and Studio subscriptions grant commercial usage licensing, higher batch limits, and priority access to specialized features. Subscriptions may be cancelled anytime through the billing settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">4. Acceptable Use Policy</h2>
        <p>
          You agree not to use the Service for any unlawful activities, including processing infringing copyrighted works without license, distributing abusive material, or attempting to compromise the security or stability of our application systems.
        </p>
      </section>
    </div>
  );
};
