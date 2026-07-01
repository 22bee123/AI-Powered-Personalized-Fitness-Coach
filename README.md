# AI Fitness Coach

A clean Next.js fitness coach app built as a single App Router codebase that includes:

- a polished landing page
- a dashboard for workouts, nutrition, coaching, and progress tracking
- local API route handlers under `src/app/api`
- a lightweight demo session flow for sign-in
- optional Gemini-powered AI responses when `GEMINI_API_KEY` is set

## Stack

- Next.js 15
- React 19
- TypeScript
- Local file-backed data store for development
- Gemini API fallback for the coach route

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file if you want Gemini support:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. Run the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## Main Routes

- `/` - landing page
- `/sign-in` - demo sign-in flow
- `/dashboard` - the main fitness workspace

## API Routes

- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `POST /api/workouts/generate`
- `GET /api/workouts/latest`
- `POST /api/nutrition/generate`
- `GET /api/nutrition/latest`
- `GET /api/workout-complete`
- `POST /api/workout-complete`
- `GET /api/coach/history`
- `DELETE /api/coach/history`
- `POST /api/coach/chat`

## Notes

- The local store lives in `data/fitness-store.json` and is created automatically on first run.
- If you want, the next step can be migrating the local store to MongoDB and replacing the demo auth with Clerk or NextAuth.
