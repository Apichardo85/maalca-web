# Diagramas de Arquitectura - MaalCaCMS

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│                    (Navegador Web)                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ Port 5011 / 7175
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                   ASP.NET Core                                   │
│              Kestrel Web Server                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Umbraco CMS Middleware                     │      │
│  │                                                      │      │
│  │  ├─ Authentication & Authorization                  │      │
│  │  ├─ Routing                                         │      │
│  │  ├─ Static Files                                    │      │
│  │  └─ Error Handling                                  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Umbraco Application                     │      │
│  │                                                      │      │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │      │
│  │  │ Backoffice │  │ Public     │  │ Delivery API │  │      │
│  │  │    API     │  │  Website   │  │              │  │      │
│  │  └────────────┘  └────────────┘  └──────────────┘  │      │
│  │                                                      │      │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │      │
│  │  │  Content   │  │   Media    │  │    Search    │  │      │
│  │  │ Management │  │  Library   │  │   (Examine)  │  │      │
│  │  └────────────┘  └────────────┘  └──────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Data Access Layer                         │      │
│  │                                                      │      │
│  │  └─ Umbraco.Cms.Persistence.SqlServer              │      │
│  │  └─ Microsoft.Data.SqlClient                        │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ TCP/IP
                     │ Port 1433
                     │
┌────────────────────▼────────────────────────────────────────────┐
│              SQL Server 2022 (Docker)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Database: MaalCaCMS                        │      │
│  │                                                      │      │
│  │  ├─ umbracoNode                                     │      │
│  │  ├─ cmsContent                                      │      │
│  │  ├─ cmsContentType                                  │      │
│  │  ├─ umbracoUser                                     │      │
│  │  ├─ umbracoMedia                                    │      │
│  │  └─ ... (otras tablas)                              │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
│  Volume: sqlserver_data                                         │
└──────────────────────────────────────────────────────────────────┘
```

## Diagrama de Flujo de Datos

```
┌──────────┐
│ Usuario  │
└────┬─────┘
     │
     │ 1. Solicitud HTTP
     │
     ▼
┌─────────────────────────────────────────┐
│       Umbraco Frontend/API              │
│                                         │
│  2. Procesa Request                     │
│  3. Valida permisos                     │
│  4. Routing                             │
└────┬────────────────────────────────────┘
     │
     │ 5. Consulta datos
     │
     ▼
┌─────────────────────────────────────────┐
│    Umbraco Content Services             │
│                                         │
│  6. Obtiene contenido                   │
│  7. Aplica transformaciones             │
│  8. Cache (si aplica)                   │
└────┬────────────────────────────────────┘
     │
     │ 9. Query SQL
     │
     ▼
┌─────────────────────────────────────────┐
│       SQL Server Database               │
│                                         │
│  10. Ejecuta query                      │
│  11. Retorna resultados                 │
└────┬────────────────────────────────────┘
     │
     │ 12. Datos
     │
     ▼
┌─────────────────────────────────────────┐
│    Umbraco Content Services             │
│                                         │
│  13. Serializa respuesta                │
│  14. Aplica formatos                    │
└────┬────────────────────────────────────┘
     │
     │ 15. Response
     │
     ▼
┌─────────────────────────────────────────┐
│       Umbraco Frontend/API              │
│                                         │
│  16. Renderiza vista / JSON             │
└────┬────────────────────────────────────┘
     │
     │ 17. HTTP Response
     │
     ▼
┌──────────┐
│ Usuario  │
└──────────┘
```

## Diagrama de Componentes Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Network: maalcacms-network (Bridge)              │    │
│  │                                                    │    │
│  │   ┌──────────────────────────────────────────┐    │    │
│  │   │  Container: maalcacms-sqlserver          │    │    │
│  │   │                                          │    │    │
│  │   │  Image: mcr.microsoft.com/mssql/server  │    │    │
│  │   │         :2022-latest                     │    │    │
│  │   │                                          │    │    │
│  │   │  Env Variables:                          │    │    │
│  │   │  - ACCEPT_EULA=Y                         │    │    │
│  │   │  - SA_PASSWORD=YourStrong@Passw0rd       │    │    │
│  │   │  - MSSQL_PID=Developer                   │    │    │
│  │   │                                          │    │    │
│  │   │  Ports:                                  │    │    │
│  │   │  - 1433:1433                             │    │    │
│  │   │                                          │    │    │
│  │   │  Volumes:                                │    │    │
│  │   │  - sqlserver_data:/var/opt/mssql        │    │    │
│  │   └──────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Volume: sqlserver_data                           │    │
│  │   - Persistencia de datos SQL Server               │    │
│  │   - Backups                                         │    │
│  │   - Logs                                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

                           ▲
                           │ localhost:1433
                           │ (TCP Connection)
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                 Host Machine                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Umbraco Application                              │    │
│  │   (Running on host, not containerized)             │    │
│  │                                                    │    │
│  │   - Port: 5011 (HTTP)                              │    │
│  │   - Port: 7175 (HTTPS)                             │    │
│  │   - Connects to: localhost:1433                    │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Diagrama de Ciclo de Vida de Request

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ GET http://localhost:5011/home
       │
       ▼
┌──────────────────────────────────────────┐
│  Kestrel Web Server                      │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  ASP.NET Core Pipeline                   │
│                                          │
│  1. Authentication Middleware            │
│  2. Routing Middleware                   │
│  3. HTTPS Redirection                    │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Umbraco Middleware                      │
│                                          │
│  4. Umbraco Request Handler              │
│  5. Content Finder                       │
│  6. Template Resolver                    │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Umbraco Services                        │
│                                          │
│  7. Content Service                      │
│  8. Published Content Cache              │
│  9. Data Type Service                    │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Database Layer                          │
│                                          │
│  10. Repository Pattern                  │
│  11. Unit of Work                        │
│  12. SQL Query Execution                 │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  SQL Server                              │
│                                          │
│  13. Execute Query                       │
│  14. Return Results                      │
└──────┬───────────────────────────────────┘
       │
       │ Data flows back up
       ▼
┌──────────────────────────────────────────┐
│  View Rendering                          │
│                                          │
│  15. Load Template/View                  │
│  16. Bind Data to View                   │
│  17. Render HTML                         │
└──────┬───────────────────────────────────┘
       │
       │ HTML Response
       ▼
┌─────────────┐
│   Browser   │
└─────────────┘
```

## Diagrama de Estructura de Archivos

```
MaalCaCMS/
│
├── 📄 Program.cs                    # Entry point
├── 📄 MaalCaCMS.csproj             # Project file
├── 📄 docker-compose.yml           # Docker config
├── 📄 appsettings.json             # App config
├── 📄 appsettings.Development.json # Dev config
├── 📄 README.md                    # Quick start
├── 📄 ARQUITECTURA.md              # Full docs
├── 📄 DIAGRAMAS.md                 # This file
│
├── 📁 Properties/
│   └── 📄 launchSettings.json      # Launch profiles
│
├── 📁 wwwroot/                     # Static files
│   ├── 📁 media/                   # User uploads
│   ├── 📁 umbraco/                 # Umbraco assets
│   ├── 📁 css/                     # Stylesheets
│   └── 📁 js/                      # JavaScript
│
├── 📁 umbraco/                     # Umbraco data
│   ├── 📁 Data/
│   │   └── 📁 Temp/                # Temp files
│   └── 📁 Logs/                    # Application logs
│       └── 📄 UmbracoTraceLog.*.json
│
├── 📁 bin/                         # Compiled binaries
│   └── 📁 Debug/
│       └── 📁 net9.0/
│
└── 📁 obj/                         # Build artifacts
```

## Diagrama de Autenticación y Autorización

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       │ 1. Intenta acceder a /umbraco
       │
       ▼
┌─────────────────────────────────────────┐
│  Authentication Middleware              │
│                                         │
│  2. Verifica cookie de autenticación    │
└──────┬──────────────────┬───────────────┘
       │                  │
       │ No autenticado   │ Autenticado
       │                  │
       ▼                  ▼
┌──────────────┐    ┌──────────────────────┐
│  Redirect to │    │ Authorization Check  │
│  Login Page  │    │                      │
└──────────────┘    │ 3. Verifica permisos │
                    └──────┬───────────────┘
                           │
                           │ Tiene permisos
                           │
                           ▼
                    ┌──────────────────────┐
                    │  Umbraco Backoffice  │
                    │                      │
                    │ 4. Acceso permitido  │
                    └──────────────────────┘
```

## Diagrama de Deployment (Propuesto para Producción)

```
┌───────────────────────────────────────────────────────────────┐
│                     Azure / Cloud Provider                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │               Load Balancer / Azure Front Door        │    │
│  └────────────────────┬─────────────────────────────────┘    │
│                       │                                        │
│       ┌───────────────┼───────────────┐                       │
│       │               │               │                       │
│       ▼               ▼               ▼                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                  │
│  │ App     │    │ App     │    │ App     │                  │
│  │ Service │    │ Service │    │ Service │                  │
│  │ Instance│    │ Instance│    │ Instance│                  │
│  │    1    │    │    2    │    │    3    │                  │
│  └────┬────┘    └────┬────┘    └────┬────┘                  │
│       │              │              │                         │
│       └──────────────┼──────────────┘                         │
│                      │                                        │
│                      ▼                                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         Azure SQL Database / SQL Server              │    │
│  │                                                      │    │
│  │  - Geo-replication                                   │    │
│  │  - Automatic backups                                 │    │
│  │  - Point-in-time restore                             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         Azure Blob Storage / CDN                     │    │
│  │                                                      │    │
│  │  - Media files                                       │    │
│  │  - Static assets                                     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │         Azure Redis Cache                            │    │
│  │                                                      │    │
│  │  - Distributed cache                                 │    │
│  │  - Session state                                     │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

## Diagrama de Seguridad

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 1: Network Security                     │    │
│  │                                                │    │
│  │  • Firewall rules                              │    │
│  │  • Docker network isolation                    │    │
│  │  • Port restrictions (1433, 5011, 7175)        │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 2: Transport Security                   │    │
│  │                                                │    │
│  │  • HTTPS/TLS                                   │    │
│  │  • SQL Server TrustServerCertificate           │    │
│  │  • Encrypted connections                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 3: Authentication                       │    │
│  │                                                │    │
│  │  • Cookie-based authentication                 │    │
│  │  • SQL Server SA authentication                │    │
│  │  • Umbraco user accounts                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 4: Authorization                        │    │
│  │                                                │    │
│  │  • Role-based access control (RBAC)            │    │
│  │  • User permissions                            │    │
│  │  • Content permissions                         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 5: Application Security                 │    │
│  │                                                │    │
│  │  • Input validation                            │    │
│  │  • XSS protection                              │    │
│  │  • CSRF protection                             │    │
│  │  • SQL injection prevention (parameterized)    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 6: Data Security                        │    │
│  │                                                │    │
│  │  • Encrypted storage (at rest)                 │    │
│  │  • Password hashing                            │    │
│  │  • Secure backups                              │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

**Última actualización:** 12 de Diciembre, 2025
**Versión:** 1.0.0
