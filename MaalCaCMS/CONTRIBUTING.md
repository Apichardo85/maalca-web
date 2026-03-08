# Guía de Contribución - MaalCaCMS

¡Gracias por tu interés en contribuir a MaalCaCMS! Esta guía te ayudará a empezar.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Solicitar Funcionalidades](#solicitar-funcionalidades)

## Código de Conducta

Este proyecto adhiere a un código de conducta profesional. Al participar, se espera que mantengas este estándar.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con diferentes puntos de vista
- Aceptar críticas constructivas
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

## Cómo Contribuir

### Tipos de Contribuciones

Aceptamos los siguientes tipos de contribuciones:

1. **Corrección de Bugs**
2. **Nuevas Funcionalidades**
3. **Mejoras de Documentación**
4. **Optimizaciones de Rendimiento**
5. **Pruebas Unitarias/Integración**
6. **Mejoras de UI/UX**

## Configuración del Entorno de Desarrollo

### Prerequisitos

- .NET 9.0 SDK o superior
- Docker Desktop
- Git
- Visual Studio 2022 / VS Code / Rider

### Pasos de Configuración

1. **Fork y Clone el Repositorio**
   ```bash
   git clone https://github.com/tu-usuario/MaalCaCMS.git
   cd MaalCaCMS
   ```

2. **Configurar Variables de Entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Iniciar SQL Server**
   ```bash
   docker-compose up -d
   ```

4. **Restaurar Dependencias**
   ```bash
   dotnet restore
   ```

5. **Compilar el Proyecto**
   ```bash
   dotnet build
   ```

6. **Ejecutar la Aplicación**
   ```bash
   dotnet run
   ```

7. **Verificar**
   - Abrir http://localhost:5011
   - Completar instalación de Umbraco si es primera vez

## Estándares de Código

### Convenciones de C#

Seguimos las [Convenciones de Código de C# de Microsoft](https://docs.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions):

```csharp
// ✅ Correcto
public class ContentService
{
    private readonly IContentRepository _contentRepository;

    public ContentService(IContentRepository contentRepository)
    {
        _contentRepository = contentRepository ?? throw new ArgumentNullException(nameof(contentRepository));
    }

    public async Task<Content> GetContentAsync(int id)
    {
        return await _contentRepository.GetByIdAsync(id);
    }
}

// ❌ Incorrecto
public class contentService
{
    private IContentRepository contentRepository;

    public contentService(IContentRepository repo)
    {
        contentRepository = repo;
    }

    public Content GetContent(int id)
    {
        return contentRepository.GetById(id);
    }
}
```

### Nomenclatura

- **PascalCase**: Clases, métodos, propiedades públicas
- **camelCase**: Variables locales, parámetros
- **_camelCase**: Campos privados
- **UPPER_CASE**: Constantes

### Formato

- **Indentación**: 4 espacios (no tabs)
- **Llaves**: En nueva línea (estilo Allman)
- **Línea máxima**: 120 caracteres
- **Usar**: `var` cuando el tipo es obvio

### Comentarios

```csharp
/// <summary>
/// Obtiene el contenido publicado por su ID.
/// </summary>
/// <param name="id">El identificador único del contenido.</param>
/// <returns>El contenido si existe, null en caso contrario.</returns>
public async Task<IPublishedContent?> GetPublishedContentAsync(int id)
{
    // Verificar cache antes de consultar BD
    var cached = _cache.Get<IPublishedContent>(id);
    if (cached != null)
        return cached;

    // Consultar base de datos
    var content = await _repository.GetPublishedAsync(id);

    // Almacenar en cache si se encuentra
    if (content != null)
        _cache.Set(id, content, TimeSpan.FromMinutes(10));

    return content;
}
```

## Proceso de Pull Request

### Antes de Enviar

1. **Asegúrate de que el código compile sin errores**
   ```bash
   dotnet build
   ```

2. **Ejecuta las pruebas**
   ```bash
   dotnet test
   ```

3. **Verifica el estilo de código**
   ```bash
   dotnet format
   ```

### Creando el Pull Request

1. **Crea una rama descriptiva**
   ```bash
   git checkout -b feature/add-multi-language-support
   # o
   git checkout -b fix/login-authentication-error
   ```

2. **Nomenclatura de Ramas**
   - `feature/` - Nuevas funcionalidades
   - `fix/` - Correcciones de bugs
   - `docs/` - Cambios en documentación
   - `refactor/` - Refactorización de código
   - `test/` - Añadir o actualizar pruebas
   - `chore/` - Mantenimiento general

3. **Commits Descriptivos**
   ```bash
   # ✅ Correcto
   git commit -m "feat: add multi-language support for content"
   git commit -m "fix: resolve login authentication timeout issue"
   git commit -m "docs: update installation guide with Docker steps"

   # ❌ Incorrecto
   git commit -m "updates"
   git commit -m "fixed stuff"
   ```

4. **Formato de Commit (Conventional Commits)**
   ```
   <tipo>(<alcance>): <descripción>

   [cuerpo opcional]

   [footer opcional]
   ```

   **Tipos:**
   - `feat`: Nueva funcionalidad
   - `fix`: Corrección de bug
   - `docs`: Documentación
   - `style`: Formato, sin cambios de código
   - `refactor`: Refactorización
   - `test`: Pruebas
   - `chore`: Mantenimiento

5. **Actualiza la Documentación**
   - Actualiza README.md si es necesario
   - Actualiza CHANGELOG.md
   - Añade comentarios de código
   - Actualiza ARQUITECTURA.md para cambios arquitectónicos

6. **Plantilla de Pull Request**

   ```markdown
   ## Descripción
   [Descripción breve de los cambios]

   ## Tipo de Cambio
   - [ ] Bug fix (cambio que corrige un issue)
   - [ ] Nueva funcionalidad (cambio que añade funcionalidad)
   - [ ] Breaking change (cambio que afecta funcionalidad existente)
   - [ ] Documentación

   ## Checklist
   - [ ] Mi código sigue las convenciones del proyecto
   - [ ] He realizado una auto-revisión de mi código
   - [ ] He comentado código complejo
   - [ ] He actualizado la documentación
   - [ ] Mis cambios no generan nuevas advertencias
   - [ ] He añadido pruebas que demuestran que mi fix funciona
   - [ ] Las pruebas unitarias pasan localmente
   - [ ] He actualizado el CHANGELOG.md

   ## Pruebas Realizadas
   [Describe las pruebas realizadas]

   ## Screenshots (si aplica)
   [Añade screenshots de cambios visuales]

   ## Issues Relacionados
   Closes #[número de issue]
   ```

## Reportar Bugs

### Antes de Reportar

1. **Verifica que no esté ya reportado**
2. **Asegúrate de usar la última versión**
3. **Verifica que sea reproducible**

### Plantilla de Reporte de Bug

```markdown
## Descripción del Bug
[Descripción clara y concisa del bug]

## Para Reproducir
Pasos para reproducir:
1. Ir a '...'
2. Hacer click en '...'
3. Scroll down hasta '...'
4. Ver error

## Comportamiento Esperado
[Descripción de lo que esperabas que sucediera]

## Comportamiento Actual
[Descripción de lo que realmente sucede]

## Screenshots
[Si aplica, añade screenshots]

## Entorno
- OS: [e.g. Windows 11]
- Navegador: [e.g. Chrome 120]
- Versión .NET: [e.g. 9.0]
- Versión Umbraco: [e.g. 15.1.0]

## Logs
```
[Pega logs relevantes aquí]
```

## Información Adicional
[Cualquier otro contexto sobre el problema]
```

## Solicitar Funcionalidades

### Plantilla de Feature Request

```markdown
## Descripción de la Funcionalidad
[Descripción clara de la funcionalidad solicitada]

## Problema que Resuelve
[Describe el problema que esta funcionalidad resolvería]

## Solución Propuesta
[Describe cómo imaginas que funcionaría]

## Alternativas Consideradas
[Describe alternativas que hayas considerado]

## Información Adicional
[Cualquier otro contexto, screenshots, mockups, etc.]
```

## Estructura de Carpetas para Contribuciones

```
MaalCaCMS/
├── Controllers/        # Controladores custom de Umbraco
├── Models/            # View models y DTOs
├── Services/          # Lógica de negocio
├── Repositories/      # Acceso a datos
├── Extensions/        # Métodos de extensión
├── Helpers/           # Utilidades
├── Composers/         # Composers de Umbraco
└── Views/             # Vistas Razor
```

## Recursos Útiles

- [Documentación de Umbraco](https://docs.umbraco.com/)
- [Guía de .NET](https://docs.microsoft.com/dotnet/)
- [Convenciones de C#](https://docs.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Preguntas

Si tienes preguntas, puedes:

1. Revisar la documentación en ARQUITECTURA.md
2. Buscar en issues existentes
3. Crear un nuevo issue con la etiqueta `question`

---

¡Gracias por contribuir a MaalCaCMS! 🎉
