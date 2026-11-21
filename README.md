# Demgod Aquatics frontend

This is the standalone React/Vite frontend copied from Dem-Aqua. It calls the Laravel API in `../adacelaframework-backend`.

## Local development

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend API URL, for example `http://127.0.0.1:8000/api`.
2. Start the Laravel backend from `../adacelaframework-backend` with `php artisan serve`.
3. Install frontend dependencies with `npm install`, then run `npm run dev`.

For a deployed frontend, set `VITE_API_BASE_URL` to the public backend API URL ending in `/api` before building. Configure `FRONTEND_URL` on the backend to the deployed frontend origin. Do not put backend secrets in frontend environment variables.

Run `npm run build` to create the static site in `dist`.
