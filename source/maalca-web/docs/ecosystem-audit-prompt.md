# 🔍 MaalCa Ecosystem Audit Prompt

## 📋 Overview

This document contains a comprehensive prompt template designed for AI agents (Claude, GPT, etc.) to perform strategic audits and planning sessions for the MaalCa ecosystem. Use this prompt to get detailed analysis of current projects, prioritization frameworks, and actionable next steps.

---

## 🤖 Master Audit Prompt

### Copy-Paste Ready Version

```markdown
Quiero que actúes como un **auditor y consultor estratégico integral** para el ecosistema de proyectos *MaalCa*.

### Tareas principales:

1. **Revisión integral por proyecto**
   * Evalúa cada proyecto activo (Editorial, Radio/Podcast, Mente Zarathustra, Catering, Inmobiliaria, Dispensario de cannabis, Afiliados como Pegote Barbershop, Amazon FBA, etc.).
   * Resume qué tenemos actualmente (recursos, infraestructura, avances).
   * Explica cómo se conecta ese proyecto con los demás dentro del ecosistema.
   * Indica el modelo de negocio actual y cómo se monetiza.

2. **Priorización de iniciativas**
   * Ordena los proyectos por **facilidad de iniciación**, considerando costos, licenciamiento, infraestructura disponible y nivel de aprendizaje requerido.
   * Identifica los "quick wins" (proyectos que podemos lanzar con poco esfuerzo y retorno rápido).

3. **Requisitos técnicos y de negocio**
   * Lista qué **licencias** necesita cada proyecto (software, comerciales, de operación legal).
   * Indica qué **certificaciones** serían necesarias u oportunas (ejemplo: seguridad alimentaria para catering, compliance legal para dispensario, licencias de música para radio, etc.).
   * Define qué **infraestructura técnica** se requiere (servidores, dominios, hosting, contenedores, pipelines, etc.).
   * Explica qué **habilidades o aprendizajes** debemos adquirir para sostener el proyecto (marketing digital, DevOps, narración en audio, etc.).
   * Haz un **inventario de ejemplo** de utensilios, herramientas y recursos mínimos necesarios para cada proyecto.

4. **Escalabilidad y próximos pasos**
   * Explica cómo debe seguir escalando cada proyecto de manera ordenada dentro del ecosistema.
   * Indica próximos pasos claros, tanto técnicos como de negocio.
   * Sugiere métricas clave para evaluar avance y sostenibilidad.

### Entregable esperado:

Un informe estructurado en secciones:
* **Resumen del ecosistema (visión general de MaalCa)**
* **Proyectos (uno por uno con su análisis completo)**
* **Priorización (tabla o ranking con razones)**
* **Requisitos (licencias, certificaciones, infra, aprendizajes, utensilios)**
* **Plan de escalabilidad y próximos pasos**

Sé claro, realista y estructurado, como un consultor que entrega un plan de acción práctico.
```

---

## 🎯 JSON Structured Version

For AI agents that work better with structured prompts:

```json
{
  "role": "auditor_y_consultor_estratégico_integral",
  "context": "ecosistema_de_proyectos_MaalCa",
  "tasks": [
    {
      "name": "revisión_integral_por_proyecto",
      "subtasks": [
        "evaluar_proyectos_activos",
        "resumir_recursos_actuales",
        "explicar_conexiones_ecosistema",
        "definir_modelo_negocio_y_monetización"
      ],
      "projects": [
        "Editorial MaalCa",
        "Radio/Podcast Hablando Mierda",
        "Mente Zarathustra",
        "Catering",
        "Inmobiliaria",
        "Dispensario Cannabis",
        "Pegote Barbershop",
        "Amazon FBA",
        "CiriWhispers",
        "CiriSonic"
      ]
    },
    {
      "name": "priorización_iniciativas",
      "criteria": [
        "facilidad_iniciación",
        "costos_iniciales",
        "licenciamiento_requerido",
        "infraestructura_disponible",
        "nivel_aprendizaje_requerido"
      ],
      "output": "quick_wins_identificados"
    },
    {
      "name": "requisitos_técnicos_y_negocio",
      "categories": [
        "licencias_software_y_comerciales",
        "certificaciones_necesarias",
        "infraestructura_técnica",
        "habilidades_por_adquirir",
        "inventario_recursos_mínimos"
      ]
    },
    {
      "name": "escalabilidad_y_próximos_pasos",
      "deliverables": [
        "plan_escalamiento_ordenado",
        "próximos_pasos_claros",
        "métricas_clave_evaluación"
      ]
    }
  ],
  "output_format": {
    "sections": [
      "resumen_ecosistema",
      "análisis_por_proyecto",
      "tabla_priorización",
      "requisitos_detallados",
      "plan_escalabilidad_siguiente"
    ],
    "style": "consultor_profesional_práctico"
  }
}
```

---

## 📊 Expected Output Structure

The audit should return information organized as follows:

### 1. Ecosystem Overview
- Current state of MaalCa as a whole
- Interconnections between projects
- Overall business model coherence

### 2. Individual Project Analysis
For each project:
- **Current Status:** What exists today
- **Resources:** Available infrastructure and assets
- **Connections:** How it integrates with other projects
- **Monetization:** Current and potential revenue streams
- **Requirements:** Technical, legal, and operational needs

### 3. Priority Matrix
| Project | Effort (1-5) | ROI Potential | Time to Launch | Priority Score |
|---------|--------------|---------------|----------------|----------------|
| Project A | 2 | High | 2 weeks | HIGH |
| Project B | 4 | Medium | 3 months | MEDIUM |

### 4. Requirements Breakdown
- **Licenses:** Software, business, operational
- **Certifications:** Industry-specific requirements
- **Infrastructure:** Technical stack needs
- **Skills Gap:** Learning and development needs
- **Resources:** Tools, equipment, materials

### 5. Scaling Roadmap
- Phase-based implementation plan
- Key milestones and checkpoints
- Resource allocation recommendations
- Risk mitigation strategies

---

## 🔧 Usage Instructions

### Step 1: Prepare Context
Before using the prompt, gather:
- Current project status documents
- Financial information (if needed)
- Technical infrastructure inventory
- Team skills assessment

### Step 2: Run the Audit
- Copy the master prompt
- Paste into your AI agent (Claude, GPT, etc.)
- Provide additional context as needed
- Run the analysis

### Step 3: Review and Act
- Analyze the recommendations
- Prioritize based on your resources
- Create action items from next steps
- Schedule regular re-audits

---

## 📈 Recommended Frequency

- **Full Ecosystem Audit:** Quarterly
- **Project-Specific Audits:** Monthly
- **Priority Matrix Updates:** Bi-weekly
- **Requirements Review:** As needed

---

## 🎯 Customization Options

### For Specific Industries
Add industry-specific considerations:
```markdown
Consideraciones adicionales para [INDUSTRIA]:
- Regulaciones específicas del sector
- Tendencias de mercado actuales
- Competidores directos e indirectos
- Oportunidades de diferenciación
```

### For Financial Focus
Add financial analysis requirements:
```markdown
Análisis financiero adicional:
- Proyecciones de ingresos por proyecto
- Costos de operación estimados
- Punto de equilibrio por vertical
- ROI esperado y cronograma
```

### For Technical Focus
Add technical deep-dive requirements:
```markdown
Análisis técnico detallado:
- Arquitectura de sistemas requerida
- Integraciones entre proyectos
- Escalabilidad técnica
- Requisitos de seguridad y compliance
```

---

**Last Updated:** December 2024  
**Document Version:** 1.0  
**Usage:** Strategic planning and business auditing