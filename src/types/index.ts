export type ToolId =
  | 'compress-images'
  | 'resize-images'
  | 'crop-images'
  | 'convert-images'
  | 'remove-background'
  | 'remove-objects'
  | 'upscale-images'
  | 'watermark-images'
  | 'blur-faces'
  | 'image-editor';

export type ComingSoonToolId =
  | 'ai-image-generator'
  | 'ai-photo-restoration'
  | 'ai-colorizer'
  | 'image-to-pdf'
  | 'smart-metadata-editor';

export type ToolCategory = 'all' | 'popular' | 'ai' | 'optimization' | 'conversion' | 'creative';

export interface ToolDefinition {
  id: ToolId;
  nameKey: string;
  defaultName: string;
  descriptionKey: string;
  defaultDescription: string;
  iconName: string;
  category: ToolCategory;
  isAi?: boolean;
  isPopular?: boolean;
  path: string;
}

export interface ComingSoonToolDefinition {
  id: ComingSoonToolId;
  nameKey: string;
  defaultName: string;
  descriptionKey: string;
  defaultDescription: string;
  iconName: string;
  category: ToolCategory;
}

export type PlanType = 'free' | 'pro' | 'studio';

export interface Plan {
  id: PlanType;
  name: string;
  priceAmount: number;
  annualPriceAmount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  dailyLimit: number;
  maxFileSizeMb: number;
  aiAccess: boolean;
  batchProcessing: boolean;
  priorityQueue: boolean;
  teamAccess: boolean;
  features: string[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'admin' | 'user';
  plan: PlanType;
  preferredLanguage: 'en' | 'ar';
  preferredTheme: 'dark' | 'light' | 'system';
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  userId?: string;
  toolType: string;
  status: 'completed' | 'failed' | 'processing';
  inputName: string;
  inputSize: number;
  outputSize?: number;
  format?: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface SavedProject {
  id: string;
  userId: string;
  title: string;
  projectType: ToolId;
  thumbnail?: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  excerpt: string;
  excerptAr?: string;
  content: string;
  contentAr?: string;
  coverImage: string;
  authorName: string;
  category: string;
  readTime: string;
  status: 'published' | 'draft';
  publishedAt: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
