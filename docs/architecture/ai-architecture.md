# 🧠 MaalCa AI Architecture Documentation

## 📋 Project Overview

**Objetivo:** Construir y operar un servidor de inteligencia artificial propio para MaalCa LLC que permita entrenar modelos personalizados y ofrecer servicios basados en IA a todos los proyectos internos y empresas asociadas.

---

## 🏗️ Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    MaalCa Ecosystem                         │
├─────────────────────────┬───────────────────────────────────┤
│    MaalCa Web (Public)  │     MaalCa AI Dashboard (Private) │
│    Next.js + TypeScript │     React + TypeScript            │
│    Marketing & Showcase │     Admin Panel & Controls        │
└─────────────────────────┴───────────────────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   MaalCa AI API     │
                │   FastAPI + Python  │
                │   Authentication    │
                │   Model Management  │
                └─────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   GPU Servers       │
                │   Model Training    │
                │   Inference Engine  │
                │   Model Storage     │
                └─────────────────────┘
```

---

## 🎯 Core Components

### 1. MaalCa Web (Current Frontend)
**Purpose:** Public marketing and project showcase
**Stack:** Next.js 15, TypeScript, Tailwind CSS
**Responsibilities:**
- Project presentation (CiriWhispers, CiriSonic, Editorial, etc.)
- SEO-optimized pages
- Public content display
- Brand presence

### 2. MaalCa AI Dashboard (New Admin App)
**Purpose:** Private administrative interface for AI management
**Stack:** React, TypeScript, Tailwind, Recharts
**Responsibilities:**
- Model training controls
- Usage analytics and metrics
- User management and permissions
- API key management
- Billing and cost tracking

### 3. MaalCa AI API (Backend)
**Purpose:** Central AI service orchestration
**Stack:** FastAPI, Python, Redis, PostgreSQL
**Responsibilities:**
- Model inference endpoints
- Authentication and authorization
- Request routing and load balancing
- Data preprocessing
- Response caching

### 4. GPU Infrastructure
**Purpose:** Model training and inference execution
**Components:**
- Training servers (high-memory GPUs)
- Inference servers (optimized for speed)
- Model storage and versioning
- Backup and disaster recovery

---

## 🔌 API Structure

### Core Endpoints

```typescript
// Authentication
POST /auth/login
POST /auth/refresh
DELETE /auth/logout

// Model Management
GET /models                    // List available models
POST /models/train            // Start training new model
GET /models/{id}/status       // Training progress
DELETE /models/{id}           // Remove model

// AI Services by Project
POST /ai/ciriwhispers/generate    // Literary text generation
POST /ai/cirisonic/content        // Content factory automation
POST /ai/editorial/proofread      // Text correction and editing
POST /ai/catering/recipes         // Recipe generation and optimization
POST /ai/properties/descriptions  // Property listing descriptions

// Analytics
GET /analytics/usage              // API usage statistics
GET /analytics/costs              // Cost breakdown
GET /analytics/performance        // Model performance metrics
```

---

## 📊 Specialized Models by Project

### CiriWhispers AI
**Training Data:** 
- Author's published works (Amaranta, Luces & Sombras)
- Personal writing style samples
- Literary preferences and themes

**Capabilities:**
- Style-consistent text generation
- Chapter continuation
- Character dialogue creation
- Thematic analysis

### CiriSonic AI
**Training Data:**
- Social media content patterns
- Engagement optimization data
- Multi-format content examples

**Capabilities:**
- Automated social posts
- Content calendar generation
- Engagement prediction
- Multi-platform adaptation

### Editorial MaalCa AI
**Training Data:**
- Editorial guidelines
- Correction patterns
- Publishing industry standards

**Capabilities:**
- Automated proofreading
- Style consistency checking
- Genre-specific editing
- Publication formatting

### Business Verticals AI
**Training Data:**
- Industry-specific content
- Business processes
- Customer interaction patterns

**Capabilities:**
- Catering: Recipe optimization, menu generation
- Properties: Listing descriptions, market analysis
- Barber: Appointment scheduling, service recommendations

---

## 🔐 Security & Privacy

### Authentication
- JWT-based authentication
- Role-based access control (Admin, User, Partner)
- API key management for external integrations

### Data Protection
- Encryption at rest and in transit
- GDPR compliance for EU users
- Data retention policies
- Partner data isolation

### Model Security
- Model versioning and rollback capabilities
- A/B testing for model improvements
- Performance monitoring and alerts
- Automated backup systems

---

## 💰 Business Model

### Internal Usage
- **Free tier** for MaalCa projects
- **Unlimited** processing for core business needs
- **Priority** access to latest models

### Partner Services
- **Basic Plan:** 10,000 requests/month - $29/month
- **Professional:** 100,000 requests/month - $199/month
- **Enterprise:** Custom limits - Custom pricing

### External Services
- **Pay-per-use** for third-party developers
- **White-label** solutions for agencies
- **Consulting** services for AI implementation

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Months 1-2)
- [ ] Set up basic API infrastructure
- [ ] Implement authentication system
- [ ] Create simple model inference pipeline
- [ ] Build basic dashboard interface

### Phase 2: Core Models (Months 3-4)
- [ ] Train CiriWhispers literary model
- [ ] Implement CiriSonic content automation
- [ ] Deploy Editorial MaalCa proofreading
- [ ] Add basic analytics

### Phase 3: Business Integration (Months 5-6)
- [ ] Integrate with existing MaalCa projects
- [ ] Train business-specific models
- [ ] Implement partner access controls
- [ ] Launch external API services

### Phase 4: Scale & Optimize (Months 7+)
- [ ] Performance optimization
- [ ] Advanced analytics and insights
- [ ] Mobile app for dashboard
- [ ] Market expansion and partnerships

---

## 📈 Success Metrics

### Technical KPIs
- Model accuracy and performance
- API response times
- System uptime and reliability
- Resource utilization efficiency

### Business KPIs
- Cost reduction vs external AI services
- Revenue from external API usage
- Partner adoption rates
- User satisfaction scores

---

## 🔧 Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Docker & Docker Compose
- GPU-enabled servers (NVIDIA CUDA)

### Local Development
```bash
# Clone AI API repository
git clone https://github.com/maalca/ai-api
cd ai-api

# Set up Python environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Clone Dashboard repository
git clone https://github.com/maalca/ai-dashboard
cd ai-dashboard
npm install

# Start development servers
docker-compose up -d  # Start databases and Redis
python main.py        # Start FastAPI server
npm run dev          # Start React dashboard
```

---

## 📚 Additional Resources

- [Model Training Guidelines](./model-training.md)
- [API Integration Examples](./api-examples.md)
- [Deployment Guide](./deployment.md)
- [Partner Onboarding](./partner-guide.md)

---

**Last Updated:** December 2024  
**Document Version:** 1.0  
**Author:** MaalCa Development Team