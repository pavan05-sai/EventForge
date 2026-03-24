# 📅 Event Management & Scheduling System

A full-stack project built with **Node.js, Express, and Supabase**.

## 📁 Project Structure

This project is divided into two main parts:

- **`backend/`**: Node.js & Express server with MVC architecture.
- **`frontend/`**: Vanilla HTML, CSS, and JavaScript interface.
- **`database/`**: SQL scripts for Supabase table creation and sample data.

## 🚀 Quick Start

### 1. Database Setup
1. Create a project at [Supabase](https://supabase.com).
2. Run the SQL in `database/schema.sql` using the Supabase SQL Editor.
3. (Optional) Run `database/seed.sql` for sample test data.

### 2. Backend Config
1. Go to `backend/` and create a `.env` file (copy `.env.example`).
2. Add your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 3. Run the App
```bash
cd backend
npm install
npm start
```

Visit `http://localhost:3000` in your browser.