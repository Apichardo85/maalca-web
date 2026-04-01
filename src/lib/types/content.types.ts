// ── Content Pipeline Types ──
// Used by the n8n content automation workflows for Curso de Espanol and other brands

export type ContentPipelineStage =
  | 'script_generation'
  | 'voice_generation'
  | 'video_generation'
  | 'post_production'
  | 'distribution'
  | 'analytics';

export type ContentStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'review';

export type ContentPlatform = 'youtube' | 'tiktok' | 'instagram';

export type ScriptCharacter = 'DOMI' | 'GRINGA';

export type LineLanguage = 'es' | 'en' | 'mixed';

export type LineEmotion =
  | 'excited'
  | 'confused'
  | 'laughing'
  | 'shocked'
  | 'teaching'
  | 'proud'
  | 'neutral';

// ── Script Types ──

export interface ScriptLine {
  character: ScriptCharacter;
  dialogue: string;
  language: LineLanguage;
  emotion: LineEmotion;
  timing: {
    startSec: number;
    durationSec: number;
  };
  visualCue: string;
  subtitle: {
    es: string;
    en: string;
  };
}

export interface SlangTerm {
  term: string;
  pronunciation: string;
  meaning: string;
  usage: string;
  example: string;
}

export interface ContentScript {
  lessonId: string;
  title: string;
  titleEs: string;
  platform: 'short' | 'long';
  estimatedDuration: number;
  hook: string;
  lines: ScriptLine[];
  slangTerms: SlangTerm[];
  endScreen: {
    text: string;
    cta: string;
  };
  totalCharCount: {
    domi: number;
    gringa: number;
  };
  hashtags: string[];
}

// ── Curriculum Types ──

export interface CurriculumLesson {
  lessonId: string;
  topic: string;
  title: string;
  slangFocus: string[];
  culturalContext: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: ContentStatus;
  priority: number;
}

// ── Voice Generation Types ──

export interface VoiceGenerationRequest {
  lessonId: string;
  brandId: string;
  characterId: string;
  lines: Array<{
    index: number;
    text: string;
    language: LineLanguage;
  }>;
}

export interface VoiceGenerationResult {
  lessonId: string;
  characterId: string;
  audioClips: Array<{
    index: number;
    audioUrl: string;
    durationSec: number;
    charCount: number;
  }>;
  totalCharCount: number;
}

// ── Video Generation Types ──

export interface VideoGenerationRequest {
  lessonId: string;
  brandId: string;
  audioUrls: {
    domi: string[];
    gringa: string[];
  };
  script: ContentScript;
  useAvatar: boolean;
}

export interface VideoGenerationResult {
  lessonId: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSec: number;
  format: 'mp4';
  resolution: { width: number; height: number };
  provider: 'heygen' | 'ffmpeg-fallback';
}

// ── Distribution Types ──

export interface DistributionRequest {
  lessonId: string;
  brandId: string;
  platforms: ContentPlatform[];
  videoUrls: Record<ContentPlatform, string>;
  thumbnailUrl: string;
  metadata: {
    title: string;
    description: string;
    hashtags: string[];
    categoryId?: string;
    language: string;
  };
}

export interface DistributionResult {
  lessonId: string;
  platform: ContentPlatform;
  postId: string;
  postUrl: string;
  scheduledAt: string;
  status: 'published' | 'scheduled' | 'failed';
}

// ── Analytics Types ──

export interface ContentAnalytics {
  lessonId: string;
  platform: ContentPlatform;
  postId: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    watchTimeMinutes: number;
  };
  engagementRate: number;
  viralScore: 'viral' | 'above_avg' | 'normal' | 'below_avg';
  collectedAt: string;
}

// ── Pipeline Event Payloads ──

export interface ContentScriptGeneratedPayload {
  lessonId: string;
  brandId: string;
  script: ContentScript;
  charCount: { domi: number; gringa: number; total: number };
}

export interface ContentVoiceGeneratedPayload {
  lessonId: string;
  brandId: string;
  audioUrls: Record<string, string[]>;
  totalCharCount: number;
  monthlyBudgetUsed: number;
  monthlyBudgetRemaining: number;
}

export interface ContentVideoGeneratedPayload {
  lessonId: string;
  brandId: string;
  videoUrl: string;
  thumbnailUrl: string;
  provider: 'heygen' | 'ffmpeg-fallback';
  durationSec: number;
}

export interface ContentPublishedPayload {
  lessonId: string;
  brandId: string;
  distributions: DistributionResult[];
}

export interface ContentAnalyticsPayload {
  brandId: string;
  analytics: ContentAnalytics[];
  viralDetected: boolean;
  viralLessons: string[];
}

// ── Brand Configuration ──

export interface BrandVoiceConfig {
  voiceId: string;
  voiceProvider: 'elevenlabs';
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export interface BrandCharacterConfig {
  name: string;
  description: string;
  personality: string;
  language: string;
  voiceId: string;
  voiceProvider: string;
  voiceSettings: BrandVoiceConfig['voice_settings'];
  avatarId: string;
  avatarProvider: string;
}

export interface ContentBrandConfig {
  brandId: string;
  brandName: string;
  tagline: string;
  characters: Record<string, BrandCharacterConfig>;
  content: {
    format: 'short' | 'long';
    durationRange: { minSec: number; maxSec: number };
    subtitles: { primary: string; secondary: string };
  };
  distribution: {
    platforms: Record<ContentPlatform, {
      enabled: boolean;
      schedule: { days: string[]; time: string; timezone: string };
    }>;
    hashtags: string[];
  };
  budget: {
    elevenLabsMonthlyChars: number;
    heygenMonthlyCredits: number;
    maxScriptsPerBatch: number;
  };
}
