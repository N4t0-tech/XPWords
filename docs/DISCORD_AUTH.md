# Inicio de Sesión con Discord — XPWords

## Arquitectura

```
Frontend (React, :5173)               Backend (Spring Boot, :3001)              Discord
       │                                      │                                   │
       │  1. Click "Iniciar con Discord"      │                                   │
       │─────────────────────────────────────>│                                   │
       │                                      │                                   │
       │  2. Redirect a Discord OAuth         │                                   │
       │  /oauth2/authorization/discord       │                                   │
       │<══════════════════════════════════════│                                   │
       │                                      │                                   │
       │  3. Usuario autoriza en Discord      │                                   │
       │──────────────────────────────────────────────────────────────────────────>│
       │                                      │                                   │
       │  4. Discord redirect con code        │                                   │
       │  /login/oauth2/code/discord?code=X   │                                   │
       │<══════════════════════════════════════│                                   │
       │                                      │                                   │
       │  5. Backend canjea code por token     │                                   │
       │                                      │──────────────────────────────────>│
       │                                      │<═══════════════════════════════════│
       │                                      │                                   │
       │  6. Backend obtiene user info         │                                   │
       │  (id, username, email, avatar)       │──────────────────────────────────>│
       │                                      │<═══════════════════════════════════│
       │                                      │                                   │
       │  7. Backend crea/busca usuario        │                                   │
       │     + genera JWT                     │                                   │
       │                                      │                                   │
       │  8. Redirect a frontend con token     │                                   │
       │  /auth/callback?token=xxx            │                                   │
       │<══════════════════════════════════════│                                   │
       │                                      │                                   │
       │  9. Frontend guarda token en          │                                   │
       │     localStorage, llama GET /users/me │                                   │
       │─────────────────────────────────────>│                                   │
       │<══════════════════════════════════════│                                   │
```

## Flujo detallado

### 1. Frontend — AuthModal.jsx
- Usuario hace click en "Iniciar con Discord"
- Redirige a: `http://localhost:3001/oauth2/authorization/discord`
- Spring Security OAuth2 client construye automáticamente la URL de Discord con:
  - `client_id`
  - `redirect_uri` (registrada en Discord Developer Portal)
  - `scope=identify email`

### 2. Backend — DiscordAuthSuccessHandler.java
Cuando Discord redirige de vuelta con un `code`, Spring Security lo procesa automáticamente y llama al success handler:

```java
public void onAuthenticationSuccess(HttpServletRequest request,
                                     HttpServletResponse response,
                                     Authentication authentication) {
    OAuth2AuthenticationToken oauth = (OAuth2AuthenticationToken) authentication;
    Map<String, Object> attrs = oauth.getPrincipal().getAttributes();

    String discordId = String.valueOf(attrs.get("id"));
    String discordTag = attrs.get("username") + "#" + attrs.get("discriminator");
    String email = (String) attrs.get("email");
    String globalName = (String) attrs.get("global_name");
```

**Lógica de creación/vinculación de cuenta:**

| Situación | Acción |
|-----------|--------|
| Usuario existe por `discordId` | Loguea, actualiza discordTag |
| Usuario existe por `email` | Vincula Discord ID a la cuenta existente |
| No existe | Crea usuario nuevo con datos de Discord (rol STUDENT, sin password) |

Luego genera JWT y redirige al frontend:
```java
String token = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
response.sendRedirect("http://localhost:5173/auth/callback?token=" + token);
```

### 3. Frontend — AuthCallback.jsx
Página que atrapa el token en la URL:
- Lee `?token=xxx` de los query params
- Llama a `handleLogin(token)` que guarda en localStorage y hace `GET /api/users/me`
- Redirige a `/home`

### 4. Frontend — App.jsx
```jsx
<Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin} />} />
```

## Archivos involucrados

### Backend
| Archivo | Función |
|---------|---------|
| `pom.xml` | Dependencia `spring-boot-starter-oauth2-client` |
| `application.yaml` | Config de Discord (client-id, secret, scopes, URIs) |
| `SecurityConfig.java` | `.oauth2Login()` con success handler |
| `DiscordAuthSuccessHandler.java` | Procesa usuario post-login Discord, genera JWT |
| `UserRepository.java` | `findByDiscordId()` para buscar por Discord ID |

### Frontend
| Archivo | Función |
|---------|---------|
| `client.js` | `getAuthBaseUrl()` exportada |
| `AuthModal.jsx` | Botón Discord → redirect a backend |
| `AuthCallback.jsx` | Captura token de URL, llama onLogin |
| `App.jsx` | Ruta `/auth/callback` |

## Configuración necesaria

### Discord Developer Portal
1. Ir a https://discord.com/developers/applications
2. Crear aplicación → OAuth2 → General
3. Agregar Redirects:
   ```
   http://localhost:3001/login/oauth2/code/discord
   http://localhost:3001/api/auth/discord/callback
   ```
4. Copiar CLIENT_ID y CLIENT_SECRET

### .env (backend/.env)
```
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
```
