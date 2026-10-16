import React from 'react';
import { ShieldCheck, Lock, EyeOff, Trash2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-xs leading-relaxed text-[#9AA8BD]">
      <div className="space-y-2 border-b border-white/8 pb-6">
        <span className="font-bold text-[#36D6C5] uppercase tracking-wider text-[11px]">Compliance &amp; Trust</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FF]">Privacy Policy</h1>
        <p className="text-[11px] text-[#9AA8BD]">Effective Date: October 2026 &middot; MMX7 Image Studio</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">1. Fundamental Privacy Principle</h2>
        <p>
          At MMX7 Image Studio, we treat every photograph, document, screenshot, or graphic asset you handle as strictly confidential. Unlike conventional web converters that upload your raw binary files to external cloud storage servers, our primary image engines execute operations natively in your web browser using HTML5 Canvas, WebAssembly, and local JavaScript algorithms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">2. Data Processed Locally vs Cloud Services</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-[#F4F7FF]">Client-Side Core Tools:</strong> Image Compression, Resizing, Cropping, Format Conversion, Watermarking, Face Obfuscation, and Meme Canvas Editing happen entirely within client memory. No image bytes are transmitted over the network for these operations.
          </li>
          <li>
            <strong className="text-[#F4F7FF]">Cloud &amp; AI Tools:</strong> When utilizing accelerated server-assisted AI features (such as deep subject segmentation or inpainting), raw images are passed over encrypted TLS connections solely for temporary inference execution. Buffers are purged immediately following completion.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">3. Account Data &amp; Security</h2>
        <p>
          When you register for an account, we store only your email address, display name, account role, preferred language, and salted password hashes. We employ strong PBKDF2 / SHA-512 cryptographic hashing and never store plaintext passwords.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#F4F7FF]">4. Data Deletion (Right to be Forgotten)</h2>
        <p>
          You retain complete ownership and control over your data. You may clear your processing job history at any time from your dashboard or permanently delete your entire user account, which irreversibly purges your profile, tokens, and saved projects.
        </p>
      </section>
    </div>
  );
};
