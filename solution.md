# Compliance Lens: Solution Architecture & Problem Tackling

## The Problem
The EU AI Act introduces a complex, multi-tiered regulatory framework for artificial intelligence systems. For enterprises rapidly deploying AI, determining whether a specific product feature falls under **Prohibited**, **High Risk**, **Limited Risk**, or **Minimal Risk** is a slow, manual, and legally ambiguous process. 

Reading through hundreds of pages of legislation and mapping it to internal company guidance (like HR Tech policies) creates a massive bottleneck for Product Managers and compliance teams. Misclassification can lead to multi-million euro fines or the stifling of low-risk innovation.

## How We Tackled It

We tackled this problem by building **Compliance Lens**, an automated, AI-driven first-pass compliance assistant. Instead of relying on a standard, generalized chatbot that is prone to hallucination, we engineered a deterministic, legally grounded architecture.

### 1. Grounding the AI with RAG (Retrieval-Augmented Generation)
To prevent the LLM from "guessing" legal interpretations based on its pre-training data, we implemented a RAG system.
- **The Knowledge Base**: We ingest the actual text of the EU AI Act alongside the company's internal compliance playbooks (e.g., "Norrin HR Guidance").
- **The Process**: When a user submits an AI product description, the system performs a semantic search to pull only the highly relevant articles (e.g., Article 5 prohibitions, Annex III high-risk use cases) and feeds them directly into the LLM's context window. 
- **The Result**: The AI is forced to cite the exact legal text it used to make its determination.

### 2. The "Maker-Checker" Dual-Agent Paradigm
A single LLM pass is prone to oversight. To simulate a real-world legal review process, we implemented an agentic architecture:
- **Agent 1: The Junior Analyst (`ClassifierAgent`)**
  - **Role**: Reads the product description against the retrieved legal context.
  - **Output**: Generates a strict JSON payload containing the assigned Risk Tier, the rationale, citations, and required obligations (e.g., Conformity Assessments).
- **Agent 2: The Senior Validator (`ValidatorAgent`)**
  - **Role**: Reviews the Junior Analyst's work. It acts as a "Red Team."
  - **Output**: Critiques the rationale, assigns a confidence score out of 100, identifies what information is missing from the product description, and suggests follow-up questions to ask the Product Manager (e.g., "Is there a human-in-the-loop?"). It can also propose an alternative risk tier if the case is ambiguous.

### 3. Resource Efficiency & Model Selection
To ensure the system is cost-effective and fast at scale:
- We utilized highly efficient LLM models (e.g., `gemini-3.1-flash-lite` and `gemini-2.5-flash`) via the OpenAI compatibility layer, ensuring rapid token generation with minimal credit burn.
- We built the prototype using a lightweight, in-memory vector retrieval mock to ensure the system can be developed and tested on any machine (bypassing heavy C++ build requirements for local vector databases like ChromaDB on Windows), while keeping the API contracts identical for a future production swap.

### 4. Frictionless User Experience
- We wrapped the backend logic in a modern Next.js 15 frontend styled with Tailwind CSS v4.
- To solve the UX issue of long LLM processing times, we implemented comprehensive asynchronous loading states (pulsing skeletons, disabled inputs, and spinner animations) to clearly communicate to the user that the dual-agent analysis is running.
- We also included a Dark Mode theme configuration for accessibility and premium feel.

## Conclusion
By combining RAG for legal accuracy with a Dual-Agent system for critical review, Compliance Lens transforms a multi-week manual legal reading process into a 60-second automated triage workflow. It doesn't replace human lawyers, but it dramatically accelerates their workflow and empowers product teams to build with confidence.
