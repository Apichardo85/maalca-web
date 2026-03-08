# Guía Visual Rápida - Umbraco en 10 Minutos

Esta es una guía ultra-rápida con imágenes ASCII para que puedas empezar inmediatamente.

## ⏱️ Timeline: 10 Minutos

```
[0-2 min]  → Acceder al Backoffice
[2-5 min]  → Crear Document Type
[5-7 min]  → Crear Contenido
[7-10 min] → Ver en API
```

---

## Minuto 1-2: Acceder al Backoffice

### Paso 1: Abre el navegador

```
http://localhost:5011/umbraco
```

### Paso 2: Verás esto (Primera vez)

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              🎯 UMBRACO CMS                        │
│            Let's get started!                      │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │ Name:     [Admin                        ]  │  │
│  │ Email:    [admin@maalcacms.local       ]  │  │
│  │ Password: [••••••••••••                ]  │  │
│  │                                            │  │
│  │ Site name: [MaalCa CMS                 ]  │  │
│  │                                            │  │
│  │          [  Install Umbraco  ]             │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Paso 3: Después del login

```
┌─────────────────────────────────────────────────────────┐
│  🏠 UMBRACO                             Admin ▼         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📄 Content      Welcome to Umbraco!                   │
│  📁 Media                                               │
│  ⚙️  Settings     Get started by creating your         │
│  📦 Packages     first Document Type                   │
│  👥 Users                                               │
│                  [Create Document Type]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Minuto 2-5: Crear Document Type

### Paso 1: Settings → Document Types

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️  SETTINGS                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ▼ 📋 Document Types                                   │
│  ▼ 🎨 Media Types                                      │
│  ▼ 📝 Data Types                                       │
│  ▼ 📄 Templates                                        │
│  ▼ 📑 Languages                                        │
│                                                         │
│  [Right-click en Document Types]                       │
│    → Create                                             │
│      → Document Type                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 2: Configurar el Document Type

```
┌─────────────────────────────────────────────────────────┐
│  New Document Type                    [Save] [Close]    │
├─────────────────────────────────────────────────────────┤
│  Info  │  Design  │  Structure  │  Templates  │        │
├────────┴──────────────────────────────────────────────┬─┤
│                                                        │ │
│  Name: [Simple Page              ]  📄                │ │
│  Alias: simplePage (auto)                             │ │
│                                                        │ │
│  ☑️ Allow as root                                     │ │
│  ☑️ Allow at root                                     │ │
│                                                        │ │
│  Delivery API:                                         │ │
│  ☑️ Enable for Delivery API                           │ │
│  ☑️ Allow access at root                              │ │
│                                                        │ │
└────────────────────────────────────────────────────────┴─┘
```

### Paso 3: Añadir Propiedades (Pestaña Design)

```
┌─────────────────────────────────────────────────────────┐
│  Simple Page                          [Save] [Close]    │
├─────────────────────────────────────────────────────────┤
│  Info  │  Design  │  Structure  │  Templates  │        │
├────────┴──────────────────────────────────────────────┬─┤
│                                                        │ │
│  [+ Add group]                                         │ │
│                                                        │ │
│  ┌─ Content Group ────────────────────────────────┐   │ │
│  │                                                 │   │ │
│  │  [+ Add property]                               │   │ │
│  │                                                 │   │ │
│  │  📝 Title                                       │   │ │
│  │     Textstring                         Required │   │ │
│  │                                                 │   │ │
│  │  📝 Description                                 │   │ │
│  │     Textarea                                    │   │ │
│  │                                                 │   │ │
│  │  📝 Content                                     │   │ │
│  │     Rich Text Editor                            │   │ │
│  │                                                 │   │ │
│  │  🖼️  Featured Image                             │   │ │
│  │     Media Picker                                │   │ │
│  │                                                 │   │ │
│  └─────────────────────────────────────────────────┘   │ │
│                                                        │ │
└────────────────────────────────────────────────────────┴─┘
```

### Paso 4: Guardar

Click en **[Save]** arriba a la derecha.

---

## Minuto 5-7: Crear Contenido

### Paso 1: Ir a Content

```
┌─────────────────────────────────────────────────────────┐
│  📄 CONTENT                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  (Empty tree)                                           │
│                                                         │
│  Right-click here → Create → Simple Page                │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 2: Llenar el Formulario

```
┌─────────────────────────────────────────────────────────┐
│  New Page                    [Save ▼] [Preview]         │
├─────────────────────────────────────────────────────────┤
│  Content  │  Info  │                                    │
├───────────┴────────────────────────────────────────────┬┤
│                                                         ││
│  Name: [Bienvenida                              ]       ││
│                                                         ││
│  ┌─ Content Group ─────────────────────────────────┐   ││
│  │                                                  │   ││
│  │  Title: *                                        │   ││
│  │  [Bienvenido a MaalCa CMS                    ]  │   ││
│  │                                                  │   ││
│  │  Description:                                    │   ││
│  │  ┌────────────────────────────────────────────┐ │   ││
│  │  │ Este es mi primer contenido en Umbraco.   │ │   ││
│  │  │ Es muy fácil de usar!                     │ │   ││
│  │  └────────────────────────────────────────────┘ │   ││
│  │                                                  │   ││
│  │  Content:                                        │   ││
│  │  ┌────────────────────────────────────────────┐ │   ││
│  │  │ [B] [I] [Link] [Image]                    │ │   ││
│  │  ├────────────────────────────────────────────┤ │   ││
│  │  │ Aquí va el contenido principal de mi      │ │   ││
│  │  │ página con formato HTML.                   │ │   ││
│  │  └────────────────────────────────────────────┘ │   ││
│  │                                                  │   ││
│  │  Featured Image:                                 │   ││
│  │  [+ Select or upload image]                      │   ││
│  │                                                  │   ││
│  └──────────────────────────────────────────────────┘   ││
│                                                         ││
└─────────────────────────────────────────────────────────┘┘
```

### Paso 3: Guardar y Publicar

```
Click en [Save ▼] → Save and Publish

┌──────────────────────────────────┐
│  Ready to publish?               │
│                                  │
│  This will make the page         │
│  visible to the public.          │
│                                  │
│  [Cancel]  [Publish]             │
└──────────────────────────────────┘
```

### Verás esto cuando esté publicado:

```
┌─────────────────────────────────────────────────────────┐
│  Bienvenida          [Save ▼] [Preview] [•••]   ✅     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Published                                           │
│  Last published: Just now by Admin                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Minuto 7-10: Ver en API

### Paso 1: Abre nueva pestaña del navegador

```
http://localhost:5011/umbraco/delivery/api/v2/content
```

### Paso 2: Verás tu contenido en JSON

```json
{
  "total": 1,
  "items": [
    {
      "name": "Bienvenida",
      "contentType": "simplePage",
      "route": {
        "path": "/bienvenida"
      },
      "properties": {
        "title": "Bienvenido a MaalCa CMS",
        "description": "Este es mi primer contenido en Umbraco. Es muy fácil de usar!",
        "content": {
          "markup": "<p>Aquí va el contenido principal de mi página con formato HTML.</p>"
        },
        "featuredImage": []
      }
    }
  ]
}
```

### Paso 3: Obtener contenido específico

```
http://localhost:5011/umbraco/delivery/api/v2/content/item/bienvenida
```

---

## 🎯 Prueba Rápida con Curl

```bash
# Powershell
curl http://localhost:5011/umbraco/delivery/api/v2/content | ConvertFrom-Json | ConvertTo-Json

# Git Bash
curl http://localhost:5011/umbraco/delivery/api/v2/content
```

---

## 🚀 Siguiente: Conectar con tu App

### Opción 1: JavaScript Vanilla

```javascript
fetch('http://localhost:5011/umbraco/delivery/api/v2/content')
  .then(res => res.json())
  .then(data => {
    console.log(data.items);
    // Usa tus datos aquí
  });
```

### Opción 2: React/Next.js

```tsx
// app/page.tsx
export default async function Page() {
  const res = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content');
  const data = await res.json();

  return (
    <div>
      {data.items.map(item => (
        <article key={item.id}>
          <h1>{item.properties.title}</h1>
          <p>{item.properties.description}</p>
        </article>
      ))}
    </div>
  );
}
```

### Opción 3: Vue

```vue
<script setup>
import { ref, onMounted } from 'vue';

const content = ref([]);

onMounted(async () => {
  const res = await fetch('http://localhost:5011/umbraco/delivery/api/v2/content');
  const data = await res.json();
  content.value = data.items;
});
</script>

<template>
  <div v-for="item in content" :key="item.id">
    <h1>{{ item.properties.title }}</h1>
    <p>{{ item.properties.description }}</p>
  </div>
</template>
```

---

## ✅ Checklist de Éxito

Después de estos 10 minutos deberías tener:

- [x] Acceso al Backoffice de Umbraco
- [x] Un Document Type creado (Simple Page)
- [x] Al menos una página de contenido publicada
- [x] Contenido visible en la Delivery API
- [x] Conocimiento básico de cómo funciona Umbraco

---

## 🎓 ¿Qué Sigue?

### Para Principiantes:
1. Lee [GUIA-INICIO-UMBRACO.md](./GUIA-INICIO-UMBRACO.md) - Guía completa
2. Crea más páginas y experimenta
3. Prueba diferentes tipos de propiedades

### Para Avanzados:
1. Crea Document Types más complejos
2. Usa Compositions para reutilizar propiedades
3. Configura Templates personalizados
4. Integra con tu frontend favorito

---

## 🆘 Ayuda Rápida

### No veo mi contenido en la API
→ ¿Lo publicaste? Debe tener ✅ verde, no 🟡 amarillo

### Error 404 en la API
→ Verifica que la URL sea correcta y que Umbraco esté corriendo

### No puedo crear contenido
→ Verifica que el Document Type tenga "Allow as root" habilitado

### La página se ve vacía
→ Asegúrate de llenar al menos los campos requeridos (*)

---

## 📊 Resumen Visual del Flujo

```
┌──────────────┐
│   Settings   │  1. Crea Document Type
│      ↓       │     (Define estructura)
│ Document     │
│    Types     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Content    │  2. Crea Contenido
│      ↓       │     (Llena datos)
│  New Page    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Publish    │  3. Publica
│      ↓       │     (Hace visible)
│     ✅       │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Delivery API │  4. Consume
│      ↓       │     (Usa en tu app)
│     JSON     │
└──────────────┘
```

---

**¡Listo! Ya sabes usar Umbraco en 10 minutos! 🎉**

Para más detalles, consulta [GUIA-INICIO-UMBRACO.md](./GUIA-INICIO-UMBRACO.md)

---

**Última actualización:** 12 de Diciembre, 2025
