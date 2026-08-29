# DocuSense

An AI-powered document summarization and analysis API built with Spring Boot. Upload PDF, DOCX, or TXT files, extract their text, and get AI-generated summaries — all secured with JWT authentication and scoped per user.

## Features

- **File upload & text extraction** — single and batch upload for PDF, DOCX, and TXT files, with automatic text extraction via Apache PDFBox and Apache POI
- **AI summarization** — documents are summarized using the Google Gemini API
- **Async processing** — summarization runs on a background thread pool so upload/analyze requests return immediately (`PROCESSING` → `COMPLETED`), rather than blocking the client
- **JWT authentication** — register/login endpoints issue JWT tokens; all document data is scoped to the authenticated user
- **Organization** — categorize documents and attach multiple tags; filter and search by category, tag, or filename
- **Rate limiting** — per-user rate limiting on AI analysis requests to protect API quota
- **API documentation** — interactive Swagger UI for exploring and testing every endpoint
- **Tested** — unit test coverage on core business logic using JUnit 5 and Mockito

## Tech Stack

- **Backend:** Java 17, Spring Boot 4, Spring Web, Spring Data JPA, Spring Security
- **Database:** MySQL
- **AI:** Google Gemini API (`gemini-3.5-flash-lite`)
- **File parsing:** Apache PDFBox, Apache POI
- **Auth:** JWT (jjwt)
- **Docs:** springdoc-openapi (Swagger UI)
- **Testing:** JUnit 5, Mockito

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user, returns a JWT |
| POST | `/api/auth/login` | Log in, returns a JWT |
| POST | `/api/documents/upload` | Upload a single document |
| POST | `/api/documents/batch` | Upload multiple documents |
| GET | `/api/documents` | List your documents (supports `?categoryId=`, `?tagId=`, `?search=`) |
| GET | `/api/documents/{id}` | Get a single document |
| DELETE | `/api/documents/{id}` | Delete a document |
| POST | `/api/documents/{id}/analyze` | Trigger AI summarization (async) |
| POST | `/api/documents/{id}/tags` | Attach tags to a document |
| GET / POST | `/api/categories` | List / create categories |
| GET / POST | `/api/tags` | List / create tags |

Full interactive documentation is available at `/swagger-ui/index.html` once the app is running.

## Setup

### Prerequisites

- Java 17+
- Maven
- MySQL
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Create the database

```sql
CREATE DATABASE docusense_db;
```

### 2. Set environment variables

The app reads secrets from environment variables — nothing sensitive is stored in the repo:

| Variable | Description |
|---|---|
| `DB_PASSWORD` | Your MySQL password |
| `GEMINI_API_KEY` | Your Gemini API key |
| `JWT_SECRET` | A long, random string (256+ bits) used to sign JWTs |

Optionally, `DB_USERNAME` (defaults to `root`).

### 3. Run the app

```bash
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

### 4. Try it out

Open `http://localhost:8080/swagger-ui/index.html`, register a user via `/api/auth/register`, click **Authorize** and paste in `Bearer <token>`, then explore the rest of the API.

## Architecture Notes

- **Layered structure:** controller → service → repository, with DTOs used at the API boundary to avoid exposing entities directly.
- **Async AI calls:** summarization is dispatched to a dedicated `AsyncSummaryService` bean (kept separate from `DocumentService` to work around Spring's self-invocation proxy limitation) running on a custom `ThreadPoolTaskExecutor`.
- **Security:** stateless JWT auth via a custom `OncePerRequestFilter`, with per-user data isolation enforced at the service layer.