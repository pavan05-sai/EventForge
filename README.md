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

## Deploy to Render

The repository includes a `render.yaml` Blueprint for one Node web service that serves both the API and frontend. The service uses the backend as its root directory, runs `npm ci` and `npm start`, and checks `/health`.

1. Create a Supabase project and run `database/schema.sql` in the Supabase SQL Editor.
2. In Supabase Project Settings, copy the Project URL and **service_role** key. Keep the service-role key private; do not use the anon key for this backend and never add either key to frontend files.
3. Push this repository to GitHub and create a Render account.
4. In Render, choose **New +** > **Blueprint**, connect this GitHub repository, and deploy the `render.yaml` configuration.
5. In the Render service environment settings, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Render generates `JWT_SECRET` from the Blueprint. Keep `NODE_ENV=production`.
6. Wait for the Render health check to pass, then open the service's `onrender.com` URL. Register a user and sign in to verify the database connection.
7. To grant the first account admin access, register it first, then run this in the Supabase SQL Editor with that account's email:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-account@example.com';
```

Role changes take effect on the next request because the backend checks the user's current database role.

## Configuration

Required server environment variables:

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key, stored only in the backend hosting environment.
- `JWT_SECRET`: random secret of at least 32 characters. Render generates one for the Blueprint deployment.
- `PORT`: optional; provided by Render at runtime and defaults to `3000` locally.

The schema leaves row-level security enabled and removes public table policies. The backend's service-role key bypasses RLS; app-level JWT and ownership checks therefore protect all API operations.