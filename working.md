# AI Act Compliance Assistant — Team README

## Before You Read This

This README exists to close four specific gaps identified in our submission evaluation. Every section maps to a fix. Read it in order before touching any code.

**Gaps we're closing:**
1. Legal accuracy risk — hallucination mitigation + disclaimer architecture
2. Impact metrics — real test set, real numbers
3. Build scope — cut to what we can actually ship
4. Health dashboard reframe — delta not frequency

---

## Project Overview

**Product name:** Compliance Lens
**Challenge:** Norrin — AI Act Compliance Assistant
**Core promise:** A compliance lead gets a risk classification, cited articles, and an actionable checklist in under 5 minutes. The tool is honest about what it doesn't know and refers hard cases back to humans.

**What we are building:**
- A RAG-powered classifier that maps AI product descriptions to EU AI Act risk tiers
- A Validator agent that challenges every classification and produces a confidence score
- A disclaimer architecture baked into every output (not an afterthought)
- A compliance delta dashboard (what changed, not how often you checked)
- A real 10-product test set for honest accuracy metrics

**What we are not building this weekend:**
- PDF export
- Framer Motion animations (static UI only)
- Impact/Health agent (logic lives in frontend, hard-coded for demo)
- Dual Microsoft submission (we are Norrin only, full stop)

---

## Repository Structure

```
compliance-lens/
│
├── README.md                  ← you are here
├── .env.example               ← copy to .env, fill in keys
│
├── backend/
│   ├── main.py                ← FastAPI app, route definitions
│   ├── agents/
│   │   ├── orchestrator.py    ← routes queries, merges outputs
│   │   ├── retrieval.py       ← Chroma search, embedding calls
│   │   ├── classifier.py      ← risk tier classification
│   │   └── validator.py       ← challenges classifier output
│   ├── data/
│   │   ├── ingest.py          ← PDF → chunks → Chroma
│   │   ├── test_set.py        ← 10 known products, ground truth
│   │   └── chroma_db/         ← generated, gitignored
│   ├── prompts/
│   │   ├── classifier.txt     ← classifier system prompt
│   │   └── validator.txt      ← validator system prompt
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           ← main layout
│   │   ├── classify/
│   │   │   └── page.tsx       ← classification input + result card
│   │   ├── chat/
│   │   │   └── page.tsx       ← free-form Q&A
│   │   └── dashboard/
│   │       └── page.tsx       ← compliance delta dashboard
│   ├── components/
│   │   ├── ClassificationCard.tsx
│   │   ├── DisclaimerBanner.tsx    ← always visible, not buried
│   │   ├── CitationAccordion.tsx
│   │   ├── ConfidenceGauge.tsx
│   │   ├── ValidatorPanel.tsx
│   │   ├── DeltaDashboard.tsx
│   │   └── BattleScar.tsx
│   └── package.json
│
└── docs/
    ├── test_set_results.md    ← fill this in during testing phase
    ├── prompt_iterations.md   ← log every prompt change and why
    └── demo_script.md         ← what Sara says, what we show
```

---

## Environment Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key with GPT-4o access
- The EU AI Act PDF (official version 2024/1689 — link below)

### Step 1: Clone and configure

```bash
git clone https://github.com/your-team/compliance-lens.git
cd compliance-lens
cp .env.example .env
```

Fill in `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
EMBEDDING_MODEL=text-embedding-3-small
CHROMA_PATH=./backend/data/chroma_db
TOP_K_RESULTS=8
```

### Step 2: Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`requirements.txt`:
```
fastapi==0.111.0
uvicorn==0.29.0
openai==1.30.0
chromadb==0.5.0
pdfplumber==0.11.0
langchain-text-splitters==0.2.0
python-dotenv==1.0.0
pydantic==2.7.0
httpx==0.27.0
```

### Step 3: Ingest the EU AI Act

Download the PDF:
```
https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689
```

Place it at `backend/data/eu_ai_act.pdf`, then:

```bash
python backend/data/ingest.py
```

This will:
- Extract text using pdfplumber
- Split into ~500 token chunks with 50 token overlap
- Store article number and title as chunk metadata
- Embed with text-embedding-3-small
- Persist to Chroma

Expected output:
```
Extracted 312 pages
Created 847 chunks
Embedded and stored in Chroma
Collection: eu_ai_act | Documents: 847
Done. Ready to query.
```

If you see fewer than 600 chunks, the PDF extraction failed silently. Check `ingest.py` logs.

### Step 4: Frontend setup

```bash
cd frontend
npm install
```

### Step 5: Run both servers

Terminal 1 (backend):
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`
Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

---

## The Four Agents — What They Do and Why

### Why four agents and not one big prompt

A single prompt classifying a product and validating its own output is the same person marking their own exam. The Validator agent exists to apply adversarial pressure. This mirrors the four-eyes principle in real compliance review and is what makes judges trust the output.

### Agent 1: Orchestrator (`agents/orchestrator.py`)

Receives all incoming requests. Decides which agents to activate. Assembles the final response. Does not call the LLM directly.

```python
class Orchestrator:
    def __init__(self):
        self.retrieval = RetrievalAgent()
        self.classifier = ClassifierAgent()
        self.validator = ValidatorAgent()

    async def classify_product(self, description: str) -> dict:
        # Step 1: Get relevant Act chunks
        context = await self.retrieval.search(description, top_k=8)
        
        # Step 2: Classify
        classification = await self.classifier.classify(description, context)
        
        # Step 3: Validate (adversarial pass)
        validation = await self.validator.validate(
            description, context, classification
        )
        
        # Step 4: Merge and return
        return {
            "classification": classification,
            "validation": validation,
            "context_used": context,
            "disclaimer": self._get_disclaimer()
        }

    async def answer_question(self, question: str) -> dict:
        # Q&A path: retrieval only, no validator (speed)
        context = await self.retrieval.search(question, top_k=6)
        answer = await self.classifier.answer(question, context)
        return {
            "answer": answer,
            "context_used": context,
            "disclaimer": self._get_disclaimer()
        }

    def _get_disclaimer(self) -> str:
        return (
            "This output is generated by an AI system and is not legal advice. "
            "Classifications should be reviewed by qualified legal counsel before "
            "any compliance decisions are made. EU AI Act interpretation is evolving "
            "and no court precedent currently exists."
        )
```

### Agent 2: Retrieval Agent (`agents/retrieval.py`)

Searches the Chroma collection. Returns raw chunks with metadata. Has no opinion about the content.

```python
import chromadb
from openai import AsyncOpenAI
import os

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH"))
collection = chroma.get_collection("eu_ai_act")

class RetrievalAgent:
    async def search(self, query: str, top_k: int = 8) -> list[dict]:
        # Generate query embedding
        response = await client.embeddings.create(
            input=query,
            model=os.getenv("EMBEDDING_MODEL")
        )
        query_embedding = response.data[0].embedding
        
        # Search Chroma
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        
        chunks = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            chunks.append({
                "text": doc,
                "article": meta.get("article", "Unknown"),
                "title": meta.get("title", ""),
                "relevance_score": round(1 - dist, 3)
            })
        
        return chunks
```

### Agent 3: Classifier Agent (`agents/classifier.py`)

The core classification logic. Reads the product description and retrieved context. Returns structured JSON only.

```python
CLASSIFIER_SYSTEM_PROMPT = """
You are a specialist in EU AI Act compliance classification. Your role is to determine 
the risk tier of an AI system based on the provided product description and the 
retrieved excerpts from the EU AI Act.

Risk tiers you must choose from:
- PROHIBITED: Systems banned under Article 5
- HIGH_RISK: Systems under Article 6 and listed in Annex III
- LIMITED_RISK: Systems with transparency obligations (Articles 50-52)
- MINIMAL_RISK: All other systems

Rules you must follow:
1. Only use information from the provided context excerpts
2. If the context is insufficient to classify with confidence, say so explicitly
3. Never extrapolate beyond what the text supports
4. Always cite specific articles and annex points
5. If a product sits between two tiers, classify at the higher tier and explain why

Return ONLY valid JSON in this exact structure:
{
  "tier": "HIGH_RISK",
  "confidence_basis": "clear|probable|ambiguous",
  "rationale": "...",
  "citations": ["Article 6(2)", "Annex III, point 4(a)"],
  "obligations": [
    "Conformity assessment (Article 43)",
    "Technical documentation (Article 11)",
    "Human oversight measures (Article 14)"
  ],
  "what_would_change_this": "If the system is used only for pre-screening and not 
  final decisions, it may fall under Article 6(2) exemption...",
  "insufficient_context": false,
  "missing_information": []
}
"""
```

Note the `what_would_change_this` field. This is critical for the disclaimer architecture — it tells Sara exactly what ambiguity exists, which is more useful than a false certainty.

### Agent 4: Validator Agent (`agents/validator.py`)

Receives the Classifier's output and the same context. Produces adversarial review. This is where the confidence score lives.

```python
VALIDATOR_SYSTEM_PROMPT = """
You are a senior compliance officer reviewing a junior analyst's AI Act classification.
Your job is to challenge the classification rigorously.

Ask yourself:
- Did they apply the right articles?
- Did they miss any relevant Annex III categories?
- Is the tier too high or too low given the evidence?
- What did they assume that isn't in the product description?
- Would a different reasonable interpretation of the same facts 
  lead to a different tier?

Return ONLY valid JSON:
{
  "agrees_with_tier": true,
  "confidence_score": 78,
  "concerns": "The classification assumes the system makes autonomous decisions. 
               If a human reviews every output, Article 6(2) exemption may apply.",
  "missing_from_description": [
    "Whether outputs are used for final decisions or recommendations only",
    "Whether the system processes biometric data"
  ],
  "suggested_followup_questions": [
    "Does a human reviewer approve every hiring decision made using this tool?",
    "Does the system analyse video, voice, or facial expressions?"
  ],
  "alternative_tier_possible": false,
  "alternative_tier": null,
  "alternative_rationale": null
}

Confidence score guide:
90-100: Classification is clear, well-cited, no ambiguity
70-89: Probable but one or two open questions
50-69: Genuinely ambiguous, legal advice strongly recommended
Below 50: Insufficient information to classify reliably
"""
```

---

## The Disclaimer Architecture

This is Fix 1 and it is non-negotiable. Every output surface in the UI has a disclaimer. Here is how it works across layers.

### Layer 1: API level
Every response object from every endpoint includes the disclaimer string. It is generated by the Orchestrator and cannot be stripped out by the frontend.

### Layer 2: Component level (`DisclaimerBanner.tsx`)

```tsx
export function DisclaimerBanner({ confidenceScore }: { confidenceScore: number }) {
  const isLowConfidence = confidenceScore < 70;

  return (
    <div className={`
      rounded-lg border p-4 mb-6
      ${isLowConfidence 
        ? 'border-amber-400 bg-amber-50' 
        : 'border-blue-200 bg-blue-50'
      }
    `}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{isLowConfidence ? '⚠️' : 'ℹ️'}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {isLowConfidence
              ? 'Low confidence — legal review strongly recommended'
              : 'AI-generated classification — not legal advice'
            }
          </p>
          <p className="text-sm text-slate-600 mt-1">
            This output is generated by an AI system and does not constitute legal advice. 
            EU AI Act interpretation is evolving with no current court precedent. 
            Review with qualified legal counsel before making compliance decisions.
          </p>
          {isLowConfidence && (
            <p className="text-sm font-medium text-amber-800 mt-2">
              Confidence score: {confidenceScore}/100. 
              The Validator agent identified significant ambiguity in this classification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Layer 3: Classification card

The `what_would_change_this` field from the Classifier is always shown — never hidden in an accordion. This is the most honest signal we give Sara: here is what we don't know.

### What this does for Norrin specifically

Norrin is a consulting firm. A tool that refers hard cases back to humans is a **feature**, not a limitation. The disclaimer architecture is their business model made visible: for anything under 70% confidence, the CTA reads "Book a Norrin expert review" — a direct conversion path from the tool into their consulting pipeline.

---

## The Real Test Set (Fix 2)

This is how we generate honest accuracy metrics. Do this before the demo.

### The 10 products

These are chosen because expert consensus on their classification exists in public guidance from the European Commission, national data protection authorities, or academic legal analysis.

| ID | Product Description | Ground Truth Tier | Source of Ground Truth |
|----|--------------------|--------------------|----------------------|
| T01 | AI system that scores CVs and ranks candidates for HR departments | HIGH_RISK | Annex III point 4(a), confirmed by EDPB guidance |
| T02 | AI chatbot for customer service FAQ on a retail website | MINIMAL_RISK | Recital 47, no Annex III category applies |
| T03 | AI that analyses facial expressions during video interviews to assess candidate suitability | HIGH_RISK | Annex III point 4(a) + biometric categorisation risk |
| T04 | AI that recommends which social media posts to show users | MINIMAL_RISK | Not in Annex III, no prohibited category |
| T05 | AI used by a bank to assess creditworthiness for loan applications | HIGH_RISK | Annex III point 5(b) |
| T06 | AI that detects emotions in call centre voice recordings | LIMITED_RISK | Article 50 transparency obligations for emotion recognition |
| T07 | AI that assigns insurance premiums based on behavioural data | HIGH_RISK | Annex III point 5(b) |
| T08 | AI that generates marketing copy suggestions for human review | MINIMAL_RISK | Human-in-the-loop, no critical decision-making |
| T09 | AI used by a public authority to prioritise social benefit claims | HIGH_RISK | Annex III point 5(a) — public benefit access |
| T10 | Social scoring system operated by a government agency | PROHIBITED | Article 5(1)(c) |

### Running the test set

```python
# backend/data/test_set.py

TEST_CASES = [
    {
        "id": "T01",
        "description": "An AI system used by HR departments that automatically scores and ranks job candidates based on their CVs. The system analyses work history, education, and keyword matches to produce a ranked shortlist that recruiters review.",
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III, point 4(a)"
    },
    # ... all 10 cases
]

async def run_test_set():
    orchestrator = Orchestrator()
    results = []
    
    for case in TEST_CASES:
        result = await orchestrator.classify_product(case["description"])
        predicted = result["classification"]["tier"]
        correct = predicted == case["ground_truth"]
        
        results.append({
            "id": case["id"],
            "ground_truth": case["ground_truth"],
            "predicted": predicted,
            "correct": correct,
            "confidence_score": result["validation"]["confidence_score"],
            "validator_agreed": result["validation"]["agrees_with_tier"]
        })
        
        print(f"{case['id']}: {'✓' if correct else '✗'} | "
              f"Predicted: {predicted} | "
              f"Confidence: {result['validation']['confidence_score']}")
    
    accuracy = sum(r["correct"] for r in results) / len(results) * 100
    avg_confidence = sum(r["confidence_score"] for r in results) / len(results)
    
    print(f"\nAccuracy: {accuracy:.1f}%")
    print(f"Average confidence: {avg_confidence:.1f}/100")
    
    return results
```

Run this at Hour 14 of your build. Record the output in `docs/test_set_results.md`. Whatever the number is, that is your metric. Do not round up. If accuracy is 70%, say 70% and explain what the Validator flagged on the wrong cases.

### The metrics table we will actually use in our pitch

| Metric | Baseline | Our Result | Measurement |
|--------|----------|------------|-------------|
| Time to classify | 20+ hours manual research | Under 5 minutes | Timed during demo with T01 scenario |
| Classification accuracy | No automated tool exists | [fill from test run] | 10-product ground truth test set |
| Validator agreement rate | N/A | [fill from test run] | % cases where Validator agreed with Classifier |
| Average confidence score | N/A | [fill from test run] | Validator confidence across test set |
| Low-confidence cases flagged | N/A | [fill from test run] | % cases scored below 70 correctly referred to human review |

Fill the bracketed fields the morning of demo day. Do not estimate them in advance.

---

## The Delta Dashboard (Fix 3)

This replaces "you've checked 3 times today" with "here's what changed since your last visit." Same anti-anxiety intent. Enterprise-appropriate framing.

### What the dashboard shows

For each tracked product:
- **Last classification** with tier badge
- **What changed since your last visit** — delta summary, not full state
- **Open questions from Validator** — the `missing_from_description` list
- **Battle Scars** — resolved findings that fade over time
- **Confidence trend** — is confidence going up or down across classification runs

### Delta logic

```tsx
// frontend/components/DeltaDashboard.tsx

interface ComplianceSnapshot {
  productId: string
  productName: string
  tier: 'PROHIBITED' | 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK'
  confidenceScore: number
  openQuestions: string[]
  lastVisit: Date
  currentTime: Date
  scars: BattleScar[]
}

interface BattleScar {
  id: string
  description: string
  resolvedAt: Date
  article: string
}

function getDeltaSummary(snapshot: ComplianceSnapshot): string {
  const hoursSinceVisit = (
    snapshot.currentTime.getTime() - snapshot.lastVisit.getTime()
  ) / (1000 * 60 * 60);

  if (hoursSinceVisit < 1) {
    return "No changes since your last visit (less than 1 hour ago).";
  }

  // In production this would diff against stored state
  // For demo: generate a contextual delta message
  return `${snapshot.openQuestions.length} open questions remain from your 
          last classification. Confidence score unchanged at ${snapshot.confidenceScore}/100.`;
}
```

### Battle Scars component

```tsx
// frontend/components/BattleScar.tsx

interface BattleScarProps {
  scar: {
    description: string
    resolvedAt: Date
    article: string
  }
}

export function BattleScar({ scar }: BattleScarProps) {
  const daysSinceResolved = Math.floor(
    (Date.now() - scar.resolvedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Opacity decreases from 0.9 to 0.1 over 7 days
  const opacity = Math.max(0.1, 0.9 - (daysSinceResolved / 7) * 0.8);

  return (
    <div
      className="flex items-center gap-2 py-2 px-3 rounded-md bg-slate-100"
      style={{ opacity }}
    >
      <span className="text-xs font-mono text-slate-500">{scar.article}</span>
      <span className="text-sm text-slate-600">{scar.description}</span>
      <span className="ml-auto text-xs text-slate-400">
        Resolved {daysSinceResolved === 0 ? 'today' : `${daysSinceResolved}d ago`}
      </span>
    </div>
  );
}
```

For the demo, seed three fake resolved findings for the T01 scenario so judges can see scars at different opacity stages. Hardcode the dates: one from today, one from 3 days ago, one from 6 days ago. The fade is visible without waiting.

---

## API Reference

### POST `/api/classify`

Request:
```json
{
  "description": "An AI system that analyses video interviews and scores candidates on communication skills, confidence, and cultural fit."
}
```

Response:
```json
{
  "classification": {
    "tier": "HIGH_RISK",
    "confidence_basis": "probable",
    "rationale": "The system analyses human behaviour to influence employment decisions, falling under Annex III point 4(a)...",
    "citations": ["Article 6(2)", "Annex III, point 4(a)"],
    "obligations": [
      "Conformity assessment (Article 43)",
      "Technical documentation (Article 11)",
      "Human oversight measures (Article 14)",
      "Registration in EU database (Article 49)"
    ],
    "what_would_change_this": "If outputs are used only as one input among many and a human makes all final decisions, the Article 6(2) exemption may apply. This requires legal analysis.",
    "insufficient_context": false,
    "missing_information": []
  },
  "validation": {
    "agrees_with_tier": true,
    "confidence_score": 74,
    "concerns": "Classification assumes system outputs influence final decisions. Confirmation needed.",
    "missing_from_description": [
      "Whether human reviewers can override the system",
      "Whether biometric or emotional data is processed"
    ],
    "suggested_followup_questions": [
      "Does a human interviewer make the final hiring decision independently?",
      "Does the system analyse facial expressions or voice tone?"
    ],
    "alternative_tier_possible": false,
    "alternative_tier": null,
    "alternative_rationale": null
  },
  "context_used": [
    {
      "text": "Article 6(2) — AI systems referred to in Annex III shall be considered high-risk...",
      "article": "Article 6",
      "title": "Classification of AI systems as high-risk",
      "relevance_score": 0.91
    }
  ],
  "disclaimer": "This output is generated by an AI system and is not legal advice..."
}
```

### POST `/api/chat`

Request:
```json
{
  "question": "What technical documentation does a high-risk AI system need to maintain?"
}
```

Response:
```json
{
  "answer": "Under Article 11 and Annex IV of the EU AI Act, high-risk AI systems must maintain technical documentation including...",
  "context_used": [...],
  "disclaimer": "..."
}
```

### GET `/api/health/{product_id}`

Response:
```json
{
  "product_id": "prod_001",
  "product_name": "CV Screening Tool v2",
  "current_tier": "HIGH_RISK",
  "confidence_score": 74,
  "streak_days": 12,
  "open_questions": 2,
  "scars": [
    {
      "id": "scar_001",
      "description": "Article 14 oversight measures — now documented",
      "resolved_at": "2025-01-10T09:00:00Z",
      "article": "Art. 14"
    }
  ],
  "last_classification": "2025-01-13T14:22:00Z",
  "delta_since_last_visit": "2 open questions remain. Confidence unchanged."
}
```

---

## Build Schedule

This is the honest version. Scope is fixed. If something takes longer, we cut features, not sleep.

### Hour 0–2: Data foundation
- [ ] Download EU AI Act PDF
- [ ] Run `ingest.py`, confirm 600+ chunks in Chroma
- [ ] Check article metadata is correct on 5 random chunks
- [ ] Init FastAPI and Next.js projects
- [ ] Confirm CORS works between ports 3000 and 8000

**Checkpoint:** Query Chroma directly for "employment decisions" and get relevant Article 6 chunks back.

### Hour 2–5: Classifier working end-to-end
- [ ] Implement RetrievalAgent
- [ ] Implement ClassifierAgent with the system prompt from this README
- [ ] Implement `/api/classify` with Orchestrator (no Validator yet)
- [ ] Test with T01 (CV screening) — must return HIGH_RISK with Annex III citation
- [ ] Test with T02 (retail chatbot) — must return MINIMAL_RISK

**Checkpoint:** Two correct classifications with citations before adding Validator.

### Hour 5–7: Validator + full multi-agent flow
- [ ] Implement ValidatorAgent
- [ ] Wire Validator into Orchestrator
- [ ] Test full flow on T01, T05, T10
- [ ] Implement `/api/chat` (retrieval only, no Validator)

**Checkpoint:** T10 (social scoring) returns PROHIBITED and Validator agrees with 90+ confidence.

### Hour 7–9: Frontend core
- [ ] Classification input form
- [ ] ClassificationCard component (tier badge, rationale, citations accordion)
- [ ] DisclaimerBanner (confidence-aware, always visible)
- [ ] ValidatorPanel (confidence score, concerns, followup questions)
- [ ] Wire to `/api/classify`

**Checkpoint:** Full classify flow works in browser. Disclaimer is visible without scrolling.

### Hour 9–12: Chat + Dashboard
- [ ] Chat UI wired to `/api/chat`
- [ ] DeltaDashboard with hardcoded T01 scenario
- [ ] BattleScar component with three seeded scars at different opacity
- [ ] ConfidenceGauge component

**Checkpoint:** Dashboard shows three scars at visibly different opacity levels.

### Hour 12–14: Run test set + fill metrics
- [ ] Run `test_set.py` against live backend
- [ ] Record results in `docs/test_set_results.md`
- [ ] Fill metrics table with real numbers
- [ ] Fix any prompt issues from test results (log changes in `docs/prompt_iterations.md`)

**Checkpoint:** Accuracy number exists. Whatever it is, we know it.

### Hour 14–18: Polish and demo prep
- [ ] Three Sara persona flows ready (T01 HR tech, T05 banking, T09 public authority)
- [ ] Demo script written in `docs/demo_script.md`
- [ ] Confirm disclaimer is visible in every state
- [ ] Check mobile layout (judges may look on phones)

### Hour 18–22: Pitch prep
- [ ] 2-minute video recorded
- [ ] Slide deck: problem → architecture → demo → metrics → Norrin consulting integration
- [ ] Rehearse live demo twice

### Hour 22–24: Submit
- [ ] Final test of both servers from clean start
- [ ] README on GitHub is clean and complete
- [ ] Submit

---

## Prompt Iteration Log

Use `docs/prompt_iterations.md` to record every prompt change during the build. Format:

```
## Iteration 3 — Hour 6
Problem: Classifier returned HIGH_RISK for T02 (retail chatbot) citing Article 6 incorrectly
Root cause: Prompt did not emphasise checking Annex III before applying Article 6
Fix: Added "Always verify the system appears in Annex III before assigning HIGH_RISK" to classifier system prompt
Result: T02 now returns MINIMAL_RISK correctly
```

This log becomes part of your submission. It shows judges you iterated based on evidence, not guesswork.

---

## Demo Script (`docs/demo_script.md`)

### Sara Persona 1: HR Tech Startup (T01)

**Setup:** Sara is a compliance lead at a startup selling CV screening software. A potential enterprise client just asked for an AI Act compliance declaration. She has 48 hours.

**What we show:**
1. Sara types the T01 description into Classify
2. Result appears: HIGH_RISK, 74/100 confidence
3. We highlight the `what_would_change_this` field — this is where Norrin's expertise adds value
4. We show the Validator's followup questions — Sara didn't know she needed to answer these
5. We show the obligations checklist — conformity assessment, technical documentation
6. Disclaimer banner is visible throughout: "Book a Norrin expert review" CTA appears because confidence is below 80

**What we say:** "Sara didn't need to read 458 pages. She needed to know what she didn't know. That's what the Validator gives her."

### Sara Persona 2: Public Authority (T09)

**Setup:** A public sector team is deploying AI to prioritise social benefit claims. They assume it's low risk because it's "just a recommendation system."

**What we show:**
1. T09 description submitted
2. HIGH_RISK returns — Annex III point 5(a) cited
3. Validator flags: "Does a human caseworker make the final decision independently?"
4. `what_would_change_this` shows the human-in-the-loop exemption question
5. Confidence: 68/100 — disclaimer banner goes amber
6. CTA: "Confidence below 70. This classification requires legal review."

**What we say:** "The tool didn't just classify. It identified the exact question that determines whether this system needs a full conformity assessment. That question was worth 48 hours of research to find."

### Sara Persona 3: Prohibited System (T10)

**Setup:** A government agency wants to understand if their social scoring pilot is compliant.

**What we show:**
1. T10 submitted
2. PROHIBITED returns immediately — Article 5(1)(c) cited
3. Validator: confidence 97/100 — this is unambiguous
4. No "book a review" CTA — the answer is clear
5. Obligations: "This system cannot be deployed under EU AI Act."

**What we say:** "Sometimes the answer is clear. The tool knows when it is."

---

## What We Are Not Building

Written here explicitly so no one adds scope during the weekend.

- ❌ PDF export of compliance reports
- ❌ User accounts or authentication
- ❌ Framer Motion animations (CSS transitions only)
- ❌ Real-time WebSocket streaming
- ❌ Impact/Health agent (dashboard is hardcoded for demo)
- ❌ Microsoft dual-submission
- ❌ Mobile-first design (desktop layout only, mobile-readable)
- ❌ Fine-tuned model (GPT-4o with prompts only)
- ❌ Multi-language support
- ❌ Persistent database beyond Chroma

If someone says "what if we also add X," the answer is: after we submit.

---

## Key Design Decisions and Why

| Decision | Alternative We Rejected | Why |
|----------|------------------------|-----|
| Separate Classifier and Validator agents | Single prompt for both | Four-eyes compliance principle; builds trust; judges can see the adversarial review |
| Disclaimer on every output, always visible | Disclaimer in footer or settings | A buried disclaimer is a liability, not a feature. Norrin's reputation depends on it |
| Delta dashboard instead of frequency nudge | "You've checked 3 times today" | Enterprise compliance roles have monitoring requirements; telling them to check less could conflict with their job |
| Real test set with ground truth | Simulated testimonials | Judges will ask for numbers. We will have them |
| `what_would_change_this` always visible | Hidden in accordion | This is the most valuable output. It surfaces ambiguity that Sara needs to resolve |
| Norrin consulting CTA at low confidence | No CTA | The tool becomes a lead generator for Norrin at exactly the right moment |

---

## If Something Breaks During Demo

| Problem | Fix |
|---------|-----|
| Chroma query returns wrong articles | Fall back to showing raw text with article number metadata |
| OpenAI API rate limit | Pre-run T01, T05, T09 and cache responses as JSON files; serve from file during demo |
| Validator disagrees unexpectedly | Use it — say "this is the four-eyes principle working in real time" |
| Confidence score seems wrong | Explain that low confidence is a feature, not a bug — it triggers the Norrin referral path |
| Frontend crashes | Run the demo from the FastAPI `/docs` Swagger UI directly — classification still works |

---

## Submission Checklist

- [ ] GitHub repo is public with this README at root
- [ ] Both servers start cleanly from `git clone` + setup instructions
- [ ] Test set results are in `docs/test_set_results.md` with real numbers
- [ ] Prompt iteration log has at least 3 entries
- [ ] Demo script is complete with all three Sara personas
- [ ] Disclaimer is visible in every screenshot
- [ ] 2-minute video is uploaded and linked in submission
- [ ] Metrics table is filled with real test results
- [ ] `what_would_change_this` field is visible without scrolling on the result card