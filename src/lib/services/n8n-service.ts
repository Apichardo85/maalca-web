import { getN8nConfig, isN8nEnabled } from '@/lib/config/n8n-config';
import { signPayload, generateCorrelationId } from '@/lib/utils/webhook-crypto';
import type {
  N8nEventType,
  N8nWebhookPayload,
  N8nServiceResponse,
  OrderPayload,
  ReservationPayload,
  NewsletterPayload,
  AppointmentPayload,
} from '@/lib/types/n8n.types';

class N8nService {
  private buildPayload<T>(
    event: N8nEventType,
    tenantId: string,
    data: T
  ): N8nWebhookPayload<T> {
    return {
      event,
      tenantId,
      timestamp: new Date().toISOString(),
      source: 'maalca-web',
      data,
      metadata: { correlationId: generateCorrelationId() },
    };
  }

  private async sendWebhook<T>(
    path: string,
    payload: N8nWebhookPayload<T>
  ): Promise<N8nServiceResponse> {
    const correlationId = payload.metadata?.correlationId || generateCorrelationId();

    if (!isN8nEnabled()) {
      console.warn(`[n8n] Disabled — skipping ${payload.event}`);
      return { success: true, correlationId, message: 'n8n disabled (no URL configured)' };
    }

    const config = getN8nConfig();
    const url = `${config.webhookBaseUrl}${path}`;
    const body = JSON.stringify(payload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-Id': payload.tenantId,
      'X-Correlation-Id': correlationId,
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
        console.error(`[n8n] ${payload.event} failed: ${res.status} ${errText}`);
        return { success: false, correlationId, error: `HTTP ${res.status}` };
      }

      console.log(`[n8n] ${payload.event} sent → ${url} (${correlationId})`);
      return { success: true, correlationId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[n8n] ${payload.event} error: ${message}`);
      return { success: false, correlationId, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }

  async sendOrder(tenantId: string, order: OrderPayload): Promise<N8nServiceResponse> {
    const payload = this.buildPayload('order.created', tenantId, order);
    return this.sendWebhook('/orders', payload);
  }

  async sendReservation(tenantId: string, reservation: ReservationPayload): Promise<N8nServiceResponse> {
    const payload = this.buildPayload('reservation.created', tenantId, reservation);
    return this.sendWebhook('/reservations', payload);
  }

  async sendNewsletterSubscription(tenantId: string, newsletter: NewsletterPayload): Promise<N8nServiceResponse> {
    const payload = this.buildPayload('newsletter.subscribed', tenantId, newsletter);
    return this.sendWebhook('/newsletter', payload);
  }

  async sendAppointment(tenantId: string, appointment: AppointmentPayload): Promise<N8nServiceResponse> {
    const payload = this.buildPayload('appointment.booked', tenantId, appointment);
    return this.sendWebhook('/appointments', payload);
  }

  async sendEvent<T>(event: N8nEventType, tenantId: string, data: T): Promise<N8nServiceResponse> {
    const payload = this.buildPayload(event, tenantId, data);
    return this.sendWebhook('/events', payload);
  }
}

export const n8nService = new N8nService();
