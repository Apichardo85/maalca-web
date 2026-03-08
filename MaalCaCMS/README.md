# MaalCaCMS

Sistema de Gestión de Contenidos basado en Umbraco CMS 15.1.0 y .NET 9.0

## Inicio Rápido

### Prerequisitos

- .NET 9.0 SDK
- Docker Desktop
- Git Bash (Windows)

### Instalación

1. **Iniciar SQL Server:**
   ```bash
   docker-compose up -d
   ```

2. **Ejecutar la aplicación:**
   ```bash
   dotnet run
   ```

3. **Acceder al sitio:**
   - Navegador: http://localhost:5011
   - Backoffice: http://localhost:5011/umbraco

## Configuración

### Base de Datos

- **Host:** localhost:1433
- **Base de datos:** MaalCaCMS
- **Usuario:** sa
- **Password:** YourStrong@Passw0rd

### URLs de la Aplicación

- **Frontend:** http://localhost:5011
- **Backoffice:** http://localhost:5011/umbraco
- **API Management:** http://localhost:5011/umbraco/management/api

## Comandos Principales

```bash
# Desarrollo
dotnet build                    # Compilar
dotnet run                      # Ejecutar
dotnet clean                    # Limpiar

# Docker
docker-compose up -d            # Iniciar servicios
docker-compose down             # Detener servicios
docker-compose down -v          # Detener y eliminar volúmenes
docker logs maalcacms-sqlserver # Ver logs de SQL Server
```

## Estructura del Proyecto

```
MaalCaCMS/
├── Program.cs              # Punto de entrada
├── appsettings.json        # Configuración
├── docker-compose.yml      # Docker
├── wwwroot/                # Estáticos
├── umbraco/                # Datos de Umbraco
└── ARQUITECTURA.md         # Documentación completa
```

## Stack Tecnológico

- **CMS:** Umbraco 15.1.0
- **Framework:** .NET 9.0
- **Base de Datos:** SQL Server 2022
- **Contenedores:** Docker

## 📍 Implementar Document Types

### 🚀 Inicio Rápido (Comienza Aquí)

**Si necesitas crear Document Types para MaalCa Ecosistema:**

1. **Lee primero**: [EMPIEZA-AQUI.md](./EMPIEZA-AQUI.md) ⭐
2. **Sigue**: [PASO-A-PASO-BACKOFFICE.md](./PASO-A-PASO-BACKOFFICE.md) (45 min)
3. **Usa el checklist**: [CHECKLIST-IMPLEMENTACION.md](./CHECKLIST-IMPLEMENTACION.md)

### 📚 Documentación Disponible

| Archivo | Propósito |
|---------|-----------|
| **[EMPIEZA-AQUI.md](./EMPIEZA-AQUI.md)** | 📍 Punto de entrada - **LEE ESTO PRIMERO** |
| **[PASO-A-PASO-BACKOFFICE.md](./PASO-A-PASO-BACKOFFICE.md)** | Guía detallada paso a paso (45 min) |
| **[CHECKLIST-IMPLEMENTACION.md](./CHECKLIST-IMPLEMENTACION.md)** | Checklist visual para imprimir |
| [QUICK-START.md](./QUICK-START.md) | Guía de inicio rápido |
| [UMBRACO-DOCUMENT-TYPES-GUIDE.md](./UMBRACO-DOCUMENT-TYPES-GUIDE.md) | Guía técnica completa |
| [NEXT-JS-INTEGRATION.md](./NEXT-JS-INTEGRATION.md) | Integración con Next.js (tipos TypeScript, API client) |
| [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) | Resumen ejecutivo y troubleshooting |
| [DOCUMENT-TYPES-README.md](./DOCUMENT-TYPES-README.md) | Overview del sistema |

### 🎯 Document Types a Implementar

Para 3 affiliates del ecosistema MaalCa:

- **Pegote Barbershop** - Barbería profesional
- **Cosina Tina** - Restaurante dominicano
- **MaalCa Properties** - Bienes raíces caribeños

### ⚙️ Delivery API

Ya configurado en `appsettings.json`:

```bash
# Listar contenido
curl http://localhost:5011/umbraco/delivery/api/v2/content

# Obtener por slug
curl http://localhost:5011/umbraco/delivery/api/v2/content/item/pegote
```

Script de validación:
```powershell
.\test-api.ps1
```

---

## Documentación General

Para documentación completa de arquitectura, configuración y troubleshooting, ver [ARQUITECTURA.md](./ARQUITECTURA.md)

## Soporte

- [Documentación de Umbraco](https://docs.umbraco.com/)
- [Comunidad Umbraco](https://our.umbraco.com/)
- [.NET Documentation](https://docs.microsoft.com/dotnet/)
