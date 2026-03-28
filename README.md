# Mavhu Dashboard

A React + Vite dashboard application.

## Getting Started

### 1. Install dependencies

```bash
npm i
```

### 2. Set up environment variables

Create a `.env` file in the root of the project and add the following:

```dotenv
VITE_SUPABASE_URL=https://hojxlaprfnxzgnyyreit.supabase.co
VITE_ANNON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvanhsYXByZm54emdueXlyZWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NjE3MzksImV4cCI6MjA2ODIzNzczOX0.onYEUwwDsjf3hZCtc2zo4VLHH9uJq0YWz8rgdodzvPw
VITE_API_BASE_URL=http://44.223.50.135:8080/api/v1
```

> **Note:** The `VITE_API_BASE_URL` must be set to the full URL above. Do **not** leave it as `/api/v1`.

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`.