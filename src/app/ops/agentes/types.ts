export interface AgentDefinition {
  key: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  modelTier: string;
  tools: string[];
  visibility: 'internal' | 'client';
  maxOutputTokens: number;
  isActive: boolean;
}

export interface AgentModel {
  tier: string;
  providerKey: string;
  modelId: string;
  inputPricePerMTok: number;
  outputPricePerMTok: number;
  isActive: boolean;
}

export interface AgentProvider {
  key: string;
  kind: string;
  baseUrl: string;
  hasKey: boolean;
  keySource: 'ops' | 'env' | 'none';
  apiKeyLast4: string | null;
  isActive: boolean;
}

export interface AgentTool {
  name: string;
  description: string;
  internalOnly: boolean;
}

export interface AgentPause {
  scope: string;
  paused: boolean;
  reason: string | null;
}

export interface AgentUsage {
  from: string;
  jobs: number;
  failed: number;
  costUsd: number;
}

export interface AgentAdminState {
  agents: AgentDefinition[];
  models: AgentModel[];
  providers: AgentProvider[];
  tools: AgentTool[];
  pauses: AgentPause[];
  usageThisMonth: AgentUsage;
}

export interface AgentJob {
  id: string;
  agentKey: string;
  kind: string;
  status: string;
  modelId: string | null;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
  toolCalls: number;
  errorCode: string | null;
  error: string | null;
  requestedBy: string | null;
  createdAt: string;
}
