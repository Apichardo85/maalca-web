# Umbraco CMS Setup para MaalCa Properties

## Content Types a Crear en Umbraco

### 1. Property (Documento Principal)
**⚠️ IMPORTANTE: Configurar como multiidioma EN/ES**

```json
{
  "alias": "property",
  "name": "Property",
  "allowCultureVariant": true,
  "properties": [
    {
      "alias": "title",
      "name": "Title",
      "propertyEditorAlias": "Umbraco.Textbox",
      "variesByCulture": true
    },
    {
      "alias": "description",
      "name": "Description", 
      "propertyEditorAlias": "Umbraco.TinyMCE",
      "variesByCulture": true
    },
    {
      "alias": "price",
      "name": "Price From",
      "propertyEditorAlias": "Umbraco.Integer"
    },
    {
      "alias": "location",
      "name": "Location",
      "propertyEditorAlias": "Umbraco.Textbox"
    },
    {
      "alias": "propertyType",
      "name": "Property Type",
      "propertyEditorAlias": "Umbraco.DropDown.Flexible",
      "config": {
        "items": [
          "Oceanfront Villa",
          "Luxury Penthouse", 
          "Private Estate",
          "Beach House",
          "Marina Condo",
          "Eco Villa"
        ]
      }
    },
    {
      "alias": "bedrooms",
      "name": "Bedrooms",
      "propertyEditorAlias": "Umbraco.Integer"
    },
    {
      "alias": "bathrooms", 
      "name": "Bathrooms",
      "propertyEditorAlias": "Umbraco.Integer"
    },
    {
      "alias": "sqft",
      "name": "Square Feet",
      "propertyEditorAlias": "Umbraco.Integer"
    },
    {
      "alias": "lotSize",
      "name": "Lot Size",
      "propertyEditorAlias": "Umbraco.Textbox"
    },
    {
      "alias": "status",
      "name": "Status",
      "propertyEditorAlias": "Umbraco.DropDown.Flexible",
      "config": {
        "items": ["Available", "Under Contract", "Sold", "Coming Soon"]
      }
    },
    {
      "alias": "featured",
      "name": "Featured Property",
      "propertyEditorAlias": "Umbraco.TrueFalse"
    },
    {
      "alias": "gallery",
      "name": "Image Gallery",
      "propertyEditorAlias": "Umbraco.MediaPicker3",
      "config": {
        "multiple": true,
        "validationLimit": { "max": 20 }
      }
    },
    {
      "alias": "amenities",
      "name": "Amenities",
      "propertyEditorAlias": "Umbraco.Tags"
    },
    {
      "alias": "virtualTourUrl",
      "name": "Virtual Tour URL",
      "propertyEditorAlias": "Umbraco.Textbox"
    },
    {
      "alias": "videoUrl",
      "name": "Video URL (YouTube/Vimeo)",
      "propertyEditorAlias": "Umbraco.Textbox"
    },
    {
      "alias": "coordinates",
      "name": "Map Coordinates",
      "propertyEditorAlias": "Umbraco.Textbox",
      "config": {
        "placeholder": "lat,lng (ejemplo: 18.4861,-69.9312)"
      }
    }
  ]
}
```

### 2. PropertyCategory (Para filtros)
```json
{
  "alias": "propertyCategory",
  "name": "Property Category",
  "properties": [
    {
      "alias": "categoryName",
      "name": "Category Name",
      "propertyEditorAlias": "Umbraco.Textbox"
    },
    {
      "alias": "categoryIcon",
      "name": "Category Icon",
      "propertyEditorAlias": "Umbraco.Textbox",
      "config": {
        "placeholder": "🏖️ (emoji o clase CSS)"
      }
    }
  ]
}
```

## API Endpoints Necesarios

### Umbraco Content Delivery API
- `/umbraco/delivery/api/v2/content?filter=contentType:property`
- `/umbraco/delivery/api/v2/content?filter=contentType:property&filter=featured:true`
- `/umbraco/delivery/api/v2/content/{id}`
- `/umbraco/delivery/api/v2/media/{id}`

## Variables de Entorno Necesarias
```env
# .env.local
UMBRACO_API_URL=https://tu-umbraco-domain.com
UMBRACO_API_KEY=tu-api-key-si-es-necesario
NEXT_PUBLIC_UMBRACO_MEDIA_URL=https://tu-umbraco-domain.com
```

## Estructura de Carpetas en Umbraco
```
Content/
├── Properties/
│   ├── Featured Properties/
│   │   ├── Villa Paraiso Oceanfront
│   │   ├── Caribbean Penthouse Dreams
│   │   └── Tropical Estate Sanctuary
│   └── All Properties/
│       ├── Modern Beach House
│       ├── Marina Luxury Residences
│       └── Eco-Luxury Retreat
└── Settings/
    └── Property Categories/
        ├── Oceanfront Villa
        ├── Luxury Penthouse
        └── Private Estate
```

## 🌍 Configuración Multiidioma

### Configurar Culturas en Umbraco
1. **Settings → Languages**
   - Agregar English (en-US) como idioma por defecto
   - Agregar Spanish (es-ES) como idioma adicional
   - Configurar fallback: ES → EN

### Content Types Multiidioma
- Marcar **"Allow culture variance"** en Document Type
- Para cada propiedad que debe traducirse, marcar **"Varies by culture"**
- Propiedades que NO necesitan traducción: price, bedrooms, bathrooms, sqft, coordinates

### Estructura de URLs
```
/en/properties/villa-paradise-oceanfront
/es/propiedades/villa-paraiso-frente-al-mar
```

## Pasos de Implementación en Umbraco

### 1. Configuración Inicial
- [ ] Instalar Umbraco Content Delivery API package
- [ ] Configurar CORS para permitir requests desde Next.js
- [ ] Crear API key si es necesario

### 2. Content Types
- [ ] Crear Content Type "Property" con todas las propiedades
- [ ] Crear Content Type "PropertyCategory" 
- [ ] Configurar templates básicos (opcional)

### 3. Contenido Inicial
- [ ] Crear estructura de carpetas en Content
- [ ] Subir las 6 propiedades de ejemplo con datos reales
- [ ] Subir todas las fotos reales a Media Library
- [ ] Configurar galerías de imágenes para cada propiedad

### 4. Configuración Media
- [ ] Configurar Image Processor para diferentes tamaños
- [ ] Establecer reglas de compresión para fotos
- [ ] Configurar URLs amigables para media

### 5. Testing
- [ ] Probar API endpoints manualmente
- [ ] Verificar que las imágenes se sirven correctamente
- [ ] Confirmar filtros y búsquedas funcionan

## Notas Técnicas

- **Fallback**: El frontend funcionará con datos mock hasta que Umbraco esté listo
- **Performance**: Implementar caché en el cliente API
- **SEO**: Utilizar Server-Side Rendering con datos de Umbraco
- **Images**: Optimización automática de imágenes desde Umbraco