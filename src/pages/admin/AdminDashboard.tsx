import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Activity,
  FileText,
  Settings,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/ui/Modal';
import { BlogPost } from '../../types';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'blog' | 'settings'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Blog modal
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postTitleAr, setPostTitleAr] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Design Tutorials');
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/signin');
      return;
    }

    loadAdminData();
  }, [token, user, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [metricsRes, usersRes, blogRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/blog'),
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }
      if (blogRes.ok) {
        const bData = await blogRes.json();
        setBlogPosts(bData.posts || []);
      }
    } catch (err) {
      console.error('Failed fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (res.ok) {
        showToast(`User plan updated to ${newPlan.toUpperCase()}`, 'success');
        loadAdminData();
      }
    } catch {
      showToast('Error updating user', 'error');
    }
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: postTitle,
        titleAr: postTitleAr || postTitle,
        slug: postSlug || postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: postExcerpt,
        content: postContent,
        category: postCategory,
        status: postStatus,
      };

      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : '/api/admin/blog';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingPost ? 'Article updated' : 'Article created', 'success');
        setBlogModalOpen(false);
        resetBlogForm();
        loadAdminData();
      }
    } catch {
      showToast('Error saving article', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog article?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast('Article deleted', 'info');
        loadAdminData();
      }
    } catch {
      showToast('Error deleting article', 'error');
    }
  };

  const resetBlogForm = () => {
    setEditingPost(null);
    setPostTitle('');
    setPostTitleAr('');
    setPostSlug('');
    setPostExcerpt('');
    setPostContent('');
    setPostCategory('Design Tutorials');
    setPostStatus('published');
  };

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostTitle(post.title);
    setPostTitleAr(post.titleAr || '');
    setPostSlug(post.slug);
    setPostExcerpt(post.excerpt);
    setPostContent(post.content);
    setPostCategory(post.category);
    setPostStatus(post.status);
    setBlogModalOpen(true);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-[#121A2A] border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#36D6C5] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Super Administrator Control Plane
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FF] mt-1">
            Studio Administration
          </h1>
          <p className="text-xs text-[#9AA8BD] mt-1">
            Server-enforced role authorization &middot; Live telemetry &middot; Content management
          </p>
        </div>

        <button
          onClick={() => {
            resetBlogForm();
            setBlogModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/8 pb-2">
        {[
          { id: 'metrics', label: 'Overview Metrics', icon: Activity },
          { id: 'users', label: 'Users Management', icon: Users, count: usersList.length },
          { id: 'blog', label: 'Blog CMS', icon: FileText, count: blogPosts.length },
          { id: 'settings', label: 'System Health', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Metrics Tab */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8">
              <span className="text-[11px] font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Total Users
              </span>
              <div className="text-3xl font-extrabold text-[#F4F7FF] mt-2">
                {metrics.users.total}
              </div>
              <p className="text-[11px] text-[#9AA8BD] mt-1">
                {metrics.users.pro} Pro &middot; {metrics.users.studio} Studio &middot; {metrics.users.free} Free
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8">
              <span className="text-[11px] font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Total Operations
              </span>
              <div className="text-3xl font-extrabold text-[#36D6C5] mt-2">
                {metrics.jobs.total}
              </div>
              <p className="text-[11px] text-[#9AA8BD] mt-1">Across all 10 tools</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8">
              <span className="text-[11px] font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Bandwidth Saved
              </span>
              <div className="text-3xl font-extrabold text-[#A78BFA] mt-2">
                {formatBytes(metrics.jobs.bytesSaved || 0)}
              </div>
              <p className="text-[11px] text-[#9AA8BD] mt-1">From browser compression</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8">
              <span className="text-[11px] font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Waiting List
              </span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">
                {metrics.waitingListCount}
              </div>
              <p className="text-[11px] text-[#9AA8BD] mt-1">Coming Soon tool leads</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
          <h3 className="text-base font-bold text-[#F4F7FF]">Registered User Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/8 text-[#9AA8BD]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Current Plan</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Created</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="py-3 font-bold text-[#F4F7FF]">{u.displayName}</td>
                    <td className="py-3 text-[#9AA8BD]">{u.email}</td>
                    <td className="py-3">
                      <select
                        value={u.plan}
                        onChange={(e) => handleUpdateUserPlan(u.id, e.target.value)}
                        className="px-2 py-1 rounded bg-[#182338] border border-white/10 text-[#F4F7FF] text-xs"
                      >
                        <option value="free">FREE</option>
                        <option value="pro">PRO</option>
                        <option value="studio">STUDIO</option>
                      </select>
                    </td>
                    <td className="py-3 uppercase text-xs font-semibold text-[#A78BFA]">{u.role}</td>
                    <td className="py-3 text-[#9AA8BD]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-[11px] text-[#36D6C5]">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === 'blog' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F4F7FF]">Blog Articles ({blogPosts.length})</h3>
            <button
              onClick={() => {
                resetBlogForm();
                setBlogModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-[#6C63FF] text-white text-xs font-semibold"
            >
              + Create Article
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {blogPosts.map((post) => (
              <div key={post.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] text-[#36D6C5] font-semibold uppercase">{post.category}</span>
                  <h4 className="text-sm font-bold text-[#F4F7FF] truncate">{post.title}</h4>
                  <p className="text-xs text-[#9AA8BD] truncate">{post.excerpt}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditPost(post)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA8BD] hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#9AA8BD] hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings / System Health */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
          <h3 className="text-base font-bold text-[#F4F7FF]">System Integrations &amp; Providers</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#0D1220] border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FF]">Database Storage</h4>
                <p className="text-[11px] text-[#9AA8BD]">Persistent local atomic file store (./data/database.json)</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">ONLINE</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D1220] border border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#F4F7FF]">Payment Sandbox</h4>
                <p className="text-[11px] text-[#9AA8BD]">Zero-risk test mode ready out-of-the-box</p>
              </div>
              <span className="text-xs font-bold text-[#36D6C5]">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Blog Article Editor Modal */}
      <Modal
        isOpen={blogModalOpen}
        onClose={() => setBlogModalOpen(false)}
        title={editingPost ? 'Edit Blog Article' : 'Create Blog Article'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveBlogPost} className="space-y-4 text-xs">
          <div>
            <label className="text-[#9AA8BD] block mb-1">Title (English)</label>
            <input
              type="text"
              required
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none"
            />
          </div>

          <div>
            <label className="text-[#9AA8BD] block mb-1">Title (Arabic)</label>
            <input
              type="text"
              value={postTitleAr}
              onChange={(e) => setPostTitleAr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none text-right"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9AA8BD] block mb-1">Slug</label>
              <input
                type="text"
                value={postSlug}
                onChange={(e) => setPostSlug(e.target.value)}
                placeholder="my-article-slug"
                className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none"
              />
            </div>
            <div>
              <label className="text-[#9AA8BD] block mb-1">Category</label>
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none"
              >
                <option value="Image Compression">Image Compression</option>
                <option value="Image Formats">Image Formats</option>
                <option value="Design Tutorials">Design Tutorials</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#9AA8BD] block mb-1">Excerpt</label>
            <textarea
              rows={2}
              value={postExcerpt}
              onChange={(e) => setPostExcerpt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] outline-none"
            />
          </div>

          <div>
            <label className="text-[#9AA8BD] block mb-1">Article Content (Markdown)</label>
            <textarea
              rows={6}
              required
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-[#F4F7FF] font-mono outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-bold"
          >
            {editingPost ? 'Save Article Changes' : 'Publish Article'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
