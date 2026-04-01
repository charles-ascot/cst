# Chimera Sports Trading — Portal

The home portal for Chimera Sports Trading Ltd. Authenticated access to the Signal Intelligence Platform.

**Live:** [chimerasportstrading.com](https://chimerasportstrading.com)

---

## Architecture

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | Cloudflare Pages |
| Backend API | FastAPI (Python) | Google Cloud Run |
| DNS | Cloudflare (CNAME flattening + proxy) | — |

---

## Repos

| Repo | Purpose |
|------|---------|
| `charles-ascot/cst` | Frontend — this repo |
| `charles-ascot/cst-api` | Backend API |

---

## Frontend (this repo)

**Stack:** React 18, React Router v6, Vite 5

**Structure:**
```
src/
  App.jsx                  # Routes
  main.jsx                 # Entry point — BrowserRouter + AuthProvider
  theme.js                 # Shared colour/font tokens
  context/
    AuthContext.jsx        # JWT auth state, login/logout, token persistence
  components/
    Layout.jsx             # Authenticated shell with sidebar nav
    ProtectedRoute.jsx     # Redirects unauthenticated users to /login
    PlaceholderPage.jsx    # Shared placeholder for pages under construction
  pages/
    Login.jsx              # Login screen — posts to /api/auth/login
    Strategy.jsx
    BettingEngine.jsx
    Operations.jsx
    Dashboards.jsx
    Reporting.jsx
    Accounting.jsx
public/
  _redirects              # Cloudflare Pages SPA routing
```

**Build:**
```bash
npm install
npm run build             # outputs to dist/
```

**Environment variable (set in Cloudflare Pages dashboard):**
```
VITE_API_URL=https://cst-api-950990732577.europe-west2.run.app
```

**Deploy:** Cloudflare Pages auto-deploys on every push to `main`.

---

## Backend API (`charles-ascot/cst-api`)

**Stack:** FastAPI, uvicorn, bcrypt, PyJWT — containerised via Docker

**Endpoints:**
- `GET  /health` — health check
- `POST /api/auth/login` — email + password → JWT access token
- `GET  /api/auth/me` — validate token, return user

**Environment variables (set in Cloud Run — never committed):**

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | 32-byte hex secret |
| `JWT_EXPIRE_HOURS` | Token lifetime (default 8) |
| `ADMIN_EMAIL` | Portal login email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — generate with `python3 generate_hash.py` |
| `ALLOWED_ORIGINS` | `https://chimerasportstrading.com,https://www.chimerasportstrading.com` |

**Cloud Run URL:** `https://cst-api-950990732577.europe-west2.run.app`

**Deploy:** Cloud Run auto-deploys on every push to `main` of `charles-ascot/cst-api`.

---

## Status

| Item | Status |
|------|--------|
| Login page (v1) | Live |
| Portal v2 — auth shell + nav | Live |
| Backend JWT auth API | Live on Cloud Run |
| Dashboard pages | Placeholder — pending build-out |
| Custom API subdomain (`api.chimerasportstrading.com`) | Pending — after FSU network |
