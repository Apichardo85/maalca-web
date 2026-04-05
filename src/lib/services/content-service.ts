import { getContentPipelineConfig, isContentPipelineEnabled } from '@/lib/config/content-pipeline-config';
import { signPayload, generateCorrelationId } from '@/lib/utils/webhook-crypto';
import type {
  ContentPipelineStage,
  ContentScriptGeneratedPayload,
  ContentVoiceGeneratedPayload,
  ContentVideoGeneratedPayload,
  ContentPublishedPayload,
  ContentAnalyticsPayload,
} from '@/lib/types/content.types';
import type { N8nServiceResponse } from '@/lib/types/n8n.types';

type ContentEventType =
  | 'content.script.generated'
  | 'content.voice.generated'
  | 'content.video.generated'
  | 'content.published'
  | 'content.analytics.updated'
  | 'content.viral.detected';

interface ContentWebhookPayload<T = unknown> {
  event: ContentEventType;
  brandId: string;
  stage: ContentPipelineStage;
  timestamp: string;
  source: 'maalca-web';
  data: T;
  metadata?: {
    correlationId: string;
  };
}

class ContentService {
  private buildPayload<T>(
    event: ContentEventType,
    brandId: string,
    stage: ContentPipelineStage,
    data: T
  ): ContentWebhookPayload<T> {
    return {
      event,
      brandId,
      stage,
      timestamp: new Date().toISOString(),
      source: 'maalca-web',
      data,
      metadata: { correlationId: generateCorrelationId() },
    };
  }

  private async sendWebhook<T>(
    path: string,
    payload: ContentWebhookPayload<T>
  ): Promise<N8nServiceResponse> {
    const correlationId = payload.metadata?.correlationId || generateCorrelationId();

    if (!isContentPipelineEnabled()) {
      console.warn(`[content] Pipeline disabled — skipping ${payload.event}`);
      return { success: true, correlationId, message: 'Content pipeline disabled' };
    }

    const config = getContentPipelineConfig();
    const url = `${config.webhookBaseUrl}${path}`;
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Brand-Id': payload.brandId,
      'X-Correlation-Id': correlationId,
      'X-Pipeline-Stage': payload.stage,
    };

    if (config.webhookSecret) {
      headers['X-Webhook-Signature'] = `sha256=${signPayload(body, config.webhookSecret)}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        console.error(`[content] ${payload.event} failed: ${res.status} ${errText}`);
        return { success: false, correlationId, error: `HTTP ${res.status}` };
      }

      console.log(`[content] ${payload.event} sent → ${url} (${correlationId})`);
      return { success: true, correlationId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[content] ${payload.event} error: ${message}`);
      return { success: false, correlationId, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }

  // ── Pipeline trigger methods ──

  async triggerScriptGeneration(brandId: string): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.script.generated',
      brandId,
      'script_generation',
      { action: 'generate', brandId }
    );
    return this.sendWebhook('/content/generate-script', payload);
  }

  async triggerVoiceGeneration(
    brandId: string,
    data: ContentScriptGeneratedPayload
  ): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.voice.generated',
      brandId,
      'voice_generation',
      data
    );
    return this.sendWebhook('/content/generate-voice', payload);
  }

  async triggerVideoGeneration(
    brandId: string,
    data: ContentVoiceGeneratedPayload
  ): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.video.generated',
      brandId,
      'video_generation',
      data
    );
    return this.sendWebhook('/content/generate-video', payload);
  }

  async triggerPostProduction(
    brandId: string,
    data: ContentVideoGeneratedPayload
  ): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.published',
      brandId,
      'post_production',
      data
    );
    return this.sendWebhook('/content/post-production', payload);
  }

  async triggerDistribution(
    brandId: string,
    data: ContentPublishedPayload
  ): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.published',
      brandId,
      'distribution',
      data
    );
    return this.sendWebhook('/content/distribute', payload);
  }

  async reportAnalytics(
    brandId: string,
    data: ContentAnalyticsPayload
  ): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(
      'content.analytics.updated',
      brandId,
      'analytics',
      data
    );
    return this.sendWebhook('/content/analytics', payload);
  }

  // ── Pipeline status ──

  async getPipelineStatus(brandId: string): Promise<N8nServiceResponse> {
    const config = getContentPipelineConfig();
    const url = `${config.webhookBaseUrl}/content/status?brandId=${brandId}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        return { success: false, correlationId: '', error: `HTTP ${res.status}` };
      }
      return { success: true, correlationId: '' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, correlationId: '', error: message };
    }
  }
}

export const contentService = new ContentService();
