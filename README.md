# Compliance Lens: AI Act Compliance Assistant

![Compliance Lens UI](./frontend/public/placeholder.jpg) *(Imagine a beautiful screenshot of the UI here)*

## 📖 Problem Statement

With the rapid acceleration of AI deployment across global enterprises, organizations face a critical hurdle: **Regulatory Compliance**, specifically the stringent requirements introduced by the **EU AI Act**. 

Determining whether an AI application falls under "Prohibited", "High Risk", "Limited Risk", or "Minimal Risk" requires deep legal expertise and manual cross-referencing of hundreds of pages of legislative text. Misclassifying an AI system can result in severe fines (up to €35M or 7% of global turnover) or unnecessary blockage of low-risk innovation. 

**Compliance Lens** was built to solve this problem by providing a dual-agent, RAG-powered workflow to act as an automated first-pass legal assistant, evaluating AI product descriptions directly against the EU AI Act and internal company guidelines.

---

## 💡 Solution & Thinking Process

To ensure high-fidelity, legally-grounded classifications without hallucinations, we designed an architecture relying on **Retrieval-Augmented Generation (RAG)** coupled with an **Agentic Peer-Review Workflow**.

### The Architecture
1. **Knowledge Base (RAG)**:
   - We ingest the raw legal text of the **EU AI Act** alongside internal company guidance (e.g., HR Tech Policies).
   - This prevents the LLM from relying on generalized pre-training data, forcing it to cite specific Articles and Annexes.
   
2. **Dual-Agent System (The "Maker-Checker" Paradigm)**:
   - **Agent 1: The Junior Analyst (`ClassifierAgent`)**: Given an AI product description and the retrieved legal context, it makes an initial determination (Risk Tier, Rationale, Obligations, Missing Info).
   - **Agent 2: The Senior Validator (`ValidatorAgent`)**: Acts as the critical reviewer. It evaluates the Junior Analyst's output, challenges assumptions, provides a confidence score, suggests follow-up questions for the product manager, and proposes alternative classifications if the context is ambiguous.

3. **Modern, Responsive Frontend**:
   - Built with Next.js 15 and Tailwind CSS v4 to provide a premium, dynamic, and intuitive user experience for compliance teams and product managers.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (React 19), Tailwind CSS v4, TypeScript
- **Backend**: Python 3, FastAPI, Uvicorn
- **AI / LLM**: Google Gemini 2.5 Flash (via OpenAI SDK Compatibility)
- **Vector Search**: Local in-memory embeddings matching for resource-efficient prototype demonstration.

---

## 🚀 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- A Google AI Studio API Key (for Gemini)

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the FastAPI server:

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Configure your environment
# Edit the .env file and add your OPENAI_API_KEY (Your Gemini API Key)
# OPENAI_API_KEY="AIzaSy..."

# Start the server
python -m uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the Next.js dev server:

```bash
cd frontend
npm install
npm run dev
```
*The web interface will be available at `http://localhost:3000`*

---

## 📁 Repository Structure

```
working norrin/
├── backend/
│   ├── agents/            # Dual-agent logic (classifier.py, validator.py)
│   ├── data/              # Source PDFs and markdown for RAG
│   ├── scripts/           # Ingestion and download scripts
│   ├── main.py            # FastAPI entry point & API routes
│   └── orchestrator.py    # Manages the flow between retrieval and agents
├── frontend/
│   ├── src/app/           # Next.js App Router (pages: /, /chat, /dashboard)
│   ├── src/components/    # Reusable React components
│   ├── globals.css        # Tailwind v4 configuration & design tokens
│   └── package.json       # Frontend dependencies
├── BUILD_LOG.md           # Detailed development history
└── README.md              # Project documentation
```

## ⚖️ Disclaimer
*Compliance Lens is an AI-powered demonstration tool. Its outputs do not constitute legal advice. All AI risk classifications must be reviewed and approved by qualified legal counsel.*
