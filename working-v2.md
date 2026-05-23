# Compliance Lens — Team README v2.0

## What Changed in This Version

This README addresses the four specific gaps that held us back from 95+:

1. **Live test set infrastructure** — run it, record honest results, analyse misses
2. **Audit trail export** — plain JSON download, lawyer-ready
3. **Norrin knowledge base customisation** — separate Chroma collection, documented
4. **Full demo flow** — tested under pressure, not just scripted

Every section that changed is marked with `[UPDATED]`. New sections are marked `[NEW]`.

---

## Project Overview

**Product name:** Compliance Lens
**Challenge:** Norrin — AI Act Compliance Assistant
**Core promise:** A compliance lead gets a risk classification, cited articles, and an actionable checklist in under 5 minutes. The tool is honest about what it does not know and routes hard cases back to Norrin experts.

**What we are building:**
- RAG-powered classifier mapping AI product descriptions to EU AI Act risk tiers
- Validator agent that adversarially challenges every classification
- Disclaimer architecture baked into every output layer
- Compliance delta dashboard showing what changed, not how often you checked
- Audit trail export as downloadable JSON (lawyer-ready)
- Norrin-specific knowledge base as a separate Chroma collection
- Real 10-product test set with ground truth, run live, results recorded honestly

**What we are not building this weekend:**
- PDF export with styling
- User accounts or authentication
- Framer Motion animations (CSS transitions only)
- Real-time WebSocket streaming
- Microsoft dual-submission
- Mobile-first design
- Fine-tuned model
- Multi-language support

---

## Repository Structure

```
compliance-lens/
│
├── README.md                        ← you are here
├── .env.example
│
├── backend/
│   ├── main.py                      ← FastAPI app
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── retrieval.py             ← searches both collections
│   │   ├── classifier.py
│   │   └── validator.py
│   ├── data/
│   │   ├── ingest_eu_act.py         ← EU AI Act PDF → Chroma
│   │   ├── ingest_norrin.py         ← [NEW] Norrin playbooks → Chroma
│   │   ├── test_set.py              ← [UPDATED] runs + records results
│   │   ├── chroma_db/               ← gitignored
│   │   └── norrin_kb/               ← [NEW] Norrin markdown files
│   ├── prompts/
│   │   ├── classifier.txt
│   │   └── validator.txt
│   ├── export/
│   │   └── audit_trail.py           ← [NEW] builds JSON export
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── classify/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ClassificationCard.tsx
│   │   ├── DisclaimerBanner.tsx
│   │   ├── CitationAccordion.tsx
│   │   ├── ConfidenceGauge.tsx
│   │   ├── ValidatorPanel.tsx
│   │   ├── DeltaDashboard.tsx
│   │   ├── BattleScar.tsx
│   │   └── AuditExportButton.tsx    ← [NEW]
│   └── package.json
│
└── docs/
    ├── test_set_results.md          ← [UPDATED] fill with real numbers
    ├── miss_analysis.md             ← [NEW] honest analysis of wrong answers
    ├── prompt_iterations.md
    └── demo_script.md
```

---

## Environment Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key with GPT-4o access
- EU AI Act PDF (official version 2024/1689)

### Step 1: Clone and configure

```bash
git clone https://github.com/your-team/compliance-lens.git
cd compliance-lens
cp .env.example .env
```

`.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
EMBEDDING_MODEL=text-embedding-3-small
CHROMA_PATH=./backend/data/chroma_db
NORRIN_KB_PATH=./backend/data/norrin_kb
TOP_K_EU_ACT=6
TOP_K_NORRIN=3
```

Note the separate TOP_K values. We retrieve more from the EU Act and fewer from the Norrin KB. This prevents Norrin's internal guidance from drowning out the primary legal source.

### Step 2: Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
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

```bash
# Download from:
# https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689
# Place at: backend/data/eu_ai_act.pdf

python backend/data/ingest_eu_act.py
```

Expected output:
```
Extracted 312 pages
Created 847 chunks
Embedded and stored in Chroma collection: eu_ai_act
Documents: 847
Done.
```

If fewer than 600 chunks appear, extraction failed silently. Check logs before continuing.

### Step 4: [NEW] Ingest Norrin Knowledge Base

```bash
python backend/data/ingest_norrin.py
```

Expected output:
```
Found 4 Norrin knowledge base files
Created 31 chunks
Embedded and stored in Chroma collection: norrin_kb
Documents: 31
Done.
```

### Step 5: Run servers

Terminal 1:
```bash
cd backend && uvicorn main:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend && npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

---

## [NEW] Norrin Knowledge Base — Customisation Layer

This is what makes Compliance Lens Norrin's product, not a generic legal chatbot.

### Why a separate collection

The EU AI Act is the primary legal source. Norrin's internal guidance is interpretive context — useful, but must never override the Act itself. Keeping them in separate Chroma collections lets us:
- Retrieve from both independently
- Weight EU Act hits higher in the final context
- Add or update Norrin documents without re-ingesting the full Act
- Show clients which guidance comes from law versus from Norrin's interpretation

### What goes in the Norrin KB

Four files, written by your team this weekend based on public guidance. Keep them short. These are not legal documents — they are structured notes that give the classifier additional context for common Norrin client scenarios.

```
backend/data/norrin_kb/
├── hr_tech_guidance.md
├── financial_services_guidance.md
├── public_sector_guidance.md
└── general_classification_notes.md
```

### Sample: `hr_tech_guidance.md`

```markdown
# Norrin Internal Guidance: HR Technology AI Systems

## Source
Based on EDPB guidance on automated decision-making, 
European Commission FAQ on AI Act Annex III, 
and Norrin client work (anonymised).

## Key Classification Signals for HR Tech

### Strong HIGH_RISK indicators
- System outputs are used to shortlist, score, or rank candidates
- System processes CV data, interview recordings, or assessments
- Outputs influence whether a candidate progresses to the next stage
- System is used by employers with 50+ employees (scale matters for audit risk)

### Potential Article 6(2) exemption — investigate before assuming HIGH_RISK
- System is a "preliminary filter" reviewed entirely by a human recruiter
- Human makes independent decision without seeing the system's score
- System only flags missing qualifications, does not rank
- System is used internally by the candidate themselves (self-assessment)

### Questions to ask the client
1. Does a human see the AI score before making a decision?
2. Can the human override the score without any friction?
3. Does the system process video, voice, or image data?
4. Is the system used for final hiring decisions or initial screening?

## Norrin Recommendation
For any HR AI system that ranks or scores candidates, 
default to HIGH_RISK and investigate exemption eligibility separately.
The cost of a missed high-risk classification far exceeds the cost 
of a conformity assessment.

## Relevant Articles
- Article 6(1)(a) and 6(2)
- Annex III, point 4(a)
- Article 14 (human oversight)
- Recital 44
```

Write similar files for financial services (Annex III point 5b, creditworthiness) and public sector (Annex III point 5a, benefit eligibility). These do not need to be perfect — they need to be useful enough to improve retrieval context.

### Ingest script: `ingest_norrin.py`

```python
import os
import chromadb
from openai import OpenAI
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
chroma = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH"))

# Delete and recreate to allow re-ingestion
try:
    chroma.delete_collection("norrin_kb")
except:
    pass
collection = chroma.create_collection("norrin_kb")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=40,
    separators=["\n## ", "\n### ", "\n\n", "\n"]
)

norrin_path = Path(os.getenv("NORRIN_KB_PATH"))
all_files = list(norrin_path.glob("*.md"))
print(f"Found {len(all_files)} Norrin knowledge base files")

chunks = []
metadatas = []
ids = []

for file in all_files:
    text = file.read_text(encoding="utf-8")
    file_chunks = splitter.split_text(text)
    
    for i, chunk in enumerate(file_chunks):
        chunk_id = f"norrin_{file.stem}_{i}"
        chunks.append(chunk)
        metadatas.append({
            "source": "norrin_internal",
            "filename": file.name,
            "topic": file.stem.replace("_", " "),
            "chunk_index": i
        })
        ids.append(chunk_id)

# Embed in batches of 20
batch_size = 20
for i in range(0, len(chunks), batch_size):
    batch = chunks[i:i + batch_size]
    response = client.embeddings.create(
        input=batch,
        model=os.getenv("EMBEDDING_MODEL")
    )
    embeddings = [r.embedding for r in response.data]
    collection.add(
        documents=batch,
        embeddings=embeddings,
        metadatas=metadatas[i:i + batch_size],
        ids=ids[i:i + batch_size]
    )

print(f"Created {len(chunks)} chunks")
print(f"Embedded and stored in Chroma collection: norrin_kb")
print(f"Documents: {collection.count()}")
print("Done.")
```

### Updated Retrieval Agent — queries both collections

```python
class RetrievalAgent:
    def __init__(self):
        chroma = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH"))
        self.eu_act = chroma.get_collection("eu_ai_act")
        self.norrin_kb = chroma.get_collection("norrin_kb")

    async def search(self, query: str) -> dict:
        query_embedding = await self._embed(query)
        
        # Search EU Act — primary legal source
        eu_results = self.eu_act.query(
            query_embeddings=[query_embedding],
            n_results=int(os.getenv("TOP_K_EU_ACT")),
            include=["documents", "metadatas", "distances"]
        )
        
        # Search Norrin KB — interpretive context
        norrin_results = self.norrin_kb.query(
            query_embeddings=[query_embedding],
            n_results=int(os.getenv("TOP_K_NORRIN")),
            include=["documents", "metadatas", "distances"]
        )
        
        return {
            "eu_act_chunks": self._format_results(eu_results, "eu_ai_act"),
            "norrin_chunks": self._format_results(norrin_results, "norrin_internal")
        }

    def _format_results(self, results: dict, source: str) -> list[dict]:
        formatted = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            formatted.append({
                "text": doc,
                "source": source,
                "article": meta.get("article", meta.get("topic", "Unknown")),
                "title": meta.get("title", meta.get("filename", "")),
                "relevance_score": round(1 - dist, 3)
            })
        return formatted

    async def _embed(self, text: str) -> list[float]:
        response = await client.embeddings.create(
            input=text,
            model=os.getenv("EMBEDDING_MODEL")
        )
        return response.data[0].embedding
```

### Updated Classifier prompt — acknowledges dual sources

The classifier prompt now receives context in two labelled blocks. This is critical: the model must know which context is law and which is guidance.

```python
def build_classifier_context(self, context: dict) -> str:
    eu_block = "\n\n".join([
        f"[EU AI ACT — {c['article']}]\n{c['text']}"
        for c in context["eu_act_chunks"]
    ])
    
    norrin_block = "\n\n".join([
        f"[NORRIN GUIDANCE — {c['article']}]\n{c['text']}"
        for c in context["norrin_chunks"]
    ])
    
    return f"""
PRIMARY LEGAL SOURCE — EU AI Act:
{eu_block}

SUPPLEMENTARY GUIDANCE — Norrin Internal (not legally binding):
{norrin_block}

Classification must be based on the EU AI Act. 
Norrin guidance provides interpretive context only.
If they conflict, the EU AI Act takes precedence.
"""
```

---

## [UPDATED] The Real Test Set — Run It, Record It, Analyse the Misses

### The 10 products with ground truth

| ID | Description | Ground Truth | Citation | Ground Truth Source |
|----|-------------|-------------|----------|-------------------|
| T01 | AI that scores and ranks CVs for HR departments. Outputs a ranked shortlist that recruiters review before interviews. | HIGH_RISK | Annex III point 4(a) | EDPB Guidance on Automated Decision-Making, 2023 |
| T02 | AI chatbot answering customer service FAQs for a retail clothing website. No personal decisions made. | MINIMAL_RISK | Recital 47 | EC FAQ on AI Act scope, 2024 |
| T03 | AI that analyses facial expressions and voice tone during video interviews to score candidate confidence and cultural fit. | HIGH_RISK | Annex III point 4(a) + Art. 5(1)(b) proximity | EDPB + AI Act Article 6(2) analysis, multiple legal scholars |
| T04 | AI that determines which social media posts to show users in a feed, based on engagement predictions. | MINIMAL_RISK | Not in Annex III | EC Prohibited AI FAQ, 2024 |
| T05 | AI used by a bank to calculate creditworthiness scores for personal loan applications. Scores are shown to loan officers. | HIGH_RISK | Annex III point 5(b) | EC AI Act Annex III official guidance |
| T06 | AI that detects emotional states in customer service call recordings to flag dissatisfied customers for follow-up. | LIMITED_RISK | Article 50(3) | Art. 50 transparency obligations for emotion recognition |
| T07 | AI that sets insurance premium prices automatically based on driver behaviour data from telematics devices. | HIGH_RISK | Annex III point 5(b) | Insurance sector AI Act analysis, Insurance Europe 2024 |
| T08 | AI that suggests marketing copy variations for human marketers to choose from. Humans select and edit all final copy. | MINIMAL_RISK | Recital 47 — human in the loop | EC FAQ on human oversight exemptions |
| T09 | AI deployed by a public authority to rank and prioritise social housing benefit applications for review. | HIGH_RISK | Annex III point 5(a) | EC guidance on public sector AI systems |
| T10 | AI system operated by a municipal government that assigns citizens a social trustworthiness score affecting access to public services. | PROHIBITED | Article 5(1)(c) | Article 5 prohibited practices — explicit text |

### Test runner: `test_set.py` [UPDATED]

```python
import asyncio
import json
from datetime import datetime
from pathlib import Path
from agents.orchestrator import Orchestrator

TEST_CASES = [
    {
        "id": "T01",
        "description": (
            "An AI system used by HR departments that automatically scores "
            "and ranks job candidates based on their CVs. The system analyses "
            "work history, education, and keyword matches to produce a ranked "
            "shortlist that recruiters review before conducting interviews."
        ),
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III, point 4(a)",
        "notes": "Classic high-risk case. Should be unambiguous."
    },
    {
        "id": "T02",
        "description": (
            "An AI chatbot that answers frequently asked customer service "
            "questions on a retail clothing website. It can look up order "
            "status and suggest return procedures. It makes no decisions "
            "about individuals."
        ),
        "ground_truth": "MINIMAL_RISK",
        "ground_truth_citation": "Recital 47",
        "notes": "Should be minimal risk. Watch for false positives."
    },
    {
        "id": "T03",
        "description": (
            "An AI system used in video interviews that analyses candidates' "
            "facial expressions, voice tone, and speech patterns to score "
            "their communication skills, confidence, and cultural fit. "
            "Scores are sent to hiring managers before the interview debrief."
        ),
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III point 4(a)",
        "notes": (
            "Biometric adjacent. Also watch for Prohibited proximity "
            "via Art 5(1)(b) emotion inference — model may flag this."
        )
    },
    {
        "id": "T04",
        "description": (
            "An AI recommendation engine that determines which social media "
            "posts and advertisements to display to users in their feed, "
            "based on predicted engagement scores."
        ),
        "ground_truth": "MINIMAL_RISK",
        "ground_truth_citation": "Not in Annex III",
        "notes": "Common false positive. Model may conflate with manipulation."
    },
    {
        "id": "T05",
        "description": (
            "An AI system used by a retail bank to calculate creditworthiness "
            "scores for personal loan applicants. The AI score is displayed to "
            "loan officers who make the final approval decision."
        ),
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III, point 5(b)",
        "notes": "Human in loop does not exempt. Should still be high-risk."
    },
    {
        "id": "T06",
        "description": (
            "An AI system that analyses voice recordings from customer service "
            "calls to detect emotional states such as frustration or satisfaction. "
            "Results are used to flag dissatisfied customers for a follow-up call."
        ),
        "ground_truth": "LIMITED_RISK",
        "ground_truth_citation": "Article 50(3)",
        "notes": (
            "This is the hardest case. Model may go HIGH_RISK "
            "(wrong) or MINIMAL_RISK (wrong). "
            "Correct answer is LIMITED_RISK — emotion recognition transparency."
        )
    },
    {
        "id": "T07",
        "description": (
            "An AI system used by an insurance company that automatically "
            "calculates motor insurance premiums based on real-time telematics "
            "data including speed, braking patterns, and time of day. "
            "Premiums are set without human review."
        ),
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III, point 5(b)",
        "notes": "Automated, consequential financial decision. Clear high-risk."
    },
    {
        "id": "T08",
        "description": (
            "An AI tool that generates three variations of marketing email "
            "subject lines for human marketing managers to review and choose "
            "between. All final copy is selected and edited by a human before "
            "any email is sent."
        ),
        "ground_truth": "MINIMAL_RISK",
        "ground_truth_citation": "Recital 47",
        "notes": "Pure human-in-loop creative tool. Minimal risk."
    },
    {
        "id": "T09",
        "description": (
            "An AI system deployed by a local government authority that "
            "analyses social housing benefit applications and ranks them "
            "by priority score. Human caseworkers use the ranked list to "
            "decide which applications to process first."
        ),
        "ground_truth": "HIGH_RISK",
        "ground_truth_citation": "Annex III, point 5(a)",
        "notes": "Public sector access to essential services. High-risk even with human review."
    },
    {
        "id": "T10",
        "description": (
            "An AI system operated by a municipal government that assigns "
            "citizens a social trustworthiness rating based on their financial "
            "history, civic behaviour records, and social relationships. "
            "This rating affects their eligibility for public services and permits."
        ),
        "ground_truth": "PROHIBITED",
        "ground_truth_citation": "Article 5(1)(c)",
        "notes": "Explicit prohibited practice. Should return PROHIBITED with high confidence."
    }
]

async def run_test_set():
    orchestrator = Orchestrator()
    results = []
    timestamp = datetime.now().isoformat()
    
    print(f"\nCompliance Lens — Test Set Run")
    print(f"Timestamp: {timestamp}")
    print(f"Model: {os.getenv('OPENAI_MODEL')}")
    print("=" * 60)
    
    for case in TEST_CASES:
        print(f"\nRunning {case['id']}...")
        
        result = await orchestrator.classify_product(case["description"])
        
        predicted = result["classification"]["tier"]
        correct = predicted == case["ground_truth"]
        confidence = result["validation"]["confidence_score"]
        validator_agreed = result["validation"]["agrees_with_tier"]
        citations = result["classification"]["citations"]
        concerns = result["validation"]["concerns"]
        
        record = {
            "id": case["id"],
            "ground_truth": case["ground_truth"],
            "predicted": predicted,
            "correct": correct,
            "confidence_score": confidence,
            "validator_agreed": validator_agreed,
            "citations_returned": citations,
            "validator_concerns": concerns,
            "case_notes": case["notes"]
        }
        results.append(record)
        
        status = "✓" if correct else "✗"
        print(f"{status} {case['id']}: {predicted} (GT: {case['ground_truth']}) | "
              f"Confidence: {confidence} | Validator: {'agreed' if validator_agreed else 'disagreed'}")
        
        if not correct:
            print(f"  ⚠ MISS — Notes: {case['notes']}")
    
    # Summary statistics
    total = len(results)
    correct_count = sum(r["correct"] for r in results)
    accuracy = correct_count / total * 100
    avg_confidence = sum(r["confidence_score"] for r in results) / total
    validator_agreement = sum(r["validator_agreed"] for r in results) / total * 100
    
    # Identify misses
    misses = [r for r in results if not r["correct"]]
    
    print("\n" + "=" * 60)
    print(f"RESULTS SUMMARY")
    print(f"Accuracy:              {accuracy:.1f}% ({correct_count}/{total})")
    print(f"Average confidence:    {avg_confidence:.1f}/100")
    print(f"Validator agreement:   {validator_agreement:.1f}%")
    print(f"Misses:                {len(misses)}")
    if misses:
        print(f"Missed cases:          {[m['id'] for m in misses]}")
    print("=" * 60)
    
    # Save full results
    output = {
        "run_metadata": {
            "timestamp": timestamp,
            "model": os.getenv("OPENAI_MODEL"),
            "embedding_model": os.getenv("EMBEDDING_MODEL"),
            "top_k_eu_act": os.getenv("TOP_K_EU_ACT"),
            "top_k_norrin": os.getenv("TOP_K_NORRIN")
        },
        "summary": {
            "accuracy_pct": round(accuracy, 1),
            "correct": correct_count,
            "total": total,
            "avg_confidence": round(avg_confidence, 1),
            "validator_agreement_pct": round(validator_agreement, 1),
            "miss_count": len(misses),
            "missed_ids": [m["id"] for m in misses]
        },
        "results": results
    }
    
    output_path = Path("docs/test_set_results.json")
    output_path.write_text(json.dumps(output, indent=2))
    print(f"\nFull results saved to {output_path}")
    
    # Write markdown summary for docs
    write_markdown_summary(output)
    
    return output

def write_markdown_summary(output: dict):
    summary = output["summary"]
    results = output["results"]
    
    lines = [
        "# Test Set Results\n",
        f"**Run timestamp:** {output['run_metadata']['timestamp']}  ",
        f"**Model:** {output['run_metadata']['model']}  ",
        f"**Accuracy:** {summary['accuracy_pct']}% ({summary['correct']}/{summary['total']})  ",
        f"**Average confidence:** {summary['avg_confidence']}/100  ",
        f"**Validator agreement:** {summary['validator_agreement_pct']}%  \n",
        "## Per-Case Results\n",
        "| ID | Ground Truth | Predicted | Correct | Confidence |",
        "|----|-------------|-----------|---------|------------|"
    ]
    
    for r in results:
        status = "✓" if r["correct"] else "✗"
        lines.append(
            f"| {r['id']} | {r['ground_truth']} | {r['predicted']} | "
            f"{status} | {r['confidence_score']} |"
        )
    
    if summary["missed_ids"]:
        lines.append("\n## Misses — See miss_analysis.md for details\n")
        for r in results:
            if not r["correct"]:
                lines.append(f"- **{r['id']}:** Predicted {r['predicted']}, "
                           f"expected {r['ground_truth']}")
                lines.append(f"  - Validator concerns: {r['validator_concerns']}")
    
    Path("docs/test_set_results.md").write_text("\n".join(lines))
    print("Markdown summary saved to docs/test_set_results.md")

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(run_test_set())
```

### [NEW] Miss analysis: `docs/miss_analysis.md`

Fill this in after running the test set. Template:

```markdown
# Miss Analysis — Compliance Lens Test Set

## Purpose
Honest analysis of every wrong answer. 
This is not damage control — it is how we improve the prompts 
and how we show judges we understand our system's limits.

## Expected Hard Cases

### T06 (Emotion Recognition — LIMITED_RISK)
This is the most likely miss. Here is why:

The Act's treatment of emotion recognition sits at the intersection of:
- Article 50(3): transparency obligations for emotion recognition systems
- Annex III point 1: biometric categorisation (if emotions are inferred from biometrics)
- Article 5(1)(b): prohibited subliminal manipulation (if used to exploit)

A classifier that retrieves Article 50 will correctly land on LIMITED_RISK.
A classifier that retrieves Annex III biometric sections may go HIGH_RISK.
Both interpretations are defensible in the legal literature.

**If T06 is a miss:**
Root cause is almost certainly retrieval — the wrong articles are being
returned for "emotion detection in voice recordings."
Fix: Add "emotion recognition transparency Article 50" 
as an explicit phrase in the test query sent to Chroma.
Or: Add a classification hint in the Norrin KB 
distinguishing biometric categorisation from transparency-only systems.

### T03 (Video Interview Facial Analysis — HIGH_RISK)
May be over-classified as PROHIBITED due to Art. 5(1)(b) 
(subliminal manipulation / exploitation of vulnerabilities).
Correct answer is HIGH_RISK, not PROHIBITED.
Validator should catch this — watch the validator_agreed field.

**If T03 is a miss (classified as PROHIBITED):**
Add clarification to classifier prompt:
"Art. 5(1)(b) requires intent to manipulate or exploit.
Systems that analyse but do not manipulate are HIGH_RISK, not Prohibited."

## Recording Actual Misses

[Fill this section after running test_set.py]

### Miss: [ID]
- **Predicted:** [tier]
- **Ground truth:** [tier]
- **Validator agreed with wrong answer:** [yes/no]
- **Root cause:** [retrieval | prompt | model reasoning]
- **Fix applied:** [describe prompt change]
- **Result after fix:** [re-run and record]
```

---

## [NEW] Audit Trail Export

This is what turns a demo tool into something a lawyer can actually use.

### What the export contains

Every classification generates a complete audit record. The lawyer or compliance lead can download it, attach it to their internal documentation, and reference it when presenting to regulators.

### `backend/export/audit_trail.py`

```python
import json
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

class AuditTrail(BaseModel):
    export_version: str = "1.0"
    generated_at: str
    tool_name: str = "Compliance Lens by Norrin"
    legal_disclaimer: str
    product_description: str
    classification: dict
    validation: dict
    context_sources: list[dict]
    followup_questions: list[str]
    what_would_change_this: str
    recommended_next_steps: list[str]

def build_audit_trail(
    product_description: str,
    orchestrator_response: dict
) -> AuditTrail:
    classification = orchestrator_response["classification"]
    validation = orchestrator_response["validation"]
    context = orchestrator_response["context_used"]
    
    # Separate EU Act from Norrin sources for transparency
    eu_sources = [c for c in context["eu_act_chunks"]]
    norrin_sources = [c for c in context["norrin_chunks"]]
    
    all_sources = []
    for s in eu_sources:
        all_sources.append({
            "source_type": "EU AI Act (Official Text)",
            "article": s["article"],
            "title": s.get("title", ""),
            "relevance_score": s["relevance_score"],
            "excerpt": s["text"][:300] + "..." if len(s["text"]) > 300 else s["text"]
        })
    for s in norrin_sources:
        all_sources.append({
            "source_type": "Norrin Internal Guidance (Interpretive — Not Legally Binding)",
            "article": s["article"],
            "title": s.get("title", ""),
            "relevance_score": s["relevance_score"],
            "excerpt": s["text"][:300] + "..." if len(s["text"]) > 300 else s["text"]
        })
    
    return AuditTrail(
        generated_at=datetime.now(timezone.utc).isoformat(),
        legal_disclaimer=(
            "This document is generated by an AI system (Compliance Lens, developed by Norrin) "
            "and does not constitute legal advice. The EU AI Act is subject to evolving "
            "interpretation and no binding court precedent currently exists. This output "
            "should be reviewed by qualified legal counsel before any compliance decisions "
            "are made. Classifications with a confidence score below 70 are particularly "
            "subject to legal uncertainty and require expert review."
        ),
        product_description=product_description,
        classification={
            "risk_tier": classification["tier"],
            "confidence_basis": classification["confidence_basis"],
            "rationale": classification["rationale"],
            "legal_citations": classification["citations"],
            "compliance_obligations": classification["obligations"]
        },
        validation={
            "confidence_score": validation["confidence_score"],
            "validator_agrees": validation["agrees_with_tier"],
            "validator_concerns": validation["concerns"],
            "alternative_tier_possible": validation["alternative_tier_possible"]
        },
        context_sources=all_sources,
        followup_questions=validation["suggested_followup_questions"],
        what_would_change_this=classification["what_would_change_this"],
        recommended_next_steps=classification["obligations"] + [
            "Review this classification with qualified legal counsel",
            "Address all open questions identified by the Validator before filing",
            "Document your classification rationale in your technical file"
        ]
    )

def export_to_json(audit_trail: AuditTrail) -> str:
    return json.dumps(audit_trail.model_dump(), indent=2, ensure_ascii=False)
```

### API endpoint: `/api/export/{session_id}`

```python
# In main.py

from export.audit_trail import build_audit_trail, export_to_json
from fastapi.responses import JSONResponse, Response

# Store sessions in memory (demo only — no persistence needed for weekend)
session_store: dict[str, dict] = {}

@app.post("/api/classify")
async def classify(request: ClassifyRequest):
    result = await orchestrator.classify_product(request.description)
    
    # Store for export
    session_id = str(uuid.uuid4())
    session_store[session_id] = {
        "description": request.description,
        "result": result
    }
    
    return {
        "session_id": session_id,
        **result
    }

@app.get("/api/export/{session_id}")
async def export_audit(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_store[session_id]
    audit = build_audit_trail(session["description"], session["result"])
    json_content = export_to_json(audit)
    
    return Response(
        content=json_content,
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename=compliance_audit_{session_id[:8]}.json"
        }
    )
```

### Frontend: `AuditExportButton.tsx` [NEW]

```tsx
interface AuditExportButtonProps {
  sessionId: string
  tier: string
  confidenceScore: number
}

export function AuditExportButton({ 
  sessionId, 
  tier, 
  confidenceScore 
}: AuditExportButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleExport = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/export/${sessionId}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compliance_audit_${sessionId.slice(0, 8)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="mt-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Download Audit Record
          </p>
          <p className="text-xs text-slate-500 mt-1">
            JSON file containing classification rationale, citations, 
            Validator analysis, and all source excerpts. 
            Attach to your technical documentation file.
          </p>
          {confidenceScore < 70 && (
            <p className="text-xs text-amber-700 mt-2 font-medium">
              ⚠ Confidence {confidenceScore}/100 — 
              include a note that legal review is pending when filing this record.
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={downloading}
          className="shrink-0 px-4 py-2 bg-slate-800 text-white text-sm 
                     rounded-lg hover:bg-slate-700 disabled:opacity-50 
                     transition-colors"
        >
          {downloading ? 'Preparing...' : '↓ Export JSON'}
        </button>
      </div>
    </div>
  )
}
```

---

## The Four Agents — Implementation

### Agent 1: Orchestrator

```python
class Orchestrator:
    def __init__(self):
        self.retrieval = RetrievalAgent()
        self.classifier = ClassifierAgent()
        self.validator = ValidatorAgent()

    async def classify_product(self, description: str) -> dict:
        context = await self.retrieval.search(description)
        classification = await self.classifier.classify(description, context)
        validation = await self.validator.validate(
            description, context, classification
        )
        return {
            "classification": classification,
            "validation": validation,
            "context_used": context,
            "disclaimer": self._disclaimer()
        }

    async def answer_question(self, question: str) -> dict:
        context = await self.retrieval.search(question)
        answer = await self.classifier.answer(question, context)
        return {
            "answer": answer,
            "context_used": context,
            "disclaimer": self._disclaimer()
        }

    def _disclaimer(self) -> str:
        return (
            "This output is generated by an AI system and is not legal advice. "
            "Classifications should be reviewed by qualified legal counsel before "
            "any compliance decisions are made. EU AI Act interpretation is evolving "
            "and no court precedent currently exists."
        )
```

### Agent 3: Classifier — full system prompt

```python
CLASSIFIER_SYSTEM_PROMPT = """
You are a specialist in EU AI Act compliance classification.
Your role is to determine the risk tier of an AI system based on
the provided product description and the retrieved legal context.

RISK TIERS — choose exactly one:
- PROHIBITED: Systems banned under Article 5
- HIGH_RISK: Systems under Article 6 and listed in Annex III
- LIMITED_RISK: Systems with transparency obligations (Articles 50-52)
- MINIMAL_RISK: All other systems

CLASSIFICATION RULES:
1. Base your classification solely on the EU AI Act excerpts provided
2. Norrin guidance provides interpretive context only — it is not law
3. If context is insufficient to classify with confidence, say so explicitly
4. When a system sits between two tiers, classify at the higher tier and explain why
5. Article 6(2) exemptions require explicit evidence — do not assume them
6. Human-in-the-loop does not automatically exempt a system from HIGH_RISK

ARTICLE 5 CHECK — run this first:
Before assigning any other tier, check whether the system:
- Creates or expands a biometric database through untargeted scraping (Art 5(1)(e))
- Infers emotions in workplace or education settings (Art 5(1)(f))
- Uses biometric categorisation to infer protected characteristics (Art 5(1)(g))
- Enables social scoring by public authorities (Art 5(1)(c))
- Uses subliminal or manipulative techniques (Art 5(1)(a)/(b))
- Exploits vulnerability of specific groups (Art 5(1)(b))
If yes to any: PROHIBITED.

EMOTION RECOGNITION NOTE:
Systems that detect or infer emotional states from biometric signals
without being used for decisions affecting individuals
fall under Article 50(3) transparency obligations — LIMITED_RISK.
Systems that use emotion inference to make decisions affecting employment,
education, or access to services may be HIGH_RISK or PROHIBITED.
The distinction is consequential use, not the detection itself.

Return ONLY valid JSON — no preamble, no explanation outside the JSON:
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
  "what_would_change_this": "...",
  "insufficient_context": false,
  "missing_information": []
}
"""
```

### Agent 4: Validator — full system prompt

```python
VALIDATOR_SYSTEM_PROMPT = """
You are a senior compliance officer conducting a four-eyes review
of a junior analyst's EU AI Act classification.

Your job is adversarial. Challenge the classification.

CHECK LIST:
1. Did they apply the correct articles?
2. Did they check Annex III before assigning HIGH_RISK?
3. Did they check Article 5 before assigning any other tier?
4. Is the tier too high — did they over-classify a MINIMAL_RISK system?
5. Is the tier too low — did they miss a HIGH_RISK Annex III category?
6. Did they assume facts not in the description?
7. Would the Article 6(2) exemption apply if human oversight is confirmed?
8. Is LIMITED_RISK being confused with MINIMAL_RISK?

CONFIDENCE SCORE GUIDE:
90-100: Classification is unambiguous, well-cited, no reasonable alternative
70-89: Probable classification, one or two open questions that would not change the tier
50-69: Genuinely ambiguous — legal expert review strongly recommended
Below 50: Insufficient information — do not classify, gather more information first

Return ONLY valid JSON:
{
  "agrees_with_tier": true,
  "confidence_score": 74,
  "concerns": "...",
  "missing_from_description": [
    "Whether outputs are used for final decisions or recommendations only"
  ],
  "suggested_followup_questions": [
    "Does a human reviewer approve every decision made using this tool?"
  ],
  "alternative_tier_possible": false,
  "alternative_tier": null,
  "alternative_rationale": null
}
"""
```

---

## The Disclaimer Architecture

Three layers. All three must be present in every demo state.

### Layer 1: API level
Every response object contains the disclaimer string. The frontend cannot render a result without it.

### Layer 2: Component level — confidence-aware

```tsx
export function DisclaimerBanner({ confidenceScore }: { confidenceScore: number }) {
  const isLowConfidence = confidenceScore < 70;
  const isVeryLow = confidenceScore < 50;

  return (
    <div className={`
      rounded-lg border p-4 mb-6
      ${isVeryLow
        ? 'border-amber-500 bg-amber-50'
        : isLowConfidence
        ? 'border-amber-300 bg-amber-50'
        : 'border-blue-200 bg-blue-50'
      }
    `}>
      <div className="flex items-start gap-3">
        <span className="text-lg">
          {isVeryLow ? '⚠️' : isLowConfidence ? '⚠️' : 'ℹ️'}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">
            {isVeryLow
              ? 'Very low confidence — do not act on this classification without legal review'
              : isLowConfidence
              ? 'Low confidence — legal review recommended before acting'
              : 'AI-generated classification — not legal advice'
            }
          </p>
          <p className="text-sm text-slate-600 mt-1">
            This output does not constitute legal advice. 
            EU AI Act interpretation is evolving with no binding court precedent. 
            Review with qualified legal counsel before making compliance decisions.
          </p>
          {isLowConfidence && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-sm font-medium text-amber-800">
                Confidence score: {confidenceScore}/100
              </p>
              <a
                href="https://norrin.com/contact"
                className="inline-block mt-2 px-3 py-1.5 bg-amber-600 
                           text-white text-xs font-medium rounded-md 
                           hover:bg-amber-700 transition-colors"
              >
                Book a Norrin expert review →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Layer 3: Export

The audit trail JSON begins with the disclaimer as the first field. When a lawyer opens the file, it is the first thing they read.

---

## Delta Dashboard [UPDATED]

### What changed framing

```tsx
function getDeltaMessage(snapshot: ComplianceSnapshot): {
  message: string
  severity: 'none' | 'info' | 'warning'
} {
  const hoursSince = (Date.now() - snapshot.lastVisit.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 0.5) {
    return {
      message: "No changes since your last visit.",
      severity: 'none'
    };
  }

  if (snapshot.openQuestions.length > 0) {
    return {
      message: `${snapshot.openQuestions.length} open question${
        snapshot.openQuestions.length > 1 ? 's' : ''
      } from your last classification remain unresolved.`,
      severity: 'info'
    };
  }

  return {
    message: "All open questions resolved. Confidence score unchanged.",
    severity: 'none'
  };
}
```

### Seeded demo data for T01 scenario

```tsx
// In dashboard/page.tsx — hardcoded for demo

const DEMO_SNAPSHOT: ComplianceSnapshot = {
  productId: "demo_t01",
  productName: "CV Screening Tool v2",
  tier: "HIGH_RISK",
  confidenceScore: 74,
  openQuestions: [
    "Does a human reviewer approve every hiring decision independently?",
    "Does the system process video or voice data?"
  ],
  lastVisit: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  currentTime: new Date(),
  scars: [
    {
      id: "scar_001",
      description: "Article 14 human oversight measures — now documented in technical file",
      resolvedAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000), // today
      article: "Art. 14"
    },
    {
      id: "scar_002",
      description: "Annex III point 4(a) classification ambiguity — resolved via legal review",
      resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      article: "Annex III"
    },
    {
      id: "scar_003",
      description: "Technical documentation gap — Annex IV checklist now complete",
      resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      article: "Art. 11"
    }
  ]
}
```

Three scars at day 0, day 3, day 6 — visibly different opacity without any wait.

---

## API Reference

### POST `/api/classify`

Request:
```json
{
  "description": "An AI system that scores CVs and ranks candidates."
}
```

Response:
```json
{
  "session_id": "a3f2c891-...",
  "classification": {
    "tier": "HIGH_RISK",
    "confidence_basis": "probable",
    "rationale": "...",
    "citations": ["Article 6(2)", "Annex III, point 4(a)"],
    "obligations": ["Conformity assessment (Article 43)", "..."],
    "what_would_change_this": "...",
    "insufficient_context": false,
    "missing_information": []
  },
  "validation": {
    "agrees_with_tier": true,
    "confidence_score": 74,
    "concerns": "...",
    "missing_from_description": ["..."],
    "suggested_followup_questions": ["..."],
    "alternative_tier_possible": false,
    "alternative_tier": null,
    "alternative_rationale": null
  },
  "context_used": {
    "eu_act_chunks": [{"text": "...", "article": "Article 6", "relevance_score": 0.91}],
    "norrin_chunks": [{"text": "...", "article": "hr tech guidance", "relevance_score": 0.83}]
  },
  "disclaimer": "This output is generated by an AI system..."
}
```

### POST `/api/chat`

Request: `{"question": "What technical documentation does a high-risk system need?"}`

Response: `{"answer": "...", "context_used": {...}, "disclaimer": "..."}`

### GET `/api/export/{session_id}`

Returns downloadable JSON audit trail file.

### GET `/api/health/{product_id}`

Returns delta dashboard data for a tracked product.

---

## [UPDATED] Build Schedule — Honest Version

### Hour 0–2: Data foundation
- [ ] Download EU AI Act PDF, place at `backend/data/eu_ai_act.pdf`
- [ ] Run `ingest_eu_act.py` — confirm 600+ chunks
- [ ] Write four Norrin KB markdown files (hr_tech, financial, public_sector, general)
- [ ] Run `ingest_norrin.py` — confirm 25+ chunks
- [ ] Init FastAPI and Next.js
- [ ] Confirm CORS works port 3000 → 8000

**Checkpoint:** Query both Chroma collections directly. Both return relevant results for "employment AI system."

### Hour 2–5: Classifier working end-to-end
- [ ] Implement RetrievalAgent (dual collection)
- [ ] Implement ClassifierAgent with full system prompt from this README
- [ ] Implement `/api/classify` with Orchestrator (no Validator yet)
- [ ] Test T01 → HIGH_RISK with Annex III citation
- [ ] Test T02 → MINIMAL_RISK
- [ ] Test T10 → PROHIBITED

**Checkpoint:** Three correct classifications with citations before adding Validator.

### Hour 5–7: Validator + full pipeline
- [ ] Implement ValidatorAgent with full system prompt
- [ ] Wire Validator into Orchestrator
- [ ] Add session_store and session_id to classify response
- [ ] Implement `/api/export/{session_id}` with audit trail
- [ ] Implement `/api/chat`

**Checkpoint:** T10 returns PROHIBITED, Validator agrees at 90+, export JSON downloads correctly.

### Hour 7–10: Frontend core
- [ ] Classification input form
- [ ] ClassificationCard (tier badge, rationale, what_would_change_this always visible)
- [ ] DisclaimerBanner (three confidence states)
- [ ] CitationAccordion (EU Act and Norrin sources labelled separately)
- [ ] ValidatorPanel (confidence gauge, concerns, followup questions)
- [ ] AuditExportButton
- [ ] Wire all to `/api/classify`

**Checkpoint:** Full classify flow in browser. Disclaimer visible. Export downloads valid JSON.

### Hour 10–12: Chat + Dashboard
- [ ] Chat UI wired to `/api/chat`
- [ ] DeltaDashboard with T01 demo data
- [ ] BattleScar component with three seeded scars
- [ ] ConfidenceGauge component

**Checkpoint:** Dashboard shows scars at three visibly different opacity levels.

### Hour 12–14: Run test set — fill real metrics
- [ ] Run `python backend/data/test_set.py`
- [ ] Record results in `docs/test_set_results.md`
- [ ] Write miss analysis in `docs/miss_analysis.md` — be honest
- [ ] Iterate on prompts for any systematic misses
- [ ] Log every prompt change in `docs/prompt_iterations.md`
- [ ] Re-run test set after fixes

**Checkpoint:** Accuracy number exists and is recorded. Miss analysis is written.

### Hour 14–18: Three Sara flows + demo polish
- [ ] T01 HR tech flow — timed, under 5 minutes
- [ ] T09 public authority flow — amber disclaimer visible
- [ ] T10 prohibited flow — PROHIBITED at 95+ confidence
- [ ] Export JSON works for all three flows
- [ ] Mobile readability check

### Hour 18–22: Pitch prep
- [ ] 2-minute video: problem → classification → validator → export → dashboard
- [ ] Slide deck: problem → architecture → metrics (real numbers) → Norrin integration
- [ ] Rehearse live demo twice, including T06 as the honest "hard case"

### Hour 22–24: Final checks + submit
- [ ] Clean start from `git clone` — does it all work?
- [ ] README on GitHub matches this document
- [ ] Disclaimer visible in every screenshot used in submission
- [ ] Test set results in repo

---

## [UPDATED] Impact Metrics — Real Numbers Only

Fill this table after running the test set. Do not estimate.

| Metric | Baseline | Our Result | How Measured |
|--------|----------|------------|--------------|
| Time to classify | 20+ hours manual research | [time T01 demo live] | Stopwatch during demo run |
| Classification accuracy | No automated tool exists | [X/10 from test_set.py] | 10-product ground truth test set |
| Validator agreement rate | N/A | [X% from test_set.py] | % cases where Validator agreed with Classifier |
| Average confidence score | N/A | [X/100 from test_set.py] | Mean across all 10 test cases |
| Hard cases correctly escalated | N/A | [X/Y below 70 confidence] | Cases where low confidence correctly signals legal review |
| Audit record generated | N/A | Yes | Demonstrated by export download |

**Instructions for presenting these numbers:**
- If accuracy is 90%+: lead with it, show the miss analysis as evidence of honesty
- If accuracy is 70-89%: lead with validator agreement and hard-case escalation; frame misses as exactly what the validator catches before Sara acts
- If accuracy is below 70%: show the prompt iteration log, explain the systematic issue, present the post-fix number — do not hide the first run

---

## Key Design Decisions

| Decision | Alternative Rejected | Why |
|----------|---------------------|-----|
| Separate Classifier and Validator | Single prompt | Four-eyes compliance principle; adversarial review builds trust |
| Dual Chroma collections | Single mixed collection | Norrin guidance must never override the Act; separation makes sourcing transparent |
| Disclaimer always visible, confidence-aware | Buried in footer | A buried disclaimer is a liability. Norrin's consulting CTA appears precisely when it should |
| Delta dashboard (what changed) | Frequency nudge (you checked 3 times) | Enterprise compliance roles have monitoring requirements; delta is useful, frequency is patronising |
| `what_would_change_this` always visible | Hidden in accordion | Most valuable output. Sara needs to know what ambiguity to resolve |
| Audit trail JSON export | No export | Lawyers need a paper trail. This turns a demo into a document |
| Real test set with miss analysis | Simulated testimonials | Judges will ask for numbers. We will have them and honest analysis of the failures |
| Norrin consulting CTA at confidence below 70 | No CTA | The tool generates leads for Norrin at exactly the moment of highest client need |

---

## If Something Breaks During Demo

| Problem | Fix |
|---------|-----|
| Chroma returns wrong articles | Show raw chunk text with article metadata — retrieval is still working |
| OpenAI rate limit | Pre-run T01, T09, T10 at Hour 18, cache as JSON, serve from file |
| Validator disagrees with correct answer | Use it — "this is the four-eyes principle catching a genuine ambiguity" |
| T06 misclassified | Present it as the honest hard case: "Art. 50 vs Annex III is a known grey zone — this is why Norrin experts exist" |
| Export download fails | Show the raw JSON in the browser — the content is what matters |
| Frontend crashes | Demo from FastAPI `/docs` Swagger UI — classification still works |
| Test set accuracy is low | Show the prompt iteration log and post-fix results — the process is the story |

---

## What We Are Not Building

Written here so no one adds scope.

- ❌ PDF styled export
- ❌ User authentication
- ❌ Framer Motion animations
- ❌ WebSocket streaming
- ❌ Microsoft dual-submission
- ❌ Fine-tuned model
- ❌ Multi-language
- ❌ Persistent database
- ❌ Mobile-first layout

After submit: anything on this list becomes fair game.

---

## Submission Checklist

- [ ] GitHub repo is public with this README at root
- [ ] Both servers start clean from `git clone` following setup instructions
- [ ] `docs/test_set_results.md` contains real numbers from `test_set.py`
- [ ] `docs/miss_analysis.md` contains honest analysis of every wrong answer
- [ ] `docs/prompt_iterations.md` has at least three logged iterations
- [ ] Disclaimer visible in every screenshot submitted
- [ ] `what_would_change_this` visible without scrolling on result card
- [ ] Norrin KB sources labelled separately from EU Act sources in citations
- [ ] Audit trail JSON export works and downloads a valid file
- [ ] 2-minute video uploaded and linked
- [ ] Metrics table filled with real test set numbers
- [ ] Three Sara flows tested and timed