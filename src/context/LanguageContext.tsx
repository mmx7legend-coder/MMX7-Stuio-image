import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: string;
}

const enTranslations: Translations = {
  // Brand
  brandName: 'MMX7 Image Studio',
  tagline: 'Every Image. Every Tool. One Creative Studio.',
  heroTitle: 'Every Image. Perfectly Processed.',
  heroSubtitle: 'Compress, convert, edit, and enhance your images with a powerful collection of online tools designed for creators and professionals.',
  exploreTools: 'Explore All Tools',
  tryFree: 'Try Free Tools',
  dragDropTitle: 'Drop your image here to begin',
  dragDropSubtitle: 'Supports JPG, PNG, WebP, GIF, SVG up to 100MB',
  selectImage: 'Select Image',
  noFileSelected: 'No file selected yet',
  fileSize: 'File size',

  // Navigation
  navHome: 'Home',
  navAllTools: 'All Tools',
  navAiTools: 'AI Tools',
  navPricing: 'Pricing',
  navBlog: 'Blog',
  navDashboard: 'Dashboard',
  navAdmin: 'Admin',
  navSignIn: 'Sign In',
  navSignUp: 'Get Started Free',
  navSignOut: 'Sign Out',
  navProfile: 'Profile & Settings',

  // Categories
  catAll: 'All Tools',
  catPopular: 'Popular',
  catAi: 'AI Tools',
  catOptimization: 'Optimization',
  catConversion: 'Conversion',
  catCreative: 'Creative Studio',

  // 10 Core Tools
  toolCompressTitle: 'Image Compressor',
  toolCompressDesc: 'Reduce file size by up to 85% while preserving visual clarity. Real batch processing and ZIP download.',
  toolResizeTitle: 'Image Resizer',
  toolResizeDesc: 'Resize by exact pixel dimensions, percentages, or social media presets with aspect ratio lock.',
  toolCropTitle: 'Image Cropper',
  toolCropDesc: 'Interactive canvas crop rectangle with standard aspect ratios, zoom, rotation, and fine angle adjustments.',
  toolConvertTitle: 'Image Converter',
  toolConvertDesc: 'Transform formats between PNG, JPG, WebP, and BMP with transparency warnings and quality tuning.',
  toolBgRemoveTitle: 'AI Background Remover',
  toolBgRemoveDesc: 'Instantly isolate subjects, output transparent PNGs, or replace with studio backdrops and solid colors.',
  toolObjRemoveTitle: 'AI Object Remover',
  toolObjRemoveDesc: 'Brush over unwanted elements, watermarks, or blemishes to cleanly inpaint and restore your photo.',
  toolUpscaleTitle: 'AI Image Upscaler',
  toolUpscaleDesc: 'Super-resolution 2x, 4x, and 8x enlargement with edge preservation and detail enhancement.',
  toolWatermarkTitle: 'Watermark Tool',
  toolWatermarkDesc: 'Protect intellectual property with customizable text or logo stamps, tiling, and opacity controls.',
  toolFaceBlurTitle: 'Face Blur & Privacy',
  toolFaceBlurDesc: 'Irreversibly obfuscate faces, license plates, and sensitive documents with Gaussian blur or mosaic pixelation.',
  toolEditorTitle: 'Image & Meme Editor',
  toolEditorDesc: 'Full creative canvas with meme typography, sticker stamps, filter adjustments, and layer ordering.',

  // 5 Coming Soon Tools
  comingSoonBadge: 'Coming Soon',
  notifyMe: 'Notify Me',
  notifySuccess: 'You will be notified when this tool launches!',
  toolAiGenTitle: 'AI Image Generator',
  toolAiGenDesc: 'Synthesize photorealistic visuals, digital art, and marketing assets from natural text prompts.',
  toolRestoreTitle: 'AI Photo Restoration',
  toolRestoreDesc: 'Repair scratched, torn, faded, and vintage historical family prints with deep reconstruction.',
  toolColorizeTitle: 'AI Colorizer',
  toolColorizeDesc: 'Intelligently infill realistic chromatic spectra into monochrome and black-and-white photography.',
  toolImgToPdfTitle: 'Image to PDF Studio',
  toolImgToPdfDesc: 'Organize, reorder, and compile multiple high-resolution images into optimized PDF portfolios.',
  toolMetaEditorTitle: 'Smart Metadata Editor',
  toolMetaEditorDesc: 'Inspect, sanitize, and customize EXIF, IPTC, and camera telemetry data for privacy and SEO.',

  // Common Tool Controls
  uploadImage: 'Upload Image',
  uploadAnother: 'Upload Another',
  downloadImage: 'Download Image',
  downloadZip: 'Download All as ZIP',
  processing: 'Processing...',
  original: 'Original',
  result: 'Processed Result',
  quality: 'Quality',
  width: 'Width',
  height: 'Height',
  dimensions: 'Dimensions',
  lockAspect: 'Lock Aspect Ratio',
  reset: 'Reset',
  apply: 'Apply',
  saveProject: 'Save Project',
  savedSuccessfully: 'Saved successfully',
  percentSaved: 'Saved',
  opacity: 'Opacity',
  fontSize: 'Font Size',
  textColor: 'Color',
  rotation: 'Rotation',
  blurIntensity: 'Blur Intensity',
  zoom: 'Zoom',
  flipHorizontal: 'Flip Horizontal',
  flipVertical: 'Flip Vertical',

  // Pricing
  pricingTitle: 'Simple, Transparent Pricing',
  pricingSubtitle: 'Choose the plan tailored to your creative workflow. Upgrade or downgrade anytime.',
  monthlyBilling: 'Monthly',
  annualBilling: 'Annual (Save 20%)',
  currentPlan: 'Current Plan',
  upgradeToPro: 'Upgrade to Pro',
  upgradeToStudio: 'Get Studio',
  planFreeTitle: 'Free',
  planProTitle: 'Pro',
  planStudioTitle: 'Studio',
  dailyOperations: 'operations / day',
  maxUpload: 'max upload size',
  batchZipIncluded: 'Batch processing & ZIP',
  aiToolsAccess: 'AI tools access',
  commercialLicense: 'Commercial license',

  // Dashboard
  welcomeBack: 'Welcome back',
  historyTitle: 'Recent Processing History',
  noHistory: 'No processed images yet. Start by exploring our tools above.',
  clearHistory: 'Clear History',
  projectsTitle: 'Saved Projects',
  noProjects: 'No saved projects yet. Use the Image & Meme Editor to save your creations.',
  usageToday: 'Daily Usage Today',
  remainingLimit: 'operations remaining today',
  accountSettings: 'Account Settings',
  editProfile: 'Edit Profile',
  dangerZone: 'Danger Zone',
  deleteAccount: 'Delete Account',

  // Footer
  footerDesc: 'MMX7 Image Studio delivers fast, privacy-conscious, in-browser and AI-assisted image manipulation tools for modern creators.',
  allRightsReserved: 'All rights reserved.',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  cookiePreferences: 'Cookie Settings',
  helpCenter: 'Help Center',
  faq: 'FAQ',
  contactUs: 'Contact Us',
};

const arTranslations: Translations = {
  // Brand
  brandName: 'استوديو الصور MMX7',
  tagline: 'كل أدوات الصور التي تحتاجها، في مكان واحد.',
  heroTitle: 'كل صورة. معالجة مثالية.',
  heroSubtitle: 'اضغط صورك، وحوّل صيغها، وعدّلها، وحسّن جودتها باستخدام مجموعة قوية من أدوات الصور عبر الإنترنت المصممة للمبدعين والمحترفين.',
  exploreTools: 'استكشف جميع الأدوات',
  tryFree: 'جرّب الأدوات المجانية',
  dragDropTitle: 'أسقط صورتك هنا للبدء',
  dragDropSubtitle: 'يدعم JPG و PNG و WebP و GIF حتى 100 ميغابايت',
  selectImage: 'اختر صورة',
  noFileSelected: 'لم يتم اختيار أي ملف بعد',
  fileSize: 'حجم الملف',

  // Navigation
  navHome: 'الرئيسية',
  navAllTools: 'جميع الأدوات',
  navAiTools: 'أدوات الذكاء الاصطناعي',
  navPricing: 'الأسعار والخطط',
  navBlog: 'المدونة',
  navDashboard: 'لوحة التحكم',
  navAdmin: 'الإدارة',
  navSignIn: 'تسجيل الدخول',
  navSignUp: 'ابدأ مجاناً',
  navSignOut: 'تسجيل الخروج',
  navProfile: 'الملف الشخصي والإعدادات',

  // Categories
  catAll: 'جميع الأدوات',
  catPopular: 'الأكثر استخداماً',
  catAi: 'الذكاء الاصطناعي',
  catOptimization: 'تحسين الحجم والسرعة',
  catConversion: 'تحويل الصيغ',
  catCreative: 'استوديو التصميم',

  // 10 Core Tools
  toolCompressTitle: 'ضغط الصور',
  toolCompressDesc: 'قلل حجم الصور بنسبة تصل إلى 85% مع الحفاظ على وضوحها. معالجة جماعية وتنزيل كملف مضغوط ZIP.',
  toolResizeTitle: 'تغيير أبعاد الصور',
  toolResizeDesc: 'غيّر المقاسات بالبكسل أو بالنسبة المئوية أو بنسب شبكات التواصل الاجتماعي مع قفل التناسب.',
  toolCropTitle: 'قص الصور',
  toolCropDesc: 'مستطيل قص تفاعلي مع نسب أبعاد قياسية ودوران وتكبير وضبط دقيق للزاوية.',
  toolConvertTitle: 'تحويل صيغ الصور',
  toolConvertDesc: 'تحويل فوري بين PNG و JPG و WebP و BMP مع دعم الشفافية وضبط الجودة.',
  toolBgRemoveTitle: 'إزالة خلفية الصورة بالذكاء الاصطناعي',
  toolBgRemoveDesc: 'اعزل العنصر الأساسي فوراً بصيغة PNG شفافة، أو استبدل الخلفية بألوان أو مشاهد استوديو احترافية.',
  toolObjRemoveTitle: 'إزالة العناصر بالذكاء الاصطناعي',
  toolObjRemoveDesc: 'امسح العناصر غير المرغوب فيها أو العلامات المائية لترميم صورتك بسلاسة.',
  toolUpscaleTitle: 'زيادة دقة الصور بالذكاء الاصطناعي',
  toolUpscaleDesc: 'مضاعفة دقة الصور 2x و 4x و 8x مع الحفاظ على حواف التفاصيل ونعومة الألوان.',
  toolWatermarkTitle: 'إضافة علامة مائية',
  toolWatermarkDesc: 'احمِ حقوق صورك بنصوص أو شعارات مخصصة مع إمكانية التكرار وضبط الشفافية والزاوية.',
  toolFaceBlurTitle: 'طمس الوجوه وحماية الخصوصية',
  toolFaceBlurDesc: 'طمس الوجوه وأرقام لوحات السيارات والمستندات الحساسة بتقنية التعتيم أو الفسيفساء غير القابلة للاسترجاع.',
  toolEditorTitle: 'محرر الصور وصانع الميمز',
  toolEditorDesc: 'استوديو تفاعلي كامل لإضافة النصوص والملصقات والأشكال الهندسية وتطبيق الفلاتر والطبقات.',

  // 5 Coming Soon Tools
  comingSoonBadge: 'قريباً',
  notifyMe: 'أشعرني عند الإطلاق',
  notifySuccess: 'تم تسجيل بريدك! سنبلغك فور إطلاق هذه الأداة.',
  toolAiGenTitle: 'توليد الصور بالذكاء الاصطناعي',
  toolAiGenDesc: 'ابتكر صوراً واقعية وفنوناً رقمية مذهلة بمجرد وصفها بالنص.',
  toolRestoreTitle: 'ترميم الصور القديمة',
  toolRestoreDesc: 'إصلاح الصور العائلية القديمة والتالفة وإزالة الخدوش وتوضيح ملامحها.',
  toolColorizeTitle: 'تلوين الصور الأبيض والأسود',
  toolColorizeDesc: 'إضافة ألوان طبيعية وواقعية إلى الصور التاريخية والشخصية أحادية اللون.',
  toolImgToPdfTitle: 'تحويل الصور إلى مستند PDF',
  toolImgToPdfDesc: 'دمج وترتيب صور متعددة عالية الدقة في ملف PDF منظم وخفيف.',
  toolMetaEditorTitle: 'محرر البيانات الوصفية الذكي',
  toolMetaEditorDesc: 'فحص وتعديل وحذف بيانات الكاميرا والموقع الجغرافي EXIF لحماية خصوصيتك وتحسين السيو.',

  // Common Tool Controls
  uploadImage: 'رفع الصورة',
  uploadAnother: 'رفع صورة أخرى',
  downloadImage: 'تنزيل الصورة المعالجة',
  downloadZip: 'تنزيل الكل في ملف ZIP',
  processing: 'جاري المعالجة...',
  original: 'الأصلية',
  result: 'النتيجة بعد المعالجة',
  quality: 'الجودة',
  width: 'العرض',
  height: 'الارتفاع',
  dimensions: 'الأبعاد',
  lockAspect: 'تثبيت نسبة الأبعاد',
  reset: 'إعادة تعيين',
  apply: 'تطبيق',
  saveProject: 'حفظ المشروع',
  savedSuccessfully: 'تم الحفظ بنجاح',
  percentSaved: 'تم توفير',
  opacity: 'الشفافية',
  fontSize: 'حجم الخط',
  textColor: 'اللون',
  rotation: 'الدوران',
  blurIntensity: 'شدة الطمس',
  zoom: 'التقريب',
  flipHorizontal: 'انعكاس أفقي',
  flipVertical: 'انعكاس رأسي',

  // Pricing
  pricingTitle: 'خطط أسعار واضحة وبسيطة',
  pricingSubtitle: 'اختر الخطة المناسبة لحجم أعمالك وإبداعك. يمكنك الترقية أو التخفيض في أي وقت.',
  monthlyBilling: 'شهرياً',
  annualBilling: 'سنوياً (خصم 20%)',
  currentPlan: 'خطتك الحالية',
  upgradeToPro: 'الترقية إلى خطة برو',
  upgradeToStudio: 'الترقية إلى استوديو',
  planFreeTitle: 'المجانية',
  planProTitle: 'برو',
  planStudioTitle: 'استوديو',
  dailyOperations: 'عملية يومياً',
  maxUpload: 'أقصى حجم للملف',
  batchZipIncluded: 'المعالجة الجماعية وملفات ZIP',
  aiToolsAccess: 'الوصول لأدوات الذكاء الاصطناعي',
  commercialLicense: 'ترخيص الاستخدام التجاري',

  // Dashboard
  welcomeBack: 'أهلاً بك مجدداً',
  historyTitle: 'سجل العمليات الأخير',
  noHistory: 'لا توجد عمليات سابقة بعد. ابدأ بتجربة إحدى الأدوات أعلاه.',
  clearHistory: 'مسح السجل',
  projectsTitle: 'المشاريع المحفوظة',
  noProjects: 'لا توجد مشاريع محفوظة بعد. استخدم محرر الصور لحفظ أعمالك.',
  usageToday: 'الاستهلاك اليومي',
  remainingLimit: 'عملية متبقية اليوم',
  accountSettings: 'إعدادات الحساب',
  editProfile: 'تعديل الملف الشخصي',
  dangerZone: 'منطقة الحذف',
  deleteAccount: 'حذف الحساب نهائياً',

  // Footer
  footerDesc: 'يوفر استوديو الصور MMX7 أدوات معالجة صور سريعة وآمنة ومحمية الخصوصية داخل المتصفح وبالذكاء الاصطناعي للمبدعين.',
  allRightsReserved: 'جميع الحقوق محفوظة.',
  privacyPolicy: 'سياسة الخصوصية',
  termsOfService: 'شروط الخدمة',
  cookiePreferences: 'إعدادات ملفات تعريف الارتباط',
  helpCenter: 'مركز المساعدة',
  faq: 'الأسئلة الشائعة',
  contactUs: 'اتصل بنا',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  isRtl: false,
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mmx7_lang');
    if (saved === 'ar' || saved === 'en') return saved;
    // Check browser language
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ar')) {
      return 'ar';
    }
    return 'en';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('mmx7_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const dict = language === 'ar' ? arTranslations : enTranslations;
    return dict[key] || enTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
