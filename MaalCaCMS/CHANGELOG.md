# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [No Publicado]

### Por Añadir
- Autenticación externa (OAuth, Azure AD)
- Entorno de staging
- CI/CD pipeline
- Monitoreo con Application Insights
- Multi-idioma
- CDN para archivos estáticos
- Cache distribuido (Redis)
- Búsqueda con Elasticsearch

## [1.0.0] - 2025-12-11

### Añadido
- Configuración inicial del proyecto Umbraco CMS 15.1.0
- Integración con .NET 9.0
- Configuración de SQL Server 2022 en Docker
- Docker Compose para infraestructura
- Estructura de directorios base (wwwroot, umbraco)
- Configuración de logging con Serilog
- Documentación completa de arquitectura (ARQUITECTURA.md)
- Diagramas de arquitectura (DIAGRAMAS.md)
- README con inicio rápido
- .gitignore para proyecto .NET/Umbraco
- Archivo .env.example para variables de entorno
- Configuración de puertos (5011 HTTP, 7175 HTTPS, 1433 SQL)

### Configurado
- ConnectionStrings para SQL Server
- Configuración de Umbraco CMS (Global, Content)
- Launch settings para desarrollo
- Middleware de Umbraco (BackOffice, Website, API)
- Delivery API para contenido headless
- Management API para administración

### Corregido
- Error de conexión a base de datos SQL Server
  - Problema: Contraseña inicial no cumplía requisitos
  - Solución: Actualizada a `YourStrong@Passw0rd`
- Error 500 al acceder a la aplicación
  - Problema: Base de datos MaalCaCMS no existía
  - Solución: Creada base de datos en SQL Server
- Error de directorios faltantes
  - Problema: wwwroot/media y umbraco/Data/Temp no existían
  - Solución: Creados directorios requeridos

### Seguridad
- Implementado TrustServerCertificate para SQL Server
- Configurado HTTPS redirection
- Añadido .gitignore para evitar commit de archivos sensibles

## [0.1.0] - 2025-12-11

### Añadido
- Creación inicial del proyecto
- Instalación de paquetes NuGet de Umbraco
- Archivo Program.cs básico

---

## Tipos de Cambios

- `Añadido` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Obsoleto` para funcionalidades que serán eliminadas
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de errores
- `Seguridad` para vulnerabilidades

## Links de Versiones

[No Publicado]: https://github.com/username/maalcacms/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/maalcacms/releases/tag/v1.0.0
[0.1.0]: https://github.com/username/maalcacms/releases/tag/v0.1.0
