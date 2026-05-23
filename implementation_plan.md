# Goal Description
Build the "Compliance Lens" project as specified in `working-v2.md` and using the UI assets from the `stitch_compliance_lens` folder. This is a RAG-powered compliance assistant for the EU AI Act with a dedicated validation agent and exportable audit trails.

## User Review Required
> [!IMPORTANT]
> The provided HTML files in the `stitch_compliance_lens` UI folders likely contain Tailwind CSS utility classes (e.g., `rounded-lg`). My standard instructions tell me to use Vanilla CSS unless you explicitly request Tailwind CSS. I highly recommend using Tailwind CSS for this project to accurately adopt the provided designs and speed up development. 

## Open Questions
> [!WARNING]
> Please address these questions before I begin execution:
> 1. Should I initialize the Next.js project with Tailwind CSS to match the provided UI templates?
> 2. For the EU AI Act PDF (`backend/data/eu_ai_act.pdf`), should I download it programmatically from the EUR-Lex URL, or will you provide it?
> 3. Should I create a mock/stub backend first to get the frontend connected, or go straight to the real OpenAI/Chroma implementation?

## Proposed Changes

### 1. Project Initialization
- Create a Next.js (App Router) project in `frontend/`.
- Create a Python FastAPI project in `backend/` with a virtual environment and `requirements.txt`.

### 2. Backend Implementation
- **Data Ingestion:** Create scripts `ingest_eu_act.py` and `ingest_norrin.py` to chunk and embed documents into ChromaDB.
- **Agents Architecture:** Implement `orchestrator.py`, `retrieval.py`, `classifier.py`, and `validator.py` with the prompts provided in the README.
- **API Routes:** Implement FastAPI endpoints for `/api/classify`, `/api/chat`, and `/api/export/{session_id}`.
- **Export:** Implement `audit_trail.py` to generate the downloadable JSON audit record.

### 3. Frontend Implementation
- **Design System:** Implement `DESIGN.md` guidelines (fonts: Source Serif 4, Inter, JetBrains Mono) and the color palette in global styles.
- **UI Conversion:** Convert the 4 HTML files provided in `stitch_compliance_lens/stitch_compliance_lens/` into Next.js React components:
  - `compliance_lens/code.html` -> Landing/Home page (`app/page.tsx`)
  - `classify_compliance_lens/code.html` -> Classification App (`app/classify/page.tsx`)
  - `dashboard_compliance_lens/code.html` -> Delta Dashboard (`app/dashboard/page.tsx`)
  - `chat_compliance_lens/code.html` -> Chat Interface (`app/chat/page.tsx`)
- **Shared Components:** Extract recurring elements like `DisclaimerBanner`, `AuditExportButton`, and Risk Indicators into reusable components.

## Verification Plan

### Automated/Manual Tests
- **Frontend Verification:** Ensure all 4 pages render correctly and match the provided UI screenshots.
- **Backend Verification:** Test the `/api/classify` endpoint with a simulated payload to ensure the 4-agent flow executes without errors.
- **Audit Export:** Verify that clicking the "Export JSON" button correctly generates and downloads the lawyer-ready audit trail.
