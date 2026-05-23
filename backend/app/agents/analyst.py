import json
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_REASONING

logger = logging.getLogger(__name__)

class LegalAnalystAgent:
    """
    Agent responsible for conducting the core legal and regulatory analysis under the EU AI Act
    and adjacent frameworks. Maps facts directly to retrieved laws and provides structured assessments.
    """
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=MODEL_REASONING,
            generation_config={"response_mime_type": "application/json"}
        )

    def analyze_compliance(self, facts: dict, references: list[dict]) -> dict:
        logger.info("LegalAnalystAgent: Conducting regulatory analysis...")
        
        # Format references for LLM context
        references_text = ""
        for i, ref in enumerate(references):
            references_text += (
                f"--- REFERENCE {i + 1}: {ref['title']} ({ref['source']}) ---\n"
                f"ID: {ref['id']}\n"
                f"URL: {ref['url']}\n"
                f"Text:\n{ref['text']}\n"
                f"Trigger Criteria: {', '.join(ref['key_indicators'])}\n\n"
            )

        system_instruction = (
            "You are a Senior Legal Counsel specializing in European Digital Regulations, specifically the EU AI Act, "
            "GDPR, and national implementations. Your task is to perform a rigorous, objective, first-pass compliance "
            "assessment of an AI use case based on its extracted facts and a set of retrieved regulatory reference texts.\n\n"
            "You must ensure your assessment is highly grounded, referencing specific Article numbers, "
            "provisions, and official guidelines. Always distinguish facts from assumptions and legal reasoning.\n\n"
            "You must analyze the supply chain role: Provider, Deployer, Importer, Distributor, or Downstream Integrator.\n"
            "Assess whether safety product conformity assessments (Article 6/Annex I), stand-alone High-Risk applications (Annex III), "
            "Specific Transparency/Labelling (Article 50), or General-Purpose AI (GPAI/Chapter V) rules apply.\n"
            "Assess if a Fundamental Rights Impact Assessment (FRIA under Article 29a) is triggered (mandatory for banking, credit, employment, public services, health insurance, education).\n"
            "Assess if CE marking (Article 48) and EU database registration (Article 49) are triggered.\n\n"
            "You must return a valid JSON object matching this schema exactly:\n"
            "{\n"
            "  \"is_ai_system\": {\n"
            "    \"qualifies\": true,\n"
            "    \"reasoning\": \"Step-by-step analysis demonstrating how the system does or does not meet the Article 3(1) definition of an AI system (machine-based, autonomy, adaptiveness, outputs inference).\",\n"
            "    \"citations\": [\"Article 3(1) - Definition of an AI System\"]\n"
            "  },\n"
            "  \"risk_classification\": {\n"
            "    \"tier\": \"Prohibited / High Risk / Specific Transparency / Minimal Risk\",\n"
            "    \"reasoning\": \"Comprehensive legal justification of this classification tier, referencing Article 5, Article 6, and/or Annex III standalone categories.\",\n"
            "    \"citations\": [\"Article 5 - Prohibited AI Practices\", \"Annex III - Standalone High-Risk\"]\n"
            "  },\n"
            "  \"role_assessment\": {\n"
            "    \"role\": \"Provider / Deployer / Downstream Integrator / Importer / Distributor\",\n"
            "    \"reasoning\": \"Analysis of which role the organizing entity occupies under Article 3 definitions (who designs, who places on market, who operates it professionally).\",\n"
            "    \"citations\": [\"Article 3 Definitions\"]\n"
            "  },\n"
            "  \"legal_obligations\": [\n"
            "    {\n"
            "      \"obligation_id\": \"unique-kebab-case-id (e.g. art-9-risk-management, art-14-human-oversight, art-26-deployer-logs, art-29a-fria, art-48-ce-marking)\",\n"
            "      \"obligation\": \"Name of obligation (e.g. Article 14 Human Oversight, Article 29a Fundamental Rights Impact Assessment, Article 26 Deployer Logging)\",\n"
            "      \"scope\": \"Specific description of what is legally required.\",\n"
            "      \"relevance\": \"Why it is triggered based on the use-case facts.\",\n"
            "      \"relevance_tier\": \"Blocker / Critical / Recommended\",\n"
            "      \"citations\": [\"Article 14 - Human Oversight\", \"Article 26 - Deployer obligations\"]\n"
            "    }\n"
            "  ],\n"
            "  \"governance_observations\": {\n"
            "    \"risk_management\": \"Iterative measures required (Article 9).\",\n"
            "    \"data_governance\": \"Bias prevention, data cleaning, and dataset audits required (Article 10).\",\n"
            "    \"documentation\": \"Technical files and instructions of use required (Article 11 & 13).\",\n"
            "    \"human_oversight\": \"Practical human-in-the-loop validation, fail-safes, or manual veto features to build.\",\n"
            "    \"logging_and_monitoring\": \"Log capture, storage duration, post-market reporting requirements (Article 12).\"\n"
            "  },\n"
            "  \"adjacent_frameworks\": {\n"
            "    \"gdpr_overlap\": \"Analysis of GDPR triggers (e.g. Article 22 Automated Individual Decisions or Article 35 DPIA requirements).\",\n"
            "    \"finnish_context\": \"Specific considerations regarding Finnish Traficom oversight, TEM, and data protection ombudsman.\",\n"
            "    \"european_context\": \"Coordination and compliance context under other national market authorities (e.g. French CNIL, German BfDI, Spanish AEPD).\",\n"
            "    \"citations\": [\"GDPR Article 22\", \"Finnish Traficom guidelines\", \"EU Adjacent National Surveillance\"]\n"
            "  },\n"
            "  \"citation_library\": [\n"
            "     {\n"
            "       \"title\": \"Citing Document Title (e.g., Article 5 - Prohibited Artificial Intelligence Practices)\",\n"
            "       \"source\": \"Source type (Legislation, Commission Guidance, National, etc.)\",\n"
            "       \"url\": \"Citation URL\",\n"
            "       \"relevance_summary\": \"How this reference directly maps and grounds the assessment findings.\"\n"
            "     }\n"
            "  ]\n"
            "}\n\n"
            "Avoid final legal disclaimers inside the JSON structure itself; these will be handled by the user interface. "
            "Focus 100% on high-quality, grounded, rigorous analysis."
        )

        prompt = (
            f"{system_instruction}\n\n"
            f"Use-case facts:\n\n{json.dumps(facts, indent=2)}\n\n"
            f"Retrieved reference corpus documents:\n\n{references_text}\n\n"
            f"Analyze compliance and output the detailed assessment in the requested JSON format."
        )

        try:
            response = self.model.generate_content(
                contents=prompt,
                generation_config={"response_mime_type": "application/json"},
                safety_settings=[
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                ]
            )
            parsed_json = json.loads(response.text)
            logger.info("LegalAnalystAgent: Analysis successfully completed.")
            return parsed_json
        except Exception as e:
            logger.error(f"LegalAnalystAgent failed: {e}")
            # Robust fallback response
            return {
                "is_ai_system": {
                    "qualifies": True,
                    "reasoning": f"Analysis failed due to a system processing error: {str(e)}. Defaulting to AI qualification for safety.",
                    "citations": []
                },
                "risk_classification": {
                    "tier": "High Risk",
                    "reasoning": "Standard defensive fallback under system error condition.",
                    "citations": []
                },
                "role_assessment": {
                    "role": "Deployer",
                    "reasoning": "Inability to determine role dynamically.",
                    "citations": []
                },
                "legal_obligations": [],
                "governance_observations": {
                    "risk_management": "Establish risk management protocols immediately.",
                    "data_governance": "Validate data sources and audit for bias.",
                    "documentation": "Compile comprehensive model records.",
                    "human_oversight": "Integrate manual review controls.",
                    "logging_and_monitoring": "Activate system-level event logging."
                },
                "adjacent_frameworks": {
                    "gdpr_overlap": "GDPR compliance required for all personal data operations.",
                    "finnish_context": "National monitoring by Finnish Traficom is triggered.",
                    "citations": []
                },
                "citation_library": []
            }
