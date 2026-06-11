# XPWords — Definición Completa del Proyecto

## 1. Descripción General

**XPWords** es una plataforma web gamificada de aprendizaje de inglés, diseñada para una comunidad de Discord. Los estudiantes ganan XP (puntos de experiencia) completando minijuegos de vocabulario, leyendo recursos educativos y participando en clases en vivo. Incluye un sistema completo de roles (Estudiante, Profesor, Moderador), panel de administración para profesores, y un leaderboard competitivo.

**URLs en producción:**
- Frontend: `https://xp-words.vercel.app`
- Backend API: `https://xpwords-production.up.railway.app/api`

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Vite | React 19.2.6, Vite 8.x |
| Routing | React Router | 7.17.0 |
| Backend | Spring Boot + Maven | Spring Boot 4.0.6, Java 21 |
| Base de datos | PostgreSQL | Neon (serverless) |
| Migraciones | Flyway | V1–V11 aplicadas |
| Autenticación | JWT + Discord OAuth2 | JJWT 0.13.0 |
| Deploy backend | Railway | Docker multi-stage |
| Deploy frontend | Vercel | SPA con rewrites |
| Íconos | Tabler Icons | CSS via CDN |

---

## 3. Estructura del Proyecto

```
XPWords/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/xpwords/backend/
│   │   ├── BackendApplication.java   # Entry point + dotenv loader
│   │   ├── auth/                     # JWT, Discord OAuth, login/register
│   │   ├── config/                   # Security, CORS, JWT config, App beans
│   │   ├── user/                     # User entity, CRUD, admin, leaderboard
│   │   ├── word/                     # Word entity, CRUD por gameType
│   │   ├── game/                     # GameResult, submit score, XP + badges
│   │   ├── resource/                 # Educational resources CRUD
│   │   ├── badge/                    # Badge entity, UserBadge, assign/auto
│   │   ├── classes/                  # Class + ClassRequest entities
│   │   ├── xp/                       # XP transactions history
│   │   └── common/                   # ErrorResponse, GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── application.yaml
│   │   └── db/migration/             # V1__init.sql ... V11__seed_*.sql
│   ├── Dockerfile                    # Multi-stage build
│   ├── docker-compose.yml            # PostgreSQL local
│   └── pom.xml
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── api/client.js             # HTTP client con JWT + 401 handling
│   │   ├── App.jsx                   # Root: auth state, routing, view mode
│   │   ├── pages/                    # 15 page components
│   │   └── components/               # 18 reusable components
│   ├── vercel.json                   # SPA rewrites
│   ├── vite.config.js
│   └── package.json
└── docs/DISCORD_AUTH.md              # OAuth flow documentation
```

---

## 4. Backend — Arquitectura Detallada

### 4.1 Capa de Configuración (`config/`)

**SecurityConfig.java** — Configuración de seguridad Spring:
- Sesiones **stateless** (sin `HttpSession`)
- CSRF deshabilitado (API REST)
- CORS configurado dinámicamente desde `app.frontend-url`
- Mapa de endpoints públicos vs. protegidos por rol:
  - **Públicos**: `/api/auth/**`, `/api/leaderboard`, `/api/stats`, `GET /api/resources/**`, `GET /api/badges`
  - **Estudiante (authenticated)**: `/api/games/**`, `/api/words`, `/api/users/me`, `/api/xp/**`, `/api/class-requests` (POST/GET)
  - **Profesor/Moderador**: CRUD de palabras, recursos, medallas, clases, solicitudes, listado de estudiantes
  - **Moderador only**: `/api/admin/**`
- Discord OAuth2 login con `DiscordAuthSuccessHandler`
- Filtro JWT antes de `UsernamePasswordAuthenticationFilter`

**CorsConfig.java** — `CorsConfigurationSource` bean usando `app.frontend-url`.
**JwtConfig.java** — `@ConfigurationProperties(prefix = "app.jwt")` con `secret` y `expirationMs`.
**AppConfig.java** — Beans: `PasswordEncoder` (BCrypt), `RestTemplate`.

### 4.2 Capa de Autenticación (`auth/`)

**AuthController.java**:
- `POST /api/auth/register` — Registro con rate limiting (3/min por IP)
- `POST /api/auth/login` — Login con rate limiting (5/min por IP)
- `POST /api/auth/discord` — Desvincular Discord
- Rate limiting: `ConcurrentHashMap<String, List<Long>>` en memoria

**AuthService.java**:
- Register: verifica email único, encodea password, asigna rol (STUDENT por defecto), genera JWT
- Login: valida credenciales, genera JWT
- `rememberMe=true` → token expira en 30 días; `false` → 24 horas

**JwtTokenProvider.java**:
- HMAC-SHA desde bytes del secret (NO Base64)
- `generateToken(userId, role, rememberMe)` — claims: `sub=userId`, `role=role`
- `validateToken()`, `getUserIdFromToken()`, `getRoleFromToken()`

**JwtAuthenticationFilter.java**:
- `OncePerRequestFilter`: extrae `Authorization: Bearer <token>`
- Valida token, setea `UsernamePasswordAuthenticationToken` con:
  - Principal: `userId` como String
  - Authority: `ROLE_<role>` (ej: `ROLE_TEACHER`)

**DiscordAuthSuccessHandler.java**:
- Recibe callback de Discord OAuth2
- Extrae `id`, `username`, `email`, `avatar` del `OAuth2User`
- Busca usuario por `discordId` o email; si no existe, crea uno nuevo
- Genera JWT y redirige a `{frontendUrl}/auth/callback?token=...`

**DiscordLinkController.java**:
- `GET /api/users/me/discord/link` — Devuelve URL de autorización de Discord con `nonce` en state
- `GET /api/auth/discord/callback` — Maneja el code exchange, vincula Discord a cuenta existente

**DTOs**: `LoginRequest`, `RegisterRequest`, `AuthResponse`

### 4.3 Capa de Usuarios (`user/`)

**User.java** (entidad `users`):
- `id` (Long, auto), `email`, `password` (hasheada), `name`, `discordId`, `discordTag`, `discordAvatar`, `level` (default 1), `xp` (default 0), `role` (STUDENT/TEACHER/MODERATOR), `avatarBg` (color para initial avatar), `createdAt`, `updatedAt`
- `@PrePersist` / `@PreUpdate` para timestamps

**UserRepository.java**: `findByEmail()`, `findByDiscordId()`, `existsByEmail()`, `findByRole()`

**UserController.java**:
- `GET /api/users/me` — Perfil del usuario autenticado
- `GET /api/users/students` — Solo TEACHER/MODERATOR
- `GET /api/users/teachers` — Cualquier autenticado
- `PUT /api/users/me` — Actualizar nombre/email
- `PUT /api/users/me/set-password` — Discord users setean password
- `PUT /api/users/me/password` — Cambiar password (requiere current)
- `DELETE /api/users/me` — Eliminar cuenta

**AdminController.java** — MODERATOR only:
- `GET /api/admin/users` — Listar todos los usuarios
- `PUT /api/admin/users/{id}/role` — Cambiar rol de cualquier usuario

**LeaderboardController.java** — Público:
- `GET /api/leaderboard` — Todos los usuarios ordenados por XP descendente, con rank
- `GET /api/stats` — `activeMembers` count, `games` (4), `resources` (5)

### 4.4 Capa de Juegos (`game/`)

**GameController.java**:
- `POST /api/games/score` — Envía resultado de partida
- `GET /api/games/history` — Historial del usuario

**GameService.java** (único service además de BadgeService):
- `@Transactional submitScore()`:
  1. Busca usuario por userId
  2. Crea `GameResult` (gameType, score, streak, round)
  3. Suma XP al usuario: `user.xp += request.score`
  4. Recalcula nivel: `level = xp / 100 + 1`
  5. Crea `XpTransaction` con source="GAME"
  6. Auto-asigna medalla "Primer juego" si es la primera partida (`countByUserId == 1`)
  7. Auto-asigna medalla "Nivel 10" si `level >= 10`

**GameResult.java** (entidad `game_results`): id, user (ManyToOne), gameType, score, streak, round, createdAt

### 4.5 Capa de Palabras (`word/`)

**Word.java** (entidad `words`): id, word, hint, options (JSONB), correctIndex, gameType (default "wordsnap")

**WordController.java**:
- `GET /api/words?gameType=` — Filtra por tipo de juego
- CRUD completo: POST, PUT, DELETE (solo TEACHER/MODERATOR)

### 4.6 Capa de Recursos (`resource/`)

**Resource.java** (entidad `resources`): id, title, category, meta, type (flash/pdf/video/link), btn, url

**ResourceController.java**:
- `GET /api/resources?category=` — Filtro por categoría
- `GET /api/resources/categories` — Devuelve `["Todos","Gramatica","Vocabulario","Listening","Writing"]`
- CRUD completo (escritura solo TEACHER/MODERATOR)

### 4.7 Capa de Medallas (`badge/`)

**Badge.java** (entidad `badges`): id, name, icon (nombre de Tabler Icon), description

**UserBadge.java** (entidad `user_badges`): `@EmbeddedId UserBadgeId(userId, badgeId)`, earnedAt

**BadgeService.java**:
- `assignBadgeIfNotOwned(userId, badgeName)`: busca badge por nombre, verifica que no esté asignada, crea UserBadge

**BadgeController.java**:
- `GET /api/badges` — Todas las medallas (público)
- `GET /api/badges/mine` — Medallas del usuario (authenticated)
- `GET /api/badges/user/{userId}` — Medallas de un estudiante (TEACHER/MODERATOR)
- CRUD completo + `POST /api/badges/assign` + `DELETE /api/badges/assign/{userId}/{badgeId}`

### 4.8 Capa de Clases (`classes/`)

**Class.java** (entidad `classes`): id, title, description, date, teacherId, createdAt, updatedAt

**ClassRequest.java** (entidad `class_requests`): id, studentId, teacherId, topic, message, status (PENDING/APPROVED/REJECTED), requestedDate, createdAt, updatedAt

**ClassController.java**: CRUD de clases (solo TEACHER/MODERATOR)

**ClassRequestController.java**:
- `GET /api/class-requests?as=student|teacher` — Filtra según vista (para moderadores que pueden ver ambas)
- `POST /api/class-requests` — Estudiante crea solicitud
- `PUT /api/class-requests/{id}/status` — Profesor aprueba/rechaza; al aprobar, auto-asigna medalla "Primera clase"

### 4.9 Capa de XP (`xp/`)

**XpTransaction.java** (entidad `xp_transactions`): id, user (ManyToOne), amount, source ("GAME"/"LESSON"/"RESOURCE"/"BADGE"), description, createdAt

**XpController.java**: `GET /api/xp/history` — Transacciones del usuario ordenadas por fecha descendente

### 4.10 Common

**GlobalExceptionHandler.java** — `@RestControllerAdvice`:
- `IllegalArgumentException` → 400
- `BadCredentialsException` → 401
- `MethodArgumentNotValidException` → 400 con errores de campo
- `Exception` genérica → 500

---

## 5. Base de Datos — Migraciones Flyway

**V1** `__init_schema.sql`: Tablas `users`, `words`, `game_results`, `resources`, `badges`, `user_badges`, `xp_transactions` con índices.

**V2** `__seed_data.sql`: 21 palabras WordSnap, 6 badges (`Primer juego`, `Nivel 5`, `Nivel 10`, `Nivel 25`, `Nivel 50`, `Coleccionista`), 5 recursos.

**V3** `__add_role_to_users.sql`: Columna `role VARCHAR(20) DEFAULT 'STUDENT'`.

**V4** `__add_classes.sql`: Tabla `classes` (title, description, date, teacherId).

**V5** `__add_class_requests.sql`: Tabla `class_requests` (studentId, teacherId, topic, message, status, requestedDate).

**V6** `__add_discord_avatar.sql`: Columna `discord_avatar VARCHAR(255)`.

**V7** `__add_quizzes.sql`: Tablas `quizzes` y `quiz_words` (posteriormente deprecadas).

**V8** `__add_game_type_to_words.sql`: Columna `game_type VARCHAR(20) DEFAULT 'wordsnap'`.

**V9** `__drop_quizzes.sql`: Elimina `quiz_words` y `quizzes`.

**V10** `__redistribute_words_to_games.sql`: Asigna 13 palabras a `linkwords`.

**V11** `__seed_sentencefix_and_listenup.sql`: 10 palabras SentenceFix + 10 palabras ListenUp.

### Decisiones clave sobre DB:
- Sin entidades Quiz/QuizWord: `gameType` en `words` asocia palabras a juegos, simplificando el modelo
- `options` es JSONB: cada juego interpreta las opciones según su mecánica
- Nivel derivado: `level = xp / 100 + 1` (nunca se persiste directamente)

---

## 6. Frontend — Arquitectura Detallada

### 6.1 Gestión de Estado (App.jsx)

**Sin context providers ni store global** — todo el estado vive en `App.jsx` con prop drilling:

- `isLoggedIn`, `user`, `authMode`, `checkingAuth`, `viewMode`
- Al montar: lee `localStorage.getItem('token')`, llama a `GET /users/me` para validar
- `effectiveView`: STUDENT → siempre "student"; TEACHER → siempre "teacher"; MODERATOR → `viewMode` (almacenado en localStorage, con toggle en Navbar)
- Evento `user-updated`: se dispara desde los juegos al enviar score para refrescar perfil

### 6.2 API Client (`api/client.js`)

- `BASE_URL` = `VITE_API_URL` o `http://localhost:3001/api`
- Métodos: `api.get()`, `api.post()`, `api.put()`, `api.delete()`
- Adjunta `Authorization: Bearer <token>` automáticamente
- 401 → limpia token y redirige a `/`
- 429 → lanza error "Demasiados intentos"
- Parsea errores del backend

### 6.3 Routing

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | Landing (o redirige a /home) | Público |
| `/auth/callback` | AuthCallback | Público (OAuth landing) |
| `/home` | Home | Authenticated |
| `/games` | Games | Authenticated |
| `/resources` | Resources | Authenticated |
| `/profile` | Profile | Authenticated |
| `/requests` | StudentRequests | Authenticated |
| `/teacher/resources` | TeacherResources | Teacher view |
| `/teacher/classes` | TeacherClasses | Teacher view |
| `/teacher/quizzes` | TeacherQuizzes | Teacher view |
| `/teacher/badges` | TeacherBadges | Teacher view |
| `/teacher/students` | TeacherStudents | Teacher view |
| `/teacher/requests` | TeacherRequests | Teacher view |
| `*` | NotFound | Público |

Nota: `TeacherWords.jsx` existe pero NO está ruteado — su funcionalidad fue absorbida por `TeacherQuizzes.jsx`.

### 6.4 Componentes (18 total)

**Navegación y UI:**
- **Navbar.jsx**: Logo XPWords, tabs según vista (estudiante: Minijuegos, Recursos, Solicitudes; profesor: Alumnos, Minijuegos, Medallas, Recursos, Clases, Solicitudes), toggle Moderador (Profe/Alumno), UserChip con enlace a perfil
- **AuthGuard.jsx**: Redirige a `/` si no está logueado
- **AuthModal.jsx**: Login/Register con tabs, campos con validación, remember-me, botón Discord OAuth, manejo de errores
- **UserChip.jsx**: Avatar (Discord o iniciales), nombre, nivel/XP
- **SectionHeader.jsx**: Ícono Tabler + label
- **CollapsiblePanel.jsx**: Sección expandible con ícono y chevron
- **Toast.jsx**: Notificación auto-dismissable (2s)
- **Tutorial.jsx**: Overlay multi-step con navegación prev/next/start

**Perfil:**
- **ProfileCard.jsx**: Avatar, nombre, Discord tag, nivel, título (Novato→Leyenda), barra de XP
- **Badge.jsx**: Ícono + nombre de medalla
- **HistoryRow.jsx**: Transacción XP con ícono de fuente
- **ProfileSettings.jsx**: Editar nombre/email
- **AccountSettings.jsx**: Rol, conectar/desconectar Discord, setear/cambiar password, logout, eliminar cuenta
- **ChangePasswordModal.jsx**: Password actual + nuevo + confirmar
- **SetPasswordModal.jsx**: Para usuarios de Discord
- **DeleteAccountModal.jsx**: Tipear "ELIMINAR" para confirmar

**Juegos:**
- **GameCard.jsx**: Ícono, título, descripción, XP, badge de dificultad
- **MiniGame.jsx** — WordSnap
- **LinkWords.jsx**
- **SentenceFix.jsx**
- **ListenUp.jsx**

**Otros:**
- **Leaderboard.jsx**: Lista rankeada con avatares Discord o iniciales
- **ResourceItem.jsx**: Card de recurso con ícono de tipo

### 6.5 Páginas (15 total)

**Landing.jsx**: Hero "Sube de nivel en inglés", CTA login/register, feature cards, footer con link a Discord

**Home.jsx**: Fetch `/api/stats` + `/api/leaderboard`, muestra estadísticas y leaderboard

**Games.jsx**: 4 game cards en grid. Al hacer click, renderiza el componente del juego como overlay (modal). Orden aleatorio no cíclico: shuffle inicial al cargar palabras, re-shuffle al agotar.

**Resources.jsx**: Fetch resources + categories. Filtro por categoría (tabs). Renderiza `ResourceItem`.

**Profile.jsx**: `ProfileCard`, medallas ganadas, historial XP, settings colapsables.

**StudentRequests.jsx**: Formulario para solicitar clase (seleccionar profesor, tema, mensaje, fecha). Lista de solicitudes enviadas con estado.

**AuthCallback.jsx**: Lee `?token=` de URL, llama a `onLogin(token)`, navega a `/home`.

**NotFound.jsx**: 404 con link "Volver al inicio".

**TeacherResources.jsx**: CRUD recursos: lista, modal crear/editar (title, category, meta, type, btn, url), delete.

**TeacherClasses.jsx**: CRUD clases: lista con formato de fecha, modal crear (title, description, datetime), delete.

**TeacherBadges.jsx**: CRUD medallas: lista con vista previa de ícono, modal crear/editar (name, icon de 20 Tabler Icons, description), delete.

**TeacherStudents.jsx**: Tabla de estudiantes (nombre, email, nivel, XP, medallas, Discord). Modal para asignar/remover medallas.

**TeacherRequests.jsx**: Lista solicitudes de clase. Botones Approve/Reject.

**TeacherQuizzes.jsx**: Selector de juego (4 tarjetas) → `WordEditor` sub-componente para CRUD de palabras por gameType, con opciones dinámicas (inputs A/B/C/D con radio para correcta, botón + para añadir/quitar opciones).

---

## 7. Minijuegos — Mecánicas Detalladas

### 7.1 WordSnap (`MiniGame.jsx`)
- **Mecánica**: Muestra palabra en inglés + 4 opciones de significado en español
- **Timer**: 10 segundos por palabra (se reinicia en cada nueva palabra)
- **Vidas**: 3 (se pierde una al responder mal o timeout)
- **Puntaje**: +50 XP por acierto, +25 XP extra cada 3 aciertos consecutivos
- **Orden**: Secuencial sobre array, con re-shuffle no-cíclico cuando se agotan todas

### 7.2 LinkWords (`LinkWords.jsx`)
- **Mecánica**: 4 definiciones en español (izquierda) ↔ 4 palabras en inglés (derecha). Seleccionar definición, luego palabra correspondiente
- **Timer**: 60 segundos por ronda
- **Vidas**: 3 (globales, se pierden con errores)
- **Puntaje**: +75 XP por match, +50 XP bonus por ronda perfecta (0 errores)
- **Orden**: 4 pares únicos por ronda, tracking de palabras usadas, re-shuffle al agotar pool

### 7.3 SentenceFix (`SentenceFix.jsx`)
- **Mecánica**: Palabras desordenadas en pool inferior. Arrastrar o clickear para colocarlas en slots superiores formando la oración correcta
- **Input**: Drag & drop HTML5 nativo + click/tap fallback (seleccionar palabra → marca verde → click en slot vacío)
- **Swap**: Click en palabra colocada la devuelve al pool; swap entre dos slots
- **Timer**: 30 segundos por oración
- **Vidas**: 3
- **Puntaje**: +100 XP por oración correcta, +25 XP cada 3 racha
- **Verificación**: Botón "VERIFICAR" solo cuando todos los slots están llenos

### 7.4 ListenUp (`ListenUp.jsx`)
- **Mecánica**: Parlante clickeable que reproduce palabra en inglés via `SpeechSynthesis` (TTS nativo del browser, voz inglesa). 4 opciones multiple choice
- **Timer**: 12 segundos. **Postergado**: arranca SOLO cuando el usuario hace click en el parlante por primera vez (idle timeout de 20s si no toca)
- **Vidas**: 3
- **Puntaje**: +80 XP por acierto, +25 XP cada 3 racha
- **Reproducción**: Se puede escuchar múltiples veces. `speechSynthesis.cancel()` al responder

### Patrón común en todos los juegos:
- 3 estados: `welcome` (pantalla inicio + tutorial), `playing` (juego activo), `gameover` (stats + retry)
- Al `gameover`: `POST /api/games/score` con gameType, score, streak, round
- Disparan evento `user-updated` para refrescar perfil
- Tutorial multi-step opcional (vía componente `Tutorial`)
- `.catch(() => {})` silencioso en llamadas API (error handling pendiente de mejorar)

---

## 8. Sistema de Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **STUDENT** | Jugar minijuegos, ver leaderboard, ver recursos, ver perfil, enviar solicitudes de clase, ver medallas propias |
| **TEACHER** | Todo lo de STUDENT + CRUD palabras, CRUD recursos, CRUD medallas, CRUD clases, gestionar solicitudes, ver estudiantes, asignar medallas |
| **MODERATOR** | Todo lo de TEACHER + toggle vista Profe/Alumno + CRUD usuarios + cambiar roles via `/api/admin/**` |

---

## 9. Sistema de Medallas (Semi-Automático)

### Automáticas (detectadas en backend):
- **"Primer juego"**: Asignada en `GameService.submitScore()` cuando `countByUserId == 1`
- **"Nivel 10"**: Asignada en `GameService.submitScore()` cuando `level >= 10` después de sumar XP
- **"Primera clase"**: Asignada en `ClassRequestController` al aprobar una solicitud

### Manuales (desde panel profesor):
- Desde `TeacherStudents.jsx`: modal con lista de medallas disponibles, asignar/remover
- Endpoint: `POST /api/badges/assign` y `DELETE /api/badges/assign/{userId}/{badgeId}`

### Medallas seed (V2): Primer juego, Nivel 5, Nivel 10, Nivel 25, Nivel 50, Coleccionista

---

## 10. Deployment

### Backend (Railway, Docker multi-stage):
- **Stage 1 build**: `maven:3.9-eclipse-temurin-21` compila con `mvn package -DskipTests`
- **Stage 2 runtime**: `eclipse-temurin:21-jre`, copia JAR, expone puerto 3001
- `server.forward-headers-strategy: native` necesario para HTTPS en Railway
- Variables de entorno: `DATASOURCE_*`, `DISCORD_CLIENT_*`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`

### Frontend (Vercel):
- Build: `npm run build` (Vite produce `dist/`)
- `vercel.json` con SPA rewrites: todas las rutas a `/index.html`
- Variable: `VITE_API_URL = https://xpwords-production.up.railway.app/api`

### Base de datos (Neon):
- PostgreSQL serverless, tier gratis "always-on"
- Flyway V1-V11 aplicadas, `ddl-auto: validate`

---

## 11. Decisiones Técnicas Clave

1. **Sin entidades Quiz/QuizWord**: `gameType` en `words` asocia palabras a juegos. Los antiguos `quizzes`/`quiz_words` (V7) fueron eliminados (V9).
2. **Sin context providers**: Todo el estado de auth vive en `App.jsx` con prop drilling. No hay Redux ni Context API.
3. **State colocation**: Cada página maneja su propio fetching y estado local.
4. **Fórmula de nivel**: `level = xp / 100 + 1` — cada nivel requiere 100 XP.
5. **Rate limiting**: `ConcurrentHashMap` en memoria en `AuthController` (5/min login, 3/min register por IP).
6. **No service layer general**: Solo `GameService` y `BadgeService` existen como servicios dedicados; otros controllers inyectan repositories directamente.
7. **SentenceFix**: Drag & drop HTML5 nativo + click/tap fallback. Sin dependencias externas. Pool + slots con swap.
8. **ListenUp**: `SpeechSynthesis` API del navegador — gratuito, offline, sin APIs externas.
9. **Orden aleatorio no cíclico**: Se barajan todas las palabras al iniciar; al agotarse el orden actual, se re-barajan.
10. **MODERATOR + filtro `?as=student|teacher`**: Los moderadores pueden ver solicitudes como estudiante o como profesor según el toggle de vista, no por su rol JWT.

---

## 12. Mapa Completo de Endpoints API

| Método | Endpoint | Controlador | Roles |
|--------|----------|------------|-------|
| POST | `/api/auth/register` | AuthController | Público |
| POST | `/api/auth/login` | AuthController | Público |
| POST | `/api/auth/discord` | AuthController | Autenticado |
| GET | `/api/auth/discord/callback` | DiscordLinkController | Público |
| GET | `/api/leaderboard` | LeaderboardController | Público |
| GET | `/api/stats` | LeaderboardController | Público |
| GET | `/api/resources` | ResourceController | Público |
| GET | `/api/resources/categories` | ResourceController | Público |
| GET | `/api/badges` | BadgeController | Público |
| GET | `/api/badges/mine` | BadgeController | Autenticado |
| GET | `/api/badges/user/{userId}` | BadgeController | TEACHER/MODERATOR |
| POST | `/api/badges` | BadgeController | TEACHER/MODERATOR |
| PUT | `/api/badges/{id}` | BadgeController | TEACHER/MODERATOR |
| DELETE | `/api/badges/{id}` | BadgeController | TEACHER/MODERATOR |
| POST | `/api/badges/assign` | BadgeController | TEACHER/MODERATOR |
| DELETE | `/api/badges/assign/{userId}/{badgeId}` | BadgeController | TEACHER/MODERATOR |
| GET | `/api/users/me` | UserController | Autenticado |
| PUT | `/api/users/me` | UserController | Autenticado |
| PUT | `/api/users/me/password` | UserController | Autenticado |
| PUT | `/api/users/me/set-password` | UserController | Autenticado |
| DELETE | `/api/users/me` | UserController | Autenticado |
| GET | `/api/users/students` | UserController | TEACHER/MODERATOR |
| GET | `/api/users/teachers` | UserController | Autenticado |
| GET | `/api/users/me/discord/link` | DiscordLinkController | Autenticado |
| GET | `/api/words` | WordController | Autenticado |
| POST | `/api/words` | WordController | TEACHER/MODERATOR |
| PUT | `/api/words/{id}` | WordController | TEACHER/MODERATOR |
| DELETE | `/api/words/{id}` | WordController | TEACHER/MODERATOR |
| POST | `/api/games/score` | GameController | Autenticado |
| GET | `/api/games/history` | GameController | Autenticado |
| POST | `/api/resources` | ResourceController | TEACHER/MODERATOR |
| PUT | `/api/resources/{id}` | ResourceController | TEACHER/MODERATOR |
| DELETE | `/api/resources/{id}` | ResourceController | TEACHER/MODERATOR |
| GET | `/api/classes` | ClassController | TEACHER/MODERATOR |
| POST | `/api/classes` | ClassController | TEACHER/MODERATOR |
| DELETE | `/api/classes/{id}` | ClassController | TEACHER/MODERATOR |
| GET | `/api/class-requests` | ClassRequestController | Autenticado |
| POST | `/api/class-requests` | ClassRequestController | Autenticado |
| PUT | `/api/class-requests/{id}/status` | ClassRequestController | TEACHER/MODERATOR |
| GET | `/api/xp/history` | XpController | Autenticado |
| GET | `/api/admin/users` | AdminController | MODERATOR |
| PUT | `/api/admin/users/{id}/role` | AdminController | MODERATOR |

---

## 13. Pendientes / Deuda Técnica

1. **Paginación**: Endpoints de listado (`/words`, `/users`, `/game/history`, etc.) no tienen paginación — potencial problema de performance con muchos datos.
2. **Error handling silencioso**: Varios `.catch(() => {})` en frontend que tragan errores de API.
3. **Página no ruteada**: `TeacherWords.jsx` existe pero no está en `App.jsx` (su funcionalidad está en `TeacherQuizzes.jsx`).
4. **Sin WebSockets**: No hay sincronización en tiempo real (notificaciones, actualizaciones).
5. **Sin tests**: No hay tests automatizados en backend ni frontend.
6. **Sin i18n**: Todo el UI está en español.
7. **Sin modo oscuro**: Tema único oscuro (css classes `.xp-*`).
8. **Rate limiting en memoria**: Se pierde al reiniciar el servidor.

---

## 14. Variables de Entorno

### Backend (`backend/.env`):
```
DATASOURCE_URL=jdbc:postgresql://...
DATASOURCE_USERNAME=...
DATASOURCE_PASSWORD=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
JWT_SECRET=...
FRONTEND_URL=https://xp-words.vercel.app
BACKEND_URL=https://xpwords-production.up.railway.app
```

### Frontend (`frontend/.env`):
```
VITE_API_URL=https://xpwords-production.up.railway.app/api
```

---

## 15. Dependencias Clave

### Backend (pom.xml):
- Spring Boot Starter Web, Data JPA, Security, OAuth2 Client, Validation, Flyway
- PostgreSQL Driver, Lombok
- JJWT 0.13.0 (api, impl, jackson)

### Frontend (package.json):
- react 19.2.6, react-dom 19.2.6, react-router-dom 7.17.0
- @vitejs/plugin-react 6.x, Vite 8.x, ESLint 10.x
