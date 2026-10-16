import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Check, User as UserIcon } from 'lucide-react';
import { BlogPost } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface BlogPostPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug, navigate }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { language } = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setPost(data.post);
      })
      .catch(() => {
        setPost(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Article URL copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse text-[#9AA8BD]">
        Loading article...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#F4F7FF]">Article Not Found</h2>
        <p className="text-xs text-[#9AA8BD]">The tutorial or article you requested does not exist or was moved.</p>
        <button
          onClick={() => navigate('/blog')}
          className="px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-xs font-semibold"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  const title = language === 'ar' ? post.titleAr || post.title : post.title;
  const content = language === 'ar' ? post.contentAr || post.content : post.content;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#9AA8BD] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Articles</span>
      </button>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#9AA8BD]">
          <span className="text-[#36D6C5] font-semibold">{post.category}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F4F7FF] tracking-tight leading-tight">
          {title}
        </h1>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#182338] border border-white/10 flex items-center justify-center text-[#6C63FF]">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#F4F7FF]">{post.authorName}</p>
              <p className="text-[10px] text-[#9AA8BD]">MMX7 Studio Editorial</p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#9AA8BD] hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#36D6C5]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="aspect-video w-full rounded-3xl overflow-hidden bg-[#121A2A] border border-white/8 shadow-2xl">
        <img src={post.coverImage} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Markdown Content rendered cleanly */}
      <div className="prose prose-invert max-w-none text-[#F4F7FF] text-sm leading-relaxed space-y-4 py-4 whitespace-pre-line">
        {content}
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#121A2A] to-[#182338] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#F4F7FF]">Ready to process your images?</h3>
          <p className="text-xs text-[#9AA8BD]">Try MMX7 Image Studio online tools with zero desktop installation.</p>
        </div>
        <button
          onClick={() => navigate('/tools')}
          className="px-6 py-3 rounded-2xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all shrink-0"
        >
          Explore All Tools &rarr;
        </button>
      </div>
    </article>
  );
};
