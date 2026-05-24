import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

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
  "summary": "A concise 1-2 sentence summary of the classification.",
  "key_facts": {
    "purpose": "What the system is built to do.",
    "outputs": "What the system produces or decides."
  },
  "risk_clarification": "Detailed explanation of potential risks.",
  "reasoning_breakdown": {
    "uploaded_document_facts": ["Fact 1 extracted from documents...", "Fact 2..."],
    "regulatory_references": ["EU AI Act Article X...", "Annex Y..."],
    "optional_sources": ["Norrin Guidance section Z..."],
    "assumptions": ["Assuming the system operates in domain X...", "Assuming human oversight..."],
    "uncertainties": ["Uncertain if the system processes biometric data..."],
    "system_reasoning": "How the facts and references logically combine to result in this classification tier."
  },
  "what_would_change_this": "Conditions that would alter the tier.",
  "insufficient_context": false,
  "missing_information": []
}
"""

class ClassifierAgent:
    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gemini-2.5-flash")

    def build_classifier_context(self, context: dict) -> str:
        eu_block = "\n\n".join([
            f"[EU AI ACT — {c.get('article', 'Unknown')}]\n{c.get('text', '')}"
            for c in context.get("eu_act_chunks", [])
        ])
        
        norrin_block = "\n\n".join([
            f"[NORRIN GUIDANCE — {c.get('article', 'Unknown')}]\n{c.get('text', '')}"
            for c in context.get("norrin_chunks", [])
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

    async def classify(self, description: str, context: dict) -> dict:
        context_str = self.build_classifier_context(context)
        prompt = f"Product Description:\n{description}\n\nContext:\n{context_str}"
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Error calling LLM: {e}")
            # Fallback mock if it fails
            return {
                "tier": "HIGH_RISK",
                "summary": "Fallback mock due to API error.",
                "key_facts": {
                    "purpose": "Unknown",
                    "outputs": "Unknown"
                },
                "risk_clarification": "Error connecting to AI.",
                "reasoning_breakdown": {
                    "uploaded_document_facts": [],
                    "regulatory_references": [],
                    "optional_sources": [],
                    "assumptions": ["API is down"],
                    "uncertainties": ["Everything"],
                    "system_reasoning": "Fallback triggered."
                },
                "what_would_change_this": "Fix the API connection.",
                "insufficient_context": False,
                "missing_information": []
            }

    async def answer(self, question: str, context: dict) -> str:
        context_str = self.build_classifier_context(context)
        system_prompt = "You are a legal assistant specializing in the EU AI Act. Answer the user's question based strictly on the provided context. If the context does not contain the answer, say so."
        prompt = f"Context:\n{context_str}\n\nQuestion:\n{question}"
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling LLM for chat: {e}")
            return "Sorry, I encountered an error connecting to the AI system. Please check your API key."
