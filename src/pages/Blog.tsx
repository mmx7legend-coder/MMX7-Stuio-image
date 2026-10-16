import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, BookOpen, Clock, User as UserIcon } from 'lucide-react';
import { BlogPost } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BlogProps {
  navigate: (path: string) => void;
}

export const Blog: React.FC<BlogProps> = ({ navigate }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const { language } = useLanguage();

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', 'Image Compression', 'Image Formats', 'Design Tutorials', 'Productivity'];

  const filteredPosts = posts.filter((p) => {
    const title = language === 'ar' ? p.titleAr || p.title : p.title;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#6C63FF]">
          Studio Knowledge Base
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F4F7FF] tracking-tight">
          Image Processing Tutorials &amp; Guides
        </h1>
        <p className="text-sm text-[#9AA8BD]">
          Practical articles on image compression algorithms, modern web formats, privacy protection, and design tips.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#6C63FF] text-white'
                  : 'bg-[#121A2A] text-[#9AA8BD] hover:text-white border border-white/5'
              }`}
            >
              {cat === 'all' ? 'All Guides' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA8BD]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121A2A] border border-white/10 text-xs text-[#F4F7FF] outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-[#121A2A]"></div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-[#9AA8BD] text-xs">
          No articles match your search criteria.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="group rounded-3xl bg-[#121A2A] border border-white/8 overflow-hidden hover:border-[#6C63FF]/40 transition-all cursor-pointer flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="aspect-video w-full overflow-hidden bg-[#0D1220]">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-[#9AA8BD] mb-2.5">
                    <span className="text-[#36D6C5] font-semibold">{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#F4F7FF] group-hover:text-[#6C63FF] transition-colors line-clamp-2">
                    {language === 'ar' ? post.titleAr || post.title : post.title}
                  </h3>

                  <p className="text-xs text-[#9AA8BD] mt-2 line-clamp-2 leading-relaxed">
                    {language === 'ar' ? post.excerptAr || post.excerpt : post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 text-xs font-semibold text-[#6C63FF] flex items-center gap-1">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
