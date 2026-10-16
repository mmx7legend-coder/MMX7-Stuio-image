import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SignInProps {
  navigate: (path: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ navigate }) => {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
          <h1 className="text-2xl font-bold text-[#F4F7FF]">{t('navSignIn')}</h1>
          <p className="text-xs text-[#9AA8BD]">Access your image projects, history, and Pro tools.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="text-[#9AA8BD]">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[#6C63FF] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : t('navSignIn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <span className="text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider block text-center">
            Instant Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@mmx7studio.com', 'MMX7admin2026!')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F4F7FF] text-left border border-white/5"
            >
              <div className="font-bold text-[#36D6C5]">Admin Demo</div>
              <div className="text-[10px] text-[#9AA8BD]">Studio &amp; Admin</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('creator@mmx7studio.com', 'Creative2026!')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F4F7FF] text-left border border-white/5"
            >
              <div className="font-bold text-[#6C63FF]">Creator Demo</div>
              <div className="text-[10px] text-[#9AA8BD]">Pro Plan</div>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#9AA8BD]">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#6C63FF] hover:underline font-semibold"
          >
            Create Account Free
          </button>
        </p>
      </div>
    </div>
  );
};
