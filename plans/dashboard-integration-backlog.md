# Dashboard Multi-Tenant Integration Backlog

> **Page/Section:** Dashboard (`/dashboard/[affiliateId]`)
> **Analyzed:** March 2026
> **Author:** maalca-web Frontend Integration Architect

---

## Data Audit

| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Affiliate Configuration | maalca-api | Multi-tenant config must come from database |
| User Authentication | maalca-api | Secure auth with JWT/OAuth |
| Customers (CRM) | maalca-api | Customer data is business-critical |
| Appointments | maalca-api | Scheduling logic and availability |
| Inventory | maalca-api | Stock management across locations |
| Queue Management | maalca-api | Real-time updates, WebSocket |
| Team/Employees | maalca-api | HR and scheduling data |
| Store/Products | maalca-api | E-commerce catalog and pricing |
| Invoicing | maalca-api | Financial data, tax compliance |
| Gift Cards | maalca-api | Balance tracking, validation |
| Metrics/Analytics | maalca-api | Aggregated business data |
| Campaigns | maalca-api | Marketing automation |
| Salon/Services | maalca-api | Service definitions and pricing |

---

## maalca-web Epics & Tasks

### [EPIC-DASH-1] Authentication & Authorization
- [ ] WEB-001: Implement login page consuming real auth API
  - What I need: `POST /api/auth/login` with `{email, password}` returning `{token, user: {id, email, affiliateId, role}}`
  - Current state: Mock login with alert "Mock login - En el futuro esto conectará con el sistema de autenticación real"
  - Acceptance criteria: User can login with valid credentials, receive JWT token, redirect to dashboard
  - Blocked until: API-REQ-001 shipped
- [ ] WEB-002: Implement protected route middleware
  - What I need: Middleware that validates JWT token on `/dashboard/*` routes
  - Current state: No route protection, all routes accessible
  - Acceptance criteria: Unauthenticated users redirected to `/login`
  - Blocked until: API-REQ-001 shipped

### [EPIC-DASH-2] Multi-Tenant Configuration
- [ ] WEB-003: Fetch affiliate configuration from API
  - What I need: `GET /api/affiliates/{affiliateId}` returning `{id, branding, modules, features, settings}`
  - Current state: Hardcoded in `src/config/affiliates-config.ts`
  - Acceptance criteria: Dashboard loads config from API, supports dynamic theme switching
  - Blocked until: API-REQ-002 shipped

### [EPIC-DASH-3] Customer Management (CRM)
- [ ] WEB-004: List customers from API
  - What I need: `GET /api/affiliates/{affiliateId}/customers?page=1&limit=20&search=&status=` returning `{data: [], total, page, totalPages}`
  - Current state: Hardcoded array in `customers/page.tsx` lines 31-80
  - Acceptance criteria: Table displays real customers with pagination and filtering
  - Blocked until: API-REQ-003 shipped
- [ ] WEB-005: Create customer via API
  - What I need: `POST /api/affiliates/{affiliateId}/customers` with `{name, email, phone, notes}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: New customer appears in list after creation
  - Blocked until: API-REQ-003 shipped
- [ ] WEB-006: Update customer via API
  - What I need: `PUT /api/affiliates/{affiliateId}/customers/{id}`
  - Current state: No edit functionality
  - Acceptance criteria: Customer data updates after edit
  - Blocked until: API-REQ-003 shipped
- [ ] WEB-007: Delete customer via API
  - What I need: `DELETE /api/affiliates/{affiliateId}/customers/{id}`
  - Current state: No delete functionality
  - Acceptance criteria: Customer removed from list after confirmation
  - Blocked until: API-REQ-003 shipped

### [EPIC-DASH-4] Appointment Scheduling
- [ ] WEB-008: List appointments from API
  - What I need: `GET /api/affiliates/{affiliateId}/appointments?date=&status=&page=1` returning `{data: [], total, page, totalPages}`
  - Current state: Hardcoded array in `appointments/page.tsx` lines 26-37
  - Acceptance criteria: Calendar displays real appointments with status
  - Blocked until: API-REQ-004 shipped
- [ ] WEB-009: Create appointment via API
  - What I need: `POST /api/affiliates/{affiliateId}/appointments` with `{customerId, serviceId, date, time, notes}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: New appointment appears in calendar
  - Blocked until: API-REQ-004 shipped
- [ ] WEB-010: Update appointment status via API
  - What I need: `PATCH /api/affiliates/{affiliateId}/appointments/{id}` with `{status}`
  - Current state: Status displayed but not editable
  - Acceptance criteria: Can change status (scheduled/completed/cancelled)
  - Blocked until: API-REQ-004 shipped

### [EPIC-DASH-5] Inventory Management
- [ ] WEB-011: List inventory from API
  - What I need: `GET /api/affiliates/{affiliateId}/inventory?category=&status=&page=1` returning `{data: [], total}`
  - Current state: Hardcoded array in `inventory/page.tsx` lines 45-56
  - Acceptance criteria: Table shows real stock levels with alerts
  - Blocked until: API-REQ-005 shipped
- [ ] WEB-012: Record inventory movement via API
  - What I need: `POST /api/affiliates/{affiliateId}/inventory/movements` with `{itemId, type: "in"|"out", quantity, notes}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: Stock updates after movement recorded
  - Blocked until: API-REQ-005 shipped

### [EPIC-DASH-6] Virtual Queue System
- [ ] WEB-013: Fetch queue entries from API (WebSocket)
  - What I need: `GET /api/affiliates/{affiliateId}/queue` and WebSocket subscription to `/queue/{affiliateId}`
  - Current state: Hardcoded array in `queue/page.tsx` lines 43-59
  - Acceptance criteria: Real-time queue updates without refresh
  - Blocked until: API-REQ-006 shipped
- [ ] WEB-014: Add entry to queue via API
  - What I need: `POST /api/affiliates/{affiliateId}/queue` with `{displayName, phone, serviceId, preferredBarberId, notes, channel}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: New entry appears in queue immediately
  - Blocked until: API-REQ-006 shipped
- [ ] WEB-015: Update queue entry status via API
  - What I need: `PATCH /api/affiliates/{affiliateId}/queue/{id}` with `{status, barberId}`
  - Current state: Status buttons exist but no API calls
  - Acceptance criteria: Can call next, mark in service, complete, no-show
  - Blocked until: API-REQ-006 shipped

### [EPIC-DASH-7] Team Management
- [ ] WEB-016: List team members from API
  - What I need: `GET /api/affiliates/{affiliateId}/team?department=&status=` returning `{data: [], total}`
  - Current state: Hardcoded array in `team/page.tsx` lines 45-58
  - Acceptance criteria: Table shows real employees with roles
  - Blocked until: API-REQ-007 shipped
- [ ] WEB-017: Add team member via API
  - What I need: `POST /api/affiliates/{affiliateId}/team` with `{name, email, role, department, joinDate}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: New employee appears in list
  - Blocked until: API-REQ-007 shipped

### [EPIC-DASH-8] Store/Products
- [ ] WEB-018: List products from API
  - What I need: `GET /api/affiliates/{affiliateId}/products?category=&status=` returning `{data: [], total}`
  - Current state: Hardcoded array in `store/page.tsx` lines 47-60
  - Acceptance criteria: Store displays real products with pricing
  - Blocked until: API-REQ-008 shipped
- [ ] WEB-019: Create/update product via API
  - What I need: `POST /api/affiliates/{affiliateId}/products` with `{name, category, price, stock, status}`
  - Current state: Modal exists but no API call
  - Acceptance criteria: Product catalog is editable
  - Blocked until: API-REQ-008 shipped

### [EPIC-DASH-9] Invoicing
- [ ] WEB-020: List invoices from API
  - What I need: `GET /api/affiliates/{affiliateId}/invoices?status=&dateFrom=&dateTo=` returning `{data: [], total}`
  - Current state: Mock data in invoicing page
  - Acceptance criteria: Invoice list shows real financial data
  - Blocked until: API-REQ-009 shipped
- [ ] WEB-021: Create invoice via API
  - What I need: `POST /api/affiliates/{affiliateId}/invoices` with `{customerId, items: [], dueDate}`
  - Current state: Create invoice modal exists
  - Acceptance criteria: Invoice generated and saved
  - Blocked until: API-REQ-009 shipped

### [EPIC-DASH-10] Gift Cards
- [ ] WEB-022: List gift cards from API
  - What I need: `GET /api/affiliates/{affiliateId}/giftcards?status=` returning `{data: [], total}`
  - Current state: Mock data in giftcards page
  - Acceptance criteria: Gift card balances displayed
  - Blocked until: API-REQ-010 shipped
- [ ] WEB-023: Create gift card via API
  - What I need: `POST /api/affiliates/{affiliateId}/giftcards` with `{amount, recipientEmail, message}`
  - Current state: Create modal exists
  - Acceptance criteria: Gift card created with unique code
  - Blocked until: API-REQ-010 shipped

### [EPIC-DASH-11] Metrics & Analytics
- [ ] WEB-024: Fetch dashboard metrics from API
  - What I need: `GET /api/affiliates/{affiliateId}/metrics` returning `{revenue, appointments, customers, inventoryValue, ...}`
  - Current state: Hardcoded stats in MetricsModule
  - Acceptance criteria: Dashboard shows real-time business metrics
  - Blocked until: API-REQ-011 shipped

### [EPIC-DASH-12] Campaigns
- [ ] WEB-025: List campaigns from API
  - What I need: `GET /api/affiliates/{affiliateId}/campaigns?status=` returning `{data: [], total}`
  - Current state: Mock data in campaigns page
  - Acceptance criteria: Campaign list shows real marketing campaigns
  - Blocked until: API-REQ-012 shipped
- [ ] WEB-026: Create campaign via API
  - What I need: `POST /api/affiliates/{affiliateId}/campaigns` with `{name, type, targetAudience, content, schedule}`
  - Current state: Create modal exists
  - Acceptance criteria: Campaign created and scheduled
  - Blocked until: API-REQ-012 shipped

---

## Contracts maalca-web Requires from Other Teams

### 📋 maalca-web → maalca-api requires:

- [ ] **API-REQ-001**: `POST /api/auth/login` returning `{token: string, user: {id, email, affiliateId, role}}` — Core authentication for dashboard access
- [ ] **API-REQ-002**: `GET /api/affiliates/{affiliateId}` returning `{id, branding, modules, features, settings}` — Multi-tenant configuration
- [ ] **API-REQ-003**: `GET/POST/PUT/DELETE /api/affiliates/{affiliateId}/customers` — CRM operations
- [ ] **API-REQ-004**: `GET/POST/PATCH /api/affiliates/{affiliateId}/appointments` — Scheduling system
- [ ] **API-REQ-004b**: `GET/POST/PUT/DELETE /api/affiliates/{affiliateId}/services` — Service catalog (name, price, duration, category) — business logic, not CMS content
- [ ] **API-REQ-005**: `GET/POST /api/affiliates/{affiliateId}/inventory` — Stock management
- [ ] **API-REQ-006**: `GET/POST/PATCH /api/affiliates/{affiliateId}/queue` with **SignalR Hub** for real-time — Virtual queue with live updates via SignalR (.NET 8)
- [ ] **API-REQ-007**: `GET/POST/PUT/DELETE /api/affiliates/{affiliateId}/team` — Employee management
- [ ] **API-REQ-008**: `GET/POST/PUT/DELETE /api/affiliates/{affiliateId}/products` — Product catalog
- [ ] **API-REQ-009**: `GET/POST /api/affiliates/{affiliateId}/invoices` — Financial/invoicing
- [ ] **API-REQ-010**: `GET/POST /api/affiliates/{affiliateId}/giftcards` — Gift card system
- [ ] **API-REQ-011**: `GET /api/affiliates/{affiliateId}/metrics` — Dashboard analytics
- [ ] **API-REQ-012**: `GET/POST /api/affiliates/{affiliateId}/campaigns` — Marketing campaigns

### 📋 maalca-web → maalCa CMS requires:

- [ ] **CMS-REQ-001**: Document Type `AffiliateLanding` with fields: `logo: MediaPicker, heroImage: MediaPicker, description: Text, primaryColor: Text, secondaryColor: Text, features: Text` — Dynamic landing pages per affiliate
- [ ] **CMS-REQ-002**: Document Type `Testimonial` with fields: `customerName: Text, quote: RichText, rating: Integer, photo: MediaPicker, affiliateId: Text` — Customer testimonials for affiliate pages

---

## Notes

1. **Real-time Requirements**: Queue system uses SignalR Hub (.NET 8) for live updates.

2. **Multi-tenancy**: All API endpoints must include `{affiliateId}` path parameter to ensure data isolation between affiliates.

3. **Pagination**: All list endpoints should support `page` and `limit` query parameters.

4. **Error Handling**: API should return consistent error format: `{error: {code, message}}` for frontend handling.

5. **Authentication Flow**: Use JWT tokens with refresh mechanism. Include affiliateId in token claims.

---

*This backlog represents maalca-web's requirements. The other teams (maalca-api, maalCa CMS) will implement these contracts to satisfy the frontend needs.*

---

## HOMEPAGE (src/app/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Ecosystem Projects list | maalCa CMS | Editorial content - belongs in CMS |
| Stats (7 projects, 50+ collaborators, etc.) | maalca-api | Business metrics from database |
| About Timeline | maalCa CMS | Static content, editable by editors |

### maalca-web Epics & Tasks

**[EPIC-HOME-1] Dynamic Ecosystem Projects**
- [ ] WEB-HOME-001: Fetch ecosystem projects from CMS
  - What I need: `GET /api/content/ecosystem-projects` returning `[{id, title, description, category, color, active, image, href, details, status, launched}]`
  - Current state: Hardcoded in [`ecosystem-projects.ts`](src/data/ecosystem-projects.ts) and inline in [`ecosistema/page.tsx`](src/app/ecosistema/page.tsx:9)
  - Acceptance criteria: Homepage displays projects from CMS, supports filtering by category
  - Blocked until: CMS-REQ-ECO-001 shipped

**[EPIC-HOME-2] Dynamic Stats**
- [ ] WEB-HOME-002: Fetch business metrics from API
  - What I need: `GET /api/metrics/overview` returning `{activeProjects, collaborators, customers, yearsExperience}`
  - Current state: Hardcoded array in [`page.tsx`](src/app/page.tsx:183) with static numbers
  - Acceptance criteria: Stats reflect real-time data from database
  - Blocked until: API-REQ-HOME-001 shipped

### Contracts Required

**📋 maalca-web → maalca-api requires:**
- [ ] **API-REQ-HOME-001**: `GET /api/metrics/overview` returning `{activeProjects: number, collaborators: number, customers: number, yearsExperience: number}` — Homepage statistics

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-ECO-001**: Document Type `EcosystemProject` with fields: `title: Text, description: Text, category: Text, color: Text, active: Boolean, image: MediaPicker, details: Text[], status: Text, launched: Text` — Homepage and Ecosistema page project showcase (UNIFIED contract)

---

## ECOSISTEMA PAGE (src/app/ecosistema/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Projects array with details | maalCa CMS | All project content is editorial |
| Project images | maalCa CMS | Media assets managed in CMS |
| Status, launch dates | maalCa CMS | Content metadata |

### maalca-web Epics & Tasks

**[EPIC-ECO-1] Dynamic Project Catalog**
- [ ] WEB-ECO-001: Fetch all ecosystem projects from CMS
  - What I need: `GET /api/content/ecosystem-projects?includeInactive=true` returning full project arrays
  - Current state: Hardcoded inline array starting at line 9 in [`ecosistema/page.tsx`](src/app/ecosistema/page.tsx:9)
  - Acceptance criteria: Projects load from CMS, supports status filtering
  - Blocked until: CMS-REQ-ECO-001 shipped
- [ ] WEB-ECO-002: Fetch single project by ID
  - What I need: `GET /api/content/ecosystem-projects/{id}` returning full project details
  - Current state: N/A - not implemented
  - Acceptance criteria: Individual project pages work
  - Blocked until: CMS-REQ-ECO-001 shipped

### Contracts Required

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-ECO-001**: Document Type `EcosystemProject` — Same as CMS-REQ-HOME-001, full details for ecosystem page

---

## EDITORIAL PAGE (src/app/editorial/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Articles metadata | maalCa CMS | Article listings are editorial content |
| Full article content | maalCa CMS | Rich text content |
| Books catalog | maalCa CMS | Publication listings |
| Digital reader content | maalCa CMS | EPUB content delivery |

### maalca-web Epics & Tasks

**[EPIC-EDIT-1] Article Listing**
- [ ] WEB-EDIT-001: Fetch articles from CMS
  - What I need: `GET /api/content/articles?page=1&limit=10&category=&featured=` returning `{data: [], total, page, totalPages}`
  - Current state: Hardcoded array in [`editorial/page.tsx`](src/app/editorial/page.tsx:12) using translation keys
  - Acceptance criteria: Articles load from CMS with pagination
  - Blocked until: CMS-REQ-EDIT-001 shipped

**[EPIC-EDIT-2] Article Content**
- [ ] WEB-EDIT-002: Fetch full article content
  - What I need: `GET /api/content/articles/{slug}` returning `{id, title, content: RichText, category, readTime, publishDate, featured, tags, author}`
  - Current state: N/A - reader component uses mock content
  - Acceptance criteria: Clicking article shows full content
  - Blocked until: CMS-REQ-EDIT-001 shipped

**[EPIC-EDIT-3] Digital Books**
- [ ] WEB-EDIT-003: Fetch books catalog from CMS
  - What I need: `GET /api/content/books` returning `{key, cover: MediaPicker, epubFile: MediaPicker, status}`
  - Current state: Hardcoded in [`booksData`](src/app/editorial/page.tsx:70), EPUB files in public/
  - Acceptance criteria: Book catalog managed in CMS, not filesystem
  - Blocked until: CMS-REQ-EDIT-002 shipped
- [ ] WEB-EDIT-004: Stream EPUB content via CMS
  - What I need: `GET /api/content/books/{id}/epub` returning EPUB binary
  - Current state: Static files in `/public/books/`
  - Acceptance criteria: Digital reader loads from CMS API
  - Blocked until: CMS-REQ-EDIT-002 shipped

### Contracts Required

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-EDIT-001**: Document Type `Article` with fields: `title: Text, slug: Text, excerpt: Text, content: RichText, category: Text, readTime: Integer, publishDate: Date, featured: Boolean, tags: Text[], author: Text` — Editorial articles
- [ ] **CMS-REQ-EDIT-002**: Document Type `Book` with fields: `title: Text, slug: Text, description: RichText, cover: MediaPicker, epubFile: MediaPicker, author: Text, status: Text` — Digital publications for reader

---

## MAALCA PROPERTIES (src/app/maalca-properties/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Properties listings | maalCa CMS | Real estate listings are editorial content |
| Property images | maalCa CMS | Media assets in CMS |
| Property details (price, beds, baths) | maalCa CMS | Property metadata |
| Lead capture forms | maalca-api | Customer leads are business data |

### maalca-web Epics & Tasks

**[EPIC-PROP-1] Property Listings**
- [ ] WEB-PROP-001: Fetch properties from CMS
  - What I need: `GET /api/content/properties?type=&priceRange=&page=1` returning `{data: [], total, page, totalPages}`
  - Current state: Uses `usePropertiesI18n` hook with fallback to mock
  - Acceptance criteria: Property listings load from CMS with filtering
  - Blocked until: CMS-REQ-PROP-001 shipped

**[EPIC-PROP-2] Lead Capture**
- [ ] WEB-PROP-002: Submit lead to API
  - What I need: `POST /api/leads/properties` with `{name, email, phone, country, propertyId, message}`
  - Current state: Modal exists but needs API
  - Acceptance criteria: Leads stored in database
  - Blocked until: API-REQ-PROP-001 shipped

### Contracts Required

**📋 maalca-web → maalca-api requires:**
- [ ] **API-REQ-PROP-001**: `POST /api/leads/properties` — Property lead capture

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-PROP-001**: Document Type `Property` with fields: `title: Text, price: Decimal, location: Text, beds: Integer, baths: Integer, sqft: Integer, images: MediaPicker[], type: Text, features: Text[]` — Real estate listings

---

## DR. PICHARDO (src/app/dr-pichardo/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Doctor info (name, bio, license) | maalCa CMS | Static content |
| Services list with pricing | maalca-api | Business logic |
| Appointment booking | maalca-api | Scheduling system |

### maalca-web Epics & Tasks

**[EPIC-DRP-1] Doctor Profile**
- [ ] WEB-DRP-001: Fetch doctor profile from CMS
  - What I need: `GET /api/content/doctor-profile`
  - Current state: Hardcoded in page.tsx lines 14-35
  - Acceptance criteria: Doctor info loads from CMS
  - Blocked until: CMS-REQ-DRP-001 shipped

**[EPIC-DRP-2] Services & Booking**
- [ ] WEB-DRP-002: Fetch services and book appointments
  - What I need: `GET/POST /api/affiliates/dr-pichardo/services` and appointments
  - Current state: Hardcoded in page.tsx lines 37+
  - Acceptance criteria: Services from API, booking works
  - Blocked until: API-REQ-DRP-001 shipped

### Contracts Required

**📋 maalca-web → maalca-api requires:**
- [ ] **API-REQ-DRP-001**: `GET/POST /api/affiliates/dr-pichardo/services` — Medical services and booking

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-DRP-001**: Document Type `DoctorProfile` — Doctor info and contact

---

## CIRIWHISPERS (src/app/ciriwhispers/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Books catalog | maalCa CMS | Book metadata |
| EPUB content | maalCa CMS | Digital content |

### maalca-web Epics & Tasks

**[EPIC-CW-1] Books Catalog**
- [ ] WEB-CW-001: Fetch books from CMS
  - What I need: `GET /api/content/ciriwhispers-books`
  - Current state: Hardcoded in page.tsx lines 26+
  - Acceptance criteria: Book catalog loads from CMS
  - Blocked until: CMS-REQ-CW-001 shipped

**[EPIC-CW-2] Digital Reader**
- [ ] WEB-CW-002: Stream EPUB from CMS
  - What I need: `GET /api/content/ciriwhispers-books/{id}/epub`
  - Current state: Static files in /public/books/
  - Acceptance criteria: Reader loads from CMS
  - Blocked until: CMS-REQ-CW-001 shipped

### Contracts Required

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-CW-001**: Document Type `CiriWhispersBook` — Book catalog and content

---

## CIRISONIC (src/app/cirisonic/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Services list | maalCa CMS | Service offerings |
| Contact form | maalca-api | Business leads |

### maalca-web Epics & Tasks

**[EPIC-CS-1] Services**
- [ ] WEB-CS-001: Fetch services from CMS
  - What I need: `GET /api/content/cirisonic-services`
  - Current state: Hardcoded in page.tsx lines 15+
  - Acceptance criteria: Services load from CMS
  - Blocked until: CMS-REQ-CS-001 shipped

**[EPIC-CS-2] Lead Capture**
- [ ] WEB-CS-002: Submit lead
  - What I need: `POST /api/leads/cirisonic`
  - Current state: Email signup exists
  - Acceptance criteria: Leads stored
  - Blocked until: API-REQ-CS-001 shipped

### Contracts Required

**📋 maalca-web → maalca-api requires:**
- [ ] **API-REQ-CS-001**: `POST /api/leads/cirisonic` — CiriSonic leads

**📋 maalca-web → maalCa CMS requires:**
- [ ] **CMS-REQ-CS-001**: Document Type `CiriSonicService` — AI services catalog

---

## LOGIN PAGE (src/app/login/page.tsx)

### Data Audit
| Data Currently Mocked | Real Owner | Why |
|---------------------|------------|-----|
| Login form | maalca-api | Authentication |

### maalca-web Epics & Tasks

**[EPIC-AUTH-1] Real Authentication**
- [ ] WEB-AUTH-001: Implement login API
  - What I need: `POST /api/auth/login`
  - Current state: Mock login alert in page.tsx line 23
  - Acceptance criteria: Real auth works
  - Blocked until: API-REQ-001 shipped

*Login already covered by API-REQ-001*
