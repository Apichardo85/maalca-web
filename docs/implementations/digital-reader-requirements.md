# 📚 Documento de Requerimientos - Lector Digital MaalCa

**Proyecto:** Lector Reutilizable para *CiriWhispers* y *Editorial MaalCa*  
**Fecha:** 27 de agosto 2025  
**Versión:** 1.0  
**Estado:** Pendiente de desarrollo  

---

## 1. **Objetivo General**

Desarrollar un **lector digital reutilizable** que permita visualizar, leer y navegar artículos, poemas y libros en distintos formatos (**EPUB, PDF, HTML**) desde la plataforma de *CiriWhispers* y *Editorial MaalCa*. El lector debe integrarse al ecosistema existente de MaalCa, ser escalable y ofrecer una experiencia de usuario moderna y fluida.

---

## 2. **Alcance**

El lector será:

* **Multiplataforma:** web (React/Next.js), escritorio (Tauri), y móvil (PWA o empaquetado con Capacitor).
* **Reutilizable:** podrá integrarse en distintas secciones (Editorial, librería de CiriWhispers, biblioteca personal de usuarios).
* **Extensible:** preparado para agregar futuras funcionalidades como anotaciones, sincronización en la nube y estadísticas de lectura.

---

## 3. **Requerimientos Funcionales**

### 3.1. Visualización

* Lectura de archivos en **EPUB** y **PDF** (mínimo requisito).
* Soporte para contenidos en **HTML/Markdown** (artículos de la editorial).
* Modos de lectura: **paginado** y **scroll continuo**.
* **Modo oscuro/claro** con posibilidad de temas personalizados.
* Ajustes de tipografía (tamaño, familia, interlineado).

### 3.2. Interacción del Usuario

* **Marcadores** de página.
* **Historial de lectura** (última página leída por documento).
* **Búsqueda interna** en el texto.
* **Soporte de Text-to-Speech (TTS)** opcional.

### 3.3. Sincronización

* Guardar progreso de lectura en la **cuenta del usuario MaalCa**.
* Posibilidad de sincronización entre dispositivos (ejemplo: iniciar lectura en web y continuar en móvil).

### 3.4. Integración con el Ecosistema MaalCa

* El lector debe poder consumir documentos desde:
  * **CMS Editorial (Umbraco Headless / JSON API).**
  * **Repositorio de CiriWhispers (artículos y poemas).**
* Conexión con el **dashboard MaalCa** para estadísticas (ej. número de lecturas por artículo/libro).

---

## 4. **Requerimientos Técnicos**

### 4.1. Stack Recomendado

* **Frontend:** React / Next.js.
* **Framework multiplataforma:** **Tauri** (para empaquetar en escritorio) y/o Capacitor (para móviles).
* **Render EPUB:** integración de **Readest** (base recomendada) o **epub.js**.
* **Render PDF:** integración con **PDF.js** (o `react-pdf`).
* **UI Components:** Chakra UI o Material UI (modo oscuro, responsividad).

### 4.2. Arquitectura

* Componente central `<Reader />` con props configurables:

```jsx
<Reader 
   source={urlOArchivo} 
   format="epub|pdf|html" 
   theme="dark|light" 
   userId={123} 
   sync={true} 
/>
```

* Backend expone API de documentos en JSON:

```json
{
  "id": "12345",
  "title": "Poema de Amaranta",
  "author": "CiriWhispers",
  "format": "epub",
  "url": "https://maalca.com/files/poema.epub"
}
```

* Sincronización: guardar progreso en base de datos asociada al usuario.

---

## 5. **Requerimientos de Negocio**

* **Licenciamiento:**
  * **Readest (GNU AGPL-3.0)** y **PDF.js (Apache 2.0)** → gratuitos, se pueden integrar.
* **Certificaciones:**
  * No obligatorias al inicio; opcional: **WCAG** (accesibilidad).
* **Costos iniciales:**
  * $0 (software libre).
  * Costos en hosting y almacenamiento dependerán del CMS y archivos (usar almacenamiento escalable: Azure Blob, AWS S3 o equivalente).

---

## 6. **Inventario Técnico Inicial**

* **Servidores:** hosting actual de MaalCa (Umbraco + React frontend).
* **Frameworks:** Next.js, Tauri, PDF.js, epub.js/Readest.
* **Utensilios dev:** Visual Studio Code, GitHub/GitLab CI/CD, Docker para empaquetado.
* **Dispositivos prueba:** Laptop (Windows/Mac/Linux), móvil (Android/iOS).

---

## 7. **Fases de Desarrollo**

### **Fase 1 – MVP (4-6 semanas)**

**Objetivos:**
- Implementar componente `<Reader />` básico
- Soporte para PDF y EPUB
- Funcionalidades básicas de lectura

**Entregables:**
- [ ] Componente Reader con soporte PDF/EPUB
- [ ] Modo oscuro/claro
- [ ] Ajustes de tipografía básicos
- [ ] Sistema de marcadores
- [ ] Integración con API MaalCa

**Tecnologías:**
- React/Next.js
- PDF.js para PDFs
- epub.js o Readest para EPUBs
- Tailwind CSS para styling

### **Fase 2 – Integración (6-8 semanas)**

**Objetivos:**
- Sincronización de progreso
- Panel de estadísticas
- Mejoras de UX

**Entregables:**
- [ ] Sistema de usuarios y autenticación
- [ ] Sincronización de progreso de lectura
- [ ] Historial de lectura
- [ ] Búsqueda interna en textos
- [ ] Dashboard básico de estadísticas

**Tecnologías:**
- Base de datos para persistencia
- API endpoints para sincronización
- Sistema de autenticación

### **Fase 3 – Escalabilidad (8-12 semanas)**

**Objetivos:**
- Apps multiplataforma
- Funcionalidades avanzadas
- Analytics completos

**Entregables:**
- [ ] App móvil (Capacitor/PWA)
- [ ] App escritorio (Tauri)
- [ ] Text-to-Speech (TTS)
- [ ] Sistema de anotaciones
- [ ] Analytics avanzados
- [ ] Optimizaciones de rendimiento

**Tecnologías:**
- Tauri para desktop
- Capacitor para móvil
- Web Speech API para TTS
- Sistema de analytics

---

## 8. **Métricas Clave**

### **Métricas de Usuario:**
- Tiempo promedio de lectura por documento
- Número de usuarios activos por mes
- Tasa de finalización de lecturas
- Frecuencia de uso del lector

### **Métricas de Contenido:**
- Libros/artículos más leídos
- Progreso de lectura promedio
- Documentos abandonados (análisis)
- Preferencias de formato (PDF vs EPUB)

### **Métricas Técnicas:**
- Tiempo de carga de documentos
- Errores de renderizado
- Compatibilidad por dispositivo/navegador
- Uso de bandwidth por sesión

---

## 9. **Consideraciones de Implementación**

### **Compatibilidad:**
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Dispositivos móviles (iOS Safari, Android Chrome)
- Responsive design para tablets

### **Performance:**
- Lazy loading para documentos grandes
- Caché inteligente para relecturas
- Optimización de memoria para EPUBs largos
- Progressive loading para PDFs pesados

### **Accesibilidad:**
- Soporte para lectores de pantalla
- Navegación por teclado
- Alto contraste
- Escalabilidad de texto

### **Seguridad:**
- Validación de archivos subidos
- Sanitización de contenido HTML
- Control de acceso a documentos premium
- Protección contra XSS

---

## 10. **Riesgos y Mitigación**

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Incompatibilidad EPUB | Media | Alto | Testing extensivo, fallback a estándares |
| Performance en móviles | Alta | Medio | Optimización progresiva, testing en dispositivos reales |
| Complejidad multiplataforma | Media | Alto | MVP web primero, después empaquetado |
| Licencias de software | Baja | Alto | Verificación legal previa, uso de software libre |

---

## 📌 **Viabilidad Técnica**

**¿Puedo desarrollar esto?** ✅ **SÍ**

**Razones:**
- Stack familiar (React/Next.js/TypeScript)
- Librerías probadas disponibles (PDF.js, epub.js)
- Arquitectura modular y escalable
- Integración natural con ecosistema MaalCa existente

**Recomendación:**
Comenzar con **Fase 1 (MVP web)** usando **PDF.js** para PDFs y **epub.js** para EPUBs, encapsulados en un componente `<Reader />` reutilizable. Esto permite validar la funcionalidad core antes de expandir a multiplataforma.

---

**Próxima acción recomendada:** Aprobar requerimientos y proceder con prototipo MVP

**Responsable técnico:** Claude Code + Equipo MaalCa  
**Timeline estimado:** 12-16 semanas para implementación completa  
**Presupuesto:** $0 en licencias + costos de hosting/storage  

---

**Última actualización:** Diciembre 2024  
**Estado:** Documento de requerimientos completado