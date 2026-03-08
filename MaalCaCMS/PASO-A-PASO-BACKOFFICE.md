# Guía Paso a Paso: Crear Document Types en Umbraco Backoffice

**Duración estimada**: 30-45 minutos
**Nivel**: Principiante
**Objetivo**: Crear la estructura completa de Document Types para MaalCa Ecosistema

---

## ✅ Pre-requisitos

- [x] Umbraco corriendo en `http://localhost:5011` ✓
- [ ] Acceso al Backoffice
- [ ] Navegador web abierto

---

## 📍 PARTE 1: Acceso al Backoffice (2 minutos)

### Paso 1.1: Abrir el Backoffice

1. Abre tu navegador (Chrome, Edge, Firefox)
2. Navega a: `http://localhost:5011/umbraco`
3. Deberías ver la pantalla de login de Umbraco

### Paso 1.2: Iniciar sesión

1. Ingresa tus credenciales de administrador
2. Clic en **Login**
3. Deberías ver el Dashboard de Umbraco

**¿Primera vez?** Si no has creado un usuario admin:
- Al primer inicio, Umbraco te pedirá crear un usuario
- Completa el formulario y guarda tus credenciales

---

## 📍 PARTE 2: Crear Element Types (Bloques) (15 minutos)

> **IMPORTANTE**: Los Element Types se crean ANTES que los Document Types porque son los bloques que usaremos en las Block Lists.

---

### 🔸 Element Type 1: Service Block (para Barbershop)

#### Paso 2.1: Navegar a Document Types

1. En el menú lateral izquierdo, clic en **Settings** (icono de engranaje ⚙️)
2. Verás una lista de secciones
3. Clic en **Document Types**

#### Paso 2.2: Crear nuevo Element Type

1. Clic derecho en **Document Types** (en el árbol de la izquierda)
2. Selecciona **Create** → **Element Type...**
   - **Nota**: NO selecciones "Document Type", debe ser "Element Type"

#### Paso 2.3: Configurar datos básicos

1. **Name**: `Service Block`
2. **Alias**: Se auto-genera como `serviceBlock` (déjalo así)
3. **Icon**: Clic en el icono y busca `scissors` (tijeras) o `settings`
4. **Description**: `Bloque para servicios de barbería (cortes, tratamientos, etc.)`

#### Paso 2.4: Agregar propiedades

Ahora vamos a agregar las propiedades del servicio:

**Propiedad 1: Service Name**

1. Clic en **Add property**
2. **Name**: `Service Name`
3. **Alias**: `serviceName` (auto-generado)
4. **Description**: `Nombre del servicio (ej: Corte Clásico)`
5. **Data Type**: Busca y selecciona `Textstring`
6. **Mandatory**: ✓ (marcar checkbox)
7. Clic en **Submit**

**Propiedad 2: Description**

1. Clic en **Add property** nuevamente
2. **Name**: `Description`
3. **Alias**: `serviceDescription`
4. **Description**: `Descripción detallada del servicio`
5. **Data Type**: `Textarea`
6. **Mandatory**: ✓
7. Clic en **Submit**

**Propiedad 3: Duration**

1. Clic en **Add property**
2. **Name**: `Duration`
3. **Alias**: `duration`
4. **Description**: `Duración estimada (ej: 45 min, 1 hora)`
5. **Data Type**: `Textstring`
6. **Mandatory**: ☐ (NO marcar, es opcional)
7. Clic en **Submit**

**Propiedad 4: Price**

1. Clic en **Add property**
2. **Name**: `Price`
3. **Alias**: `price`
4. **Description**: `Precio del servicio (ej: RD$ 500)`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. Clic en **Submit**

#### Paso 2.5: Guardar

1. Clic en **Save** (botón arriba a la derecha)
2. Deberías ver un mensaje de éxito: "Service Block has been saved"

---

### 🔸 Element Type 2: Team Member Block

#### Paso 2.6: Crear nuevo Element Type

1. Clic derecho en **Document Types**
2. **Create** → **Element Type...**

#### Paso 2.7: Configurar datos básicos

1. **Name**: `Team Member Block`
2. **Alias**: `teamMemberBlock`
3. **Icon**: Busca `user` o `people`
4. **Description**: `Bloque para miembros del equipo (barberos, agentes, chefs)`

#### Paso 2.8: Agregar propiedades

**Propiedad 1: Name**

1. **Add property**
2. **Name**: `Name`
3. **Alias**: `memberName`
4. **Description**: `Nombre completo del miembro del equipo`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 2: Role**

1. **Add property**
2. **Name**: `Role`
3. **Alias**: `role`
4. **Description**: `Cargo o posición (ej: Master Barber, Senior Agent)`
5. **Data Type**: `Textstring`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 3: Biography**

1. **Add property**
2. **Name**: `Biography`
3. **Alias**: `bio`
4. **Description**: `Biografía breve del miembro`
5. **Data Type**: `Textarea`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 4: Photo**

1. **Add property**
2. **Name**: `Photo`
3. **Alias**: `photo`
4. **Description**: `Foto del miembro del equipo`
5. **Data Type**: Busca `Media Picker` o `Media Picker 3`
6. **Mandatory**: ☐
7. **Submit**

#### Paso 2.9: Guardar

1. Clic en **Save**

---

### 🔸 Element Type 3: Menu Item Block (para Restaurant)

#### Paso 2.10: Crear nuevo Element Type

1. Clic derecho en **Document Types** → **Create** → **Element Type...**

#### Paso 2.11: Configurar datos básicos

1. **Name**: `Menu Item Block`
2. **Alias**: `menuItemBlock`
3. **Icon**: Busca `food` o `cutlery`
4. **Description**: `Bloque para platos individuales del menú`

#### Paso 2.12: Agregar propiedades

**Propiedad 1: Dish Name**

1. **Add property**
2. **Name**: `Dish Name`
3. **Alias**: `dishName`
4. **Description**: `Nombre del plato`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 2: Dish Description**

1. **Add property**
2. **Name**: `Dish Description`
3. **Alias**: `dishDescription`
4. **Data Type**: `Textarea`
5. **Mandatory**: ☐
6. **Submit**

**Propiedad 3: Price**

1. **Add property**
2. **Name**: `Price`
3. **Alias**: `price`
4. **Data Type**: `Textstring`
5. **Mandatory**: ✓
6. **Submit**

**Propiedad 4: Is Special**

1. **Add property**
2. **Name**: `Is Special`
3. **Alias**: `isSpecial`
4. **Description**: `¿Es un plato especial o destacado?`
5. **Data Type**: Busca `True/False` o `Toggle`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 5: Dish Image**

1. **Add property**
2. **Name**: `Dish Image`
3. **Alias**: `dishImage`
4. **Data Type**: `Media Picker` o `Media Picker 3`
5. **Mandatory**: ☐
6. **Submit**

#### Paso 2.13: Guardar

1. Clic en **Save**

---

### 🔸 Element Type 4: Property Block (para Real Estate)

#### Paso 2.14: Crear nuevo Element Type

1. Clic derecho en **Document Types** → **Create** → **Element Type...**

#### Paso 2.15: Configurar datos básicos

1. **Name**: `Property Block`
2. **Alias**: `propertyBlock`
3. **Icon**: Busca `home` o `building`
4. **Description**: `Bloque para listados de propiedades inmobiliarias`

#### Paso 2.16: Agregar propiedades

**Propiedad 1: Property Title**

1. **Add property**
2. **Name**: `Property Title`
3. **Alias**: `propertyTitle`
4. **Data Type**: `Textstring`
5. **Mandatory**: ✓
6. **Submit**

**Propiedad 2: Description**

1. **Add property**
2. **Name**: `Description`
3. **Alias**: `propertyDescription`
4. **Data Type**: `Textarea` o `Rich Text Editor`
5. **Mandatory**: ☐
6. **Submit**

**Propiedad 3: Location**

1. **Add property**
2. **Name**: `Location`
3. **Alias**: `location`
4. **Data Type**: `Textstring`
5. **Submit**

**Propiedad 4: Price**

1. **Add property**
2. **Name**: `Price`
3. **Alias**: `price`
4. **Data Type**: `Textstring`
5. **Mandatory**: ✓
6. **Submit**

**Propiedad 5: Bedrooms**

1. **Add property**
2. **Name**: `Bedrooms`
3. **Alias**: `bedrooms`
4. **Data Type**: Busca `Numeric` o `Integer`
5. **Submit**

**Propiedad 6: Bathrooms**

1. **Add property**
2. **Name**: `Bathrooms`
3. **Alias**: `bathrooms`
4. **Data Type**: `Numeric`
5. **Submit**

**Propiedad 7: Square Meters**

1. **Add property**
2. **Name**: `Square Meters`
3. **Alias**: `sqMeters`
4. **Data Type**: `Numeric` o `Decimal`
5. **Submit**

**Propiedad 8: Photo Gallery**

1. **Add property**
2. **Name**: `Photo Gallery`
3. **Alias**: `propertyGallery`
4. **Data Type**: `Media Picker` (configurado para múltiples imágenes)
5. **Submit**

**Propiedad 9: Is Featured**

1. **Add property**
2. **Name**: `Is Featured`
3. **Alias**: `isFeatured`
4. **Description**: `¿Es una propiedad destacada?`
5. **Data Type**: `True/False`
6. **Submit**

#### Paso 2.17: Guardar

1. Clic en **Save**

---

## ✅ Checkpoint 1: Verificar Element Types

En este punto deberías tener:

- ✓ Service Block
- ✓ Team Member Block
- ✓ Menu Item Block
- ✓ Property Block

Para verificar:
1. Settings → Document Types
2. Deberías ver los 4 Element Types en la lista

---

## 📍 PARTE 3: Crear Document Types (20 minutos)

Ahora vamos a crear los Document Types que usarán los Element Types.

---

### 🔸 Document Type 1: Base Affiliate (Padre)

#### Paso 3.1: Crear Document Type

1. Clic derecho en **Document Types**
2. Selecciona **Create** → **Document Type** (NO Element Type)

#### Paso 3.2: Configurar datos básicos

1. **Name**: `Base Affiliate`
2. **Alias**: `baseAffiliate`
3. **Icon**: Busca `store` o `business`
4. **Description**: `Document Type base para todos los affiliates del ecosistema MaalCa`

#### Paso 3.3: Configurar estructura

1. Clic en la pestaña **Structure** (arriba)
2. **Allow at root**: ☐ (NO marcar - este es un tipo base, no se crea directamente)
3. **Allow as root**: ☐

#### Paso 3.4: Crear Tab "Content"

1. En la sección principal, clic en **Add group** o **Add tab**
2. **Group name**: `Content`
3. Clic en **Submit** o presiona Enter

#### Paso 3.5: Agregar propiedades al tab Content

Ahora vamos a agregar propiedades dentro del tab "Content":

**Propiedad 1: Brand Name**

1. Dentro del grupo "Content", clic en **Add property**
2. **Name**: `Brand Name`
3. **Alias**: `brandName`
4. **Description**: `Nombre oficial de la marca del affiliate`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 2: Slug**

1. **Add property**
2. **Name**: `Slug`
3. **Alias**: `slug`
4. **Description**: `Identificador para URLs (ej: pegote, cosina-tina)`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 3: Hero Image**

1. **Add property**
2. **Name**: `Hero Image`
3. **Alias**: `heroImage`
4. **Description**: `Imagen principal del hero section (recomendado: 1920x1080px)`
5. **Data Type**: `Media Picker` o `Media Picker 3`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 4: Hero Title**

1. **Add property**
2. **Name**: `Hero Title`
3. **Alias**: `heroTitle`
4. **Description**: `Título principal del hero section`
5. **Data Type**: `Textstring`
6. **Mandatory**: ✓
7. **Submit**

**Propiedad 5: Hero Description**

1. **Add property**
2. **Name**: `Hero Description`
3. **Alias**: `heroDescription`
4. **Description**: `Descripción/tagline del hero section`
5. **Data Type**: `Textarea`
6. **Mandatory**: ✓
7. **Submit**

#### Paso 3.6: Crear Tab "SEO"

1. Clic en **Add group** (fuera del grupo Content)
2. **Group name**: `SEO`
3. **Submit**

#### Paso 3.7: Agregar propiedades al tab SEO

**Propiedad 1: SEO Title**

1. Dentro del grupo "SEO", clic en **Add property**
2. **Name**: `SEO Title`
3. **Alias**: `seoTitle`
4. **Description**: `Título para SEO (máximo 60 caracteres)`
5. **Data Type**: `Textstring`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 2: SEO Description**

1. **Add property**
2. **Name**: `SEO Description`
3. **Alias**: `seoDescription`
4. **Description**: `Meta descripción para SEO (máximo 160 caracteres)`
5. **Data Type**: `Textarea`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 3: SEO Keywords**

1. **Add property**
2. **Name**: `SEO Keywords`
3. **Alias**: `seoKeywords`
4. **Description**: `Palabras clave separadas por comas`
5. **Data Type**: `Textstring`
6. **Mandatory**: ☐
7. **Submit**

**Propiedad 4: Social Image**

1. **Add property**
2. **Name**: `Social Image`
3. **Alias**: `socialImage`
4. **Description**: `Imagen para redes sociales (recomendado: 1200x630px)`
5. **Data Type**: `Media Picker`
6. **Mandatory**: ☐
7. **Submit**

#### Paso 3.8: Guardar

1. Clic en **Save**

---

### 🔸 Document Type 2: Barbershop (hereda de Base Affiliate)

#### Paso 3.9: Crear Document Type hijo

1. Clic derecho en **Base Affiliate** (en el árbol)
2. Selecciona **Create** → **Document Type**
   - **IMPORTANTE**: Al crear desde Base Affiliate, automáticamente heredará sus propiedades

#### Paso 3.10: Configurar datos básicos

1. **Name**: `Barbershop`
2. **Alias**: `barbershop`
3. **Icon**: Busca `scissors` (tijeras)
4. **Description**: `Document Type para barberías del ecosistema MaalCa`

#### Paso 3.11: Configurar permisos

1. Clic en la pestaña **Permissions** (arriba)
2. **Allow at root**: ✓ (marcar - queremos poder crear Barbershop en la raíz)
3. **Allow as root**: ✓

#### Paso 3.12: Crear Tab "Services"

1. Vuelve a la pestaña **Design** o pestaña principal
2. Clic en **Add group**
3. **Group name**: `Services`
4. **Submit**

#### Paso 3.13: Agregar propiedad Services

**IMPORTANTE**: Antes de agregar esta propiedad, necesitamos crear un Data Type para Block List.

##### Sub-paso: Crear Data Type para Services Block List

1. Abre una nueva pestaña del navegador (mantén la actual abierta)
2. En el menú lateral, ve a **Settings** → **Data Types**
3. Clic derecho en **Data Types** → **Create** → **New Data Type**
4. Configurar:
   - **Name**: `Barbershop Services - Block List`
   - **Property Editor**: Busca y selecciona `Block List`
5. En la configuración de Block List:
   - **Available Blocks**: Clic en **Add**
   - Selecciona **Service Block** (el Element Type que creamos antes)
   - **Label**: Escribe `{{serviceName}} - {{price}}`
     - Esto muestra el nombre y precio del servicio en la lista
   - **Submit**
6. Clic en **Save**
7. Cierra esta pestaña y vuelve a la pestaña de Barbershop

##### Continuar agregando propiedad Services

1. En el tab "Services", clic en **Add property**
2. **Name**: `Services`
3. **Alias**: `services`
4. **Description**: `Lista de servicios ofrecidos`
5. **Data Type**: Busca y selecciona `Barbershop Services - Block List` (el que acabamos de crear)
6. **Mandatory**: ✓
7. **Submit**

#### Paso 3.14: Crear Tab "Team"

1. **Add group**
2. **Group name**: `Team`
3. **Submit**

#### Paso 3.15: Agregar propiedad Team Members

##### Sub-paso: Crear Data Type para Team Block List

1. Nueva pestaña → Settings → Data Types
2. Create → New Data Type
3. **Name**: `Team Members - Block List`
4. **Property Editor**: `Block List`
5. **Available Blocks** → Add → **Team Member Block**
6. **Label**: `{{memberName}} - {{role}}`
7. **Save**
8. Volver a pestaña Barbershop

##### Agregar propiedad

1. En tab "Team", **Add property**
2. **Name**: `Team Members`
3. **Alias**: `teamMembers`
4. **Description**: `Barberos y personal del equipo`
5. **Data Type**: `Team Members - Block List`
6. **Mandatory**: ☐
7. **Submit**

#### Paso 3.16: Crear Tab "Gallery"

1. **Add group**
2. **Group name**: `Gallery`
3. **Submit**

#### Paso 3.17: Agregar propiedad Work Gallery

1. **Add property**
2. **Name**: `Work Gallery`
3. **Alias**: `workGallery`
4. **Description**: `Galería de trabajos realizados`
5. **Data Type**: `Media Picker` (asegúrate que permita múltiples imágenes)
   - Si no existe, crea uno:
     - Settings → Data Types → Create
     - Name: `Multiple Media Picker`
     - Property Editor: `Media Picker 3`
     - Config: **Multiple items**: ✓
6. **Mandatory**: ☐
7. **Submit**

#### Paso 3.18: Crear Tab "Contact"

1. **Add group**
2. **Group name**: `Contact`
3. **Submit**

#### Paso 3.19: Agregar propiedades de contacto

**Propiedad 1: Business Hours**

1. **Add property**
2. **Name**: `Business Hours`
3. **Alias**: `businessHours`
4. **Data Type**: `Textarea`
5. **Submit**

**Propiedad 2: Phone Number**

1. **Add property**
2. **Name**: `Phone Number`
3. **Alias**: `phoneNumber`
4. **Data Type**: `Textstring`
5. **Submit**

**Propiedad 3: Email**

1. **Add property**
2. **Name**: `Email`
3. **Alias**: `email`
4. **Data Type**: Busca `Email Address` o usa `Textstring`
5. **Submit**

**Propiedad 4: Address**

1. **Add property**
2. **Name**: `Address`
3. **Alias**: `address`
4. **Data Type**: `Textarea`
5. **Submit**

**Propiedad 5: Google Maps URL**

1. **Add property**
2. **Name**: `Google Maps URL`
3. **Alias**: `googleMapsUrl`
4. **Data Type**: `Textstring`
5. **Submit**

#### Paso 3.20: Guardar

1. Clic en **Save**

---

### 🔸 Document Type 3: Restaurant (simplificado por tiempo)

#### Paso 3.21: Crear desde Base Affiliate

1. Clic derecho en **Base Affiliate**
2. **Create** → **Document Type**

#### Paso 3.22: Configurar

1. **Name**: `Restaurant`
2. **Alias**: `restaurant`
3. **Icon**: `food` o `restaurant`
4. **Permissions** → **Allow at root**: ✓

#### Paso 3.23: Agregar tabs y propiedades clave

**Tab "Menu":**
- Crear Data Type: `Menu Items - Block List` usando `Menu Item Block`
- Propiedad `menuSections` (Block List)

**Tab "Chef":**
- `chefName` (Textstring)
- `chefBio` (Textarea o Rich Text Editor)
- `chefPhoto` (Media Picker)

**Tab "Gallery":**
- `dishGallery` (Multiple Media Picker)

**Tab "Contact":**
- `phoneNumber`, `email`, `address`, `serviceHours`

#### Paso 3.24: Guardar

---

### 🔸 Document Type 4: Real Estate (simplificado)

#### Paso 3.25: Crear desde Base Affiliate

1. Clic derecho en **Base Affiliate**
2. **Create** → **Document Type**

#### Paso 3.26: Configurar

1. **Name**: `Real Estate`
2. **Alias**: `realEstate`
3. **Icon**: `home` o `building`
4. **Permissions** → **Allow at root**: ✓

#### Paso 3.27: Agregar tabs y propiedades

**Tab "Properties":**
- Crear Data Type: `Property Listings - Block List` usando `Property Block`
- Propiedad `propertyListings` (Block List)

**Tab "Agents":**
- Propiedad `agents` usando `Team Members - Block List` (reutilizar)

**Tab "Service Areas":**
- `serviceAreas` (Tags)

**Tab "Contact":**
- `phoneNumber`, `email`, `address`

#### Paso 3.28: Guardar

---

## ✅ Checkpoint 2: Verificar Document Types

En Settings → Document Types deberías ver:

```
📁 Document Types
  📄 Base Affiliate
    📄 Barbershop
    📄 Restaurant
    📄 Real Estate
  📄 Service Block (Element Type)
  📄 Team Member Block (Element Type)
  📄 Menu Item Block (Element Type)
  📄 Property Block (Element Type)
```

---

## 📍 PARTE 4: Crear Contenido de Prueba (10 minutos)

### Paso 4.1: Ir a Content

1. En el menú lateral, clic en **Content**

### Paso 4.2: Crear Pegote Barbershop

1. Clic derecho en la raíz (o clic en los 3 puntos **...**)
2. **Create** → **Barbershop**
3. **Name**: `Pegote Barbershop`
4. Clic en **Create**

### Paso 4.3: Llenar Tab "Content" (heredado de Base Affiliate)

1. **Brand Name**: `Pegote Barbershop`
2. **Slug**: `pegote`
3. **Hero Image**:
   - Clic en **Select media**
   - Si no tienes imágenes, súbelas desde tu computadora
   - O usa una imagen placeholder
4. **Hero Title**: `Estilo Dominicano, Calidad Internacional`
5. **Hero Description**: `La barbería #1 de Santo Domingo. Más de 10 años perfeccionando tu imagen.`

### Paso 4.4: Llenar Tab "SEO"

1. **SEO Title**: `Pegote Barbershop - La Mejor Barbería de Santo Domingo`
2. **SEO Description**: `Barbería profesional en Santo Domingo. Cortes clásicos, fades, diseños personalizados. Más de 10 años de experiencia.`
3. **SEO Keywords**: `barbería santo domingo, corte de pelo, fade, barbershop república dominicana`

### Paso 4.5: Llenar Tab "Services"

1. Clic en **Add content**
2. Deberías ver **Service Block** como opción
3. Clic en **Service Block**

**Servicio 1:**
- **Service Name**: `Corte Clásico`
- **Description**: `Corte tradicional con navaja y toalla caliente. Incluye lavado, corte, delineado y masaje relajante.`
- **Duration**: `45 min`
- **Price**: `RD$ 500`
- Clic en **Submit**

4. Clic en **Add content** nuevamente para agregar más servicios

**Servicio 2:**
- **Service Name**: `Fade + Diseño`
- **Description**: `Degradado profesional con diseño personalizado. Técnica moderna con máquinas premium.`
- **Duration**: `60 min`
- **Price**: `RD$ 700`
- **Submit**

**Servicio 3:**
- **Service Name**: `Afeitado Clásico`
- **Description**: `Afeitado tradicional con navaja caliente, toalla aromática y productos de alta calidad.`
- **Duration**: `30 min`
- **Price**: `RD$ 400`
- **Submit**

### Paso 4.6: Llenar Tab "Team"

1. Clic en **Add content** → **Team Member Block**

**Miembro 1:**
- **Name**: `Carlos 'El Maestro' Pérez`
- **Role**: `Master Barber & Fundador`
- **Biography**: `Con más de 15 años de experiencia, Carlos es especialista en cortes clásicos y fades modernos.`
- **Photo**: (sube una imagen si tienes)
- **Submit**

### Paso 4.7: Llenar Tab "Contact"

- **Business Hours**:
  ```
  Lunes a Viernes: 9:00 AM - 6:00 PM
  Sábados: 9:00 AM - 3:00 PM
  Domingos: Cerrado
  ```
- **Phone Number**: `+1 (809) 555-1234`
- **Email**: `info@pegotebarbershop.com`
- **Address**: `Calle El Conde #123, Zona Colonial, Santo Domingo, República Dominicana`

### Paso 4.8: Guardar y Publicar

1. Clic en **Save** (arriba a la derecha)
2. **IMPORTANTE**: Clic en **Save and Publish** (no solo Save)
   - "Save" = borrador (no visible en API)
   - "Save and Publish" = publicado (visible en API)

---

## 📍 PARTE 5: Probar Delivery API (5 minutos)

### Paso 5.1: Abrir PowerShell

1. Presiona `Windows + X`
2. Selecciona **Windows PowerShell**

### Paso 5.2: Navegar al proyecto

```powershell
cd C:\Users\apich\MaalCaCMS
```

### Paso 5.3: Ejecutar script de validación

```powershell
.\test-api.ps1
```

Deberías ver:
- ✅ Umbraco Running
- ✅ Delivery API Accessible
- ✅ Content Available
- ✅ Pegote Barbershop found

### Paso 5.4: Ver JSON response

```powershell
Invoke-RestMethod -Uri "http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote" | ConvertTo-Json -Depth 10
```

Deberías ver el JSON completo con:
- `contentType`: "barbershop"
- `properties.brandName`: "Pegote Barbershop"
- `properties.services.contentData`: array con los 3 servicios
- `properties.teamMembers.contentData`: array con el miembro del equipo

---

## 🎉 ¡Felicitaciones!

Has completado:
- ✅ 4 Element Types
- ✅ 4 Document Types (Base + 3 hijos)
- ✅ Contenido de prueba para Pegote Barbershop
- ✅ Validación del Delivery API

---

## 🚀 Próximos Pasos

1. **Crear más contenido**:
   - Cosina Tina (Restaurant)
   - MaalCa Properties (Real Estate)

2. **Integrar con Next.js**:
   - Copia los tipos TypeScript de `NEXT-JS-INTEGRATION.md`
   - Implementa el cliente de Delivery API
   - Crea componentes para mostrar el contenido

3. **Optimizar**:
   - Configurar imágenes responsive
   - Implementar cache
   - Agregar más validaciones

---

## ❓ ¿Problemas?

### "No veo Element Type al crear"
→ Asegúrate de seleccionar "Element Type" (no "Document Type")

### "Block List está vacío al agregar contenido"
→ Verifica que creaste el Data Type de Block List y lo asociaste correctamente

### "Delivery API retorna 404"
→ Asegúrate de hacer **Save and Publish** (no solo Save)

### "No puedo crear Barbershop en Content"
→ Verifica que marcaste "Allow at root" en Permissions

---

**¿Necesitas ayuda?** Consulta:
- `UMBRACO-DOCUMENT-TYPES-GUIDE.md` - Guía completa
- `IMPLEMENTATION-SUMMARY.md` - Troubleshooting

---

**Autor**: Claude Code para MaalCa Ecosistema
**Fecha**: 2025-12-13
**Duración total**: ~45 minutos
