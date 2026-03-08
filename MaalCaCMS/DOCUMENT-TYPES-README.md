# Document Types para Contenido Editorial y Visor EPUB

## Descripción
Este documento describe los Document Types creados para el ecosistema MaalCa CMS, enfocados en contenido editorial y visualización de EPUB con soporte multilenguaje.

## Document Types Creados

### 1. EditorialContent
Document Type para contenido editorial con soporte para EPUB/PDF y campos SEO.

#### Campos:
- **Autor** (TextBox) - Autor del contenido
- **Título** (TextBox) - Título del contenido
- **Palabras clave** (Tags) - Palabras clave separadas por comas
- **Contenido** (BlockList) - Contenido principal del artículo
- **PDF/EPUB** (MediaPicker3) - Archivo PDF o EPUB para descarga
- **Fecha** (DatePicker) - Fecha de publicación
- **Categoría** (TextBox) - Categoría del contenido

#### Tabs:
- **Content**: Campos principales del contenido
- **SEO**: Configuración SEO (título, descripción, imagen social)

### 2. EPUBViewer
Document Type para visualización de EPUB con soporte multilenguaje.

#### Campos:
- **Título** (TextBox) - Título del visor EPUB
- **EPUB File** (MediaPicker3) - Archivo EPUB a visualizar
- **Idioma** (TextBox) - Idioma del contenido (ej: es, en, fr)
- **Autor** (TextBox) - Autor del EPUB
- **Editorial** (TextBox) - Editorial del EPUB
- **Fecha Publicación** (DatePicker) - Fecha de publicación del EPUB
- **Descripción** (TextArea) - Descripción del EPUB
- **Etiquetas** (Tags) - Etiquetas para clasificación

#### Tabs:
- **Content**: Información del EPUB
- **SEO**: Configuración SEO (título, descripción, imagen social)

## Data Types para Azure AI Search

### 1. Azure AI Search Config
DataType para configuración de conexión con Azure AI Search.

### 2. Azure AI Search
DataType para implementar funcionalidad de búsqueda usando Azure AI Search.

## Configuración

### 1. Agregar el Composer al Program.cs
```csharp
using MaalCaCMS.Composers;

// En el método Compose
builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddDeliveryApi()
    .AddComposers()
    .AddUmbraco()
    .AddSearch()
    .Build();
```

### 2. DocumentTypeComposer.cs
El archivo contiene la lógica para crear los Document Types de forma programática.

## Uso

1. Compilar la solución
2. Iniciar la aplicación Umbraco
3. Los Document Types se crearán automáticamente al iniciar la aplicación
4. Acceder al backoffice para crear contenido usando los nuevos Document Types

## Características

- **Creación Programática**: Los Document Types se crean automáticamente al iniciar la aplicación
- **Soporte Multilenguaje**: EPUBViewer incluye campo de idioma
- **Integración con Azure AI Search**: Data Types configurados para búsqueda avanzada
- **SEO Optimizado**: Todos los Document Types incluyen tabs SEO
- **Soporte Multimedia**: Integración con MediaPicker3 para archivos EPUB/PDF

## Estructura de Archivos
```
MaalCaCMS/
├── DocumentTypeComposer.cs
├── Program.cs (modificado)
└── DOCUMENT-TYPES-README.md
```

## Próximos Pasos

- Implementar los custom editors para Azure AI Search
- Crear los elementos BlockList para el contenido editorial
- Configurar las relaciones entre Document Types
- Implementar la lógica de búsqueda con Azure AI Search
