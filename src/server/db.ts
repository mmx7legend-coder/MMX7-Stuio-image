import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  displayName: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'studio';
  preferredLanguage: 'en' | 'ar';
  preferredTheme: 'dark' | 'light' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface DbSubscription {
  id: string;
  userId: string;
  provider: 'stripe' | 'test_sandbox';
  planId: 'free' | 'pro' | 'studio';
  status: 'active' | 'canceled' | 'past_due';
  billingInterval: 'month' | 'year';
  amount: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface DbJob {
  id: string;
  userId: string;
  toolType: string;
  status: 'completed' | 'failed';
  inputName: string;
  inputSize: number;
  outputSize: number;
  format: string;
  createdAt: string;
}

export interface DbProject {
  id: string;
  userId: string;
  title: string;
  projectType: string;
  thumbnail?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface DbNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content: string;
  contentAr: string;
  coverImage: string;
  authorName: string;
  category: string;
  readTime: string;
  status: 'published' | 'draft';
  publishedAt: string;
  createdAt: string;
}

export interface DbWaitingList {
  id: string;
  email: string;
  toolId: string;
  createdAt: string;
}

export interface DbData {
  users: DbUser[];
  subscriptions: DbSubscription[];
  jobs: DbJob[];
  projects: DbProject[];
  notifications: DbNotification[];
  blogPosts: DbBlogPost[];
  waitingList: DbWaitingList[];
  settings: {
    announcementBanner?: {
      active: boolean;
      textEn: string;
      textAr: string;
      link?: string;
    };
    maintenanceMode: boolean;
    stripeConfigured: boolean;
    geminiConfigured: boolean;
  };
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
}

export function generateToken(userId: string): string {
  const timestamp = Date.now();
  const raw = `${userId}:${timestamp}:${crypto.randomBytes(16).toString('hex')}`;
  const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET || 'mmx7_studio_secret_2026').update(raw).digest('hex');
  return Buffer.from(`${raw}:${hmac}`).toString('base64url');
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;
    const [userId, timestampStr, randomStr, hmac] = parts;
    const expectedRaw = `${userId}:${timestampStr}:${randomStr}`;
    const expectedHmac = crypto.createHmac('sha256', process.env.JWT_SECRET || 'mmx7_studio_secret_2026').update(expectedRaw).digest('hex');
    if (hmac !== expectedHmac) return null;
    // 30 days token expiry
    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) return null;
    return userId;
  } catch {
    return null;
  }
}

function getInitialData(): DbData {
  const adminAuth = hashPassword('MMX7admin2026!');
  const creatorAuth = hashPassword('Creative2026!');

  const now = new Date().toISOString();

  const adminUser: DbUser = {
    id: 'user_admin_001',
    email: 'admin@mmx7studio.com',
    passwordHash: adminAuth.hash,
    salt: adminAuth.salt,
    displayName: 'MMX7 Admin',
    role: 'admin',
    plan: 'studio',
    preferredLanguage: 'en',
    preferredTheme: 'dark',
    createdAt: now,
    updatedAt: now,
  };

  const creatorUser: DbUser = {
    id: 'user_creator_002',
    email: 'creator@mmx7studio.com',
    passwordHash: creatorAuth.hash,
    salt: creatorAuth.salt,
    displayName: 'Creative Pro User',
    role: 'user',
    plan: 'pro',
    preferredLanguage: 'en',
    preferredTheme: 'dark',
    createdAt: now,
    updatedAt: now,
  };

  const adminSub: DbSubscription = {
    id: 'sub_admin_001',
    userId: 'user_admin_001',
    provider: 'test_sandbox',
    planId: 'studio',
    status: 'active',
    billingInterval: 'year',
    amount: 108,
    currency: 'USD',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const creatorSub: DbSubscription = {
    id: 'sub_creator_002',
    userId: 'user_creator_002',
    provider: 'test_sandbox',
    planId: 'pro',
    status: 'active',
    billingInterval: 'month',
    amount: 5,
    currency: 'USD',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const blogPosts: DbBlogPost[] = [
    {
      id: 'post-1',
      slug: 'how-to-compress-images-without-losing-quality',
      title: 'How to Compress Images Without Losing Visual Quality',
      titleAr: 'كيف تضغط الصور دون خسارة جودتها المرئية',
      excerpt: 'Learn the exact balance between lossless and lossy compression, optimal chroma subsampling, and target web dimensions.',
      excerptAr: 'تعرف على التوازن الدقيق بين الضغط غير المفقود والمفقود وتنسيقات الويب المثلى.',
      content: `## The Physics of Image Compression

Every web image consists of millions of pixel values. Uncompressed images (like raw BMPs or uncompressed TIFFs) record red, green, and blue values for every single pixel.

For a standard 4K image (3840 x 2160 pixels), storing 3 bytes per pixel requires approximately 24.8 megabytes per image. Loading multiple such images on a mobile device destroys page load speeds and data allowances.

### 1. Lossless vs Lossy Compression
- **Lossless Compression** (PNG, lossless WebP): Eliminates redundant bit patterns using algorithms like Deflate and LZ77 without changing a single pixel. Perfect for screenshots, charts, diagrams, and line art.
- **Lossy Compression** (JPEG, modern WebP, AVIF): Selectively discards high-frequency pixel variations that human vision cannot distinguish, typically yielding 70% to 90% file size reductions.

### 2. The Golden Ratio of Quality
In tests across thousands of digital photographs, a quality level between **78% and 85%** produces an unnoticeable difference to the naked eye while reducing file size by upwards of 75%. Below 65%, artifacting and color banding become noticeable.

### 3. Summary Best Practices
1. Choose WebP for modern web browsers whenever possible.
2. Maintain original high-resolution master copies offline.
3. Use MMX7 Image Compressor with intelligent quality targeting before deploying to production.`,
      contentAr: `## فيزياء ضغط الصور الرقمية

تتكون كل صورة على الويب من ملايين البكسلات. تتطلب الصور غير المضغوطة مساحات هائلة تبطئ تحميل المواقع على الهواتف والأجهزة المختلفة.

### 1. الضغط المفقود مقابل غير المفقود
- **الضغط غير المفقود (PNG / WebP)**: يحافظ على كل بكسل بدقة متناهية، وهو ممتاز للشعارات والرسوم التوضيحية ذات النصوص.
- **الضغط المفقود (JPEG / WebP)**: يحذف الترددات اللونية الدقيقة التي تعجز العين البشرية عن ملاحظتها، مما يوفر حتى 85% من الحجم.

### 2. الإعداد المثالي
أثبتت التجارب أن معامل الجودة بين **78% و 85%** يمنحك التوازن المثالي بين وضوح الصورة وتوفير الباندويث.`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      authorName: 'Creative Team',
      category: 'Image Compression',
      readTime: '4 min read',
      status: 'published',
      publishedAt: '2026-03-10T10:00:00Z',
      createdAt: '2026-03-10T10:00:00Z',
    },
    {
      id: 'post-2',
      slug: 'png-vs-jpg-vs-webp-which-format-should-you-use',
      title: 'PNG vs JPG vs WebP: Which Format Should You Use?',
      titleAr: 'مقارنة شاملة بين PNG و JPG و WebP: أي صيغة تختار؟',
      excerpt: 'A comprehensive performance comparison of modern digital formats, transparency handling, and browser support.',
      excerptAr: 'دليل شامل يوضح الفرق بين صيغ الصور الرقمية ومتى تستخدم كلاً منها لتحقيق أفضل أداء.',
      content: `## Choosing the Right Image Format

Web creators frequently face the decision of which file format to export. Selecting the wrong format can cause either bloated download sizes or blurry, compressed artifacts.

### PNG (Portable Network Graphics)
- **Best for:** Transparent backgrounds, logos, user interface screenshots, icons, and sharp graphical text.
- **Pros:** 24-bit RGB with 8-bit alpha transparency; lossless fidelity.
- **Cons:** Significantly larger file sizes when used for photographs.

### JPEG / JPG (Joint Photographic Experts Group)
- **Best for:** Complex photographs, rich scenic images, portraiture with continuous color gradients.
- **Pros:** High compression efficiency; supported everywhere for over 30 years.
- **Cons:** No transparency support; compression artifacts around sharp high-contrast text.

### WebP (Modern Web Standard)
- **Best for:** Modern web applications, mobile apps, e-commerce storefronts.
- **Pros:** Supports both lossy and lossless compression, alongside full 8-bit alpha transparency. Delivers 25-35% smaller files than comparable JPEGs.
- **Cons:** Legacy graphic software (older than 2020) sometimes requires plugins to open.

Use MMX7 Image Converter to batch-convert your media asset libraries in seconds!`,
      contentAr: `## كيف تختار الصيغة المناسبة لصورك؟

اختيار الصيغة الخاطئة إما يثقل موقعك أو يشوه تفاصيل التصميم.

### صيغة PNG
الأفضل للشعارات والرسومات التي تحتوي على خلفية شفافة ونصوص حادة.

### صيغة JPG
الأفضل للصور الفوتوغرافية الطبيعية والشخصية ذات الألوان الكثيرة المتدرجة.

### صيغة WebP الحديثة
معيار الويب العصري الذي يجمع بين الشفافية والضغط الفائق بحجم أقل بنسبة 30% مقارنة بـ JPG.`,
      coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      authorName: 'Alex Vance',
      category: 'Image Formats',
      readTime: '5 min read',
      status: 'published',
      publishedAt: '2026-03-12T14:30:00Z',
      createdAt: '2026-03-12T14:30:00Z',
    },
    {
      id: 'post-3',
      slug: 'how-to-resize-images-for-social-media-platforms',
      title: 'How to Resize Images for Social Media in 2026',
      titleAr: 'الدليل الكامل لأبعاد وأحجام الصور لمنصات التواصل في 2026',
      excerpt: 'Current dimensions, aspect ratios, and compression tips for Instagram, YouTube, X, Facebook, and LinkedIn.',
      excerptAr: 'أحدث مقاسات ونسب أبعاد الصور لإنستغرام ويوتيوب وإكس ولينكدإن.',
      content: `## The 2026 Social Media Dimension Guide

Each platform employs aggressive automated re-compression algorithms if your uploaded images deviate from their optimal aspect ratio.

### Platform Breakdown
- **Instagram Feed**: 1080 x 1350 px (4:5 Portrait) maximizes vertical viewport estate. Square is 1080 x 1080 px (1:1).
- **Instagram & TikTok Stories**: 1080 x 1920 px (9:16 Full Screen).
- **YouTube Thumbnails**: 1280 x 720 px (16:9 Standard HD). Minimum width 640px.
- **LinkedIn Banners**: 1584 x 396 px (4:1 Ultra Wide).
- **X / Twitter Header**: 1500 x 500 px (3:1).

Take advantage of MMX7 Image Resizer with one-click social media presets to resize your content with pixel accuracy.`,
      contentAr: `## دليل مقاسات شبكات التواصل

كل منصة تعيد ضغط وقص صورتك تلقائياً إذا لم تلتزم بالنسب المثالية.

- **إنستغرام**: 1080 × 1350 بكسل للمنشورات الرأسية، و 1080 × 1920 للقصص والريلز.
- **يوتيوب**: 1280 × 720 بكسل للصور المصغرة بصيغة 16:9.
- **لينكد إن**: 1584 × 396 بكسل لغلاف الحساب الشخصي والشركات.`,
      coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80',
      authorName: 'Sarah Jenkins',
      category: 'Design Tutorials',
      readTime: '6 min read',
      status: 'published',
      publishedAt: '2026-03-15T09:00:00Z',
      createdAt: '2026-03-15T09:00:00Z',
    },
    {
      id: 'post-4',
      slug: 'privacy-first-image-editing-masking-sensitive-data',
      title: 'Privacy-First Image Editing: Masking Faces and Sensitive Documents',
      titleAr: 'حماية الخصوصية عند تعديل الصور: طمس الوجوه والمستندات الحساسة',
      excerpt: 'Why local browser processing protects personal privacy, and how to effectively mask identity in photos.',
      excerptAr: 'لماذا تعد المعالجة المحلية داخل المتصفح هي الأكثر أماناً لحماية خصوصية بياناتك وصورك.',
      content: `## Protecting Privacy in the Digital Age

When you upload personal documents, ID cards, financial statements, or family photos to cloud services, you may unknowingly expose private metadata (EXIF GPS coordinates, device serial numbers, face vectors).

### Best Practices for Privacy Masking
1. **Prefer Browser-Side Processing**: Tools that process directly in your browser's WebAssembly or HTML5 Canvas never transmit your raw images across the network.
2. **True Pixel Obfuscation**: Merely overlaying a black box in basic presentation software can sometimes be undone if vector layers remain intact. MMX7 Face Blur and Privacy Tool irreversibly modifies the underlying raster pixel array via Gaussian blur or Mosaic pixelation.
3. **Strip Metadata**: When publishing photos publicly, ensure EXIF tags are cleaned to prevent location tracking.`,
      contentAr: `## حماية الخصوصية في العصر الرقمي

عند رفع مستندات حساسة أو صور عائلية، قد تكشف بيانات الموقع الجغرافي EXIF دون قصد.

تقدم منصة MMX7 معالجة فورية محلية عبر المتصفح لطمس الوجوه والبيانات الحساسة بطريقة غير قابلة للاسترجاع.`,
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      authorName: 'David Chen',
      category: 'Productivity',
      readTime: '4 min read',
      status: 'published',
      publishedAt: '2026-03-20T11:00:00Z',
      createdAt: '2026-03-20T11:00:00Z',
    }
  ];

  const notifications: DbNotification[] = [
    {
      id: 'notif-1',
      userId: 'user_admin_001',
      title: 'Welcome to MMX7 Image Studio',
      body: 'Your administrative account is ready. You have unrestricted access to all studio tools and management controls.',
      read: false,
      createdAt: now,
    },
    {
      id: 'notif-2',
      userId: 'user_creator_002',
      title: 'Pro Plan Active',
      body: 'Your Pro plan gives you 150 daily operations, batch processing, and AI tools access.',
      read: true,
      createdAt: now,
    }
  ];

  return {
    users: [adminUser, creatorUser],
    subscriptions: [adminSub, creatorSub],
    jobs: [
      {
        id: 'job-init-1',
        userId: 'user_creator_002',
        toolType: 'compress-images',
        status: 'completed',
        inputName: 'hero-banner.png',
        inputSize: 2450000,
        outputSize: 612000,
        format: 'webp',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'job-init-2',
        userId: 'user_creator_002',
        toolType: 'resize-images',
        status: 'completed',
        inputName: 'profile-shot.jpg',
        inputSize: 1800000,
        outputSize: 420000,
        format: 'jpg',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      }
    ],
    projects: [
      {
        id: 'proj-init-1',
        userId: 'user_creator_002',
        title: 'Launch Banner Meme',
        projectType: 'image-editor',
        thumbnail: '',
        metadata: {
          layersCount: 3,
          aspect: '16:9',
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ],
    notifications,
    blogPosts,
    waitingList: [],
    settings: {
      maintenanceMode: false,
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    }
  };
}

class Database {
  private data: DbData;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed reading DB file, re-initializing default data:', err);
        this.data = getInitialData();
        this.persist();
      }
    } else {
      this.data = getInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed persisting database:', err);
    }
  }

  // Users
  getUserByEmail(email: string): DbUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): DbUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getAllUsers(): DbUser[] {
    return this.data.users;
  }

  createUser(user: Omit<DbUser, 'id' | 'createdAt' | 'updatedAt'>): DbUser {
    const now = new Date().toISOString();
    const newUser: DbUser = {
      ...user,
      id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(newUser);

    // Create free subscription record
    this.data.subscriptions.push({
      id: `sub_${Date.now()}`,
      userId: newUser.id,
      provider: 'test_sandbox',
      planId: newUser.plan || 'free',
      status: 'active',
      billingInterval: 'month',
      amount: 0,
      currency: 'USD',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Welcome notification
    this.data.notifications.push({
      id: `notif_${Date.now()}`,
      userId: newUser.id,
      title: 'Welcome to MMX7 Image Studio',
      body: 'Your account has been created. Start editing, compressing, or enhancing your images today.',
      read: false,
      createdAt: now,
    });

    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<Omit<DbUser, 'id' | 'createdAt'>>): DbUser | null {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  deleteUser(id: string): boolean {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.data.subscriptions = this.data.subscriptions.filter((s) => s.userId !== id);
    this.data.jobs = this.data.jobs.filter((j) => j.userId !== id);
    this.data.projects = this.data.projects.filter((p) => p.userId !== id);
    this.data.notifications = this.data.notifications.filter((n) => n.userId !== id);
    this.persist();
    return true;
  }

  // Subscriptions
  getSubscriptionByUserId(userId: string): DbSubscription | undefined {
    return this.data.subscriptions.find((s) => s.userId === userId && s.status === 'active');
  }

  updateSubscription(userId: string, planId: 'free' | 'pro' | 'studio', billingInterval: 'month' | 'year' = 'month'): DbSubscription {
    let sub = this.data.subscriptions.find((s) => s.userId === userId);
    const now = new Date().toISOString();
    const durationDays = billingInterval === 'year' ? 365 : 30;
    const amount = planId === 'studio' ? (billingInterval === 'year' ? 108 : 12) : planId === 'pro' ? (billingInterval === 'year' ? 48 : 5) : 0;

    if (sub) {
      sub.planId = planId;
      sub.status = 'active';
      sub.billingInterval = billingInterval;
      sub.amount = amount;
      sub.currentPeriodStart = now;
      sub.currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    } else {
      sub = {
        id: `sub_${Date.now()}`,
        userId,
        provider: 'test_sandbox',
        planId,
        status: 'active',
        billingInterval,
        amount,
        currency: 'USD',
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      };
      this.data.subscriptions.push(sub);
    }

    const user = this.getUserById(userId);
    if (user) {
      user.plan = planId;
    }

    this.persist();
    return sub;
  }

  // Processing Jobs / History
  getJobsByUserId(userId: string): DbJob[] {
    return this.data.jobs.filter((j) => j.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllJobs(): DbJob[] {
    return this.data.jobs;
  }

  addJob(job: Omit<DbJob, 'id' | 'createdAt'>): DbJob {
    const newJob: DbJob = {
      ...job,
      id: `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
    };
    this.data.jobs.unshift(newJob);
    // Limit store to 1000 jobs
    if (this.data.jobs.length > 1000) {
      this.data.jobs = this.data.jobs.slice(0, 1000);
    }
    this.persist();
    return newJob;
  }

  deleteJob(id: string, userId: string): boolean {
    const index = this.data.jobs.findIndex((j) => j.id === id && (j.userId === userId || userId === 'admin'));
    if (index === -1) return false;
    this.data.jobs.splice(index, 1);
    this.persist();
    return true;
  }

  clearUserJobs(userId: string): boolean {
    this.data.jobs = this.data.jobs.filter((j) => j.userId !== userId);
    this.persist();
    return true;
  }

  // Daily Usage Limits
  getTodayUsageCount(userId: string): number {
    const today = new Date().toISOString().split('T')[0];
    return this.data.jobs.filter((j) => j.userId === userId && j.createdAt.startsWith(today)).length;
  }

  // Projects
  getProjectsByUserId(userId: string): DbProject[] {
    return this.data.projects.filter((p) => p.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  saveProject(project: Omit<DbProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DbProject {
    const now = new Date().toISOString();
    if (project.id) {
      const existing = this.data.projects.find((p) => p.id === project.id && p.userId === project.userId);
      if (existing) {
        existing.title = project.title;
        existing.thumbnail = project.thumbnail;
        existing.metadata = project.metadata;
        existing.updatedAt = now;
        this.persist();
        return existing;
      }
    }
    const newProj: DbProject = {
      id: `proj_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: project.userId,
      title: project.title,
      projectType: project.projectType,
      thumbnail: project.thumbnail,
      metadata: project.metadata,
      createdAt: now,
      updatedAt: now,
    };
    this.data.projects.unshift(newProj);
    this.persist();
    return newProj;
  }

  deleteProject(id: string, userId: string): boolean {
    const index = this.data.projects.findIndex((p) => p.id === id && p.userId === userId);
    if (index === -1) return false;
    this.data.projects.splice(index, 1);
    this.persist();
    return true;
  }

  // Notifications
  getNotificationsByUserId(userId: string): DbNotification[] {
    return this.data.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationAsRead(id: string, userId: string): boolean {
    const n = this.data.notifications.find((notif) => notif.id === id && notif.userId === userId);
    if (!n) return false;
    n.read = true;
    this.persist();
    return true;
  }

  // Blog Posts
  getBlogPosts(includeDrafts = false): DbBlogPost[] {
    if (includeDrafts) {
      return this.data.blogPosts;
    }
    return this.data.blogPosts.filter((p) => p.status === 'published');
  }

  getBlogPostBySlug(slug: string): DbBlogPost | undefined {
    return this.data.blogPosts.find((p) => p.slug === slug);
  }

  createBlogPost(post: Omit<DbBlogPost, 'id' | 'createdAt'>): DbBlogPost {
    const newPost: DbBlogPost = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.blogPosts.unshift(newPost);
    this.persist();
    return newPost;
  }

  updateBlogPost(id: string, updates: Partial<DbBlogPost>): DbBlogPost | null {
    const post = this.data.blogPosts.find((p) => p.id === id);
    if (!post) return null;
    Object.assign(post, updates);
    this.persist();
    return post;
  }

  deleteBlogPost(id: string): boolean {
    const index = this.data.blogPosts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.blogPosts.splice(index, 1);
    this.persist();
    return true;
  }

  // Waiting list for coming soon tools
  addToWaitingList(email: string, toolId: string): DbWaitingList {
    const item: DbWaitingList = {
      id: `wait_${Date.now()}`,
      email,
      toolId,
      createdAt: new Date().toISOString(),
    };
    this.data.waitingList.push(item);
    this.persist();
    return item;
  }

  getWaitingList(): DbWaitingList[] {
    return this.data.waitingList;
  }

  // Settings & Status
  getSettings() {
    return {
      ...this.data.settings,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    };
  }

  updateSettings(settings: Partial<DbData['settings']>) {
    Object.assign(this.data.settings, settings);
    this.persist();
    return this.getSettings();
  }
}

export const db = new Database();
