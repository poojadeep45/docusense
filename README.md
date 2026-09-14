![CI](https://github.com/poojadeep45/docusense/actions/workflows/ci.yml/badge.svg)

# DocuSense

An AI-powered document management platform — upload PDFs, DOCX, or TXT files, get AI-generated summaries, and organize everything with categories and tags. Built as a two-part project: a Spring Boot REST API and a separate React dashboard.

> **Live demo:** currently offline while the backend is moved to a new host — see [Deployment](#deployment) below. Both halves run locally with the steps in this README.

## What's in this repo

\```
.
├── docusense/              # Spring Boot backend (REST API)
└── docusense-frontend/     # React dashboard (Vite)
\```

## Architecture at a glance

\```
┌─────────────────────┐         HTTP / JSON          ┌──────────────────────┐
│  React Frontend      │ ────────────────────────────▶│  Spring Boot Backend │
│  (Vite, port 5173)   │◀──────────────────────────── │  (port 8080)         │
└─────────────────────┘         JWT-authenticated      └──────────┬───────────┘
                                                                    │
                                                          ┌─────────┴─────────┐
                                                          │      MySQL         │
                                                          └─────────┬─────────┘
                                                                    │
                                                          ┌─────────┴─────────┐
                                                          │  Google Gemini API │
                                                          │  (summarization)   │
                                                          └────────────────────┘
\```

The frontend and backend are fully independent — different languages, different deploy targets, connected only over HTTP with CORS configured on the backend. Either can be swapped out without touching the other, as long as the API contract holds.

## Features

**Backend**
- File upload & text extraction — single and batch upload for PDF, DOCX, and TXT, via Apache PDFBox and Apache POI
- AI summarization via the Google Gemini API, run asynchronously so upload/analyze requests return immediately (`PROCESSING` → `COMPLETED`)
- JWT authentication, with optional "remember me" (30-day tokens instead of the default 24-hour) and a full forgot/reset password flow
- Input validation on all request bodies: usernames, emails, a 14-character password minimum, safe handling of malformed or oversized uploads
- Categories and tags for organizing documents; filter and search by category, tag, or filename
- Pagination on every document-listing endpoint (`?page=`, `?size=`)
- Per-user rate limiting on AI analysis requests
- Configurable CORS for local dev and deployed frontends
- Interactive API docs via Swagger UI
- Unit test coverage (JUnit 5, Mockito) and CI via GitHub Actions

**Frontend**
- Multi-page dashboard: Dashboard (charts + overview), Documents, Categories, Tags
- Dashboard charts — documents by status, by category, top tags, uploads over time (Recharts)
- Documents table with server-side pagination, sortable columns, search, and category/tag filters
- Bulk actions — select multiple documents, delete or tag them at once
- Drag-and-drop or click-to-browse upload, single or batch, with an optional category
- Full auth UI: login with "remember me", registration, forgot/reset password
- Show/hide toggle on password fields; attempts to trigger the browser's native "save password" prompt
- Dark mode, persisted across sessions
- Loading skeletons instead of blank screens on first load

There's also a minimal, self-contained web UI served directly from the backend (no build step) if you just want to poke at the API without running the React app.

## Tech stack

| Layer | Stack |
|---|---|
| Backend | Java 17, Spring Boot 4, Spring Web, Spring Security, Spring Data JPA |
| Database | MySQL |
| AI | Google Gemini API (`gemini-3.5-flash-lite`) |
| File parsing | Apache PDFBox, Apache POI |
| Auth | JWT (jjwt), Jakarta Bean Validation |
| API docs | springdoc-openapi (Swagger UI) |
| Testing | JUnit 5, Mockito |
| Frontend | React 18, Vite, React Router v6, Recharts, lucide-react |
| CI/CD | GitHub Actions |

## Quick start (run both locally)

You'll need two terminals.

### 1. Backend

**Create the database:**
\```sql
CREATE DATABASE docusense_db;
\```

**Set environment variables** (nothing sensitive lives in the repo):

| Variable | Description | Required? |
|---|---|---|
| `DB_PASSWORD` | Your MySQL password | Yes |
| `DB_USERNAME` | MySQL username | No — defaults to `root` |
| `DB_URL` | Full JDBC URL | No — defaults to `jdbc:mysql://localhost:3306/docusense_db` |
| `GEMINI_API_KEY` | Your Gemini API key ([aistudio.google.com](https://aistudio.google.com)) | Yes |
| `JWT_SECRET` | A long, random string (256+ bits) used to sign JWTs | Yes |
| `FRONTEND_URL` | Where the frontend runs, used to build password-reset links | No — defaults to `http://localhost:5173` |
| `PORT` | Server port | No — defaults to `8080` |
| `docusense.cors.allowed-origins` | Comma-separated origins allowed to call the API | No — defaults to `http://localhost:5173` |

**Run it:**
\```bash
cd docusense
mvn spring-boot:run
\```
Starts on `http://localhost:8080`. Open `http://localhost:8080/swagger-ui/index.html` to explore the API directly — register via `/api/auth/register`, click **Authorize**, paste `Bearer <token>`.

### 2. Frontend

\```bash
cd docusense-frontend
npm install
cp .env.example .env   # edit VITE_API_URL if your backend isn't on localhost:8080
npm run dev
\```
Opens at `http://localhost:5173`. Register an account and you're in.

## API reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user, returns a JWT |
| POST | `/api/auth/login` | Log in; body accepts `rememberMe: boolean` for a 30-day token instead of 24-hour |
| POST | `/api/auth/forgot-password` | Request a password reset link for an email |
| POST | `/api/auth/reset-password` | Reset a password using a valid token |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents/upload` | Upload a single document |
| POST | `/api/documents/batch` | Upload multiple documents |
| GET | `/api/documents` | List your documents, paginated (`?page=0&size=10`) |
| GET | `/api/documents?categoryId=` | Filter by category, paginated |
| GET | `/api/documents?tagId=` | Filter by tag, paginated |
| GET | `/api/documents?search=` | Search by filename, paginated |
| GET | `/api/documents/{id}` | Get a single document |
| DELETE | `/api/documents/{id}` | Delete a document |
| POST | `/api/documents/{id}/analyze` | Trigger AI summarization (async) |
| POST | `/api/documents/{id}/tags` | Attach tags to a document |

All list endpoints return a page object:
\```json
{
  "content": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5,
  "first": true,
  "last": false
}
\```

### Categories & Tags

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/categories` | List / create categories |
| GET / POST | `/api/tags` | List / create tags |

Full interactive documentation is available at `/swagger-ui/index.html` once the backend is running.

## Email delivery

Forgot-password currently **logs the reset link to the backend's server console** instead of sending a real email — this keeps local setup free of SMTP credentials. Look for a block like this in your terminal output after calling `/api/auth/forgot-password`:

\```
=================================================================
PASSWORD RESET requested for: someone@example.com
Reset link (valid for 30 minutes): http://localhost:5173/reset-password?token=...
=================================================================
\```

Swapping this for a real provider (SMTP, SendGrid, Mailgun, etc.) only requires changing `EmailService.java` on the backend — nothing else in either codebase talks to email directly.

## Frontend project structure

\```
docusense-frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx              # entry point
    ├── App.jsx               # routes
    ├── api.js                # fetch wrapper for the DocuSense API
    ├── styles.css
    ├── context/
    │   ├── AuthContext.jsx   # auth state, login/register/logout
    │   └── ThemeContext.jsx  # light/dark mode
    ├── layouts/
    │   └── DashboardLayout.jsx
    ├── utils/
    │   └── credentials.js    # browser "save password" prompt helper
    ├── pages/
    │   ├── LoginPage.jsx, RegisterPage.jsx
    │   ├── ForgotPasswordPage.jsx, ResetPasswordPage.jsx
    │   ├── DashboardPage.jsx, DocumentsPage.jsx
    │   └── CategoriesPage.jsx, TagsPage.jsx
    └── components/
        ├── Sidebar.jsx, TopHeader.jsx, ThemeToggle.jsx
        ├── StatCard.jsx, StatusBadge.jsx, Skeleton.jsx
        ├── Modal.jsx, UploadModal.jsx, DocumentDetailModal.jsx
        ├── PasswordInput.jsx, Pagination.jsx, Toast.jsx
        ├── AuthSidePanel.jsx, ProtectedRoute.jsx
\```

## Backend architecture notes

- **Layered structure:** controller → service → repository, with DTOs at the API boundary so entities are never exposed directly.
- **Async AI calls:** summarization is dispatched to a dedicated `AsyncSummaryService` bean (kept separate from `DocumentService` to work around Spring's self-invocation proxy limitation), running on a custom `ThreadPoolTaskExecutor`.
- **Security:** stateless JWT auth via a custom `OncePerRequestFilter`, with per-user data isolation enforced at the service layer. Password reset tokens are single-use and time-limited (30 minutes); the forgot-password endpoint responds identically whether or not an email is registered, to avoid leaking account existence.
- **Validation:** request DTOs use Jakarta Bean Validation annotations; a `GlobalExceptionHandler` translates validation failures, not-found errors, and oversized uploads into consistent JSON error responses.

## Known limitations

- **File storage is local disk** on the backend (`docusense.upload-dir`). Most free-tier hosting platforms have an ephemeral filesystem, so uploaded files are lost on redeploy or restart. Fine for local dev; needs swapping to object storage (S3-compatible, Cloudinary, etc.) before relying on it in a persistent deployment.
- **Password reset emails aren't actually sent** — see [Email delivery](#email-delivery) above.
- **Documents-table column sorting on the frontend only reorders the current page**, not the full result set across pages, since the backend sorts by upload date server-side and has no `sort` query param yet.
- **Categories, Tags, and Dashboard pages fetch every document** (looping through all backend pages) to compute counts and chart data, since there's no dedicated aggregate/count endpoint. Fine at small-to-moderate scale.
- **The browser "save password" prompt** only works over HTTPS or localhost, and only in browsers supporting the Credential Management API (not Safari).

## Deployment

Not currently deployed. Free-tier hosting options were explored (Railway, Render, Cloudflare Tunnel) — most now require card verification even on their free tiers, and the previous Railway trial has expired. Revisit this section once a hosting decision is made.

## Status

Actively developed as a learning/portfolio project. Both halves have working test coverage and CI, and run end-to-end locally per the quick start above.