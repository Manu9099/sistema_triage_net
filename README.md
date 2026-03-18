# 🏥 Sistema Triage Clínico

Sistema fullstack de triage médico con diagnóstico diferencial automatizado, desarrollado con **.NET 10** y **React + TypeScript**. Permite al personal clínico registrar síntomas de pacientes, calcular el nivel de urgencia y obtener diagnósticos diferenciales con probabilidades basadas en reglas clínicas.

🔗 **Demo en producción:** [sistema-triage-api.onrender.com](https://sistema-triage-api.onrender.com)

---

## ✨ Características principales

- **Triage automatizado** con 4 niveles de urgencia (Emergencia, Urgente, Semi-urgente, No urgente)
- **Motor de diagnóstico diferencial** con 30 enfermedades en 6 grupos clínicos
- **Signos vitales** con alertas automáticas por valores fuera de rango
- **Notificaciones en tiempo real** vía SignalR para emergencias
- **3 roles de acceso**: Admin, Staff clínico y Paciente
- **Portal Admin** y **Portal Paciente** con interfaces separadas
- **Historial clínico** completo por paciente
- **Exportar PDF y Excel** de triages y reportes
- **Fotos de perfil** almacenadas en Azure Blob Storage
- **CI/CD automático** con Docker + Render

---

## 🛠️ Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| .NET 10 + ASP.NET Core | API REST |
| Entity Framework Core | ORM + migraciones |
| ASP.NET Identity | Autenticación y roles |
| JWT + Refresh Tokens | Autorización |
| SignalR | Notificaciones en tiempo real |
| FluentValidation | Validación de requests |
| Azure SQL | Base de datos en producción |
| Azure Blob Storage | Almacenamiento de fotos |
| Serilog | Logging estructurado |

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + TypeScript | UI |
| Vite 8 | Build tool |
| Tailwind CSS | Estilos |
| React Router v6 | Navegación y rutas protegidas |
| Axios | Cliente HTTP con interceptors |
| SignalR JS Client | Notificaciones en tiempo real |
| jsPDF | Exportar PDF |
| SheetJS (xlsx) | Exportar Excel |

### Infraestructura
| Tecnología | Uso |
|---|---|
| Docker | Containerización |
| Render | Deploy backend + frontend |
| Azure SQL | Base de datos producción |
| Azure Blob Storage | Almacenamiento de imágenes |
| GitHub Actions | CI/CD |

---

## 🏗️ Arquitectura

```
sistema_triage/
├── sistema_triage.API/          # Controllers, Middleware, Hubs
├── sistema_triage.Application/  # Services, DTOs, Validators, Motor Diagnóstico
├── sistema_triage.Domain/       # Entities, Interfaces, Enums
├── sistema_triage.Infrastructure/ # EF Core, Repositories, Blob Service
└── sistema_triage.Client/       # React + TypeScript (Vite)
```

### Clean Architecture
```
API → Application → Domain
         ↑
   Infrastructure
```

### Motor de diagnóstico diferencial
El sistema incluye un motor propio basado en reglas clínicas que cubre:
- 🫁 **Respiratorias**: Gripe, Neumonía, Asma, Bronquitis, EPOC
- ❤️ **Cardiovasculares**: HTA, Arritmia, SCA, Insuficiencia cardíaca, TEP
- 🫃 **Digestivas**: Gastritis, Apendicitis, Colecistitis, SII, Hepatitis
- 🧠 **Neurológicas**: Migraña, ACV, Epilepsia, Vértigo, Meningitis
- 🦠 **Infecciosas**: Dengue, COVID-19, ITU, Sepsis, Tuberculosis
- 💉 **Metabólicas**: Hipoglucemia, Cetoacidosis, Hipotiroidismo, Hipertiroidismo, ISR

---

## 🚀 Instalación local

### Requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- SQL Server (local o Azure)

### Backend

```bash
# Clonar repositorio
git clone https://github.com/Manu9099/sistema_triage_net.git
cd sistema_triage_net

# Restaurar dependencias
dotnet restore

# Configurar appsettings.json
# Editar sistema_triage.API/appsettings.json con tu connection string

# Aplicar migraciones
dotnet ef database update \
  --project sistema_triage.Infrastructure \
  --startup-project sistema_triage.API

# Ejecutar API
cd sistema_triage.API
dotnet run --no-launch-profile
```

La API estará disponible en `http://localhost:5000`
Documentación Scalar en `http://localhost:5000/scalar/v1`

### Frontend

```bash
cd sistema_triage.Client

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "VITE_API_URL=http://localhost:5000" > .env.development

# Ejecutar
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## ⚙️ Variables de entorno

### Backend (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=SistemaTriage;..."
  },
  "Jwt": {
    "Key": "ClaveSecretaDeAlMenos32Caracteres!",
    "Issuer": "sistema-triage-api",
    "Audience": "sistema-triage-client",
    "ExpirationMinutes": "60"
  },
  "Azure": {
    "BlobConnectionString": "DefaultEndpointsProtocol=https;...",
    "BlobContainerName": "fotos"
  },
  "AdminDefault": {
    "Email": "admin@triage.com",
    "Password": "Admin@12345"
  }
}
```

### Frontend (`.env`)

```env
VITE_API_URL=https://tu-api.onrender.com
```

---

## 🐳 Deploy con Docker

```bash
# Build
docker build -t sistema-triage .

# Run
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Jwt__Key="..." \
  sistema-triage
```

---

## 📡 Endpoints principales

| Método | Endpoint | Descripción | Roles |
|---|---|---|---|
| POST | `/api/auth/login` | Login | Público |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| GET | `/api/pacientes` | Listar pacientes | Admin, Staff |
| POST | `/api/pacientes` | Crear paciente | Admin, Staff |
| PUT | `/api/pacientes/{id}` | Actualizar paciente | Admin, Staff |
| DELETE | `/api/pacientes/{id}` | Desactivar paciente | Admin |
| POST | `/api/pacientes/{id}/foto` | Subir foto | Autenticado |
| GET | `/api/pacientes/mi-perfil` | Perfil del paciente logueado | Paciente |
| POST | `/api/triage` | Registrar triage | Admin, Staff, Paciente |
| GET | `/api/triage/paciente/{id}` | Historial de un paciente | Autenticado |
| GET | `/api/triage/reporte` | Reporte por fechas | Admin, Staff |

---

## 👥 Roles y permisos

| Rol | Acceso |
|---|---|
| **Admin** | Todo el sistema, gestión de usuarios, configuración |
| **Staff** | Ver y gestrar pacientes, registrar triages, ver reportes |
| **Paciente** | Solo sus propios datos, iniciar triage propio |

---

## 📸 Capturas

### Portal Admin
- Dashboard con estadísticas en tiempo real
- Gestión completa de pacientes (crear, editar, eliminar)
- Registro de triage con signos vitales
- Historial clínico por paciente
- Reportes exportables a PDF y Excel
- Notificaciones en tiempo real para emergencias

### Portal Paciente
- Dashboard con indicador visual de urgencia
- Evaluación de síntomas propia
- Historial de triages con diagnósticos
- Perfil editable con foto

---

## 🔒 Seguridad

- JWT con refresh tokens
- Contraseñas hasheadas con ASP.NET Identity
- Validación de inputs con FluentValidation
- Global Exception Middleware (400, 401, 403, 404, 500)
- CORS configurado por entorno
- Firewall de Azure SQL por IP
- Variables de entorno para secretos

---

## 📄 Licencia

MIT License — libre para uso personal y educativo.

---

## 👨‍💻 Autor

**Manu** — Desarrollador fullstack  
[GitHub](https://github.com/Manu9099) · [LinkedIn](https://linkedin.com/in/tu-perfil)
