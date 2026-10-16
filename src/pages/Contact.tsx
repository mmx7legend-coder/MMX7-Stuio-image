import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been received! Our team will respond shortly.', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider">Get in Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FF]">Contact MMX7 Studio</h1>
        <p className="text-xs text-[#9AA8BD]">Have questions, feedback, or custom business inquiries? We'd love to hear from you.</p>
      </div>

      <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 shadow-2xl">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F4F7FF]">Message Sent Successfully</h3>
            <p className="text-xs text-[#9AA8BD] max-w-sm mx-auto">
              Thank you for reaching out, {name}. A member of our creative studio team will review your message and reply via {email}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#9AA8BD] block mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Vance"
                className="w-full px-3 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>

            <div>
              <label className="text-[#9AA8BD] block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>

            <div>
              <label className="text-[#9AA8BD] block mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none"
              >
                <option value="Support">General Support</option>
                <option value="Feature">Tool Feature Request</option>
                <option value="Billing">Billing &amp; Subscriptions</option>
                <option value="Enterprise">Studio &amp; Team Licensing</option>
              </select>
            </div>

            <div>
              <label className="text-[#9AA8BD] block mb-1">Your Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist your creative workflow?"
                className="w-full px-3 py-2.5 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none focus:border-[#6C63FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6C63FF]/20"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
