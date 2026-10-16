import React, { useState } from 'react';
import {
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  Crown,
  ChevronDown,
  LayoutDashboard,
  History,
  FolderOpen,
  CreditCard,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { CORE_TOOLS } from '../../data/tools';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user, logout, openUpgradeModal } = useAuth();
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navAllTools'), path: '/tools', hasDropdown: true },
    { label: t('navAiTools'), path: '/tools/ai' },
    { label: t('navPricing'), path: '/pricing' },
    { label: t('navBlog'), path: '/blog' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const planBadgeColors = {
    free: 'bg-white/10 text-[#9AA8BD] border-white/10',
    pro: 'bg-[#6C63FF]/20 text-[#A78BFA] border-[#6C63FF]/40',
    studio: 'bg-[#36D6C5]/20 text-[#36D6C5] border-[#36D6C5]/40',
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B14]/90 backdrop-blur-md border-b border-white/8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#36D6C5] flex items-center justify-center p-0.5 shadow-md shadow-[#6C63FF]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#36D6C5]">
                M7
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#F4F7FF] flex items-center gap-1.5">
              MMX7 <span className="font-normal text-[#9AA8BD] text-xs">STUDIO</span>
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.hasDropdown) {
              return (
                <div key={link.path} className="relative">
                  <button
                    onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                    onMouseEnter={() => setToolsDropdownOpen(true)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      currentPath.startsWith('/tools') ? 'text-white bg-white/5' : 'text-[#9AA8BD] hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Dropdown Panel */}
                  {toolsDropdownOpen && (
                    <div
                      onMouseLeave={() => setToolsDropdownOpen(false)}
                      className="absolute top-full left-0 mt-2 w-80 p-3 rounded-2xl bg-[#121A2A] border border-white/10 shadow-2xl grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-top-1"
                    >
                      <div className="px-2 py-1 text-[11px] font-semibold text-[#9AA8BD] uppercase tracking-wider">
                        Core Image Tools
                      </div>
                      {CORE_TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleNavClick(tool.path)}
                          className="flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#182338] border border-white/5 flex items-center justify-center text-[#6C63FF] group-hover:text-[#36D6C5]">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-[#F4F7FF] group-hover:text-white">
                              {t(tool.nameKey)}
                            </div>
                            <div className="text-[10px] text-[#9AA8BD] truncate max-w-[200px]">
                              {t(tool.descriptionKey)}
                            </div>
                          </div>
                        </button>
                      ))}
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleNavClick('/tools')}
                          className="w-full py-1.5 px-2 text-center text-xs font-semibold text-[#6C63FF] hover:text-[#A78BFA] transition-colors"
                        >
                          View All 15 Tools &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  currentPath === link.path ? 'text-white bg-white/5 font-semibold' : 'text-[#9AA8BD] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Language, Theme, Auth */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-white/10 text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${planBadgeColors[user.plan] || planBadgeColors.free}`}>
                    {user.plan}
                  </span>
                  <span className="text-xs font-medium text-[#F4F7FF] max-w-[100px] truncate hidden sm:inline">
                    {user.displayName}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6C63FF] to-[#A78BFA] flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#121A2A] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-semibold text-[#F4F7FF]">{user.displayName}</p>
                    <p className="text-[11px] text-[#9AA8BD] truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavClick('/dashboard')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#6C63FF]" />
                      <span>{t('navDashboard')}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/dashboard/history')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <History className="w-4 h-4 text-[#36D6C5]" />
                      <span>{t('historyTitle')}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/dashboard/projects')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      <span>{t('projectsTitle')}</span>
                    </button>
                    <button
                      onClick={() => handleNavClick('/dashboard/profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#9AA8BD] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{t('navProfile')}</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#36D6C5] hover:bg-[#36D6C5]/10 transition-colors font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{t('navAdmin')}</span>
                      </button>
                    )}

                    {user.plan === 'free' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openUpgradeModal();
                        }}
                        className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white bg-gradient-to-r from-[#6C63FF] to-[#36D6C5] font-semibold"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Upgrade to Pro</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-white/5">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('navSignOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('/signin')}
                className="px-3 py-1.5 text-xs font-semibold text-[#9AA8BD] hover:text-white transition-colors"
              >
                {t('navSignIn')}
              </button>
              <button
                onClick={() => handleNavClick('/signup')}
                className="px-3.5 py-1.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B50E8] text-white text-xs font-semibold shadow-md shadow-[#6C63FF]/20 transition-all hover:scale-102"
              >
                {t('navSignUp')}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#9AA8BD] hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#0D1220] px-4 py-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPath === link.path ? 'bg-white/5 text-white' : 'text-[#9AA8BD]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="pt-3 border-t border-white/5 space-y-1">
              <button
                onClick={() => handleNavClick('/dashboard')}
                className="w-full text-left px-3 py-2 text-sm text-[#F4F7FF]"
              >
                {t('navDashboard')}
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNavClick('/admin')}
                  className="w-full text-left px-3 py-2 text-sm text-[#36D6C5]"
                >
                  {t('navAdmin')}
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-rose-400"
              >
                {t('navSignOut')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('/signin')}
                className="w-full py-2 rounded-xl bg-white/5 text-center text-xs font-semibold text-white"
              >
                {t('navSignIn')}
              </button>
              <button
                onClick={() => handleNavClick('/signup')}
                className="w-full py-2 rounded-xl bg-[#6C63FF] text-center text-xs font-semibold text-white"
              >
                {t('navSignUp')}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
