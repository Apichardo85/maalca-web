# n8n Workflows

Exportable workflow definitions for the MaalCa n8n instance (`maalca-agents.up.railway.app`).

## Architect Agent (`architect-agent.json`)

**Issue:** #76
**Trigger:** GitHub webhook on `issues.labeled` with label `agent:architect`
**Model:** Claude Sonnet 4 (via Anthropic API credential)

### Flow

```
GitHub Webhook (POST /architect-agent)
  -> Filter: action=labeled AND label.name=agent:architect
  -> Extract Issue Data (repo, number, title, body, author, labels)
  -> Fetch ADRs from Umbraco Delivery API (contentType:article)
  -> Format ADR Context (summary list for LLM prompt)
  -> Claude: Analyze Architecture (system prompt with stack context + ADR principles)
  -> Parse Claude Response (JSON extraction with error handling)
  -> IF Approved:
       YES -> Create ADR file via GitHub Contents API -> Comment on issue (approved + ADR link)
       NO  -> Comment on issue (rejected + alternative) -> Add `needs-decision` label
```

### Required Credentials (configure in n8n)

| Credential | Type | Usage |
|---|---|---|
| `Anthropic API` | Anthropic API key | Claude Sonnet 4 for architectural analysis |
| `GitHub API` | GitHub PAT or App | Create files, comment on issues, manage labels |

### Required GitHub Webhook Setup

Configure a webhook on each monitored repo (maalca-web, maalca-cms, maalca-api):

- **URL:** `https://maalca-agents.up.railway.app/webhook/architect-agent`
- **Content type:** `application/json`
- **Events:** `Issues` (specifically the `labeled` action)
- **Secret:** Match the webhook secret configured in n8n

### How to Import

1. Open n8n at `https://maalca-agents.up.railway.app`
2. Go to Workflows -> Import from File
3. Select `architect-agent.json`
4. Configure the Anthropic API and GitHub API credentials
5. Activate the workflow

### Notes

- The Umbraco Delivery API URL (`localhost:5011`) should be updated to the production CMS URL when deployed.
- The ADR format follows the convention in `docs/adr/ADR-001-frontend-hosting.md`: Title, Estado, Fecha, Contexto, Decision, Razones, Alternativa rechazada, Consecuencias.
- The Claude system prompt encodes the full MaalCa stack context and architectural principles to ensure coherent decisions.
