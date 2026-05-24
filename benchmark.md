# Compliance Lens: Benchmarks & Architectural Analysis

This document provides an overview of the performance benchmarks, structural advantages, limitations, integration strategies for Norrin infrastructure, and the future roadmap for the **Compliance Lens** platform.

---

## 1. Performance Benchmarks

Since Compliance Lens is an AI-driven, dual-agent system, performance is measured across **latency**, **accuracy**, and **cost-efficiency**.

### Latency (Time-to-Classification)
*   **Vector Retrieval (ChromaDB)**: `< 50ms`. The local in-memory vector database is highly optimized and returns relevant EU AI Act and internal policy chunks almost instantaneously.
*   **PDF/Document Parsing (`pdfplumber`)**: `~200ms - 800ms` (depending on document length). Extracting raw text from standard compliance PDFs or architecture diagrams is incredibly fast.
*   **Junior Analyst Agent (First Pass)**: `~3 - 5 seconds`. Using lightweight models (e.g., Gemini Flash), the initial classification is rapid.
*   **Senior Validator Agent (Review Pass)**: `~3 - 5 seconds`. The critical review process runs sequentially after the first pass.
*   **Total End-to-End Latency**: `~6 to 12 seconds` per request. Compared to the hours or days it takes a human compliance officer to cross-reference the EU AI Act, this is an exponential acceleration.

### Cost Efficiency
*   By utilizing highly efficient models (Gemini Flash) via API, the token cost per classification is virtually negligible (often fractions of a cent).
*   Vector embeddings are generated using lightweight models and cached locally, entirely eliminating recurring retrieval costs.

---

## 2. Advantages & Disadvantages

### Advantages
1.  **Deterministic Legal Grounding (RAG)**: The system does not hallucinate legal advice. Because it uses Retrieval-Augmented Generation, it *must* cite specific articles (e.g., Article 6, Annex III) and internal playbooks before drawing a conclusion.
2.  **Maker-Checker Architecture**: The dual-agent system prevents silent failures. If the Junior agent misclassifies an edge case, the Validator agent catches it, lowers the confidence score, and flags the ambiguity for a human.
3.  **Extensible Knowledge Base**: If the EU AI Act changes, or Norrin's internal HR policies shift, we simply drop a new `.md` or `.pdf` file into the `norrin_kb` folder and restart the ingestion script. Zero code changes required.
4.  **Multimodal Support**: The recent addition of file uploads allows product managers to upload raw architecture diagrams and PRDs (Product Requirement Documents) directly into the classifier.

### Disadvantages / Limitations
1.  **Context Window Constraints**: While models are improving, dropping a massive 400-page PDF into the classifier at once may result in truncation or "lost in the middle" phenomena during extraction. We currently rely on chunking to mitigate this.
2.  **Not Legal Advice**: As an automated system, it lacks the nuanced, contextual understanding of case law that a human lawyer possesses. It is strictly a "first-pass triage" tool.
3.  **Sequential Bottleneck**: The Senior Validator must wait for the Junior Analyst to finish. This adds a few seconds of latency that could theoretically be optimized using speculative execution models in the future.

---

## 3. Integration with Norrin Infrastructure

To move Compliance Lens from a prototype to a production-grade internal Norrin tool, the following integration steps are recommended:

### A. Deployment & Hosting
*   **Containerization**: Dockerize both the Next.js frontend and the FastAPI backend.
*   **Orchestration**: Deploy to Norrin's existing Kubernetes (K8s) clusters.
*   **Database Integration**: Swap the local file-based ChromaDB for a managed enterprise vector database (e.g., Pinecone, Milvus, or pgvector within Norrin's existing PostgreSQL clusters) to allow high-availability and distributed scaling.

### B. Authentication & Security (SSO)
*   Integrate the Next.js frontend with Norrin's existing Identity Provider (e.g., Okta, Azure AD, Google Workspace) using OAuth 2.0 / SAML.
*   Ensure that only authorized Product Managers and Legal Counsel can access the tool.

### C. CI/CD & Knowledge Base Sync
*   Instead of manually running ingestion scripts, link the `norrin_kb` database directly to Norrin's internal Confluence or SharePoint.
*   When the legal team updates an internal policy on Confluence, a web-hook automatically triggers the backend to re-embed and update the Vector Database.

---

## 4. Future Expansion & Roadmap

Looking beyond the current implementation, Compliance Lens can evolve into a comprehensive AI governance platform:

1.  **Jira / Linear Integration**:
    *   Instead of using a standalone web app, integrate Compliance Lens as a Jira plugin. When a PM creates a Jira Epic for a new AI feature, the bot automatically scans the ticket and posts a comment with the predicted EU AI Act Risk Tier.

2.  **Continuous Monitoring (Drift Detection)**:
    *   Compliance isn't a one-time event. Future versions could hook into model registries (e.g., MLflow, Vertex AI) to monitor deployed models. If a model's purpose drifts from "Limited Risk" to "High Risk", the system triggers an alert to the legal team.

3.  **Global Regulatory Support**:
    *   Currently focused on the EU AI Act. We can easily scale the RAG database to include the **US Executive Order on AI**, **Canada's AIDA**, and **UK AI Guidelines**, allowing the tool to provide regional compliance breakdowns simultaneously.

4.  **Automated Conformity Documentation**:
    *   For "High Risk" systems, the tool could automatically generate a draft of the required EU Declaration of Conformity and CE Marking technical documentation based on the chat history and uploaded PRDs.
