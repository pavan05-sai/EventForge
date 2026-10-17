# 📅 Event Management & Scheduling System

A full-stack project built with **Node.js, Express, and Supabase**.

## 📁 Project Structure

This project is divided into two main parts:

- **`backend/`**: Node.js & Express server with MVC architecture.
- **`frontend/`**: Vanilla HTML, CSS, and JavaScript interface.
- **`database/`**: SQL scripts for Supabase table creation and sample data.

## Local Setup

1. Create a project at [Supabase](https://supabase.com) and run `database/schema.sql` in its SQL Editor.
2. In Supabase Project Settings, copy the Project URL and the **service_role** key. The service-role key is secret and must only be configured on the server.
3. Copy `backend/.env.example` to `backend/.env`, then set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a `JWT_SECRET` containing at least 32 random characters. Do not commit `.env` or expose the service-role key in frontend code.
4. Install and run the backend:

```bash
cd backend
npm ci
npm start
```

Open `http://localhost:3000`. The health endpoint is `http://localhost:3000/health`.

## Deploy Frontend to Vercel and Backend to Render

The Render service runs the API. Vercel serves the static frontend from `frontend/`.

1. Deploy the backend to Render: choose **New + → Blueprint**, connect this repository, and deploy `render.yaml`.
2. In Render environment settings, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Render generates `JWT_SECRET`. Leave `NODE_ENV=production`.
3. Wait for Render's `/health` check to pass. Copy the backend URL, for example `https://your-service.onrender.com`.
4. In [`frontend/js/config.js`](frontend/js/config.js), set `window.EVENT_API_BASE` to the Render API URL ending in `/api`, for example `https://your-service.onrender.com/api`. This is a public API address, not a secret. Commit and push this change.
5. In Vercel, choose **Add New → Project**, import this repository, set **Root Directory** to `frontend`, and deploy. The `vercel.json` file configures clean URLs for routes such as `/dashboard` and `/event`.
6. Copy the deployed Vercel origin (for example, `https://your-app.vercel.app`). In Render environment settings set `FRONTEND_URL` to that exact origin, with no trailing slash, then save/redeploy. This allows the browser frontend to call the API.
7. Open the Vercel URL, register an account, sign in, and create an event to verify frontend-to-API and database connectivity.

To grant the first account admin access, register it first, then run this in the Supabase SQL Editor with that account's email:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-account@example.com';
```

Role changes take effect on the next request because the backend checks the user's current database role.

`FRONTEND_URL` can contain comma-separated allowed origins if you need to permit more than one deployed frontend URL. Never put Supabase keys in Vercel; only the backend needs the service-role key.

## Configuration

Required server environment variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key, stored only in the backend hosting environment.
- `JWT_SECRET`: random secret of at least 32 characters. Render generates one for the Blueprint deployment.
- `PORT`: optional; provided by Render at runtime and defaults to `3000` locally.

The schema leaves row-level security enabled and removes public table policies. The backend's service-role key bypasses RLS; app-level JWT and ownership checks therefore protect all API operations.