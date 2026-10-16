import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordProps {
  navigate: (path: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitted(true);
      showToast(data.message, 'info');
    } catch {
      showToast('Error requesting password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 shadow-2xl space-y-6">
        <button
          onClick={() => navigate('/signin')}
          className="inline-flex items-center gap-1.5 text-xs text-[#9AA8BD] hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#F4F7FF]">Password Recovery</h1>
          <p className="text-xs text-[#9AA8BD]">
            Enter your registered email address and we'll send password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center space-y-2">
            <p className="font-semibold">Reset Instructions Sent</p>
            <p className="text-emerald-300/80">
              Check your inbox for further steps. In development mode, you can also log in directly using the demo accounts.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-[#080B14] font-bold"
            >
              Return to Login
            </button>
          </div>
        ) : (
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
