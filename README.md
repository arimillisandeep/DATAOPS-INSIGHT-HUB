# DataOps Insight Hub

A full-stack **Data Operations Monitoring & Analytics Platform** for data engineering teams — monitor ETL pipelines, investigate failures, track data quality, review error logs, and analyze ETL errors with AI assistance.

**Stack:** React.js 18 · React Router · Recharts · Axios · Vite (frontend, current phase) — FastAPI + SQL Server + JWT planned for the backend phase.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build
```

### Demo credentials (mock authentication)

| Role | Email | Password |
|---|---|---|
| Admin | admin@dataops.com | Admin@123 |
| Data Engineer | engineer@dataops.com | Engineer@123 |
| Viewer | viewer@dataops.com | Viewer@123 |

> These credentials exist only in the mock layer (`src/data/mockData.js`). They are **not** real secrets and must be removed when the FastAPI/JWT backend lands.

---

## Feature Map

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Email/password login with validation, loading and error states |
| `/dashboard` | All roles | KPI cards, success-rate chart, status distribution, recent runs, failed pipelines |
| `/pipelines` | All roles | Search (debounced), status/source filters, sorting, pagination |
| `/pipelines/:id` | All roles | Metadata, metrics, execution history, latest error, retry (authorized roles) |
| `/data-quality` | All roles | Record KPIs, completeness/validity/uniqueness gauges, quality trend, problematic columns |
| `/logs` | All roles | Searchable/filterable error logs, detail view with stack trace, **AI error analysis** |
| `/users` | Admin only | User CRUD with role assignment, create/edit validation, delete confirmation |
| `/profile` | All roles | Current user info, role permissions summary |

**Permission matrix**

- **Admin** — everything, including user management.
- **Data Engineer** — all monitoring pages, retry failed pipelines, run AI analysis.
- **Viewer** — read-only; no retry button, no user management (route hidden and server-guarded).

---

## Architecture

```
src/
  components/      Navbar, Sidebar, KPICard, StatusBadge, DataTable, SearchBar,
                   Filter, Pagination, Modal, Loader, ErrorMessage, Icon, AppLayout
  pages/           Login, Dashboard, Pipelines, PipelineDetails, DataQuality,
                   Logs, Users, Profile, NotFound
  context/         AuthContext.jsx        (session state, login/logout, role helpers)
  hooks/           useAuth.js, usePipelines.js
  services/        api.js                 (centralized API service layer)
  routes/          ProtectedRoute.jsx     (auth + role guards)
  data/            mockData.js            (deterministic seeded mock data)
  App.jsx          Router tree
  main.jsx         Entry point
```

### Key decisions

1. **Centralized API service (`src/services/api.js`).** No page contains a raw `fetch`/`axios` call. Every method is named after its future FastAPI endpoint (`getPipelines`, `retryPipeline`, `analyzeError`, ...). The mock layer simulates latency, server-side filtering/sorting/pagination, validation errors, and an occasional AI-service failure so every loading/error/empty state is reachable in the UI today.

2. **Swappable mock boundary.** `USE_MOCK_API` at the top of `api.js` flips the entire app to real HTTP calls (base URL from `VITE_API_URL`). Pages and hooks never change — only the method bodies in `api.js`.

3. **Auth via Context + custom hook.** `AuthContext` holds the session (persisted to `localStorage`), exposes `login/logout/hasRole/canRetryPipelines/canManageUsers`, and `useAuth()` is the single consumer hook. Replacing mock auth with JWT means changing `api.login` and storing the token — no page rewrites.

4. **Deterministic mock data.** A seeded PRNG generates pipeline run history, so demos are stable across reloads and the dashboard aggregates (successful runs, failed runs, success-rate trend) stay consistent with the pipeline list.

5. **Authorization is enforced twice.** UI hides actions by role (`canRetryPipelines`, Admin-only nav item, `/users` route guard), and the API layer rejects invalid operations (e.g. retrying a non-failed pipeline returns a 409-style error). The FastAPI backend must repeat these checks — hiding a button is not authorization.

6. **Reusable primitives.** `DataTable` (sortable columns, skeleton loading, empty/error states), `Pagination`, `SearchBar` (built-in debounce), `Filter`, `Modal`/`ConfirmModal`, `KPICard`, and `StatusBadge` are generic and reused across every page.

7. **AI analysis is advisory only.** The mock classifier (`AI_KNOWLEDGE_BASE`) matches error signatures (type conversion, timeouts, duplicate keys, permission denied, schema drift, ...) to a cause, ordered remediation steps, and a confidence score. It never executes database changes.

---

## Deployment

The app is deployed to **Vercel**: https://dataops-insight-hub.vercel.app

- `vercel.json` adds an SPA rewrite so `BrowserRouter` deep links (e.g. `/pipelines/3`) resolve to `index.html`.
- Vercel's zero-config Vite preset runs `npm install` + `npm run build` and serves `dist/`.
- Deploy manually with the Vercel CLI:
  ```bash
  vercel login
  vercel link --yes --project dataops-insight-hub
  vercel deploy --prod --yes
  ```
- Or connect the GitHub repo in the Vercel dashboard for automatic deploys on every push.

---

## Backend Roadmap (Phases 8–10)

The API contract the frontend already expects:

| Method | Endpoint | Used by |
|---|---|---|
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard` | Dashboard |
| GET | `/api/pipelines` | Pipelines (query: `search`, `status`, `source`, `sortBy`, `sortOrder`, `page`, `pageSize`) |
| GET | `/api/pipelines/{id}` | PipelineDetails |
| GET | `/api/pipelines/{id}/runs` | PipelineDetails |
| POST | `/api/pipelines/{id}/retry` | PipelineDetails (Admin, Data Engineer) |
| GET | `/api/logs` | Logs (query: `search`, `severity`, `page`, `pageSize`) |
| GET | `/api/data-quality` | DataQuality |
| GET/POST | `/api/users` | Users (Admin) |
| PUT/DELETE | `/api/users/{id}` | Users (Admin) |
| POST | `/api/ai/analyze-error` | Logs |

**Suggested SQL Server entities:** `Users`, `Roles`, `Pipelines`, `PipelineRuns`, `PipelineLogs`, `DataQualityResults` — with foreign keys (`PipelineRuns.PipelineId → Pipelines.Id`, `PipelineLogs.PipelineId → Pipelines.Id`), timestamps, status fields, and indexes on `Pipelines.Status`, `PipelineRuns.Timestamp`, and `PipelineLogs.Severity`.

**FastAPI skeleton:**

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def require_role(*roles: str):
    def guard(user = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(403, "Forbidden")
        return user
    return guard

@app.post("/api/pipelines/{id}/retry")
async def retry_pipeline(id: int, user=Depends(require_role("Admin", "Data Engineer"))):
    ...
```

To integrate: set `USE_MOCK_API = false` in `src/services/api.js`, point `VITE_API_URL` at the FastAPI server, and implement JWT auth (store the token from `/api/auth/login`, attach it via an `apiClient` request interceptor).

---

## Security Notes

- Mock passwords live only in `mockData.js` for the frontend-only phase — remove before any real deployment.
- `VITE_API_URL` keeps the backend URL out of source code; AI credentials belong server-side (FastAPI), never in the browser bundle.
- The AI feature returns recommendations only; it does not propose or execute destructive operations.

---

## Resume Positioning

**DataOps Insight Hub** — React.js, FastAPI, SQL Server, AI-assisted analytics.
A full-stack data operations monitoring platform for ETL pipeline health, execution tracking, data-quality monitoring, failure investigation, and AI-assisted error analysis.
