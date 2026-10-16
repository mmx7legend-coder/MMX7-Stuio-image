import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  History,
  FolderOpen,
  User as UserIcon,
  CreditCard,
  Bell,
  Trash2,
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ProcessingJob, SavedProject, NotificationItem } from '../../types';
import { CORE_TOOLS } from '../../data/tools';

interface DashboardProps {
  navigate: (path: string) => void;
  initialTab?: 'overview' | 'history' | 'projects' | 'profile' | 'billing' | 'notifications';
}

export const Dashboard: React.FC<DashboardProps> = ({ navigate, initialTab = 'overview' }) => {
  const { user, token, todayUsage, dailyLimit, remainingOperations, logout, updateProfile, openUpgradeModal } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'projects' | 'profile' | 'billing' | 'notifications'>(initialTab);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Profile Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }

    // Fetch user jobs
    fetch('/api/history', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) setJobs(data.jobs);
      })
      .catch(() => {});

    // Fetch user projects
    fetch('/api/projects', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch(() => {});

    // Fetch notifications
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, [token, navigate]);

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        showToast('Record deleted from history', 'info');
      }
    } catch {
      showToast('Error removing history record', 'error');
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setJobs([]);
        showToast('Processing history cleared', 'info');
      }
    } catch {
      showToast('Error clearing history', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast('Project removed', 'info');
      }
    } catch {
      showToast('Error deleting project', 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) return;
    await updateProfile({ displayName });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        showToast(data.error || 'Failed to update password', 'error');
      }
    } catch {
      showToast('Network error while updating password', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account and all associated projects?')) return;

    try {
      const res = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        logout();
        navigate('/');
      } else {
        const data = await res.json();
        showToast(data.error || 'Could not delete account', 'error');
      }
    } catch {
      showToast('Error during account deletion', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121A2A] to-[#182338] border border-white/8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-[#36D6C5] uppercase tracking-wider">
            Workspace Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FF] mt-1">
            {t('welcomeBack')}, {user.displayName}!
          </h1>
          <p className="text-xs text-[#9AA8BD] mt-1">
            Account: {user.email} &middot; Role: {user.role.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#080B14] border border-white/10 text-center">
            <span className="text-[10px] text-[#9AA8BD] uppercase block font-semibold">Active Plan</span>
            <span className="text-sm font-extrabold uppercase text-[#6C63FF]">{user.plan}</span>
          </div>

          {user.plan === 'free' && (
            <button
              onClick={() => openUpgradeModal()}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#36D6C5] text-white text-xs font-bold shadow-lg shadow-[#6C63FF]/20 flex items-center gap-1.5 transition-transform hover:scale-102"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/8 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'history', label: 'Processing History', icon: History, count: jobs.length },
          { id: 'projects', label: 'Saved Projects', icon: FolderOpen, count: projects.length },
          { id: 'notifications', label: 'Notifications', icon: Bell, count: notifications.filter((n) => !n.read).length },
          { id: 'profile', label: 'Profile & Security', icon: UserIcon },
          { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                  : 'text-[#9AA8BD] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Usage Meter */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Daily Operations
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#F4F7FF]">{todayUsage}</span>
                <span className="text-xs text-[#9AA8BD]">/ {dailyLimit} operations today</span>
              </div>
              <div className="w-full bg-[#182338] h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#6C63FF] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (todayUsage / dailyLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9AA8BD] pt-1">
                {remainingOperations} operations remaining today on {user.plan.toUpperCase()} plan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Total Processed Assets
              </span>
              <div className="text-3xl font-extrabold text-[#36D6C5]">{jobs.length}</div>
              <p className="text-xs text-[#9AA8BD]">Processed across all 10 creative studio tools.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-2">
              <span className="text-xs font-bold text-[#9AA8BD] uppercase tracking-wider block">
                Saved Projects
              </span>
              <div className="text-3xl font-extrabold text-amber-400">{projects.length}</div>
              <p className="text-xs text-[#9AA8BD]">Canvas editor memes &amp; compositions saved in cloud.</p>
            </div>
          </div>

          {/* Quick Launch Tools */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#F4F7FF]">Launch Creative Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CORE_TOOLS.slice(0, 5).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => navigate(tool.path)}
                  className="p-4 rounded-2xl bg-[#121A2A] hover:bg-[#182338] border border-white/5 hover:border-[#6C63FF]/30 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#182338] border border-white/5 flex items-center justify-center text-[#6C63FF] mb-2 group-hover:text-[#36D6C5]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#F4F7FF] group-hover:text-white truncate">
                    {t(tool.nameKey)}
                  </h4>
                  <p className="text-[10px] text-[#9AA8BD] mt-0.5 truncate">Open Editor &rarr;</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Jobs Table */}
          <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F7FF]">Recent Operations</h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-semibold text-[#6C63FF] hover:underline"
              >
                View Full History &rarr;
              </button>
            </div>

            {jobs.length === 0 ? (
              <p className="text-xs text-[#9AA8BD] py-6 text-center">{t('noHistory')}</p>
            ) : (
              <div className="divide-y divide-white/5">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#F4F7FF]">{job.inputName}</p>
                      <p className="text-[11px] text-[#9AA8BD]">
                        {job.toolType} &middot; {new Date(job.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#36D6C5] font-semibold">{formatBytes(job.outputSize || 0)}</span>
                      <span className="text-[10px] text-[#9AA8BD] block uppercase">{job.format}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. History */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F4F7FF]">{t('historyTitle')}</h3>
              <p className="text-xs text-[#9AA8BD]">Tracked image operations across sessions.</p>
            </div>
            {jobs.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearHistory')}</span>
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#9AA8BD]">{t('noHistory')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/8 text-[#9AA8BD]">
                    <th className="pb-3 font-semibold">File Name</th>
                    <th className="pb-3 font-semibold">Tool</th>
                    <th className="pb-3 font-semibold">Input Size</th>
                    <th className="pb-3 font-semibold">Output Size</th>
                    <th className="pb-3 font-semibold">Format</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-[#F4F7FF] max-w-[180px] truncate">
                        {job.inputName}
                      </td>
                      <td className="py-3 text-[#A78BFA]">{job.toolType}</td>
                      <td className="py-3 text-[#9AA8BD]">{formatBytes(job.inputSize)}</td>
                      <td className="py-3 text-[#36D6C5] font-semibold">{formatBytes(job.outputSize || 0)}</td>
                      <td className="py-3 uppercase text-[#9AA8BD]">{job.format}</td>
                      <td className="py-3 text-[#9AA8BD]">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1 text-[#9AA8BD] hover:text-rose-400 rounded"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Projects */}
      {activeTab === 'projects' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F4F7FF]">{t('projectsTitle')}</h3>
            <button
              onClick={() => navigate('/tools/image-editor')}
              className="px-3.5 py-1.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold"
            >
              + New Canvas Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#9AA8BD]">{t('noProjects')}</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-[#0D1220] border border-white/5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    {proj.thumbnail && (
                      <img
                        src={proj.thumbnail}
                        alt=""
                        className="w-full h-32 object-cover rounded-xl mb-3 bg-[#080B14]"
                      />
                    )}
                    <h4 className="text-sm font-bold text-[#F4F7FF]">{proj.title}</h4>
                    <p className="text-[11px] text-[#9AA8BD]">
                      Updated: {new Date(proj.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => navigate(`/tools/${proj.projectType}`)}
                      className="text-xs font-semibold text-[#6C63FF] hover:underline"
                    >
                      Open in Studio
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 text-[#9AA8BD] hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
          <h3 className="text-base font-bold text-[#F4F7FF]">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-[#9AA8BD] py-8 text-center">No notifications at this time.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-colors ${
                    n.read ? 'bg-[#0D1220] border-white/5' : 'bg-[#182338] border-[#6C63FF]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#F4F7FF]">{n.title}</h4>
                    <span className="text-[10px] text-[#9AA8BD]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#9AA8BD] mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Profile & Settings */}
      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
            <h3 className="text-base font-bold text-[#F4F7FF]">{t('editProfile')}</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs text-[#9AA8BD] mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9AA8BD] mb-1 block">Email (Cannot be changed)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-[#9AA8BD] cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold"
              >
                Save Changes
              </button>
            </form>
          </div>

          <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-4">
            <h3 className="text-base font-bold text-[#F4F7FF]">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-[#9AA8BD] mb-1 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[#9AA8BD] mb-1 block">New Password (min 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#182338] border border-white/10 text-xs text-[#F4F7FF] outline-none"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('dangerZone')}</span>
            </h4>
            <p className="text-xs text-[#9AA8BD]">
              Permanently erase your account, session tokens, processing history, and cloud projects in accordance with privacy compliance.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
            >
              {t('deleteAccount')}
            </button>
          </div>
        </div>
      )}

      {/* 6. Billing */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-3xl bg-[#121A2A] border border-white/8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F4F7FF]">Current Subscription</h3>
              <p className="text-xs text-[#9AA8BD]">Your plan determines daily operation limits and AI capabilities.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#6C63FF]/20 text-[#A78BFA] text-xs font-bold uppercase">
              {user.plan}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1220] border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#F4F7FF]">MMX7 {user.plan.toUpperCase()} Plan</p>
              <p className="text-[11px] text-[#9AA8BD]">
                {user.plan === 'free'
                  ? 'Standard daily limits (10 ops/day)'
                  : 'Upgraded creative capabilities with batch processing'}
              </p>
            </div>

            <button
              onClick={() => navigate('/pricing')}
              className="py-2 px-4 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold"
            >
              Change Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
