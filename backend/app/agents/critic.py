import json
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_REASONING

logger = logging.getLogger(__name__)

class RedTeamCriticAgent:
    """
    Independent compliance audit agent that reviews the first-pass legal analysis.
    Identifies ungrounded assumptions, flags gaps, estimates uncertainty levels,
    rates evidence quality, and designs highly specialized follow-up questions.
    """
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=MODEL_REASONING,
            generation_config={"response_mime_type": "application/json"}
        )

    def review_analysis(self, facts: dict, analysis: dict) -> dict:
        logger.info("RedTeamCriticAgent: Auditing the legal assessment and identifying gaps...")
        
        system_instruction = (
            "You are an independent, highly critical Red-Team compliance auditor specializing in the EU AI Act. "
            "Your job is to critically review a first-pass legal assessment and the extracted facts of an AI use case.\n\n"
            "You must be skeptical. Look for:\n"
            "- Overconfident or unsupported legal conclusions (e.g. concluding a system is NOT high-risk without checking all Annex III subcategories).\n"
            "- Ungrounded assumptions made by the analyst or facts lacking technical validation.\n"
            "- Contradictions or weak spots in the evidentiary documents.\n"
            "- Quality of the reference materials cited.\n"
            "- Critical information gaps that prevent a confident assessment.\n\n"
            "You must return a valid JSON object matching this schema exactly:\n"
            "{\n"
            "  \"critic_summary\": \"Overall critical evaluation of the assessment's strength, certainty, and potential blindspots (1-2 paragraphs).\",\n"
            "  \"certainty_scores\": {\n"
            "    \"ai_system_definition\": {\n"
            "       \"score\": 85,\n"
            "       \"justification\": \"Why is the confidence high/medium/low?\"\n"
            "    },\n"
            "    \"risk_classification\": {\n"
            "       \"score\": 60,\n"
            "       \"justification\": \"Is the risk classification solid or is it a borderline case?\"\n"
            "    },\n"
            "    \"roles_and_obligations\": {\n"
            "       \"score\": 75,\n"
            "       \"justification\": \"Are provider/deployer boundaries clear?\"\n"
            "    }\n"
            "  },\n"
            "  \"flagged_assumptions\": [\n"
            "    {\n"
            "      \"assumption\": \"The assumed technical detail or operation.\",\n"
            "      \"risk\": \"Why making this assumption without proof is risky for compliance.\"\n"
            "    }\n"
            "  ],\n"
            "  \"information_gaps\": [\n"
            "    {\n"
            "      \"gap\": \"What critical information is missing from the use-case documents.\",\n"
            "      \"impact\": \"How this gap prevents a firm legal conclusion.\"\n"
            "    }\n"
            "  ],\n"
            "  \"expert_followup_questions\": [\n"
            "     \"Question 1: highly specific technical or governance question that an auditor would ask (e.g. 'Does the HR filter allow manual overrides, and is the override logged?')\",\n"
            "     \"Question 2: ...\"\n"
            "  ],\n"
            "  \"source_quality_audit\": [\n"
            "    {\n"
            "      \"citation\": \"Title/ID of the cited source.\",\n"
            "      \"type\": \"Legislation / Commission Guidance / National Implementation / Uploaded Material / Assumption\",\n"
            "      \"reliability\": \"High / Medium / Low\",\n"
            "      \"notes\": \"Brief audit note on the authority and version of this cited reference.\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        prompt = (
            f"{system_instruction}\n\n"
            f"Extracted Use-case facts:\n\n{json.dumps(facts, indent=2)}\n\n"
            f"First-pass Legal Analysis:\n\n{json.dumps(analysis, indent=2)}\n\n"
            f"Perform the critical audit and return the JSON evaluation."
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
            logger.info("RedTeamCriticAgent: Audit completed successfully.")
            return parsed_json
        except Exception as e:
            logger.error(f"RedTeamCriticAgent failed: {e}")
            # Fallback structure
            return {
                "critic_summary": "System failure: Red-team independent audit could not execute correctly.",
                "certainty_scores": {
                    "ai_system_definition": {"score": 50, "justification": "Analysis failed to complete."},
                    "risk_classification": {"score": 50, "justification": "Analysis failed to complete."},
                    "roles_and_obligations": {"score": 50, "justification": "Analysis failed to complete."}
                },
                "flagged_assumptions": [{"assumption": "None verified due to crash.", "risk": "High"}],
                "information_gaps": [{"gap": "Audit engine failure.", "impact": "Prevents verification of legal grounding."}],
                "expert_followup_questions": [
                    "Can you verify the deployment environment and data pipelines manually?",
                    "What are the specific model architectures and training metrics?"
                ],
                "source_quality_audit": []
            }
