# 📊 Análisis del Sistema de Afiliados MaalCa
**Generado:** 2025-01-12
**Afiliados Analizados:** 3 (Dr. Pichardo, Pegote Barbershop, BritoColor)

---

## 🏢 Afiliados Actuales

### 1. **Dr. Pichardo**
- **Especialidad:** Medicina Interna
- **Modelo:** Medicina solidaria (donaciones voluntarias)
- **Ubicación:** Santo Domingo, República Dominicana
- **Página:** `/dr-pichardo`
- **Estado:** ✅ Página completa y funcional

### 2. **Pegote Barbershop**
- **Especialidad:** Barbería dominicana
- **Modelo:** Servicios pagados ($20-$50)
- **Ubicación:** Elmira, NY, Estados Unidos
- **Página:** `/pegote-barber`
- **Estado:** ✅ Página completa y funcional

### 3. **BritoColor**
- **Especialidad:** Comunicación visual y diseño
- **Modelo:** Proyectos de diseño/impresión
- **Ubicación:** Santo Domingo, República Dominicana
- **Página:** ❌ No tiene (solo perfil en `/affiliates`)
- **Estado:** ⚠️ Necesita página dedicada

---

## 📋 Matriz Comparativa de Funcionalidades

| Funcionalidad | Dr. Pichardo | Pegote Barber | BritoColor | Reusable |
|---------------|--------------|---------------|------------|----------|
| **Hero Section** | ✅ Medicina/Bio | ✅ Bandera RD/Estilo | ❌ N/A | ✅ Sí |
| **Servicios/Productos** | ✅ 3 servicios | ✅ 6 servicios | ❌ N/A | ✅ Sí |
| **Sistema de Reservas** | ✅ Modal booking | ✅ Fila virtual + QR | ❌ N/A | ⚠️ Parcial |
| **Precios** | 💰 Donaciones | 💰 Fijos ($20-$50) | ❓ Cotización | ⚠️ Modelos diferentes |
| **Equipo** | 👨‍⚕️ 1 doctor | 👨‍💼 2 barberos | ❓ 1 fundador | ✅ Sí |
| **Testimonios** | ✅ 3 clientes | ✅ 3 clientes | ❌ N/A | ✅ Sí |
| **Formulario Contacto** | ✅ Sí | ✅ Sí | ❌ N/A | ✅ Sí |
| **WhatsApp Integration** | ✅ Componente | ✅ Flotante | ❌ N/A | ✅ Sí |
| **Galería/Portfolio** | ❌ No | ❌ No | ❌ N/A | ✅ Necesario |
| **Blog/Noticias** | ✅ Operativos médicos | ❌ No | ❌ N/A | ⚠️ Parcial |
| **Horarios** | ⚠️ Implícito | ✅ Explícito | ❌ N/A | ✅ Sí |
| **Ubicación/Mapa** | ✅ Dirección | ✅ Dirección | ❌ N/A | ✅ Sí |
| **Multiidioma** | ❌ Solo ES | ✅ ES/EN toggle | ❌ N/A | ✅ Sí |
| **Redes Sociales** | ❌ No visible | ✅ Links | ✅ Instagram | ✅ Sí |
| **Newsletter** | ❌ No | ❌ No | ❌ N/A | ✅ Opcional |

---

## 🔧 Componentes UI Reutilizables Existentes

### ✅ Ya Implementados
```
/src/components/ui/
├── WhatsAppIntegration.tsx         ✅ Usado por Dr. Pichardo
├── MedicalConsultationBooking.tsx  ✅ Sistema de citas médicas
├── ConsultationBooking.tsx         ✅ Sistema genérico de booking
├── MedicalDonationSystem.tsx       ✅ Sistema de donaciones
├── PropertyNewsletterSubscription  ✅ Newsletter signup
├── FormField.tsx                   ✅ Campos de formulario
├── SelectField.tsx                 ✅ Selects
├── TextAreaField.tsx               ✅ Textarea
└── SocialShare.tsx                 ✅ Compartir en redes
```

### ⚠️ Componentes Específicos (No Reutilizables)
- **Pegote Barber:** Sistema QR propio (hardcoded en page.tsx)
- **Dr. Pichardo:** Operativos médicos (específico del dominio)

### ❌ Faltan Crear (Necesarios)
```
- AffiliateHeroSection.tsx          (Hero genérico configurable)
- ServiceGrid.tsx                   (Grid de servicios/productos)
- TeamMemberCard.tsx                (Cards de equipo)
- TestimonialSlider.tsx             (Slider de testimonios)
- PortfolioGallery.tsx              (Galería para BritoColor)
- BookingCalendar.tsx               (Calendario de disponibilidad)
- PricingTable.tsx                  (Tabla de precios)
- AffiliateContactForm.tsx          (Formulario genérico)
```

---

## 🚨 Funcionalidades FALTANTES (Backend Necesario)

### 1. **Sistema de Reservas Real**
**Estado Actual:** 🔴 Solo frontend mockup
**Necesario:**
```typescript
// Base de datos
- tabla: bookings (reservas con timestamps, estado, cliente, servicio)
- tabla: availability (slots disponibles por día/hora)
- tabla: services (catálogo de servicios por afiliado)

// API Endpoints
POST /api/bookings/create        - Crear reserva
GET  /api/bookings/:id           - Ver reserva
PUT  /api/bookings/:id/status    - Actualizar estado
GET  /api/availability/:date     - Slots disponibles

// Features
- Validación de disponibilidad en tiempo real
- Prevención de doble-booking
- Sistema de confirmación automática
- Cancelaciones y reprogramación
```

### 2. **Sistema de Pagos**
**Estado Actual:** 🔴 No existe
**Necesario:**
```typescript
// Integración Stripe o PayPal
- Cobro al reservar (50% adelanto o 100%)
- Opción "Pagar en tienda"
- Reembolsos automáticos
- Registro de transacciones

// Modelos de pago
- Dr. Pichardo: Donaciones voluntarias (min/max sugerido)
- Pegote: Pago fijo por servicio
- BritoColor: Cotización custom + adelanto
```

### 3. **Panel Administrativo**
**Estado Actual:** 🔴 No existe
**Necesario:**
```
/pegote-barber/admin
/dr-pichardo/admin
/britocolor/admin

Features:
- Dashboard con métricas del día
- Lista de reservas (pendientes/confirmadas/completadas)
- Gestión de horarios y disponibilidad
- Scanner QR (para Pegote)
- Gestión de clientes e historial
- Reportes de ingresos
- Configuración de servicios y precios
```

### 4. **Sistema de Notificaciones**
**Estado Actual:** 🔴 No existe
**Necesario:**
```typescript
// Email (Resend/SendGrid)
- Confirmación de reserva con QR
- Recordatorio 24h antes
- Recordatorio 1h antes
- Factura/recibo post-servicio

// WhatsApp Business API
- Confirmación inmediata
- Recordatorios automáticos
- Link de pago

// SMS (opcional, Twilio)
- Confirmación de cita
- Código de verificación
```

### 5. **Generación QR Codes**
**Estado Actual:** 🔴 Mockup visual solamente
**Necesario:**
```typescript
// Librería: qrcode.react o qr-code-styling
import QRCode from 'qrcode'

// Generar QR único por reserva
const qrData = {
  bookingId: "PEG-2025-001",
  clientName: "Carlos M.",
  service: "combo-premium",
  date: "2025-01-15",
  time: "15:30",
  affiliate: "pegote-barber"
}

// Validación al escanear
- Verificar que QR es válido
- Marcar como "usado" (1 solo uso)
- Actualizar estado a "cliente llegó"
```

### 6. **Sistema de Facturación**
**Estado Actual:** 🔴 No existe
**Necesario:**
```typescript
// Generar facturas automáticas
- PDF con logo del afiliado
- Detalles del servicio
- Cálculo de impuestos (según país)
- Numeración correlativa
- Envío por email

// Integración contable
- Exportar a Excel/CSV
- Reportes mensuales/anuales
- Dashboard de ingresos
```

### 7. **Base de Datos (Estructura Sugerida)**
```sql
-- Tabla: affiliates
CREATE TABLE affiliates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  type VARCHAR, -- 'medical', 'barber', 'design'
  email VARCHAR,
  phone VARCHAR,
  address TEXT,
  settings JSONB -- horarios, servicios, precios
);

-- Tabla: bookings
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  affiliate_id VARCHAR REFERENCES affiliates(id),
  customer_name VARCHAR,
  customer_email VARCHAR,
  customer_phone VARCHAR,
  service_id VARCHAR,
  booking_date DATE,
  booking_time TIME,
  status VARCHAR, -- 'pending', 'confirmed', 'completed', 'cancelled'
  qr_code TEXT,
  payment_status VARCHAR,
  payment_amount DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tabla: services
CREATE TABLE services (
  id VARCHAR PRIMARY KEY,
  affiliate_id VARCHAR REFERENCES affiliates(id),
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  duration INTEGER, -- minutos
  is_active BOOLEAN
);

-- Tabla: customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  bookings_count INTEGER DEFAULT 0,
  last_visit DATE,
  notes TEXT
);
```

---

## 🎯 Componentes Reutilizables (Prioritarios)

### 🟢 Alta Prioridad (Crear AHORA)

#### 1. **AffiliateServiceCard**
```tsx
<AffiliateServiceCard
  name="Corte Clásico"
  description="El estilo tradicional"
  price={25}
  duration="45 min"
  onBook={() => {}}
  popular={false}
/>
```
**Usado por:** Dr. Pichardo, Pegote, BritoColor

#### 2. **AffiliateBookingModal**
```tsx
<AffiliateBookingModal
  affiliate="pegote-barber"
  services={services}
  onSubmit={(data) => {}}
  paymentType="fixed" | "donation" | "quote"
/>
```
**Usado por:** Todos los afiliados

#### 3. **AffiliateTestimonials**
```tsx
<AffiliateTestimonials
  testimonials={[
    {name: "Carlos", text: "...", rating: 5}
  ]}
/>
```
**Usado por:** Dr. Pichardo, Pegote (futuro: BritoColor)

#### 4. **AffiliateContactSection**
```tsx
<AffiliateContactSection
  name="Pegote Barbershop"
  phone="+1607..."
  email="..."
  address="..."
  whatsapp="+1607..."
  socialMedia={{instagram: "...", facebook: "..."}}
/>
```
**Usado por:** Todos los afiliados

### 🟡 Media Prioridad

#### 5. **AffiliateGallery** (Para BritoColor)
```tsx
<AffiliateGallery
  images={[
    {src: "/img/britocolor-1.jpg", title: "Fachada Comercial"},
    {src: "/img/britocolor-2.jpg", title: "Totem ACM"}
  ]}
  layout="masonry" | "grid"
/>
```

#### 6. **AffiliateTeamGrid**
```tsx
<AffiliateTeamGrid
  members={[
    {
      name: "Pegote",
      role: "Fundador",
      image: "...",
      bio: "..."
    }
  ]}
/>
```

### 🟠 Baja Prioridad (Futuro)

- **AffiliateNewsletterSignup** (si no usan el existente)
- **AffiliateBlogSection** (para operativos médicos, etc.)
- **AffiliateMetricsWidget** (stats públicas)

---

## 🏗️ Arquitectura Sugerida

### Estructura de Archivos
```
/src
├── app/
│   ├── affiliates/
│   │   ├── page.tsx                    (Lista de afiliados)
│   │   ├── [id]/
│   │   │   └── page.tsx                (Perfil público)
│   │   └── [id]/
│   │       └── admin/
│   │           └── page.tsx            (Panel admin)
│   │
│   ├── dr-pichardo/
│   │   ├── page.tsx                    (Página pública)
│   │   └── admin/
│   │       └── page.tsx                (Panel admin médico)
│   │
│   ├── pegote-barber/
│   │   ├── page.tsx
│   │   └── admin/
│   │       └── page.tsx                (Panel con QR scanner)
│   │
│   └── britocolor/
│       ├── page.tsx                    (CREAR)
│       └── admin/
│           └── page.tsx                (CREAR)
│
├── components/
│   ├── affiliate/                      (CREAR CARPETA)
│   │   ├── AffiliateHeroSection.tsx
│   │   ├── AffiliateServiceCard.tsx
│   │   ├── AffiliateBookingModal.tsx
│   │   ├── AffiliateTestimonials.tsx
│   │   ├── AffiliateContactSection.tsx
│   │   ├── AffiliateGallery.tsx
│   │   ├── AffiliateTeamGrid.tsx
│   │   └── index.ts
│   │
│   └── admin/                          (CREAR CARPETA)
│       ├── AdminDashboard.tsx
│       ├── BookingsList.tsx
│       ├── QRScanner.tsx
│       ├── AvailabilityManager.tsx
│       └── index.ts
│
├── lib/
│   ├── api/
│   │   ├── bookings.ts                 (CREAR)
│   │   ├── payments.ts                 (CREAR)
│   │   ├── notifications.ts            (CREAR)
│   │   └── qr-codes.ts                 (CREAR)
│   │
│   └── types/
│       ├── booking.types.ts            (CREAR)
│       ├── payment.types.ts            (CREAR)
│       └── affiliate.types.ts          (YA EXISTE)
│
└── data/
    ├── mock/
    │   └── affiliates.ts               (YA EXISTE)
    │
    └── services/                       (CREAR)
        ├── dr-pichardo-services.ts
        ├── pegote-services.ts
        └── britocolor-services.ts
```

---

## 📊 Comparación de Modelos de Negocio

| Aspecto | Dr. Pichardo | Pegote Barber | BritoColor |
|---------|--------------|---------------|------------|
| **Tipo de servicio** | Consultas médicas | Servicios de barbería | Proyectos de diseño |
| **Modelo de precio** | Donación voluntaria | Fijos ($20-$50) | Cotización custom |
| **Duración** | 30-60 min | 30-90 min | Variable (días/semanas) |
| **Reservas** | Citas programadas | Fila virtual/walk-in | Por proyecto |
| **Pago** | Después del servicio | Antes o al llegar | Adelanto 50% |
| **Facturación** | Opcional (donación) | Obligatoria | Obligatoria |
| **Follow-up** | Sí (recordatorios médicos) | Sí (próxima cita) | Sí (revisiones) |
| **Sistema QR** | No necesario | ✅ Crítico | No necesario |
| **WhatsApp** | ✅ Principal contacto | ✅ Reservas rápidas | ✅ Cotizaciones |

---

## 🎯 Recomendaciones Estratégicas

### 🟢 Fase 1: Componentes Unificados (1-2 semanas)
1. Crear carpeta `/components/affiliate/` con 6 componentes core
2. Refactorizar Dr. Pichardo y Pegote para usar componentes
3. Crear página de BritoColor usando los mismos componentes
4. **Resultado:** 3 páginas consistentes, código 50% menos

### 🟡 Fase 2: Backend Básico (2-3 semanas)
1. Configurar Supabase/Firebase
2. Implementar sistema de bookings
3. Integración de emails (Resend)
4. Generación QR real
5. **Resultado:** Reservas funcionales, notificaciones automáticas

### 🟠 Fase 3: Pagos y Facturación (2-3 semanas)
1. Integrar Stripe
2. Sistema de facturación PDF
3. Reportes de ingresos
4. **Resultado:** Pagos online, facturación automática

### 🔴 Fase 4: Panel Admin (3-4 semanas)
1. Dashboard por afiliado
2. QR Scanner (Pegote)
3. Gestión de disponibilidad
4. Reportes avanzados
5. **Resultado:** Afiliados pueden autogestionarse

---

## 💰 Estimación de Costos (Servicios Externos)

| Servicio | Propósito | Costo Mensual |
|----------|-----------|---------------|
| **Supabase** | Base de datos + Auth | $0-$25 |
| **Resend** | Emails transaccionales | $0-$20 (hasta 3k/mes) |
| **Stripe** | Pagos online | 2.9% + $0.30 por transacción |
| **WhatsApp Business API** | Notificaciones WhatsApp | $0.005-$0.05 por mensaje |
| **Twilio** (opcional) | SMS | $0.0075 por SMS |
| **Vercel/Netlify** | Hosting | $0-$20 |
| **TOTAL** | | **~$50-100/mes** |

---

## ✅ Checklist de Implementación

### Componentes Reutilizables
- [ ] AffiliateServiceCard
- [ ] AffiliateBookingModal
- [ ] AffiliateTestimonials
- [ ] AffiliateContactSection
- [ ] AffiliateGallery
- [ ] AffiliateTeamGrid

### Páginas de Afiliados
- [x] Dr. Pichardo `/dr-pichardo`
- [x] Pegote Barber `/pegote-barber`
- [ ] BritoColor `/britocolor` (crear)

### Backend
- [ ] Base de datos (tablas: bookings, services, customers)
- [ ] API de reservas
- [ ] Sistema de pagos (Stripe)
- [ ] Generación QR real
- [ ] Sistema de notificaciones (email + WhatsApp)
- [ ] Facturación automática

### Panel Admin
- [ ] Admin dashboard genérico
- [ ] QR Scanner (Pegote)
- [ ] Gestión de citas
- [ ] Reportes de ingresos
- [ ] Configuración de servicios

### Testing
- [ ] Test de reservas end-to-end
- [ ] Test de pagos
- [ ] Test de notificaciones
- [ ] Test de QR codes
- [ ] Test móvil (responsive)

---

## 🔗 Referencias

- Páginas actuales:
  - http://localhost:3001/dr-pichardo
  - http://localhost:3001/pegote-barber
  - http://localhost:3001/affiliates

- Documentación:
  - [BRANDING.md](./BRANDING.md) - Guías de marca
  - [CLAUDE.md](./CLAUDE.md) - Guías de desarrollo
  - [affiliate.types.ts](./src/lib/types/affiliate.types.ts) - Tipos de datos

---

**Próximo paso recomendado:** Crear componentes unificados en `/components/affiliate/` y página de BritoColor.
