![CI](https://github.com/poojadeep45/docusense/actions/workflows/ci.yml/badge.svg)

# DocuSense

An AI-powered document summarization and analysis platform. Upload PDF, DOCX, or TXT files, extract their text, and get AI-generated summaries — all secured with per-user JWT authentication.

This repo contains two independently deployable projects:

| Project | What it is | README |
|---|---|---|
| [`docusense`](./docusense) | Spring Boot REST API — auth, upload, text extraction, AI summarization, categories/tags | [docusense/README.md](./docusense/README.md) |
| [`docusense-frontend`](./docusense-frontend) | React + Vite dashboard — charts, documents table, bulk actions, dark mode | [docusense-frontend/README.md](./docusense-frontend/README.md) |

> **Live demo:** currently offline while the backend is moved to a new host. Both projects run locally with the steps below.

## Architecture

```
┌──────────────────────┐        HTTP / CORS        ┌───────────────────────┐
│  docusense-frontend   │ ─────────────────────────▶ │      docusense        │
│  React 18 + Vite      │ ◀───────────────────────── │  Spring Boot 4 API    │
│  localhost:5173       │        JSON / JWT           │  localhost:8080       │
└──────────────────────┘                             └───────────┬───────────┘
                                                                  │
                                                     ┌────────────┼────────────┐
                                                     ▼                         ▼
                                              ┌─────────────┐         ┌───────────────┐
                                              │    MySQL     │         │  Gemini API    │
                                              │  (documents, │         │ (summarization)│
                                              │  users, etc) │         └───────────────┘
                                              └─────────────┘
```

The backend also ships a minimal, no-build-step web UI of its own (served at `http://localhost:8080`) for quickly poking at the API without running the React app.

## Quickstart (both projects)

These are the minimum steps to get end-to-end summarization working locally. See each project's own README for full detail, troubleshooting, and configuration options.

1. **Create the database**
   ```sql
   CREATE DATABASE docusense_db;
   ```
2. **Configure and start the backend**
   ```bash
   cd docusense
   # set required env vars: DB_PASSWORD, GEMINI_API_KEY, JWT_SECRET
   mvn spring-boot:run
   ```
   Runs on `http://localhost:8080`.
3. **Configure and start the frontend**
   ```bash
   cd docusense-frontend
   npm install
   cp .env.example .env   # edit VITE_API_URL if the backend isn't on localhost:8080
   npm run dev
   ```
   Runs on `http://localhost:5173`.
4. **Use it** — open `http://localhost:5173`, register an account, and upload a document. Or hit the API directly via Swagger at `http://localhost:8080/swagger-ui/index.html`.

## Keeping frontend and backend in sync

The two projects agree on three settings — if any of these don't line up, you'll typically see a CORS error or failed requests:

| Setting | Where | Default | Purpose |
|---|---|---|---|
| `docusense.cors.allowed-origins` | backend env var | `http://localhost:5173` | Origins the API will accept requests from |
| `FRONTEND_URL` | backend env var | `http://localhost:5173` | Used to build password-reset links |
| `VITE_API_URL` | frontend `.env` | `http://localhost:8080` | Where the frontend sends API requests |

If you change the port or host either service runs on, update all three.

## Notes

- **Password reset emails aren't real yet** — the backend logs the reset link to its own console instead of sending an email. See the backend README's [Email delivery](./docusense/README.md#email-delivery) section.
- **File storage is local disk** on the backend — fine for local dev, but ephemeral on most free-tier hosts. See the backend README's [Known limitations](./docusense/README.md#known-limitations).
- **Deployment:** not currently deployed. Railway, Render, and Cloudflare Tunnel were explored; most free-tier hosts now require card verification and the previous Railway trial has expired.

## Tech stack at a glance

- **Backend:** Java 17, Spring Boot 4, Spring Data JPA, Spring Security, MySQL, JWT, Google Gemini API
- **Frontend:** React 18, Vite, React Router v6, Recharts, plain CSS

## License

_Add license details here._