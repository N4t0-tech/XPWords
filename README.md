# XPWords

Plataforma de aprendizaje de inglés gamificada para la comunidad del servidor de Discord. Los estudiantes ganan XP al completar minijuegos, leer recursos y participar en clases.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite, React Router 7 |
| Backend | Spring Boot 4, Java 21, Maven |
| DB | PostgreSQL (Neon) |
| Migraciones | Flyway |
| Auth | JWT + Discord OAuth2 |
| Deploy backend | Railway (Docker multi-stage) |
| Deploy frontend | Vercel (SPA) |

## Features

- Minijuegos de vocabulario con XP y rachas
- Sistema de niveles y leaderboard
- Login con email o Discord OAuth
- Roles: Estudiante, Profesor, Moderador
- Herramientas de profesor: recursos, clases, solicitudes
- Links de Discord en el perfil

## Estructura

```
xpwords/
├── backend/           # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/com/xpwords/backend/
│   │       │   ├── auth/         # JWT, Discord OAuth
│   │       │   ├── user/         # CRUD, roles, leaderboard
│   │       │   ├── game/         # Minijuegos y puntajes
│   │       │   ├── resource/     # Recursos educativos
│   │       │   ├── classes/      # Clases y solicitudes
│   │       │   ├── xp/           # XP y transacciones
│   │       │   ├── badge/        # Logros
│   │       │   ├── config/       # Security, CORS, JWT
│   │       │   └── common/       # Error handling
│   │       └── resources/
│   │           ├── application.yaml
│   │           └── db/migration/ # Flyway (V1 a V6)
│   ├── Dockerfile
│   ├── .env.example
│   └── pom.xml
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── api/        # Cliente HTTP
│   │   ├── components/ # Navbar, modales, leaderboard
│   │   └── pages/      # Home, perfil, juegos, admin
│   ├── vercel.json
│   └── package.json
└── docs/
    └── DISCORD_AUTH.md # Flujo detallado de OAuth
```

## Quick start

```bash
# Backend (requiere Java 21 + Maven)
cd backend
cp .env.example .env  # completar variables
mvn spring-boot:run

# Frontend
cd frontend
pnpm install
pnpm dev
```

Frontend en `http://localhost:5173`, backend en `http://localhost:3001`.

## Variables de entorno

Backend (`backend/.env`):

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `DATASOURCE_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://host:5432/db` |
| `DATASOURCE_USERNAME` | Usuario DB | `postgres` |
| `DATASOURCE_PASSWORD` | Password DB | |
| `DISCORD_CLIENT_ID` | App ID de Discord | |
| `DISCORD_CLIENT_SECRET` | Secret de Discord | |
| `JWT_SECRET` | Secreto para firmar tokens | |
| `FRONTEND_URL` | URL del frontend | `http://localhost:5173` |
| `BACKEND_URL` | URL del backend | `http://localhost:3001` |

Frontend (`frontend/.env`):

| Variable | Descripción |
|----------|------------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3001/api` |

## Deploy

- **Backend**: Railway con Docker multi-stage. Puerto `3001`, `server.forward-headers-strategy: native`.
- **Frontend**: Vercel como SPA (rewrite todas las rutas a `index.html`).
- **DB**: Neon (PostgreSQL, siempre activo, free tier).

## Discord OAuth

Ver [`docs/DISCORD_AUTH.md`](docs/DISCORD_AUTH.md) para el flujo completo.
