// ── Content Pipeline Configuration ──

export interface ContentPipelineConfig {
  enabled: boolean;
  elevenLabsApiKey: string;
  heygenApiKey: string;
  anthropicApiKey: string;
  anthropicModel: string;
  webhookBaseUrl: string;
  webhookSecret: string;
  ffmpegServiceUrl: string;
  timeoutMs: number;
}

export function getContentPipelineConfig(): ContentPipelineConfig {
  return {
    enabled: !!process.env.ELEVENLABS_API_KEY,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    heygenApiKey: process.env.HEYGEN_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.CONTENT_ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    webhookBaseUrl: process.env.N8N_WEBHOOK_URL || '',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || '',
    ffmpegServiceUrl: process.env.FFMPEG_SERVICE_URL || '',
    timeoutMs: parseInt(process.env.CONTENT_PIPELINE_TIMEOUT || '30000', 10),
  };
}

export function isContentPipelineEnabled(): boolean {
  return !!process.env.ELEVENLABS_API_KEY;
}

// ── ElevenLabs API endpoints ──
export const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
export const ELEVENLABS_TTS_URL = (voiceId: string) =>
  `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`;

// ── HeyGen API endpoints ──
export const HEYGEN_BASE_URL = 'https://api.heygen.com';
export const HEYGEN_VIDEO_GENERATE_URL = `${HEYGEN_BASE_URL}/v2/video/generate`;
export const HEYGEN_VIDEO_STATUS_URL = (videoId: string) =>
  `${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`;

// ── Claude API endpoints ──
export const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
