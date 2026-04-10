# Chimera Sports Trading — Portal

The home portal for Chimera Sports Trading Ltd. Authenticated access to the Signal Intelligence Platform.

**Live:** [chimerasportstrading.com](https://chimerasportstrading.com)
**GCP Project:** chimera-v4

---

## Architecture

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + Vite 5 | Cloudflare Pages |
| Backend Auth API | FastAPI (Python) | Google Cloud Run |
| FSU1X | Sports Odds API (FastAPI → Python, migrating to Kotlin/Springboot) | Google Cloud Run |
| FSU1Y | Horse Racing API (FastAPI → Python, migrating to Kotlin/Springboot) | Google Cloud Run |
| FSU4 | Email Intelligence Ingestion (FastAPI → Python, migrating to Kotlin/Springboot) | Google Cloud Run |
| FSU4C | Chat Intelligence Collection (FastAPI → Python, migrating to Kotlin/Springboot) | Google Cloud Run |
| DNS | Cloudflare (CNAME flattening + proxy) | — |

---

## Repos

| Repo | Purpose |
|------|---------|
| `charles-ascot/cst` | Frontend — this repo |
| `charles-ascot/cst-api` | Backend auth API |

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
    Strategy.jsx           # FSU4 — intelligence feed, action items, AI query
    BettingEngine.jsx      # FSU1X (sports odds) + FSU1Y (racecards/runner odds)
    Operations.jsx         # FSU4 + FSU4C — ingest queues, spaces, system health
    Dashboards.jsx         # Summary tiles from all 4 FSUs
    Reporting.jsx          # FSU4 + FSU4C metrics
    Accounting.jsx         # Not wired to FSUs
public/
  _redirects              # Cloudflare Pages SPA routing
docs/
  worklog-2026-04-10.md   # Session work log
```

**Build:**
```bash
npm install
npm run build             # outputs to dist/
```

**Environment variables (set in Cloudflare Pages dashboard):**
```
VITE_API_URL=https://cst-api-lssrjnis3q-nw.a.run.app
VITE_FSU1X_URL=https://beta-fsu1x-lssrjnis3q-nw.a.run.app
VITE_FSU1Y_URL=https://beta-fsu1y-lssrjnis3q-nw.a.run.app
VITE_FSU4_URL=https://fsu4-lssrjnis3q-nw.a.run.app
VITE_FSU4C_URL=https://fsu4c-lssrjnis3q-nw.a.run.app
VITE_FSU1X_API_KEY=<from Cloud Run secret manager>
VITE_FSU1Y_API_KEY=<from Cloud Run secret manager>
VITE_FSU4_API_KEY=<from Cloud Run secret manager>
VITE_FSU4C_API_KEY=<from Cloud Run secret manager>
```

**Deploy:** Cloudflare Pages auto-deploys on every push to `main`.

---

## Backend Auth API (`charles-ascot/cst-api`)

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

**Cloud Run URL:** `https://cst-api-lssrjnis3q-nw.a.run.app`

**Deploy:** Cloud Run auto-deploys on every push to `main` of `charles-ascot/cst-api`.

---

## FSU Data Services (chimera-v4 GCP project)

All FSUs currently in Python/FastAPI. Migrating to Kotlin/Springboot — dashboard wiring is data-only so the switchover will not break the frontend.

| FSU | Purpose | Auth Header | Cloud Run URL |
|-----|---------|-------------|---------------|
| FSU1X | Sports odds aggregation — 70+ sports, 40+ bookmakers via The Odds API | `X-API-Key` | `https://beta-fsu1x-lssrjnis3q-nw.a.run.app` |
| FSU1Y | Horse racing — racecards, runners, form, results via The Racing API | `X-API-Key` | `https://beta-fsu1y-lssrjnis3q-nw.a.run.app` |
| FSU4 | Email intelligence — Gmail → AI tagging (Claude) → Firestore | `X-Chimera-API-Key` | `https://fsu4-lssrjnis3q-nw.a.run.app` |
| FSU4C | Chat intelligence — Google Chat → OCR + classification → Firestore | `X-Chimera-API-Key` | `https://fsu4c-lssrjnis3q-nw.a.run.app` |

### Dashboard → FSU Mapping

| Portal Page | FSU(s) | Data |
|------------|--------|------|
| Dashboards | All 4 | Summary tiles — sport count, race count, intelligence count, action items |
| Betting Engine | FSU1X + FSU1Y | Sports odds table; racecards → runner odds grid |
| Strategy | FSU4 | Intelligence registry feed, action items queue (SCN/SDR), AI query |
| Operations | FSU4 + FSU4C | Ingest queues, chat spaces registry, system health |
| Reporting | FSU4 + FSU4C | Processing metrics by intent, urgency, source |
| Accounting | — | Not wired to FSUs |

---

## Status

| Item | Status |
|------|--------|
| Login portal (v1) | Live |
| Portal v2 — auth shell + nav | Live |
| Backend JWT auth API | Live on Cloud Run |
| FSU1X, FSU1Y, FSU4, FSU4C | Live on Cloud Run — confirmed healthy |
| Dashboard pages | Placeholder — pending FSU API keys + build-out |
| Multi-user auth | Deferred |
| Custom API subdomain (`api.chimerasportstrading.com`) | Deferred — after FSU network |
| FSU migration to Kotlin/Springboot | In progress (separate work) |

### Next — Blocked on FSU API Keys
To build the dashboard pages, these env vars must be set in Cloudflare Pages:
- `VITE_FSU1X_API_KEY` — X-API-Key for FSU1X
- `VITE_FSU1Y_API_KEY` — X-API-Key for FSU1Y
- `VITE_FSU4_API_KEY` — X-Chimera-API-Key for FSU4
- `VITE_FSU4C_API_KEY` — X-Chimera-API-Key for FSU4C
