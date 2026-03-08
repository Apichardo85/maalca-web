# Quick Start: Document Types para MaalCa Ecosistema

## 🚀 Inicio Rápido

### 1. Compilar y Ejecutar

```bash
# Limpiar compilación anterior
dotnet clean

# Restaurar paquetes
dotnet restore

# Compilar el proyecto
dotnet build

# Ejecutar
dotnet run
```

### 2. Verificar Document Types

Una vez iniciada la aplicación:

1. Navega a `http://localhost:5011/umbraco`
2. Inicia sesión con tus credenciales de admin
3. Ve a **Settings → Document Types**

Deberías ver:
- ✅ **BaseAffiliate** (icono azul de tienda)
  - Propiedades: brandName, slug, heroImage, heroTitle, heroDescription, SEO fields
- ✅ **Barbershop** (icono naranja de tijeras, extiende BaseAffiliate)
  - Tabs adicionales: Services, Team, Gallery, Contact
- ✅ **Restaurant** (icono rojo de comida, extiende BaseAffiliate)
  - Tabs adicionales: Menu, Chef, Gallery, Contact & Reservations
- ✅ **Real Estate** (icono verde de casa, extiende BaseAffiliate)
  - Tabs adicionales: Properties, Agents, Service Areas, Contact

**Element Types** (bloques para Block Lists):
- ✅ **ServiceBlock** - Para servicios de barbería
- ✅ **TeamMemberBlock** - Para miembros del equipo
- ✅ **MenuItemBlock** - Para platos del menú
- ✅ **MenuSectionBlock** - Para secciones del menú
- ✅ **PropertyBlock** - Para propiedades inmobiliarias

### 3. Configurar Block Lists (IMPORTANTE)

Los Document Types ya están creados, pero **debes configurar manualmente** los Block Lists en el Backoffice:

#### Para Barbershop → Services

1. Settings → Document Types → **Barbershop** → Tab "Services"
2. Clic en la propiedad **"services"**
3. Clic en el Data Type asociado (Umbraco.BlockList)
4. En "Available Blocks", clic en **"Add"**
5. Selecciona **ServiceBlock** como Element Type
6. Configura:
   - Label: `{{serviceName}} - {{price}}`
   - Icon: icon-scissors
7. **Save**

#### Para Barbershop → Team Members

1. Settings → Document Types → **Barbershop** → Tab "Team"
2. Clic en la propiedad **"teamMembers"**
3. Configurar Block List para usar **TeamMemberBlock**
4. Label: `{{memberName}} - {{role}}`

#### Para Restaurant → Menu Sections

1. Settings → Document Types → **Restaurant** → Tab "Menu"
2. Clic en la propiedad **"menuSections"**
3. Configurar Block List para usar **MenuSectionBlock**
4. Label: `{{sectionName}}`

#### Para Restaurant → Featured Dishes

1. Settings → Document Types → **Restaurant** → Tab "Menu"
2. Clic en la propiedad **"featuredDishes"**
3. Configurar Block List para usar **MenuItemBlock**
4. Label: `{{dishName}} - {{price}}`

#### Para RealEstate → Property Listings

1. Settings → Document Types → **RealEstate** → Tab "Properties"
2. Clic en la propiedad **"propertyListings"**
3. Configurar Block List para usar **PropertyBlock**
4. Label: `{{propertyTitle}} - {{price}}`

#### Para RealEstate → Agents

1. Settings → Document Types → **RealEstate** → Tab "Agents"
2. Clic en la propiedad **"agents"**
3. Configurar Block List para usar **TeamMemberBlock**
4. Label: `{{memberName}} - {{role}}`

---

## 📝 Crear Contenido de Prueba: Pegote Barbershop

### Paso 1: Crear Nodo

1. Ve a **Content**
2. Clic derecho en la raíz → **Create** → **Barbershop**
3. Nombre: `Pegote Barbershop`

### Paso 2: Tab Content

```
Brand Name: Pegote Barbershop
Slug: pegote
Hero Title: Estilo Dominicano, Calidad Internacional
Hero Description: La barbería #1 de Santo Domingo. Más de 10 años perfeccionando tu imagen.
Hero Image: [Sube una imagen desde Media]
```

### Paso 3: Tab SEO

```
SEO Title: Pegote Barbershop - La Mejor Barbería de Santo Domingo
SEO Description: Barbería profesional en Santo Domingo. Cortes clásicos, fades, diseños personalizados. Más de 10 años de experiencia. ¡Agenda tu cita hoy!
SEO Keywords: barbería santo domingo, corte de pelo, fade, barbershop república dominicana, peluquería masculina
Social Image: [Opcional - imagen 1200x630px]
```

### Paso 4: Tab Services

Clic en **"Add content"** → Selecciona **Service Block**

**Servicio 1:**
```
Service Name: Corte Clásico
Description: Corte tradicional con navaja y toalla caliente. Incluye lavado, corte, delineado y masaje relajante.
Duration: 45 min
Price: RD$ 500
```

**Servicio 2:**
```
Service Name: Fade + Diseño
Description: Degradado profesional con diseño personalizado. Técnica moderna con máquinas premium.
Duration: 60 min
Price: RD$ 700
```

**Servicio 3:**
```
Service Name: Afeitado Clásico
Description: Afeitado tradicional con navaja caliente, toalla aromática y productos de alta calidad.
Duration: 30 min
Price: RD$ 400
```

### Paso 5: Tab Team

Clic en **"Add content"** → Selecciona **Team Member Block**

**Miembro 1:**
```
Name: Carlos 'El Maestro' Pérez
Role: Master Barber & Fundador
Bio: Con más de 15 años de experiencia, Carlos es especialista en cortes clásicos y fades modernos. Entrenado en las mejores barberías de Nueva York y Santo Domingo.
Photo: [Sube foto profesional del barbero]
```

**Miembro 2:**
```
Name: José 'El Artista' Rodríguez
Role: Senior Barber
Bio: Especialista en diseños personalizados y técnicas de color. 8 años perfeccionando su arte en Pegote Barbershop.
Photo: [Sube foto]
```

### Paso 6: Tab Gallery

Sube 5-10 imágenes de:
- Trabajos realizados (cortes finales)
- Proceso de corte
- Interior de la barbería
- Antes/después

### Paso 7: Tab Contact

```
Business Hours:
Lunes a Viernes: 9:00 AM - 6:00 PM
Sábados: 9:00 AM - 3:00 PM
Domingos: Cerrado

Phone Number: +1 (809) 555-1234
Email: info@pegotebarbershop.com
Address: Calle El Conde #123, Zona Colonial, Santo Domingo, República Dominicana
Google Maps URL: https://maps.google.com/?q=Zona+Colonial+Santo+Domingo
```

### Paso 8: Publicar

1. Clic en **"Save and Publish"** (botón verde arriba a la derecha)
2. Confirmar publicación

---

## 🧪 Probar Delivery API

### Verificar que el contenido está accesible

#### 1. Listar todo el contenido

```bash
curl http://localhost:5011/umbraco/delivery/api/v2/content
```

**Respuesta esperada:**
```json
{
  "total": 1,
  "items": [
    {
      "contentType": "barbershop",
      "name": "Pegote Barbershop",
      "id": "...",
      ...
    }
  ]
}
```

#### 2. Obtener contenido por slug/path

```bash
curl http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote
```

**Respuesta esperada:**
```json
{
  "contentType": "barbershop",
  "name": "Pegote Barbershop",
  "properties": {
    "brandName": "Pegote Barbershop",
    "slug": "pegote",
    "heroTitle": "Estilo Dominicano, Calidad Internacional",
    "services": {
      "contentData": [
        {
          "contentType": "serviceBlock",
          "serviceName": "Corte Clásico",
          "serviceDescription": "Corte tradicional...",
          "price": "RD$ 500"
        }
      ]
    }
  }
}
```

#### 3. Verificar campos específicos

```bash
curl "http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote?fields=properties[brandName,heroTitle,services]"
```

#### 4. Desde PowerShell (Windows)

```powershell
Invoke-RestMethod -Uri "http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote" | ConvertTo-Json -Depth 10
```

---

## 🔧 Troubleshooting

### Error: "Document Types no aparecen en Backoffice"

**Solución:**
1. Verifica logs en `umbraco/Logs/` (archivo más reciente)
2. Busca errores relacionados con `DocumentTypeComposer` o `ElementTypeComposer`
3. Si hay errores de compilación, ejecuta:
   ```bash
   dotnet clean
   dotnet build
   ```

### Error: "Block List está vacío / no muestra Element Types"

**Causa:** Los Block Lists necesitan configuración manual en Backoffice (ver sección 3 arriba).

**Solución:**
1. Settings → Data Types → Crea nuevo Data Type
2. Tipo: **Block List**
3. Nombre: `Barbershop Services Block List` (por ejemplo)
4. Configura Element Types disponibles
5. Asigna este Data Type a la propiedad en el Document Type

### Error: "Delivery API retorna 404"

**Verificar:**
1. ¿El contenido está **Published** (no solo guardado)?
2. ¿El slug es correcto? (debe coincidir exactamente)
3. ¿Delivery API está habilitado en `appsettings.json`?
   ```json
   "DeliveryApi": {
     "Enabled": true,
     "PublicAccess": true
   }
   ```

### Error: "CORS al consumir desde Next.js"

**Solución:** Agrega configuración CORS en `Program.cs`:

```csharp
// Antes de builder.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Después de app.Build()
app.UseCors("AllowNextJs");
```

---

## 📚 Siguientes Pasos

### Contenido

1. ✅ Crear contenido para **Cosina Tina** (Restaurant)
   - Menú completo con secciones
   - Biografía del chef
   - Galería de platos

2. ✅ Crear contenido para **MaalCa Properties** (Real Estate)
   - Listados de propiedades
   - Información de agentes
   - Áreas de servicio

### Optimización

3. ✅ Configurar Media Types para imágenes optimizadas
   - Formato WebP
   - Responsive images (srcset)
   - Lazy loading

4. ✅ Implementar validación de datos
   - Regex para slug
   - Longitud máxima de SEO fields
   - Campos requeridos

### Integración con Next.js

5. ✅ Crear cliente TypeScript para Delivery API
6. ✅ Implementar tipos TypeScript basados en Document Types
7. ✅ Configurar ISR (Incremental Static Regeneration)
8. ✅ Implementar caché en Next.js

---

## 📖 Documentación Relacionada

- 📄 **UMBRACO-DOCUMENT-TYPES-GUIDE.md** - Guía completa detallada
- 🏗️ **ARQUITECTURA.md** - Arquitectura general del ecosistema
- 📊 **DIAGRAMAS.md** - Diagramas de flujo y arquitectura

---

## ✅ Checklist de Validación

Antes de integrar con Next.js, verifica:

- [ ] Document Types creados (BaseAffiliate, Barbershop, Restaurant, RealEstate)
- [ ] Element Types creados (ServiceBlock, TeamMemberBlock, etc.)
- [ ] Block Lists configurados manualmente en Backoffice
- [ ] Contenido de prueba para Pegote Barbershop creado y publicado
- [ ] Delivery API responde correctamente
- [ ] Imágenes de prueba subidas a Media
- [ ] SEO fields completos
- [ ] URLs de Delivery API funcionan

**¿Listo para integrar con Next.js?** 🚀

---

**Última actualización:** 2025-12-13
**Versión:** 1.0
**Autor:** Claude Code para MaalCa Ecosistema
