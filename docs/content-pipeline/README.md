# Content Pipeline — MALCA Automated Content Production

## Overview

Automated content production system for MALCA brands. Currently configured for **Curso de Espanol** (Domi + Gringa), designed to be reusable across all MALCA content brands.

## Architecture

```
TRIGGER (Cron/Webhook/Manual)
        |
[WF#1] SCRIPT GENERATION ──> Claude API → Structured JSON dialogue
        |
[WF#2] VOICE GENERATION  ──> ElevenLabs → Audio clips per character
        |
[WF#3] VIDEO GENERATION  ──> HeyGen (3/mo) + FFmpeg fallback
        |
[WF#4] POST-PRODUCTION   ──> Subtitles + resize + thumbnails
        |
[WF#5] DISTRIBUTION      ──> YouTube + TikTok + Instagram
        |
[WF#6] ANALYTICS         ──> Performance tracking + viral detection
```

## File Structure

```
docs/content-pipeline/
  README.md                          ← You are here
  curriculum-seed.json               ← 20 initial lesson topics
  brand-config-curso-espanol.json    ← Brand configuration (voices, avatars, schedule)
  system-prompts/
    scriptwriter.md                  ← Claude system prompt for script generation
  voice-config/
    domi.json                        ← ElevenLabs config for Domi character
    gringa.json                      ← ElevenLabs config for Gringa character
  templates/
    (thumbnail-template.html)        ← TODO: Thumbnail HTML template

docs/n8n-workflows/
  content-scriptwriter.json          ← WF#1: Import into n8n
  (content-voice-gen.json)           ← TODO: WF#2
  (content-video-gen.json)           ← TODO: WF#3
  (content-post-prod.json)           ← TODO: WF#4
  (content-distributor.json)         ← TODO: WF#5
  (content-analytics.json)           ← TODO: WF#6

src/lib/types/content.types.ts       ← TypeScript types for the pipeline
src/lib/config/content-pipeline-config.ts ← Config from env vars
src/lib/services/content-service.ts  ← Service to trigger/receive pipeline events
src/app/api/webhooks/content/route.ts ← Inbound webhook from n8n
```

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
ELEVENLABS_API_KEY=your_key_here
HEYGEN_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 2. ElevenLabs Voice Setup

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Find/clone voices for Domi (Dominican male) and Gringa (American female)
3. Copy voice IDs into `voice-config/domi.json` and `voice-config/gringa.json`
4. Also update `brand-config-curso-espanol.json` with the voice IDs

### 3. Import n8n Workflow

1. Open n8n at `https://maalca-agents.up.railway.app`
2. Go to Workflows → Import
3. Import `content-scriptwriter.json`
4. Add credentials:
   - Anthropic API Key (Header Auth with `x-api-key`)
5. Activate the workflow

### 4. Test

- Manual trigger: POST to `https://maalca-agents.up.railway.app/webhook/content/generate-script`
- Or click "Execute Workflow" in n8n editor
- Check execution log for generated scripts

## Monthly Budget

| Service | Cost | Capacity |
|---------|------|----------|
| ElevenLabs Starter | $5/mo | 30,000 chars (~60 scripts) |
| HeyGen Free | $0 | 3 avatar videos |
| Claude API | ~$2/mo | ~30 scripts |
| **Total** | **~$9-12/mo** | **20-26 videos/month** |

## Adding a New Brand

1. Copy `brand-config-curso-espanol.json` → `brand-config-{new-brand}.json`
2. Update characters, voices, avatars, schedule, hashtags
3. Create a new system prompt in `system-prompts/`
4. Duplicate the n8n workflow and update the brand references
5. The TypeScript types and services are already brand-agnostic

## Implementation Status

- [x] Phase 1: Script Engine (curriculum, system prompt, n8n workflow, TypeScript types)
- [ ] Phase 2: Voice Pipeline (ElevenLabs integration)
- [ ] Phase 3: Video Generation (HeyGen + FFmpeg fallback)
- [ ] Phase 4: Post-Production & Distribution
- [ ] Phase 5: Analytics & Optimization
- [ ] Phase 6: Multi-Brand Template
