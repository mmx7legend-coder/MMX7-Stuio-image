import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { UpgradeModal } from './components/ui/UpgradeModal';

// Pages
import { Home } from './pages/Home';
import { AllTools } from './pages/AllTools';
import { CompressImages } from './pages/tools/CompressImages';
import { ResizeImages } from './pages/tools/ResizeImages';
import { CropImages } from './pages/tools/CropImages';
import { ConvertImages } from './pages/tools/ConvertImages';
import { RemoveBackground } from './pages/tools/RemoveBackground';
import { RemoveObjects } from './pages/tools/RemoveObjects';
import { UpscaleImages } from './pages/tools/UpscaleImages';
import { WatermarkImages } from './pages/tools/WatermarkImages';
import { BlurFaces } from './pages/tools/BlurFaces';
import { ImageEditor } from './pages/tools/ImageEditor';
import { Pricing } from './pages/Pricing';
import { Blog } from './pages/Blog';
import { BlogPostPage } from './pages/BlogPostPage';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { CookiePreferences } from './pages/legal/CookiePreferences';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotFound } from './pages/NotFound';

export const AppContent: React.FC = () => {
  const basePath = import.meta.env.BASE_URL || '/';
  const stripBase = (pathname: string) => {
    if (basePath !== '/' && pathname.startsWith(basePath)) {
      const stripped = '/' + pathname.slice(basePath.length).replace(/^\/+/, '');
      return stripped === '/' ? '/' : stripped.replace(/\/$/, '');
    }
    return pathname || '/';
  };
  const [currentPath, setCurrentPath] = useState<string>(() => stripBase(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(stripBase(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const target = basePath === '/' ? path : `${basePath.replace(/\/$/, '')}${path === '/' ? '/' : path}`;
    window.history.pushState({}, '', target);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    const path = currentPath;

    // Static Routes
    if (path === '/') return <Home navigate={navigate} />;
    if (path === '/tools') return <AllTools navigate={navigate} initialCategory="all" />;
    if (path === '/tools/popular') return <AllTools navigate={navigate} initialCategory="popular" />;
    if (path === '/tools/ai') return <AllTools navigate={navigate} initialCategory="ai" />;
    if (path === '/tools/optimization') return <AllTools navigate={navigate} initialCategory="optimization" />;
    if (path === '/tools/conversion') return <AllTools navigate={navigate} initialCategory="conversion" />;

    // 10 Core Working Tools
    if (path === '/tools/compress-images') return <CompressImages />;
    if (path === '/tools/resize-images') return <ResizeImages />;
    if (path === '/tools/crop-images') return <CropImages />;
    if (path === '/tools/convert-images') return <ConvertImages />;
    if (path === '/tools/remove-background') return <RemoveBackground />;
    if (path === '/tools/remove-objects') return <RemoveObjects />;
    if (path === '/tools/upscale-images') return <UpscaleImages />;
    if (path === '/tools/watermark-images') return <WatermarkImages />;
    if (path === '/tools/blur-faces') return <BlurFaces />;
    if (path === '/tools/image-editor') return <ImageEditor />;

    // Pricing & Content
    if (path === '/pricing') return <Pricing />;
    if (path === '/blog') return <Blog navigate={navigate} />;
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      return <BlogPostPage slug={slug} navigate={navigate} />;
    }

    // Company & Support
    if (path === '/about') return <About navigate={navigate} />;
    if (path === '/contact') return <Contact />;
    if (path === '/faq' || path === '/help') return <FAQ />;

    // Legal
    if (path === '/privacy') return <PrivacyPolicy />;
    if (path === '/terms') return <TermsOfService />;
    if (path === '/cookies') return <CookiePreferences />;

    // Auth
    if (path === '/signin' || path === '/login') return <SignIn navigate={navigate} />;
    if (path === '/signup' || path === '/register') return <SignUp navigate={navigate} />;
    if (path === '/forgot-password') return <ForgotPassword navigate={navigate} />;

    // User Dashboard
    if (path === '/dashboard') return <Dashboard navigate={navigate} initialTab="overview" />;
    if (path === '/dashboard/history') return <Dashboard navigate={navigate} initialTab="history" />;
    if (path === '/dashboard/projects') return <Dashboard navigate={navigate} initialTab="projects" />;
    if (path === '/dashboard/profile') return <Dashboard navigate={navigate} initialTab="profile" />;
    if (path === '/dashboard/billing') return <Dashboard navigate={navigate} initialTab="billing" />;
    if (path === '/dashboard/notifications') return <Dashboard navigate={navigate} initialTab="notifications" />;

    // Admin
    if (path === '/admin') return <AdminDashboard navigate={navigate} />;

    // 404 Fallback
    return <NotFound navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      <Header currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderCurrentPage()}</main>
      <Footer navigate={navigate} />
      <UpgradeModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
