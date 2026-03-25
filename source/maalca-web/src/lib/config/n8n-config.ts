export interface N8nConfig {
  webhookBaseUrl: string;
  webhookSecret: string;
  whatsappNumber: string;
  timeoutMs: number;
}

let _config: N8nConfig | null = null;

export function getN8nConfig(): N8nConfig {
  if (_config) return _config;

  const webhookBaseUrl = process.env.N8N_WEBHOOK_URL || '';
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET || '';
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '16078574226';
  const timeoutMs = parseInt(process.env.N8N_WEBHOOK_TIMEOUT || '10000', 10);

  if (!webhookBaseUrl) {
    console.warn('[n8n] N8N_WEBHOOK_URL not set — n8n integration disabled');
  }

  _config = { webhookBaseUrl, webhookSecret, whatsappNumber, timeoutMs };
  return _config;
}

export function isN8nEnabled(): boolean {
  return !!getN8nConfig().webhookBaseUrl;
}
