# MaalCaCMS - Documentación y Arquitectura del Proyecto

## Información General

**Nombre del Proyecto:** MaalCaCMS
**Versión:** 1.0.0
**Fecha de Creación:** 11 de Diciembre, 2025
**CMS:** Umbraco CMS 15.1.0
**Framework:** .NET 9.0
**Base de Datos:** Microsoft SQL Server 2022

## Descripción del Proyecto

MaalCaCMS es un sistema de gestión de contenidos basado en Umbraco CMS, diseñado para proporcionar una plataforma robusta y escalable para la administración de contenido web.

---

## Arquitectura del Sistema

### Stack Tecnológico

```
┌─────────────────────────────────────────────────┐
│                  Frontend                        │
│            Umbraco Backoffice                    │
│         (React + TypeScript + C#)                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Application Layer                   │
│              Umbraco CMS 15.1.0                  │
│                  .NET 9.0                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│               Data Layer                         │
│          SQL Server 2022 (Docker)                │
│         Microsoft.Data.SqlClient                 │
└─────────────────────────────────────────────────┘
```

### Componentes Principales

1. **Umbraco CMS**
   - Sistema de gestión de contenidos headless/tradicional
   - API de Delivery para contenido
   - API de Management para administración
   - Backoffice para gestión de contenido

2. **ASP.NET Core**
   - Framework web moderno
   - Middleware personalizable
   - Dependency Injection
   - Logging con Serilog

3. **SQL Server 2022**
   - Base de datos relacional
   - Almacenamiento de contenido
   - Gestión de usuarios y permisos
   - Versionado de contenido

---

## Infraestructura

### Docker Compose

**Archivo:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: maalcacms-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    restart: unless-stopped
    networks:
      - maalcacms-network

volumes:
  sqlserver_data:
    driver: local

networks:
  maalcacms-network:
    driver: bridge
```

### Contenedores

| Servicio | Container Name | Puerto | Estado |
|----------|----------------|--------|--------|
| SQL Server | maalcacms-sqlserver | 1433 | Running |

---

## Configuración

### Cadenas de Conexión

**Archivo:** `appsettings.json`

```json
{
  "ConnectionStrings": {
    "umbracoDbDSN": "Server=localhost,1433;Database=MaalCaCMS;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;",
    "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
  }
}
```

### Configuración de Umbraco

```json
{
  "Umbraco": {
    "CMS": {
      "Global": {
        "Id": "d8d0e7c9-9c6e-4f5a-9d8e-3f4c5b6a7b8c",
        "SanitizeTinyMce": true
      },
      "Content": {
        "AllowEditInvariantFromNonDefault": true,
        "ContentVersionCleanupPolicy": {
          "EnableCleanup": true
        }
      }
    }
  }
}
```

### Logging

Umbraco utiliza Serilog para el logging estructurado:

```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    }
  }
}
```

**Ubicación de Logs:** `umbraco/Logs/UmbracoTraceLog.{MachineName}.{Date}.json`

---

## Estructura del Proyecto

```
MaalCaCMS/
├── Program.cs                          # Punto de entrada de la aplicación
├── MaalCaCMS.csproj                   # Archivo de proyecto .NET
├── appsettings.json                   # Configuración principal
├── appsettings.Development.json       # Configuración de desarrollo
├── docker-compose.yml                 # Configuración de Docker
├── ARQUITECTURA.md                    # Este documento
│
├── Properties/
│   └── launchSettings.json            # Configuración de ejecución
│
├── wwwroot/                           # Archivos estáticos
│   ├── media/                         # Archivos multimedia
│   ├── umbraco/                       # Archivos de Umbraco
│   ├── css/                           # Hojas de estilo
│   └── js/                            # JavaScript
│
├── umbraco/                           # Directorio de Umbraco
│   ├── Data/
│   │   └── Temp/                      # Archivos temporales
│   └── Logs/                          # Logs de aplicación
│
├── bin/                               # Binarios compilados
└── obj/                               # Archivos objeto intermedios
```

---

## Base de Datos

### Información de Conexión

| Parámetro | Valor |
|-----------|-------|
| Host | localhost |
| Puerto | 1433 |
| Usuario | sa |
| Password | YourStrong@Passw0rd |
| Base de Datos | MaalCaCMS |
| Proveedor | Microsoft.Data.SqlClient |

### Esquema

Umbraco crea automáticamente las siguientes tablas principales:

- **umbracoNode**: Árbol de contenido
- **cmsContent**: Contenido de páginas
- **cmsContentType**: Tipos de contenido
- **umbracoUser**: Usuarios del sistema
- **umbracoMedia**: Archivos multimedia
- **umbracoDocument**: Documentos publicados

---

## Puertos y URLs

### Aplicación

| Servicio | Protocolo | Puerto | URL |
|----------|-----------|--------|-----|
| Umbraco Web | HTTP | 5011 | http://localhost:5011 |
| Umbraco Web | HTTPS | 7175 | https://localhost:7175 |
| Umbraco Backoffice | HTTP | 5011 | http://localhost:5011/umbraco |
| Umbraco API | HTTP | 5011 | http://localhost:5011/umbraco/management/api |

### Infraestructura

| Servicio | Puerto |
|----------|--------|
| SQL Server | 1433 |

---

## Comandos Útiles

### Docker

```bash
# Iniciar SQL Server
docker-compose up -d

# Detener SQL Server
docker-compose down

# Ver logs de SQL Server
docker logs maalcacms-sqlserver

# Detener y eliminar todo (incluyendo volúmenes)
docker-compose down -v

# Acceder a SQL Server CLI
docker exec -it maalcacms-sqlserver bash
```

### .NET

```bash
# Compilar el proyecto
dotnet build

# Ejecutar el proyecto
dotnet run

# Ejecutar sin compilar
dotnet run --no-build

# Limpiar archivos compilados
dotnet clean

# Restaurar paquetes NuGet
dotnet restore

# Ver información del proyecto
dotnet --info
```

### SQL Server (dentro del contenedor)

```bash
# Conectar a SQL Server
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C

# Listar bases de datos
SELECT name FROM sys.databases;
GO

# Crear base de datos
CREATE DATABASE MaalCaCMS;
GO

# Usar base de datos
USE MaalCaCMS;
GO
```

---

## Proceso de Instalación

### Instalación Inicial

1. **Iniciar SQL Server:**
   ```bash
   cd C:\Users\apich\MaalCaCMS
   docker-compose up -d
   ```

2. **Esperar a que SQL Server esté listo (30-40 segundos)**

3. **Ejecutar Umbraco:**
   ```bash
   dotnet run
   ```

4. **Acceder al instalador:**
   - Abrir navegador en http://localhost:5011
   - Seguir el asistente de instalación
   - Crear usuario administrador
   - Configurar sitio

### Primera Configuración

1. **Nombre del usuario:** Admin (sugerido)
2. **Email:** admin@maalcacms.local
3. **Contraseña:** (Contraseña segura)
4. **Nombre del sitio:** MaalCa CMS
5. **Plantilla:** Elegir según necesidades

---

## Paquetes NuGet Instalados

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| Umbraco.Cms | 15.1.0 | CMS principal |
| Umbraco.Cms.Api.Delivery | 15.1.0 | API de contenido |
| Umbraco.Cms.Api.Management | 15.1.0 | API de gestión |
| Umbraco.Cms.Imaging.ImageSharp | 15.1.0 | Procesamiento de imágenes |
| Umbraco.Cms.Persistence.SqlServer | 15.1.0 | Persistencia SQL Server |
| Microsoft.Data.SqlClient | (Transitiva) | Cliente SQL Server |
| SixLabors.ImageSharp | 3.1.6 | Librería de imágenes |

---

## Seguridad

### Credenciales

⚠️ **IMPORTANTE:** Las siguientes credenciales son para desarrollo local únicamente.

**SQL Server:**
- Usuario: `sa`
- Password: `YourStrong@Passw0rd`

**Umbraco Backoffice:**
- Se configuran durante la instalación inicial

### Recomendaciones

1. **Cambiar contraseñas en producción**
2. **Usar variables de entorno para credenciales**
3. **Habilitar HTTPS en producción**
4. **Configurar firewall para SQL Server**
5. **Implementar autenticación de dos factores**
6. **Realizar backups regulares**

---

## Troubleshooting

### Error 500 en navegador

**Problema:** "This page isn't working - HTTP ERROR 500"

**Solución:**
1. Verificar que SQL Server esté corriendo:
   ```bash
   docker ps | grep maalcacms-sqlserver
   ```
2. Revisar logs de Umbraco:
   ```bash
   tail -50 umbraco/Logs/UmbracoTraceLog.VOLCOM.*.json
   ```
3. Verificar conectividad a base de datos

### Base de datos no existe

**Problema:** "Cannot open database MaalCaCMS"

**Solución:**
```bash
docker exec maalcacms-sqlserver bash -c "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -C -Q 'CREATE DATABASE MaalCaCMS'"
```

### Puerto 5011 en uso

**Problema:** "Address already in use"

**Solución:**
1. Encontrar el proceso:
   ```bash
   netstat -ano | findstr ":5011"
   ```
2. Detener el proceso o cambiar el puerto en `launchSettings.json`

### SQL Server no inicia

**Problema:** Contenedor se detiene inmediatamente

**Solución:**
1. Ver logs:
   ```bash
   docker logs maalcacms-sqlserver
   ```
2. Verificar que la contraseña cumple con los requisitos de complejidad
3. Reiniciar contenedor:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

## Backup y Restauración

### Backup de Base de Datos

```bash
# Dentro del contenedor
docker exec maalcacms-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -C \
  -Q "BACKUP DATABASE MaalCaCMS TO DISK = '/var/opt/mssql/backup/MaalCaCMS.bak'"

# Copiar backup al host
docker cp maalcacms-sqlserver:/var/opt/mssql/backup/MaalCaCMS.bak ./backups/
```

### Restauración

```bash
# Copiar backup al contenedor
docker cp ./backups/MaalCaCMS.bak maalcacms-sqlserver:/var/opt/mssql/backup/

# Restaurar
docker exec maalcacms-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong@Passw0rd' -C \
  -Q "RESTORE DATABASE MaalCaCMS FROM DISK = '/var/opt/mssql/backup/MaalCaCMS.bak' WITH REPLACE"
```

### Backup de Archivos

```bash
# Backup de media y configuración
tar -czf maalcacms-backup-$(date +%Y%m%d).tar.gz \
  wwwroot/media \
  appsettings.json \
  umbraco/Data
```

---

## Roadmap

### Versión 1.1 (Planificado)

- [ ] Implementar autenticación externa (OAuth/Azure AD)
- [ ] Configurar entorno de staging
- [ ] Implementar CI/CD con GitHub Actions
- [ ] Agregar monitoreo con Application Insights

### Versión 1.2 (Planificado)

- [ ] Implementar CDN para archivos estáticos
- [ ] Configurar cache distribuido (Redis)
- [ ] Implementar búsqueda con Elasticsearch
- [ ] Multi-idioma

---

## Contacto y Soporte

**Documentación Oficial:**
- Umbraco: https://docs.umbraco.com/
- .NET: https://docs.microsoft.com/dotnet/

**Recursos:**
- Umbraco Community: https://our.umbraco.com/
- GitHub Issues: (Agregar repositorio cuando esté disponible)

---

## Changelog

### v1.0.0 - 2025-12-11

**Añadido:**
- Configuración inicial del proyecto
- Integración con SQL Server 2022
- Configuración de Docker Compose
- Estructura base de Umbraco CMS 15.1.0
- Documentación de arquitectura

**Corregido:**
- Error de conexión a base de datos (contraseña SQL Server)
- Creación de directorios requeridos (wwwroot/media, umbraco/Data/Temp)

---

## Licencia

(Agregar información de licencia según corresponda)

---

**Última actualización:** 12 de Diciembre, 2025
**Versión del documento:** 1.0.0
