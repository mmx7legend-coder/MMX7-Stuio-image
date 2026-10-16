import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SignUpProps {
  navigate: (path: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ navigate }) => {
  const { register } = useAuth();
  const { t } = useLanguage();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) return;
    setLoading(true);
    try {
      const success = await register(email, password, displayName);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#36D6C5] flex items-center justify-center p-0.5 mx-auto">
            <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center font-extrabold text-[#36D6C5]">
              M7
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#F4F7FF]">{t('navSignUp')}</h1>
          <p className="text-xs text-[#9AA8BD]">Start editing, compressing, and converting with 10 free operations daily.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#9AA8BD] mb-1 block">Your Name / Handle</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9AA8BD] mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#9AA8BD] mb-1 block">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1 text-xs text-[#9AA8BD]">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded accent-[#6C63FF]"
            />
            <label htmlFor="terms">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => navigate('/terms')}
                className="text-[#6C63FF] hover:underline"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => navigate('/privacy')}
                className="text-[#6C63FF] hover:underline"
              >
                Privacy Policy
              </button>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreeTerms}
            className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#9AA8BD]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/signin')}
            className="text-[#6C63FF] hover:underline font-semibold"
          >
            Sign In Here
          </button>
        </p>
      </div>
    </div>
  );
};
