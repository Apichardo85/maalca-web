# ✅ Checklist de Implementación - MaalCa Document Types

**Imprime esto o tenlo abierto mientras trabajas**

---

## 🎯 OBJETIVO

Crear Document Types completos para:
- Pegote Barbershop
- Cosina Tina
- MaalCa Properties

**Tiempo total**: 45 minutos

---

## FASE 1: Element Types (15 min)

### Service Block ⚠️ IMPORTANTE
- [ ] Settings → Document Types → Create → **Element Type**
- [ ] Name: `Service Block`
- [ ] Icon: scissors
- [ ] Agregar propiedades:
  - [ ] `serviceName` (Textstring) - **Mandatory**
  - [ ] `serviceDescription` (Textarea) - **Mandatory**
  - [ ] `duration` (Textstring) - Opcional
  - [ ] `price` (Textstring) - **Mandatory**
- [ ] **SAVE**

### Team Member Block
- [ ] Create → **Element Type**
- [ ] Name: `Team Member Block`
- [ ] Icon: user
- [ ] Agregar propiedades:
  - [ ] `memberName` (Textstring) - **Mandatory**
  - [ ] `role` (Textstring) - Opcional
  - [ ] `bio` (Textarea) - Opcional
  - [ ] `photo` (Media Picker) - Opcional
- [ ] **SAVE**

### Menu Item Block
- [ ] Create → **Element Type**
- [ ] Name: `Menu Item Block`
- [ ] Icon: food
- [ ] Agregar propiedades:
  - [ ] `dishName` (Textstring) - **Mandatory**
  - [ ] `dishDescription` (Textarea) - Opcional
  - [ ] `price` (Textstring) - **Mandatory**
  - [ ] `isSpecial` (True/False) - Opcional
  - [ ] `dishImage` (Media Picker) - Opcional
- [ ] **SAVE**

### Property Block
- [ ] Create → **Element Type**
- [ ] Name: `Property Block`
- [ ] Icon: home
- [ ] Agregar propiedades:
  - [ ] `propertyTitle` (Textstring) - **Mandatory**
  - [ ] `propertyDescription` (Textarea) - Opcional
  - [ ] `location` (Textstring) - Opcional
  - [ ] `price` (Textstring) - **Mandatory**
  - [ ] `bedrooms` (Numeric) - Opcional
  - [ ] `bathrooms` (Numeric) - Opcional
  - [ ] `sqMeters` (Decimal) - Opcional
  - [ ] `propertyGallery` (Media Picker) - Opcional
  - [ ] `isFeatured` (True/False) - Opcional
- [ ] **SAVE**

---

## FASE 2: Data Types para Block Lists (10 min)

⚠️ **Estos son necesarios ANTES de crear Document Types**

### Barbershop Services Block List
- [ ] Settings → Data Types → Create → New Data Type
- [ ] Name: `Barbershop Services - Block List`
- [ ] Property Editor: **Block List**
- [ ] Available Blocks → Add → **Service Block**
- [ ] Label: `{{serviceName}} - {{price}}`
- [ ] **SAVE**

### Team Members Block List
- [ ] Create → New Data Type
- [ ] Name: `Team Members - Block List`
- [ ] Property Editor: **Block List**
- [ ] Available Blocks → Add → **Team Member Block**
- [ ] Label: `{{memberName}} - {{role}}`
- [ ] **SAVE**

### Menu Items Block List
- [ ] Create → New Data Type
- [ ] Name: `Menu Items - Block List`
- [ ] Property Editor: **Block List**
- [ ] Available Blocks → Add → **Menu Item Block**
- [ ] Label: `{{dishName}} - {{price}}`
- [ ] **SAVE**

### Property Listings Block List
- [ ] Create → New Data Type
- [ ] Name: `Property Listings - Block List`
- [ ] Property Editor: **Block List**
- [ ] Available Blocks → Add → **Property Block**
- [ ] Label: `{{propertyTitle}} - {{price}}`
- [ ] **SAVE**

### Multiple Media Picker (si no existe)
- [ ] Create → New Data Type
- [ ] Name: `Multiple Media Picker`
- [ ] Property Editor: **Media Picker 3**
- [ ] Config: **Multiple items** = ✓
- [ ] **SAVE**

---

## FASE 3: Document Types (20 min)

### Base Affiliate (Padre)
- [ ] Settings → Document Types → Create → **Document Type**
- [ ] Name: `Base Affiliate`
- [ ] Icon: store
- [ ] **Structure** tab:
  - [ ] Allow at root: ☐ (NO marcar)

#### Tab "Content"
- [ ] Add group: `Content`
- [ ] Agregar propiedades:
  - [ ] `brandName` (Textstring) - **Mandatory**
  - [ ] `slug` (Textstring) - **Mandatory**
  - [ ] `heroImage` (Media Picker) - **Mandatory**
  - [ ] `heroTitle` (Textstring) - **Mandatory**
  - [ ] `heroDescription` (Textarea) - **Mandatory**

#### Tab "SEO"
- [ ] Add group: `SEO`
- [ ] Agregar propiedades:
  - [ ] `seoTitle` (Textstring)
  - [ ] `seoDescription` (Textarea)
  - [ ] `seoKeywords` (Textstring)
  - [ ] `socialImage` (Media Picker)
- [ ] **SAVE**

---

### Barbershop (hijo de Base Affiliate)
- [ ] Right-click **Base Affiliate** → Create → **Document Type**
- [ ] Name: `Barbershop`
- [ ] Icon: scissors
- [ ] **Permissions** tab:
  - [ ] Allow at root: ✓ (SÍ marcar)

#### Tab "Services"
- [ ] Add group: `Services`
- [ ] Add property:
  - [ ] Name: `Services`
  - [ ] Alias: `services`
  - [ ] Data Type: `Barbershop Services - Block List`
  - [ ] **Mandatory**: ✓

#### Tab "Team"
- [ ] Add group: `Team`
- [ ] Add property:
  - [ ] Name: `Team Members`
  - [ ] Alias: `teamMembers`
  - [ ] Data Type: `Team Members - Block List`

#### Tab "Gallery"
- [ ] Add group: `Gallery`
- [ ] Add property:
  - [ ] Name: `Work Gallery`
  - [ ] Alias: `workGallery`
  - [ ] Data Type: `Multiple Media Picker`

#### Tab "Contact"
- [ ] Add group: `Contact`
- [ ] Agregar propiedades:
  - [ ] `businessHours` (Textarea)
  - [ ] `phoneNumber` (Textstring)
  - [ ] `email` (Email Address o Textstring)
  - [ ] `address` (Textarea)
  - [ ] `googleMapsUrl` (Textstring)
- [ ] **SAVE**

---

### Restaurant (hijo de Base Affiliate)
- [ ] Right-click **Base Affiliate** → Create → **Document Type**
- [ ] Name: `Restaurant`
- [ ] Icon: food
- [ ] **Permissions** → Allow at root: ✓

#### Tabs y propiedades
- [ ] Tab "Menu":
  - [ ] `menuSections` (Menu Items - Block List) - **Mandatory**
- [ ] Tab "Chef":
  - [ ] `chefName` (Textstring)
  - [ ] `chefBio` (Textarea o Rich Text Editor)
  - [ ] `chefPhoto` (Media Picker)
- [ ] Tab "Gallery":
  - [ ] `dishGallery` (Multiple Media Picker)
- [ ] Tab "Contact":
  - [ ] `phoneNumber`, `email`, `address`, `serviceHours`
- [ ] **SAVE**

---

### Real Estate (hijo de Base Affiliate)
- [ ] Right-click **Base Affiliate** → Create → **Document Type**
- [ ] Name: `Real Estate`
- [ ] Icon: home
- [ ] **Permissions** → Allow at root: ✓

#### Tabs y propiedades
- [ ] Tab "Properties":
  - [ ] `propertyListings` (Property Listings - Block List) - **Mandatory**
- [ ] Tab "Agents":
  - [ ] `agents` (Team Members - Block List)
- [ ] Tab "Service Areas":
  - [ ] `serviceAreas` (Tags)
- [ ] Tab "Contact":
  - [ ] `phoneNumber`, `email`, `address`
- [ ] **SAVE**

---

## FASE 4: Contenido de Prueba (10 min)

### Pegote Barbershop
- [ ] Content → Create → **Barbershop**
- [ ] Name: `Pegote Barbershop`

#### Tab "Content"
- [ ] Brand Name: `Pegote Barbershop`
- [ ] Slug: `pegote`
- [ ] Hero Image: (subir imagen)
- [ ] Hero Title: `Estilo Dominicano, Calidad Internacional`
- [ ] Hero Description: `La barbería #1 de Santo Domingo. Más de 10 años perfeccionando tu imagen.`

#### Tab "SEO"
- [ ] SEO Title: `Pegote Barbershop - La Mejor Barbería de Santo Domingo`
- [ ] SEO Description: `Barbería profesional en Santo Domingo. Cortes clásicos, fades, diseños personalizados.`
- [ ] SEO Keywords: `barbería santo domingo, corte de pelo, fade`

#### Tab "Services"
- [ ] **Servicio 1**:
  - [ ] Service Name: `Corte Clásico`
  - [ ] Description: `Corte tradicional con navaja y toalla caliente...`
  - [ ] Duration: `45 min`
  - [ ] Price: `RD$ 500`
- [ ] **Servicio 2**:
  - [ ] Service Name: `Fade + Diseño`
  - [ ] Description: `Degradado profesional con diseño personalizado...`
  - [ ] Duration: `60 min`
  - [ ] Price: `RD$ 700`
- [ ] **Servicio 3**:
  - [ ] Service Name: `Afeitado Clásico`
  - [ ] Description: `Afeitado tradicional con navaja caliente...`
  - [ ] Duration: `30 min`
  - [ ] Price: `RD$ 400`

#### Tab "Team"
- [ ] **Miembro 1**:
  - [ ] Name: `Carlos 'El Maestro' Pérez`
  - [ ] Role: `Master Barber & Fundador`
  - [ ] Biography: `Con más de 15 años de experiencia...`

#### Tab "Contact"
- [ ] Business Hours: `Lunes a Viernes: 9:00 AM - 6:00 PM...`
- [ ] Phone Number: `+1 (809) 555-1234`
- [ ] Email: `info@pegotebarbershop.com`
- [ ] Address: `Calle El Conde #123, Zona Colonial...`

### ⚠️ IMPORTANTE: Publicar
- [ ] **Save and Publish** (NO solo Save)

---

## FASE 5: Validación (5 min)

### PowerShell
- [ ] Abrir PowerShell
- [ ] `cd C:\Users\apich\MaalCaCMS`
- [ ] `.\test-api.ps1`

### Verificar resultados
- [ ] ✅ Umbraco Running
- [ ] ✅ Delivery API Accessible
- [ ] ✅ Content Available
- [ ] ✅ Pegote Barbershop found

### Verificar JSON
```powershell
Invoke-RestMethod -Uri "http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote"
```

- [ ] Verifica que muestra:
  - [ ] `contentType`: "barbershop"
  - [ ] `properties.brandName`: "Pegote Barbershop"
  - [ ] `properties.services.contentData`: array con 3 servicios
  - [ ] `properties.teamMembers.contentData`: array con 1 miembro

---

## 🎉 COMPLETADO

Si todos los checkboxes están marcados:

✅ **Backend**: Document Types creados
✅ **Contenido**: Pegote Barbershop publicado
✅ **API**: Delivery API funcionando

### Próximos pasos:
1. Crear contenido para Cosina Tina (Restaurant)
2. Crear contenido para MaalCa Properties (Real Estate)
3. Integrar con Next.js (ver `NEXT-JS-INTEGRATION.md`)

---

## ⚠️ Problemas Comunes

| Problema | Solución |
|----------|----------|
| "No puedo agregar bloques a Services" | Verifica que creaste el Data Type de Block List primero |
| "Delivery API 404" | Asegúrate de hacer **Save and Publish**, no solo Save |
| "No veo Barbershop en Create" | Marca "Allow at root" en Permissions |
| "Block List vacío" | Asocia el Element Type en la configuración del Block List |

---

## 📊 Progreso Visual

```
[████████████████████░░] 80% - Solo falta validar

Fases completadas:
✅ Element Types
✅ Data Types
✅ Document Types
✅ Contenido
⏳ Validación pendiente
```

---

**Última actualización**: 2025-12-13
**Tiempo estimado**: 45 minutos
**Dificultad**: ⭐⭐☆☆☆
