# AI for Good — Project README

This repository contains a FastAPI backend and a Vite + React frontend for the "AI Act Compliance Assistant" prototype.

**Quick summary**: run the backend (Python + FastAPI) and frontend (Node + Vite) locally, then use the web UI to upload documents and run compliance analysis.

**Prerequisites**
- Python 3.10+ (3.11/3.12 recommended)
- Node.js 18+ and npm
- git

**Repository layout**
- `backend/` — FastAPI app and Python sources
- `frontend/` — Vite + React frontend
- `sessions/` — runtime session files persisted by the backend

**Backend (Python) setup & run**

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate
pip install -r requirements.txt
```

2. (Optional) Set environment variables. The app uses `GEMINI_API_KEY` for model access. A default key exists in `backend/app/config.py` but you should set a real key in production:

```bash
# Windows (PowerShell)
$env:GEMINI_API_KEY="your_key_here"

# macOS / Linux
export GEMINI_API_KEY="your_key_here"
```

3. Run the API with Uvicorn (development):

```bash
cd ..  # repo root if needed
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

4. API endpoints (examples)
- `GET /` — status
- `POST /api/session/create` — create a new session (returns `session_id`)
- `POST /api/session/upload` — upload files (multipart form; `session_id` + files)
- `POST /api/session/analyze` — run compliance analysis for a session
- `POST /api/session/chat` — follow-up chat queries

Note: the backend stores session files under `backend/sessions/` by default.

**Frontend (Node + Vite) setup & run**

1. Install dependencies and run dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Build for production:

```bash
npm run build
npm run preview
```

The frontend dev server uses Vite (default port 5173) and is configured to allow CORS to the backend.

**Run both locally**
1. Start the backend (port 8000).
2. Start the frontend (`npm run dev`) and open the Vite URL (usually http://localhost:5173).

**Dependencies**
- Backend: see `backend/requirements.txt` (FastAPI, Uvicorn, google-generativeai, pypdf, python-multipart)
- Frontend: see `frontend/package.json` (React 18, Vite, TypeScript)

**Testing & utilities**
- There are a few helper scripts in `backend/` such as `kill_port.py` and `test_model.py` — inspect them for local debugging.

**Commit & push the README**
If you want me to commit and push this README to branch `pinkuu`, I can do that now (or you can run):

```bash
git add README.md
git commit -m "Add README with setup and run instructions"
git push origin pinkuu
```

**Questions I still need from you**
- Do you want a more detailed `.env` sample listing all environment variables used by the app?
- Should I include instructions for Docker or deployment to a cloud provider?

If you want any of those, tell me which and I'll update the README.
