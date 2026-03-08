# Guía de Implementación: Document Types para MaalCa Ecosistema

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Enfoque 1: UI Backoffice (Manual)](#enfoque-1-ui-backoffice-manual)
3. [Enfoque 2: Programático con C# (Recomendado)](#enfoque-2-programático-con-c-recomendado)
4. [Configuración del Delivery API](#configuración-del-delivery-api)
5. [Creación de Contenido de Prueba](#creación-de-contenido-de-prueba)
6. [Testing y Validación](#testing-y-validación)

---

## Resumen Ejecutivo

### Estado Actual
- ✅ Umbraco 15.1.0 corriendo en `http://localhost:5011`
- ✅ Delivery API habilitado en `Program.cs`
- ✅ SQL Server 2022 en Docker (puerto 1433)
- ⚠️ Document Types pendientes de crear

### Estructura a Implementar
```
BaseAffiliate (Document Type Base)
├── Barbershop (Pegote Barbershop)
├── Restaurant (Cosina Tina)
└── RealEstate (MaalCa Properties)
```

### Tecnologías Clave
- **Block List Editor**: Para contenido repetitivo (servicios, menús, propiedades)
- **Media Picker 3**: Para imágenes optimizadas
- **Rich Text Editor**: Para contenido editorial
- **Content Picker**: Para relaciones entre contenidos

---

## Enfoque 1: UI Backoffice (Manual)

### Paso 1: Acceder al Backoffice

1. Navega a `http://localhost:5011/umbraco`
2. Inicia sesión con tus credenciales de admin
3. En el menú lateral, selecciona **Settings**

### Paso 2: Crear Data Types Personalizados

Antes de crear Document Types, necesitamos Data Types reutilizables.

#### 2.1 Service Block (para Barbershop)

1. Settings → Data Types → Clic derecho → **Create** → **Block List**
2. Nombre: `Service Block List`
3. Configurar Block:
   - Clic en **Add** bajo "Available Blocks"
   - Crea un nuevo Element Type llamado `ServiceBlock`
   - Propiedades del `ServiceBlock`:
     ```
     - name (Textstring) - Mandatory
     - description (Textarea) - Mandatory
     - duration (Textstring) - Optional
     - price (Textstring) - Mandatory
     ```

#### 2.2 Menu Section Block (para Restaurant)

1. Settings → Data Types → **Create** → **Block List**
2. Nombre: `Menu Section Block List`
3. Element Type: `MenuSectionBlock`
   ```
   - sectionName (Textstring) - Ej: "Desayuno", "Almuerzo"
   - items (Nested Block List)
     └── MenuItem Element:
         - dishName (Textstring)
         - description (Textarea)
         - price (Textstring)
         - isSpecial (True/False)
         - image (Media Picker 3)
   ```

#### 2.3 Property Listing Block (para RealEstate)

1. Settings → Data Types → **Create** → **Block List**
2. Nombre: `Property Block List`
3. Element Type: `PropertyBlock`
   ```
   - title (Textstring)
   - description (Rich Text Editor)
   - location (Textstring)
   - price (Textstring)
   - bedrooms (Numeric)
   - bathrooms (Numeric)
   - sqMeters (Numeric)
   - gallery (Multiple Media Picker 3)
   - isFeatured (True/False)
   ```

#### 2.4 Team Member Block (para Barbershop/RealEstate)

1. Settings → Data Types → **Create** → **Block List**
2. Nombre: `Team Member Block List`
3. Element Type: `TeamMemberBlock`
   ```
   - name (Textstring)
   - role (Textstring)
   - bio (Textarea)
   - photo (Media Picker 3)
   ```

### Paso 3: Crear el Document Type Base

1. Settings → Document Types → Clic derecho → **Create**
2. Nombre: `BaseAffiliate`
3. Icono: 🏢 (selecciona uno relevante)
4. **Tabs/Groups:**

#### Tab: "Content"
```
- brandName (Textstring) - Mandatory
- slug (Textstring) - Mandatory, Pattern: ^[a-z0-9-]+$
- heroImage (Media Picker 3) - Mandatory
- heroTitle (Textstring) - Mandatory
- heroDescription (Textarea) - Mandatory
```

#### Tab: "SEO"
```
- seoTitle (Textstring) - Max 60 caracteres
- seoDescription (Textarea) - Max 160 caracteres
- seoKeywords (Textstring)
- socialImage (Media Picker 3)
```

5. **Structure:**
   - Desmarcar "Allow at root"
   - En "Allowed child node types": dejar vacío (será padre, no hijo)

6. **Save**

### Paso 4: Crear Document Type - Barbershop

1. Settings → Document Types → Clic derecho en **BaseAffiliate** → **Create**
2. Nombre: `Barbershop`
3. Alias: `barbershop` (auto-generado)
4. Icono: ✂️

#### Propiedades Adicionales

**Tab: "Services"**
```
- services (Service Block List) - Mandatory
```

**Tab: "Team"**
```
- teamMembers (Team Member Block List)
```

**Tab: "Gallery"**
```
- workGallery (Multiple Media Picker 3)
```

**Tab: "Contact"**
```
- businessHours (Textarea) - Formato: "Lun-Vie: 9:00-18:00"
- phoneNumber (Textstring)
- email (Email Address)
- address (Textarea)
- googleMapsUrl (Textstring)
```

5. **Permissions:**
   - Settings → Barbershop → **Permissions** tab
   - Marcar **"Allow as root"** (para poder crear en la raíz del Content)

6. **Save**

### Paso 5: Crear Document Type - Restaurant

1. Settings → Document Types → Clic derecho en **BaseAffiliate** → **Create**
2. Nombre: `Restaurant`
3. Alias: `restaurant`
4. Icono: 🍽️

#### Propiedades Adicionales

**Tab: "Menu"**
```
- menuSections (Menu Section Block List) - Mandatory
- featuredDishesTitle (Textstring) - Default: "Especiales del Día"
- featuredDishes (Menu Item Block - reutilizar del Block List)
```

**Tab: "Chef"**
```
- chefName (Textstring)
- chefBio (Rich Text Editor)
- chefPhoto (Media Picker 3)
```

**Tab: "Gallery"**
```
- dishGallery (Multiple Media Picker 3)
```

**Tab: "Reservations"**
```
- reservationInfo (Rich Text Editor)
- reservationPhone (Textstring)
- serviceHours (Textarea)
```

5. **Permissions:**
   - Marcar **"Allow as root"**

6. **Save**

### Paso 6: Crear Document Type - RealEstate

1. Settings → Document Types → Clic derecho en **BaseAffiliate** → **Create**
2. Nombre: `RealEstate`
3. Alias: `realEstate`
4. Icono: 🏠

#### Propiedades Adicionales

**Tab: "Properties"**
```
- propertyListings (Property Block List) - Mandatory
- featuredPropertiesTitle (Textstring) - Default: "Propiedades Destacadas"
```

**Tab: "Agents"**
```
- agents (Team Member Block List)
```

**Tab: "Service Areas"**
```
- serviceAreas (Tags) - Config: Tag Group "Locations"
```

**Tab: "Blog"**
```
- blogPosts (Multi Node Tree Picker) - Start Node: /Blog
```

5. **Permissions:**
   - Marcar **"Allow as root"**

6. **Save**

---

## Enfoque 2: Programático con C# (Recomendado)

Este enfoque permite versionado, CI/CD y mayor consistencia.

### Paso 1: Crear Composer para Document Types

Crea el archivo `Composers/DocumentTypeComposer.cs`:

```csharp
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Umbraco.Extensions;

namespace MaalCaCMS.Composers
{
    public class DocumentTypeComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Components().Append<DocumentTypeComponent>();
        }
    }

    public class DocumentTypeComponent : IComponent
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IDataTypeService _dataTypeService;
        private readonly IShortStringHelper _shortStringHelper;

        public DocumentTypeComponent(
            IContentTypeService contentTypeService,
            IDataTypeService dataTypeService,
            IShortStringHelper shortStringHelper)
        {
            _contentTypeService = contentTypeService;
            _dataTypeService = dataTypeService;
            _shortStringHelper = shortStringHelper;
        }

        public void Initialize()
        {
            CreateBaseAffiliateDocumentType();
            CreateBarbershopDocumentType();
            CreateRestaurantDocumentType();
            CreateRealEstateDocumentType();
        }

        public void Terminate() { }

        private void CreateBaseAffiliateDocumentType()
        {
            const string alias = "baseAffiliate";

            if (_contentTypeService.Get(alias) != null)
                return; // Ya existe

            var baseAffiliate = new ContentType(_shortStringHelper, -1)
            {
                Alias = alias,
                Name = "Base Affiliate",
                Description = "Document Type base para todos los affiliates del ecosistema",
                Icon = "icon-store",
                AllowedAsRoot = false,
                IsElement = false
            };

            // Tab: Content
            var contentTab = "Content";
            baseAffiliate.AddPropertyGroup(contentTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "brandName",
                    Name = "Brand Name",
                    Description = "Nombre de la marca del affiliate",
                    Mandatory = true
                }, contentTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "slug",
                    Name = "Slug",
                    Description = "URL-friendly identifier (ej: pegote, cosina-tina)",
                    Mandatory = true,
                    ValidationRegExp = "^[a-z0-9-]+$"
                }, contentTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "heroImage",
                    Name = "Hero Image",
                    Mandatory = true
                }, contentTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "heroTitle",
                    Name = "Hero Title",
                    Mandatory = true
                }, contentTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "heroDescription",
                    Name = "Hero Description",
                    Mandatory = true
                }, contentTab);

            // Tab: SEO
            var seoTab = "SEO";
            baseAffiliate.AddPropertyGroup(seoTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "seoTitle",
                    Name = "SEO Title",
                    Description = "Máximo 60 caracteres"
                }, seoTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "seoDescription",
                    Name = "SEO Description",
                    Description = "Máximo 160 caracteres"
                }, seoTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "seoKeywords",
                    Name = "SEO Keywords",
                    Description = "Separados por comas"
                }, seoTab);

            baseAffiliate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "socialImage",
                    Name = "Social Sharing Image"
                }, seoTab);

            _contentTypeService.Save(baseAffiliate);
        }

        private void CreateBarbershopDocumentType()
        {
            const string alias = "barbershop";

            if (_contentTypeService.Get(alias) != null)
                return;

            var baseAffiliate = _contentTypeService.Get("baseAffiliate");
            if (baseAffiliate == null)
                throw new Exception("BaseAffiliate document type must exist first");

            var barbershop = new ContentType(_shortStringHelper, baseAffiliate, alias)
            {
                Name = "Barbershop",
                Description = "Document Type para barberías",
                Icon = "icon-scissors",
                AllowedAsRoot = true
            };

            // Tab: Services
            var servicesTab = "Services";
            barbershop.AddPropertyGroup(servicesTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.BlockList")
                {
                    Alias = "services",
                    Name = "Services",
                    Description = "Lista de servicios ofrecidos",
                    Mandatory = true
                }, servicesTab);

            // Tab: Team
            var teamTab = "Team";
            barbershop.AddPropertyGroup(teamTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.BlockList")
                {
                    Alias = "teamMembers",
                    Name = "Team Members"
                }, teamTab);

            // Tab: Gallery
            var galleryTab = "Gallery";
            barbershop.AddPropertyGroup(galleryTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "workGallery",
                    Name = "Work Gallery",
                    Description = "Galería de trabajos realizados"
                }, galleryTab);

            // Tab: Contact
            var contactTab = "Contact";
            barbershop.AddPropertyGroup(contactTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "businessHours",
                    Name = "Business Hours"
                }, contactTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "phoneNumber",
                    Name = "Phone Number"
                }, contactTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.EmailAddress")
                {
                    Alias = "email",
                    Name = "Email"
                }, contactTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "address",
                    Name = "Address"
                }, contactTab);

            barbershop.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "googleMapsUrl",
                    Name = "Google Maps URL"
                }, contactTab);

            _contentTypeService.Save(barbershop);
        }

        private void CreateRestaurantDocumentType()
        {
            const string alias = "restaurant";

            if (_contentTypeService.Get(alias) != null)
                return;

            var baseAffiliate = _contentTypeService.Get("baseAffiliate");
            if (baseAffiliate == null)
                throw new Exception("BaseAffiliate document type must exist first");

            var restaurant = new ContentType(_shortStringHelper, baseAffiliate, alias)
            {
                Name = "Restaurant",
                Description = "Document Type para restaurantes",
                Icon = "icon-restaurant",
                AllowedAsRoot = true
            };

            // Tab: Menu
            var menuTab = "Menu";
            restaurant.AddPropertyGroup(menuTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.BlockList")
                {
                    Alias = "menuSections",
                    Name = "Menu Sections",
                    Mandatory = true
                }, menuTab);

            // Tab: Chef
            var chefTab = "Chef";
            restaurant.AddPropertyGroup(chefTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "chefName",
                    Name = "Chef Name"
                }, chefTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TinyMCE")
                {
                    Alias = "chefBio",
                    Name = "Chef Biography"
                }, chefTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "chefPhoto",
                    Name = "Chef Photo"
                }, chefTab);

            // Tab: Gallery
            var galleryTab = "Gallery";
            restaurant.AddPropertyGroup(galleryTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "dishGallery",
                    Name = "Dish Gallery"
                }, galleryTab);

            // Tab: Contact
            var contactTab = "Contact";
            restaurant.AddPropertyGroup(contactTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TinyMCE")
                {
                    Alias = "reservationInfo",
                    Name = "Reservation Information"
                }, contactTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "phoneNumber",
                    Name = "Phone Number"
                }, contactTab);

            restaurant.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "serviceHours",
                    Name = "Service Hours"
                }, contactTab);

            _contentTypeService.Save(restaurant);
        }

        private void CreateRealEstateDocumentType()
        {
            const string alias = "realEstate";

            if (_contentTypeService.Get(alias) != null)
                return;

            var baseAffiliate = _contentTypeService.Get("baseAffiliate");
            if (baseAffiliate == null)
                throw new Exception("BaseAffiliate document type must exist first");

            var realEstate = new ContentType(_shortStringHelper, baseAffiliate, alias)
            {
                Name = "Real Estate",
                Description = "Document Type para agencias inmobiliarias",
                Icon = "icon-home",
                AllowedAsRoot = true
            };

            // Tab: Properties
            var propertiesTab = "Properties";
            realEstate.AddPropertyGroup(propertiesTab);

            realEstate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.BlockList")
                {
                    Alias = "propertyListings",
                    Name = "Property Listings",
                    Mandatory = true
                }, propertiesTab);

            // Tab: Agents
            var agentsTab = "Agents";
            realEstate.AddPropertyGroup(agentsTab);

            realEstate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.BlockList")
                {
                    Alias = "agents",
                    Name = "Agents"
                }, agentsTab);

            // Tab: Service Areas
            var areasTab = "Service Areas";
            realEstate.AddPropertyGroup(areasTab);

            realEstate.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.Tags")
                {
                    Alias = "serviceAreas",
                    Name = "Service Areas",
                    Description = "Áreas geográficas de servicio"
                }, areasTab);

            _contentTypeService.Save(realEstate);
        }
    }
}
```

### Paso 2: Crear los Element Types para Block Lists

Crea `Composers/ElementTypeComposer.cs`:

```csharp
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;

namespace MaalCaCMS.Composers
{
    public class ElementTypeComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Components().Append<ElementTypeComponent>();
        }
    }

    public class ElementTypeComponent : IComponent
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IShortStringHelper _shortStringHelper;

        public ElementTypeComponent(
            IContentTypeService contentTypeService,
            IShortStringHelper shortStringHelper)
        {
            _contentTypeService = contentTypeService;
            _shortStringHelper = shortStringHelper;
        }

        public void Initialize()
        {
            CreateServiceBlockElementType();
            CreateTeamMemberBlockElementType();
            CreateMenuItemBlockElementType();
            CreatePropertyBlockElementType();
        }

        public void Terminate() { }

        private void CreateServiceBlockElementType()
        {
            const string alias = "serviceBlock";

            if (_contentTypeService.Get(alias) != null)
                return;

            var serviceBlock = new ContentType(_shortStringHelper, -1)
            {
                Alias = alias,
                Name = "Service Block",
                Icon = "icon-settings",
                IsElement = true // IMPORTANTE: Es un Element Type
            };

            serviceBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "serviceName",
                    Name = "Service Name",
                    Mandatory = true
                });

            serviceBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "serviceDescription",
                    Name = "Description",
                    Mandatory = true
                });

            serviceBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "duration",
                    Name = "Duration (e.g., 45 min)"
                });

            serviceBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "price",
                    Name = "Price",
                    Mandatory = true
                });

            _contentTypeService.Save(serviceBlock);
        }

        private void CreateTeamMemberBlockElementType()
        {
            const string alias = "teamMemberBlock";

            if (_contentTypeService.Get(alias) != null)
                return;

            var teamMember = new ContentType(_shortStringHelper, -1)
            {
                Alias = alias,
                Name = "Team Member Block",
                Icon = "icon-user",
                IsElement = true
            };

            teamMember.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "memberName",
                    Name = "Name",
                    Mandatory = true
                });

            teamMember.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "role",
                    Name = "Role/Position"
                });

            teamMember.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "bio",
                    Name = "Biography"
                });

            teamMember.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "photo",
                    Name = "Photo"
                });

            _contentTypeService.Save(teamMember);
        }

        private void CreateMenuItemBlockElementType()
        {
            const string alias = "menuItemBlock";

            if (_contentTypeService.Get(alias) != null)
                return;

            var menuItem = new ContentType(_shortStringHelper, -1)
            {
                Alias = alias,
                Name = "Menu Item Block",
                Icon = "icon-meal",
                IsElement = true
            };

            menuItem.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "dishName",
                    Name = "Dish Name",
                    Mandatory = true
                });

            menuItem.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextArea")
                {
                    Alias = "dishDescription",
                    Name = "Description"
                });

            menuItem.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "price",
                    Name = "Price",
                    Mandatory = true
                });

            menuItem.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TrueFalse")
                {
                    Alias = "isSpecial",
                    Name = "Is Special/Featured?"
                });

            menuItem.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "dishImage",
                    Name = "Dish Image"
                });

            _contentTypeService.Save(menuItem);
        }

        private void CreatePropertyBlockElementType()
        {
            const string alias = "propertyBlock";

            if (_contentTypeService.Get(alias) != null)
                return;

            var propertyBlock = new ContentType(_shortStringHelper, -1)
            {
                Alias = alias,
                Name = "Property Block",
                Icon = "icon-home",
                IsElement = true
            };

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "propertyTitle",
                    Name = "Property Title",
                    Mandatory = true
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TinyMCE")
                {
                    Alias = "propertyDescription",
                    Name = "Description"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "location",
                    Name = "Location"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TextBox")
                {
                    Alias = "price",
                    Name = "Price",
                    Mandatory = true
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.Integer")
                {
                    Alias = "bedrooms",
                    Name = "Bedrooms"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.Integer")
                {
                    Alias = "bathrooms",
                    Name = "Bathrooms"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.Decimal")
                {
                    Alias = "sqMeters",
                    Name = "Square Meters"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.MediaPicker3")
                {
                    Alias = "propertyGallery",
                    Name = "Photo Gallery"
                });

            propertyBlock.AddPropertyType(
                new PropertyType(_shortStringHelper, "Umbraco.TrueFalse")
                {
                    Alias = "isFeatured",
                    Name = "Is Featured Property?"
                });

            _contentTypeService.Save(propertyBlock);
        }
    }
}
```

### Paso 3: Ejecutar y Verificar

1. Asegúrate de que tu proyecto compile:
   ```bash
   dotnet build
   ```

2. Ejecuta el proyecto:
   ```bash
   dotnet run
   ```

3. Ve al Backoffice (`http://localhost:5011/umbraco`)

4. Navega a **Settings → Document Types**
   - Deberías ver `BaseAffiliate`, `Barbershop`, `Restaurant`, `RealEstate`
   - También los Element Types: `ServiceBlock`, `TeamMemberBlock`, etc.

---

## Configuración del Delivery API

El Delivery API ya está habilitado en `Program.cs` (línea 10: `.AddDeliveryApi()`), pero necesitamos configurar acceso público.

### Opción 1: Acceso Público (Sin API Key)

Edita `appsettings.json`:

```json
{
  "Umbraco": {
    "CMS": {
      "DeliveryApi": {
        "Enabled": true,
        "PublicAccess": true,
        "DisableAccessRestrictions": true,
        "ApiKey": "",
        "MemberAuthorization": {
          "Enabled": false
        }
      }
    }
  }
}
```

### Opción 2: Con API Key (Recomendado para Producción)

```json
{
  "Umbraco": {
    "CMS": {
      "DeliveryApi": {
        "Enabled": true,
        "PublicAccess": false,
        "ApiKey": "tu-api-key-segura-aqui",
        "MemberAuthorization": {
          "Enabled": false
        }
      }
    }
  }
}
```

Para usar con API Key, incluye header:
```
Api-Key: tu-api-key-segura-aqui
```

### Configurar Document Types para Delivery API

Por defecto, todos los Document Types están disponibles en Delivery API en Umbraco 15. Si necesitas restringir:

1. Settings → Document Types → [Selecciona el tipo]
2. Tab **Permissions**
3. Sección **Delivery API**:
   - Marcar "Available via Delivery API"
   - Seleccionar propiedades a incluir/excluir

---

## Creación de Contenido de Prueba

### Crear Nodo Pegote Barbershop

1. **Content → Clic derecho → Create → Barbershop**

2. **Tab Content:**
   ```
   Brand Name: Pegote Barbershop
   Slug: pegote
   Hero Title: Estilo Dominicano, Calidad Internacional
   Hero Description: La barbería #1 de Santo Domingo. Más de 10 años perfeccionando tu imagen.
   Hero Image: [Sube una imagen]
   ```

3. **Tab SEO:**
   ```
   SEO Title: Pegote Barbershop - La Mejor Barbería de Santo Domingo
   SEO Description: Barbería profesional en Santo Domingo. Cortes clásicos, fades, diseños y más. 10+ años de experiencia.
   SEO Keywords: barbería santo domingo, corte de pelo, fade, barbershop rd
   ```

4. **Tab Services:**
   - Clic en **Add Content** → Selecciona `Service Block`
   - Servicio 1:
     ```
     Service Name: Corte Clásico
     Description: Corte tradicional con navaja y toalla caliente
     Duration: 45 min
     Price: RD$ 500
     ```
   - Servicio 2:
     ```
     Service Name: Fade + Diseño
     Description: Degradado profesional con diseño personalizado
     Duration: 60 min
     Price: RD$ 700
     ```

5. **Tab Team:**
   - Clic en **Add Content** → `Team Member Block`
   ```
   Name: Carlos 'El Maestro' Pérez
   Role: Master Barber
   Bio: 15 años de experiencia, especialista en fades y cortes clásicos
   Photo: [Sube foto del barbero]
   ```

6. **Tab Gallery:**
   - Sube 5-10 imágenes de trabajos realizados

7. **Tab Contact:**
   ```
   Business Hours: Lun-Vie: 9:00-18:00, Sáb: 9:00-15:00
   Phone Number: +1 809-555-1234
   Email: info@pegotebarbershop.com
   Address: Calle El Conde #123, Zona Colonial, Santo Domingo
   Google Maps URL: https://maps.google.com/...
   ```

8. **Save and Publish** (botón verde arriba a la derecha)

---

## Testing y Validación

### 1. Verificar Estructura de Document Types

Navega a:
```
http://localhost:5011/umbraco/settings/documentTypes
```

Deberías ver:
- ✅ BaseAffiliate
- ✅ Barbershop (extiende BaseAffiliate)
- ✅ Restaurant (extiende BaseAffiliate)
- ✅ RealEstate (extiende BaseAffiliate)

### 2. Probar Delivery API - Listar Todo el Contenido

**Endpoint:**
```
GET http://localhost:5011/umbraco/delivery/api/v2/content
```

**cURL:**
```bash
curl http://localhost:5011/umbraco/delivery/api/v2/content
```

**Respuesta Esperada:**
```json
{
  "total": 1,
  "items": [
    {
      "contentType": "barbershop",
      "name": "Pegote Barbershop",
      "id": "...",
      "properties": {
        "brandName": "Pegote Barbershop",
        "slug": "pegote",
        "heroTitle": "Estilo Dominicano, Calidad Internacional",
        ...
      }
    }
  ]
}
```

### 3. Probar Delivery API - Por Ruta (Path)

**Endpoint:**
```
GET http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote
```

**cURL:**
```bash
curl http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote
```

**Respuesta Esperada:**
```json
{
  "contentType": "barbershop",
  "name": "Pegote Barbershop",
  "id": "d8f5a3c1-...",
  "properties": {
    "brandName": "Pegote Barbershop",
    "slug": "pegote",
    "heroTitle": "Estilo Dominicano, Calidad Internacional",
    "heroDescription": "La barbería #1 de Santo Domingo...",
    "heroImage": [
      {
        "url": "/media/.../hero-image.jpg",
        "width": 1920,
        "height": 1080
      }
    ],
    "services": {
      "contentData": [
        {
          "contentType": "serviceBlock",
          "serviceName": "Corte Clásico",
          "serviceDescription": "Corte tradicional con navaja...",
          "duration": "45 min",
          "price": "RD$ 500"
        },
        {
          "contentType": "serviceBlock",
          "serviceName": "Fade + Diseño",
          "serviceDescription": "Degradado profesional...",
          "duration": "60 min",
          "price": "RD$ 700"
        }
      ]
    },
    "teamMembers": {
      "contentData": [
        {
          "contentType": "teamMemberBlock",
          "memberName": "Carlos 'El Maestro' Pérez",
          "role": "Master Barber",
          "bio": "15 años de experiencia...",
          "photo": [
            {
              "url": "/media/.../carlos.jpg"
            }
          ]
        }
      ]
    },
    "seoTitle": "Pegote Barbershop - La Mejor Barbería...",
    "seoDescription": "Barbería profesional en Santo Domingo..."
  }
}
```

### 4. Probar Delivery API - Por ID

**Endpoint:**
```
GET http://localhost:5011/umbraco/delivery/api/v2/content/item/{guid}
```

**cURL:**
```bash
# Reemplaza {guid} con el ID real del contenido
curl http://localhost:5011/umbraco/delivery/api/v2/content/item/d8f5a3c1-...
```

### 5. Consumir desde Next.js Frontend

Ejemplo de función para tu Next.js app:

```typescript
// src/lib/umbraco/client.ts
const UMBRACO_API_BASE = 'http://localhost:5011/umbraco/delivery/api/v2';

export async function getAffiliateBySlug(slug: string) {
  const response = await fetch(
    `${UMBRACO_API_BASE}/content/item/${slug}`,
    {
      headers: {
        'Accept': 'application/json',
        // Si usas API Key:
        // 'Api-Key': process.env.UMBRACO_API_KEY!
      },
      next: { revalidate: 60 } // ISR cada 60 segundos
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch affiliate: ${response.statusText}`);
  }

  return response.json();
}

// Uso en Server Component:
export default async function BarbershopPage() {
  const data = await getAffiliateBySlug('pegote');

  return (
    <div>
      <h1>{data.properties.heroTitle}</h1>
      <p>{data.properties.heroDescription}</p>
      {/* Renderizar servicios, team, etc. */}
    </div>
  );
}
```

---

## Troubleshooting

### Problema: "Document Type not found in Backoffice"

**Solución:**
1. Verifica que los Composers se ejecutaron:
   - Revisa logs en `umbraco/Logs/`
   - Busca errores relacionados con `DocumentTypeComposer`

2. Si usaste enfoque programático, reinicia la aplicación:
   ```bash
   dotnet clean
   dotnet build
   dotnet run
   ```

### Problema: "Delivery API returns 404"

**Solución:**
1. Verifica que el contenido esté **Published** (no solo guardado)
2. Revisa `appsettings.json` → `DeliveryApi.Enabled: true`
3. Confirma que el slug/path es correcto

### Problema: "CORS error from Next.js"

**Solución:**
Agrega configuración CORS en `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Después de app.Build():
app.UseCors("AllowNextJs");
```

### Problema: "Block List no retorna datos estructurados"

**Solución:**
En Umbraco 15, Block List retorna `contentData` array. Procesa así:

```typescript
const services = data.properties.services.contentData.map((service: any) => ({
  name: service.serviceName,
  description: service.serviceDescription,
  duration: service.duration,
  price: service.price
}));
```

---

## Próximos Pasos

1. ✅ Crear contenido para **Cosina Tina** (Restaurant)
2. ✅ Crear contenido para **MaalCa Properties** (RealEstate)
3. ✅ Configurar Media Types optimizados (WebP, responsive images)
4. ✅ Implementar Content Versioning (ya habilitado)
5. ⚠️ Configurar CDN para imágenes (futuro)
6. ⚠️ Implementar multi-idioma (futuro)

---

## Recursos Adicionales

- **Documentación Oficial Umbraco 15**: https://docs.umbraco.com/umbraco-cms/v/15.latest
- **Delivery API Docs**: https://docs.umbraco.com/umbraco-cms/v/15.latest/reference/delivery-api
- **Block List Editor**: https://docs.umbraco.com/umbraco-cms/v/15.latest/fundamentals/backoffice/property-editors/built-in-umbraco-property-editors/block-editor

---

**Última actualización**: 2025-12-13
**Versión Umbraco**: 15.1.0
**Estado**: ✅ Listo para implementación
