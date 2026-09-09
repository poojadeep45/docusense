# DocuSense — Frontend

A React frontend for the DocuSense API: register/login, drag-and-drop upload, and a live document list with auto-refreshing status and expandable summaries.

## 1. Set up the backend first

This app is nothing without your DocuSense API running. Before doing anything here:

1. In your DocuSense Spring Boot project, add the CORS config (see the message this was delivered with, or check `SecurityConfig.java`) so the browser is allowed to call the API from this app's origin.
2. Make sure DocuSense is running — either locally (`http://localhost:8080`) or on Railway.

## 2. Configure this app

```bash
cp .env.example .env
```

Edit `.env` and set `VITE_API_URL` to wherever your backend is running.

## 3. Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## 4. Deploy

1. Push this project to its own GitHub repo (separate from DocuSense's backend repo)
2. Go to vercel.com → New Project → import the repo
3. Framework preset: Vite (auto-detected)
4. **Add an environment variable** in Vercel's project settings: `VITE_API_URL` = your Railway backend URL
5. Deploy

## 5. After deploying — update CORS

Once you have your live Vercel URL, go back to `SecurityConfig.java` in the backend, add that URL to the `setAllowedOrigins(...)` list, then commit and push so Railway redeploys with the update. Without this step, the deployed frontend won't be able to reach the API — the browser will block the requests.

## Project structure

```
src/
  context/AuthContext.jsx   — token/user state, persisted to localStorage
  services/api.js           — all backend calls in one place
  pages/Login.jsx
  pages/Register.jsx
  pages/Dashboard.jsx       — upload + document list, polls every 5s
  components/Dropzone.jsx
  components/DocumentCard.jsx
  App.jsx                   — switches between auth screens and the dashboard
```
