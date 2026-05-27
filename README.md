# StarPay

Sistema de gestión para instalaciones deportivas con administración de atletas, competiciones, personal y pagos.

---

## Tech Stack

### Frontend
<p>
  <img src="https://img.shields.io/badge/%20-React-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=1E1E1E" alt="React" />
  <img src="https://img.shields.io/badge/%20-TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1E1E1E" alt="TypeScript" />
  <img src="https://img.shields.io/badge/%20-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=1E1E1E" alt="Vite" />
  <img src="https://img.shields.io/badge/%20-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&labelColor=1E1E1E" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/%20-Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white&labelColor=1E1E1E" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/%20-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=1E1E1E" alt="Node.js" />
</p>

### Backend
<p>
  <img src="https://img.shields.io/badge/%20-Python-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1E1E1E" alt="Python" />
  <img src="https://img.shields.io/badge/%20-Django-092E20?style=for-the-badge&logo=django&logoColor=white&labelColor=1E1E1E" alt="Django" />
</p>

### Base de Datos
<p>
  <img src="https://img.shields.io/badge/%20-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=1E1E1E" alt="PostgreSQL" />
</p>

---

## Tech Stack (Detallado)

### Backend
- **Python 3.12+**
- **Django 5.0+**
- **Django REST Framework**
- **PostgreSQL**
- **JWT Authentication (django-rest-framework-simplejwt)**
- **django-cors-headers**
- **python-dotenv**

### Frontend
- **React 19**
- **Vite 6**
- **TypeScript 6**
- **Tailwind CSS 4**
- **Framer Motion** (animaciones)
- **React Router 7**
- **Axios**
- **Sonner** (notificaciones/toast)
- **Recharts** (gráficos)

## Estructura del Proyecto

```
StarPay/
├── backend/                    # Django Backend
│   ├── starpay_core/          # Configuración principal
│   ├── apps/                  # Django Apps
│   │   ├── users/            # Usuarios y autenticación
│   │   ├── athletes/         # Gestión de atletas
│   │   ├── competitions/     # Competiciones y resultados
│   │   ├── staff/            # Personal/instructores
│   │   └── payments/         # Pagos y suscripciones
│   └── manage.py
├── frontend/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── hooks/            # Custom Hooks
│   │   ├── pages/            # Páginas/Rutas
│   │   ├── services/         # Servicios API
│   │   └── types/            # TypeScript types
│   └── package.json
└── venv/                      # Virtual Environment
```

## Requisitos Previos

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- pip / npm

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd StarPay
```

### 2. Backend Setup

#### Crear entorno virtual

```bash
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (CMD)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

#### Instalar dependencias

```bash
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary django-cors-headers python-dotenv
```

#### Crear base de datos PostgreSQL

```sql
CREATE DATABASE starpay_db;
CREATE USER postgres WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE starpay_db TO postgres;
```

#### Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar tus credenciales:

```bash
# En backend/
cp .env.example .env
```

Editar `backend/.env`:

```env
SECRET_KEY=django-insecure-tu-secret-key-aqui
DEBUG=True
DB_NAME=starpay_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### Migraciones y Superusuario

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Ejecución

### Backend (Puerto 8000)

```bash
cd backend
python manage.py runserver
```

- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/

### Frontend (Puerto 5173)

```bash
cd frontend
npm run dev
```

- App: http://localhost:5173

## Características Principales

- **Autenticación JWT**: Login/Logout seguro
- **Dashboard**: Vista general con métricas y gráficos
- **Atletas**: CRUD, búsqueda en tiempo real, filtrado
- **Competiciones**: Gestión de eventos, registro de resultados
- **Personal**: Administración de instructores/staff
- **Pagos**: Seguimiento de suscripciones y pagos
- **UI Moderna**: Glassmorphism, animaciones framer-motion
- **Responsive**: Diseño adaptable mobile/desktop

## Endpoints API Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Iniciar sesión |
| POST | `/api/auth/refresh/` | Refresh token JWT |
| GET | `/api/athletes/` | Lista de atletas |
| POST | `/api/athletes/` | Crear atleta |
| GET | `/api/competitions/` | Lista de competiciones |
| GET/POST | `/api/competitions/{id}/results/` | Resultados |
| GET | `/api/staff/` | Lista de personal |

## Variables de Entorno (.env)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django Secret Key | **requerido** |
| `DEBUG` | Modo debug | `False` |
| `DB_NAME` | Nombre de DB PostgreSQL | **requerido** |
| `DB_USER` | Usuario DB | **requerido** |
| `DB_PASSWORD` | Password DB | **requerido** |
| `DB_HOST` | Host DB | `localhost` |
| `DB_PORT` | Puerto DB | `5432` |
| `ALLOWED_HOSTS` | Hosts permitidos (comma-separated) | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS permitidos | `http://localhost:5173` |

## Build para Producción

### Frontend

```bash
cd frontend
npm run build
```

Output en `frontend/dist/`

### Backend

```bash
# Establecer DEBUG=False
python manage.py collectstatic
```

## Licencia

MIT
