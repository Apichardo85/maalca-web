# Guía de Inicio - Cómo Usar Umbraco CMS

Esta guía te llevará paso a paso desde cero hasta tener contenido funcionando en Umbraco.

## 📋 Tabla de Contenidos

1. [Acceder al Backoffice](#1-acceder-al-backoffice)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Crear tu Primer Document Type](#3-crear-tu-primer-document-type)
4. [Crear Contenido](#4-crear-contenido)
5. [Consumir Contenido desde API](#5-consumir-contenido-desde-api)
6. [Próximos Pasos](#6-próximos-pasos)

---

## 1. Acceder al Backoffice

### Paso 1.1: Asegúrate que todo esté corriendo

```bash
# Terminal 1: SQL Server debe estar corriendo
docker ps | grep maalcacms-sqlserver

# Terminal 2: Umbraco debe estar corriendo
cd C:\Users\apich\MaalCaCMS
dotnet run
```

### Paso 1.2: Abrir el Backoffice

1. **Abre tu navegador** en: http://localhost:5011/umbraco

2. **Primera vez - Instalación:**
   - Te mostrará el instalador de Umbraco
   - Completa los siguientes campos:

   ```
   Nombre: Admin
   Email: admin@maalcacms.local
   Contraseña: [tu contraseña segura]

   Nombre del sitio: MaalCa CMS
   ```

   - Click en "Install"
   - Espera 2-3 minutos mientras se crea la base de datos

3. **Login:**
   - Email: admin@maalcacms.local
   - Password: [tu contraseña]

### Paso 1.3: Familiarízate con el Backoffice

Una vez dentro verás:

```
┌─────────────────────────────────────────────────────┐
│  UMBRACO BACKOFFICE                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ├─ 📄 Content        # Gestionar páginas/contenido│
│  ├─ 📁 Media          # Imágenes y archivos        │
│  ├─ ⚙️  Settings       # Document Types, Templates  │
│  ├─ 📦 Packages       # Extensiones                 │
│  ├─ 👥 Users          # Gestión de usuarios        │
│  └─ 📊 Analytics      # Estadísticas                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 2. Configuración Inicial

### Paso 2.1: Habilitar Delivery API (Ya está configurado)

La Delivery API ya está habilitada en `appsettings.json`. Verifica que tengas:

```json
"DeliveryApi": {
  "Enabled": true,
  "PublicAccess": true
}
```

### Paso 2.2: Verifica la API

Abre en navegador o usa curl:

```bash
# Ver todos los contenidos
curl http://localhost:5011/umbraco/delivery/api/v2/content

# Deberías ver algo como:
# {"total": 0, "items": []}
```

---

## 3. Crear tu Primer Document Type

Los **Document Types** son como plantillas o esquemas que definen qué tipo de contenido puedes crear.

### Paso 3.1: Ir a Settings

1. Click en **Settings** (⚙️) en el menú lateral
2. Click derecho en **Document Types**
3. Selecciona **Create** → **Document Type**

### Paso 3.2: Crear "Página Simple"

Vamos a crear un Document Type básico para una página:

```
┌─────────────────────────────────────────┐
│  Configuración del Document Type        │
├─────────────────────────────────────────┤
│                                         │
│  Name: Simple Page                      │
│  Alias: simplePage (auto-generado)     │
│  Icon: 📄 (Elige uno que te guste)     │
│                                         │
│  ☑️ Allow as root                       │
│  ☑️ Allow at root                       │
│  ☑️ Allow in Delivery API               │
│                                         │
└─────────────────────────────────────────┘
```

### Paso 3.3: Agregar Propiedades (Campos)

Click en **Add Group** → Nombra el grupo "Content"

Ahora añade estas propiedades:

**Propiedad 1: Título**
```
Name: Title
Alias: title
Type: Textstring
☑️ Mandatory
```

**Propiedad 2: Descripción**
```
Name: Description
Alias: description
Type: Textarea
```

**Propiedad 3: Contenido**
```
Name: Content
Alias: content
Type: Rich Text Editor
```

**Propiedad 4: Imagen**
```
Name: Featured Image
Alias: featuredImage
Type: Media Picker
```

### Paso 3.4: Configurar Delivery API

En la pestaña **Settings**:
1. Scroll hasta "Delivery API"
2. ☑️ Enable for Delivery API
3. ☑️ Allow access at root

### Paso 3.5: Guardar

Click en **Save** (arriba a la derecha)

---

## 4. Crear Contenido

### Paso 4.1: Ir a Content

1. Click en **Content** (📄) en el menú lateral
2. Verás un árbol vacío

### Paso 4.2: Crear tu Primera Página

1. Click derecho en el área blanca
2. Selecciona **Simple Page**

### Paso 4.3: Llenar el Contenido

```
┌─────────────────────────────────────────┐
│  Nueva Página                           │
├─────────────────────────────────────────┤
│                                         │
│  Name: Bienvenida                       │
│                                         │
│  ┌─── Content Group ─────────────────┐ │
│  │                                   │ │
│  │ Title:                            │ │
│  │ [Bienvenido a MaalCa CMS]        │ │
│  │                                   │ │
│  │ Description:                      │ │
│  │ [Este es mi primer contenido]    │ │
│  │                                   │ │
│  │ Content:                          │ │
│  │ [Escribe aquí tu contenido HTML] │ │
│  │                                   │ │
│  │ Featured Image:                   │ │
│  │ [Click para subir imagen]        │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Paso 4.4: Guardar y Publicar

1. Click en **Save** (arriba a la derecha)
2. Click en **Save and Publish**
3. Confirma la publicación

---

## 5. Consumir Contenido desde API

### Paso 5.1: Ver tu Contenido en la API

Abre en tu navegador:

```
http://localhost:5011/umbraco/delivery/api/v2/content
```

Deberías ver algo como:

```json
{
  "total": 1,
  "items": [
    {
      "name": "Bienvenida",
      "createDate": "2025-12-12T...",
      "updateDate": "2025-12-12T...",
      "route": {
        "path": "/bienvenida",
        "startItem": {
          "id": "...",
          "path": "bienvenida"
        }
      },
      "id": "...",
      "contentType": "simplePage",
      "properties": {
        "title": "Bienvenido a MaalCa CMS",
        "description": "Este es mi primer contenido",
        "content": "<p>Escribe aquí tu contenido HTML</p>",
        "featuredImage": [...]
      }
    }
  ]
}
```

### Paso 5.2: Obtener por Path

```bash
# Obtener contenido específico
curl http://localhost:5011/umbraco/delivery/api/v2/content/item/bienvenida
```

### Paso 5.3: Desde JavaScript/TypeScript

```javascript
// Ejemplo con fetch
async function getContent() {
  const response = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content');
  const data = await response.json();
  console.log(data.items);
}

// Obtener página específica
async function getPage(slug) {
  const response = await fetch(`http://localhost:5011/umbraco/delivery/api/v2/content/item/${slug}`);
  const data = await response.json();
  return data;
}
```

### Paso 5.4: Desde Next.js

```typescript
// app/page.tsx
export default async function HomePage() {
  const response = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content');
  const data = await response.json();

  return (
    <div>
      <h1>Contenido desde Umbraco</h1>
      {data.items.map((item: any) => (
        <article key={item.id}>
          <h2>{item.properties.title}</h2>
          <p>{item.properties.description}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## 6. Próximos Pasos

### 6.1: Crear más Document Types

Ahora que entiendes lo básico, crea Document Types para:

- **Blog Post**: Para artículos
- **Servicio**: Para servicios que ofreces
- **Producto**: Para catálogo
- **Contacto**: Para página de contacto

### 6.2: Document Types Avanzados

Aprende sobre:

- **Compositions**: Reutilizar propiedades comunes
- **Nested Content**: Contenido anidado
- **Content Picker**: Relacionar contenidos
- **Multi URL Picker**: Enlaces múltiples

### 6.3: Integración con Frontend

Revisa estos documentos:

- [NEXT-JS-INTEGRATION.md](./NEXT-JS-INTEGRATION.md) - Integrar con Next.js
- [UMBRACO-DOCUMENT-TYPES-GUIDE.md](./UMBRACO-DOCUMENT-TYPES-GUIDE.md) - Guía técnica completa

---

## 🎯 Ejemplo Completo: Sistema de Blog

Aquí te dejo un ejemplo completo para crear un blog:

### Document Type: Blog Post

```
Settings:
  Name: Blog Post
  Alias: blogPost
  Icon: 📝
  ☑️ Allow as root
  ☑️ Allow in Delivery API

Properties:

  Group: Content
    - Title (textstring, mandatory)
    - Excerpt (textarea, mandatory)
    - Content (Rich Text Editor, mandatory)
    - Featured Image (Media Picker)

  Group: Metadata
    - Author (textstring)
    - Publish Date (Date Picker, mandatory)
    - Tags (Tags, multiple)
    - Category (Dropdown with: Tech, Business, Lifestyle)

  Group: SEO
    - Meta Title (textstring)
    - Meta Description (textarea)
```

### Crear Posts

1. Content → Create → Blog Post
2. Llena los campos
3. Save and Publish

### Consumir desde API

```javascript
// Obtener todos los posts
const posts = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content?contentType=blogPost');

// Obtener un post específico
const post = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content/item/mi-primer-post');
```

---

## 🔥 Tips y Trucos

### Tip 1: Usa Aliases Consistentes
```
❌ Malo: myTitle, My_Description, CONTENT
✅ Bueno: title, description, content
```

### Tip 2: Organiza con Compositions
Para propiedades que se repiten (SEO, Social Media), crea Compositions.

### Tip 3: Prueba la API Frecuentemente
Usa Postman o Thunder Client en VS Code para probar la API mientras desarrollas.

### Tip 4: Versionado
Umbraco guarda versiones automáticamente. Puedes volver a versiones anteriores desde el menú de Actions.

### Tip 5: Preview Mode
Usa "Save" para guardar borrador y "Save and Publish" para publicar. Solo el contenido publicado aparece en la API.

---

## ❓ Troubleshooting

### No veo mi contenido en la API

1. ¿Está publicado? (debe ser verde, no amarillo)
2. ¿El Document Type tiene habilitada la Delivery API?
3. ¿La propiedad está marcada como disponible en API?

### El contenido no se actualiza

1. Refresca el navegador con Ctrl+F5
2. Verifica que guardaste y publicaste
3. Espera 2-3 segundos (cache del navegador)

### Error al publicar

1. Verifica campos mandatory
2. Revisa que las validaciones estén correctas
3. Mira los logs en `umbraco/Logs/`

---

## 📚 Recursos Adicionales

- [Documentación Oficial Umbraco](https://docs.umbraco.com/)
- [Delivery API Reference](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api)
- [Document Types](https://docs.umbraco.com/umbraco-cms/fundamentals/data/document-types)
- [Content Apps](https://docs.umbraco.com/umbraco-cms/extending/content-apps)

---

**¡Felicidades! Ya sabes usar Umbraco CMS 🎉**

Ahora puedes crear contenido rico y consumirlo desde cualquier frontend (Next.js, React, Vue, etc.)

---

**Última actualización:** 12 de Diciembre, 2025
**Versión:** 1.0.0
