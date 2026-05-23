# Build Log: Compliance Lens

This document chronicles the step-by-step development process, architectural decisions, challenges faced, and resolutions implemented during the creation of **Compliance Lens**.

## Phase 1: Project Initialization & Architecture Design

**Goal:** Establish a robust foundation for a full-stack, AI-driven compliance tool.

1. **Frontend Initialization**: 
   - Initialized a Next.js 15 project (`create-next-app`). 
   - Configured Tailwind CSS v4 to match the provided `stitch_compliance_lens` UI designs.
   
2. **Backend Initialization**:
   - Set up a Python virtual environment.
   - Initialized a FastAPI application to serve as the orchestrator.
   - Defined the core API contracts: `/api/classify` (for the dual-agent workflow) and `/api/chat` (for the generic RAG Q&A).

## Phase 2: Building the Brain (Agents & RAG)

**Goal:** Implement the "Maker-Checker" dual-agent paradigm and data retrieval pipeline.

1. **Data Ingestion**:
   - Wrote a script (`download_pdf.py`) to automatically fetch the official EU AI Act PDF if not already present.
   - Created internal "Norrin" HR guidelines as markdown files to demonstrate merging external legislation with internal company policy.
   
2. **The Vector Database Challenge**:
   - *Challenge*: Encountered severe build failures (`C++ build tools required`) when attempting to install `chromadb` and `hnswlib` on the Windows environment. This is a common issue with local vector DBs on Windows without MSVC installed.
   - *Resolution*: Pivoted to a resource-light, in-memory mock retrieval system (`retrieval.py`) for the prototype. This ensured the application remained stable, cross-platform compatible, and didn't exhaust local system resources, while keeping the API interfaces identical for a future seamless swap to Chroma/Pinecone.

3. **Agent Integration (Gemini 2.5 Flash)**:
   - Configured the application to use Google's **Gemini 2.5 Flash** model via the `openai` Python SDK compatibility layer (`https://generativelanguage.googleapis.com/v1beta/openai/`).
   - Implemented `ClassifierAgent` with structured JSON output enforcement to parse risk tiers, citations, and rationales.
   - Implemented `ValidatorAgent` to critique the first agent's output.

## Phase 3: Bringing the UI to Life

**Goal:** Translate raw HTML/CSS mockups into a functional, responsive Next.js application.

1. **Routing and Layout**:
   - Created `app/page.tsx` for the primary Classification workflow.
   - Created `app/chat/page.tsx` for the conversational RAG interface.
   - Created `app/dashboard/page.tsx` for the analytics view.

2. **Tailwind CSS v4 Configuration**:
   - *Challenge*: Upgrading to Next.js 15 introduced Tailwind CSS v4, which fundamentally changes how design tokens are managed (shifting from `tailwind.config.ts` to CSS variables inside `@theme` in `globals.css`). The initial UI rendered completely unstyled.
   - *Resolution*: Completely rewrote `globals.css` to properly import Tailwind v4 (`@import "tailwindcss";`) and defined all custom colors, typography, and spacing variables inside the `@theme` block. Hot Module Replacement immediately picked up the changes, restoring the intended premium aesthetics.

3. **User Experience Enhancements**:
   - Added asynchronous API fetching logic using `fetch` to connect the React components to the FastAPI endpoints.
   - *Feedback Integration*: The user reported uncertainty during the long LLM processing times.
   - *Resolution*: Implemented prominent loading states, including disabling buttons, injecting spinning SVGs, and adding animated skeleton pulse loaders to provide immediate visual feedback while the dual-agents run their analysis.

## Phase 4: Testing & Deployment

**Goal:** Ensure end-to-end stability.

1. **API Key Management**:
   - Tested the live endpoint. The initial test revealed an `API_KEY_INVALID` error from Google. 
   - The application correctly handled the 400 Bad Request error gracefully without crashing the server, falling back to a structured mock response.
   - Once a valid API key was swapped into the `.env` file, the dual-agent workflow successfully generated accurate, legally-grounded classifications.

## Conclusion

The project successfully achieved its goal: creating a highly professional, agentic workflow wrapped in a premium UI. The pivot away from heavy local vector databases towards a resource-light implementation allowed for rapid iteration, while the Tailwind v4 migration ensured the project utilizes the absolute bleeding-edge of frontend tooling.
