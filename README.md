# Paul Kimani — DevOps Engineer Portfolio

A modern, responsive portfolio built with Vite, React, TypeScript, and Tailwind CSS. It showcases skills, experience, and selected projects in DevOps, Cloud, Containers, and Automation. The site supports dark mode, smooth interactions, and includes a backend endpoint (FastAPI) for contact form submissions that saves messages to both Supabase and Google Sheets for redundancy.

## Tech Stack

- Frontend: React 18, TypeScript, Vite 7, Tailwind CSS 3, React Icons
- Backend: FastAPI (Python), Uvicorn ASGI server
- Data: Supabase REST API (messages table) + Google Sheets API (optional, for redundancy)
- Tooling: ESLint, PostCSS/Autoprefixer

## Features

- Responsive, accessible UI with light/dark theme toggle
- Modern gradients, subtle animations, and smooth scrolling
- Portfolio, About, Resume, and Contact sections
- Social links (GitHub, LinkedIn) and mailto shortcut
- Contact form backend with rate limiting and hCaptcha verification
- Dual backend support: Messages saved to both Supabase and Google Sheets (optional)

## Project Structure

```text
kimani-portfolio/
├─ api/
│  └─ submit-message.py        # FastAPI app to accept contact messages (Supabase + Google Sheets)
├─ src/
│  ├─ components/              # UI sections (Hero, About, Portfolio, Resume, Contact, Header, Footer)
│  ├─ contexts/                # Theme context
│  ├─ hooks/                   # Custom hooks (theme)
│  ├─ assets/                  # Images
│  ├─ index.css                # Tailwind entry
│  ├─ main.tsx, App.tsx        # App bootstrap
│  └─ ...
├─ public/                     # Static assets
├─ tailwind.config.js          # Tailwind setup (darkMode: 'class')
├─ vite.config.ts              # Vite configuration
├─ package.json                # Scripts and dependencies
├─ requirements.txt            # Python deps (FastAPI, gspread, google-auth, python-dotenv)
├─ GOOGLE_SHEETS_SETUP.md      # Detailed Google Sheets setup guide
└─ dockerfile                  # Container build (frontend)
```

## Scripts

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Type-check, build production assets to dist/
npm run build

# Preview production build locally (http://localhost:4173)
npm run preview

# Lint the project
npm run lint
```

## Environment Variables

Frontend runs without env by default. If you enable the backend API integration, set these for the FastAPI server:

### Required (at least one backend):
- **SUPABASE_URL** or **VITE_SUPABASE_URL**: Base URL of your Supabase project
- **SUPABASE_SERVICE_ROLE_KEY**: Service role key for server-side inserts

### Optional:
- **HCAPTCHA_SECRET**: Secret for verifying hCaptcha tokens (if unset, captcha validation is skipped)
- **GOOGLE_SHEET_ID**: Google Sheet ID for saving messages (optional, for redundancy)
- **GOOGLE_CREDENTIALS_JSON**: Service account credentials JSON as a single-line string (optional)
- **GOOGLE_SHEET_NAME**: Worksheet name (default: "Messages")

### Notes:
- The backend looks up `SUPABASE_URL` or falls back to `VITE_SUPABASE_URL`.
- **At least one backend (Supabase or Google Sheets) must be configured.**
- Messages are saved to **both** backends if both are configured (for redundancy).
- If one backend fails, the message is still saved to the other.
- See `GOOGLE_SHEETS_SETUP.md` for detailed Google Sheets setup instructions.

## Backend API (FastAPI)

Path: `api/submit-message.py`

Endpoint:

```http
POST /api/submit-message
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "I love your work!",
  "company": "",           // honeypot; leave empty
  "captchaToken": "..."    // optional if hCaptcha disabled
}
```

Behavior:
- Validates required fields and email format
- Optional hCaptcha verification
- Naive 1 request/minute rate limiting per IP using Supabase REST query
- Saves message to Supabase `messages` table (if configured)
- Saves message to Google Sheets (if configured)
- Returns success if at least one backend saves successfully
- Response includes `saved_to` field indicating which backends succeeded

Expected Supabase schema (example):

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  ip text
);
```

### Run the Backend Locally

**Option 1: Using .env file (Recommended)**

1. Create a `.env` file in the project root:
```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
HCAPTCHA_SECRET=<your-hcaptcha-secret>
GOOGLE_SHEET_ID=<your-sheet-id>
GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'
GOOGLE_SHEET_NAME=Messages
```

2. Install dependencies and run:
```bash
# Install Python deps
pip install -r requirements.txt

# Start FastAPI (automatically loads .env file)
uvicorn api.submit-message:app --reload --host 0.0.0.0 --port 8000
```

**Option 2: Using environment variables directly**

```bash
# 1) Install Python deps
pip install -r requirements.txt

# 2) Export env vars (PowerShell example)
$env:SUPABASE_URL="https://<your-project>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"
# Optional
$env:HCAPTCHA_SECRET="<your-hcaptcha-secret>"
$env:GOOGLE_SHEET_ID="<your-sheet-id>"
$env:GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}'

# 3) Start FastAPI
uvicorn api.submit-message:app --reload --host 0.0.0.0 --port 8000
```

**Note:** The `.env` file is automatically loaded by the backend (using `python-dotenv`).

If serving the frontend separately, call `http://localhost:8000/api/submit-message` from the client. Configure CORS as needed if you place the API on another domain.

## Run the Frontend Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Styling and Theming

- Tailwind CSS with `darkMode: 'class'` (see `tailwind.config.js`)
- Theme state via `src/contexts/ThemeContext.tsx` and `src/hooks/useTheme.ts`
- UI components in `src/components/*` with accessible semantics and transitions

## Docker (optional)

Build and run a production image of the frontend:

```bash
docker build -t kimani-portfolio .
docker run -p 4173:4173 kimani-portfolio
```

Then open `http://localhost:4173`.

## Deployment

You can deploy the frontend to any static host (Vercel, Netlify, GitHub Pages, S3/CloudFront): Currently hosted on Vercel, integrated with GitHub for automatic deployments on every commit.

```bash
npm run build
# upload the dist/ folder to your host
```

For the backend, deploy the FastAPI app to your preferred environment (e.g., Fly.io, Render, Railway, Azure App Service, AWS App Runner/ECS, or a simple VPS) and configure environment variables securely.

**Important:** When deploying, set all environment variables in your hosting platform's settings. Never commit `.env` files or credentials to version control.

## Accessibility & Performance

- Semantic HTML, alt text for images, focus states, and keyboard-friendly controls
- Optimized build via Vite; lazy, modern tooling
- SVG/icon usage via `react-icons`

## Development Notes

- Code style: TypeScript with strict, clear naming; lint with ESLint
- UI uses Tailwind utility classes; prefer readability and consistent spacing
- Gradients and transitions are implemented in `Hero.tsx` and other components

## Troubleshooting

### Frontend Issues
- Port in use: update `vite.config.ts` or stop conflicting processes
- CORS errors when posting messages: align frontend origin with backend CORS policy

### Backend Issues
- **Supabase 401/403**: verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Google Sheets not saving**: 
  - Check server logs for initialization messages
  - Verify `GOOGLE_SHEET_ID` and `GOOGLE_CREDENTIALS_JSON` are set correctly
  - Ensure the service account email has Editor access to the Google Sheet
  - See `GOOGLE_SHEETS_SETUP.md` for detailed setup instructions
- **Messages not appearing**: Check the API response `saved_to` field to see which backends succeeded
- **Environment variables not loading**: Make sure `.env` file exists in project root and restart the server

### API Response Format
The API returns a `saved_to` object indicating which backends successfully saved:
```json
{
  "ok": true,
  "message": {...},
  "saved_to": {
    "supabase": true,
    "google_sheets": true
  },
  "warnings": ["Google Sheets save failed: ..."]  // Only if one backend failed
}
```

---

© 2025 Paul Kimani. All rights reserved.
