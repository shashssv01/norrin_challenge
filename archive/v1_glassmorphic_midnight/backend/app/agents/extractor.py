import json
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_FAST

logger = logging.getLogger(__name__)

class FactExtractorAgent:
    """
    Agent responsible for digesting raw use-case documents and synthesizing them into 
    a standardized set of structured facts, identifying contradictions, assumptions, and gaps.
    """
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=MODEL_FAST,
            generation_config={"response_mime_type": "application/json"}
        )

    def extract_facts(self, raw_text: str) -> dict:
        logger.info("FactExtractorAgent: Extracting facts from use-case documentation...")
        
        system_instruction = (
            "You are an expert AI Governance and Compliance auditor. Your role is to analyze "
            "raw use-case documentation and extract a structured, grounded representation of all facts. "
            "You must identify contradictory evidence or unverified assertions within the documents.\n\n"
            "You must return a valid JSON object matching this schema exactly:\n"
            "{\n"
            "  \"summary\": \"Concise, objective summary of the use case (2-3 paragraphs).\",\n"
            "  \"extracted_facts\": {\n"
            "    \"purpose\": \"The primary intended objective or goal of the AI system.\",\n"
            "    \"users\": \"Who is operating or deploying this system (e.g., HR managers, customer support reps, police)?\",\n"
            "    \"affected_persons\": \"The individuals or groups whose health, safety, or fundamental rights are affected by the system's outputs.\",\n"
            "    \"sector\": \"The domain or industry sector (e.g., employment, banking, healthcare, infrastructure, education, retail).\",\n"
            "    \"input_data\": \"Types of input data (e.g., personal resumes, biometric face templates, text queries, device sensor logs).\",\n"
            "    \"outputs\": \"Outputs produced (e.g. predictions, classifications, content, scores, actions, or recommendations).\",\n"
            "    \"automation_level\": \"How automated is the system (e.g., fully autonomous execution, human-in-the-loop validation, human-on-the-loop supervision)?\",\n"
            "    \"human_oversight\": \"Specific human oversight features described (e.g. manual approval queues, override toggles, kill switches, audit panels).\",\n"
            "    \"deployment_context\": \"Where is it deployed (e.g., public clouds, on-premises servers in Finland, SaaS integration, embedded in hardware devices)?\",\n"
            "    \"use_of_generative_ai\": \"Does the system generate synthetic images, audio, video, or conversational text? (Yes/No with explanation)\",\n"
            "    \"use_of_gpai\": \"Does the system integrate a foundation General-Purpose AI model (e.g. Gemini, GPT-4, Claude)? (Yes/No with explanation)\",\n"
            "    \"impact_on_people\": \"How does it affect people's opportunities, livelihood, rights, physical safety, or mental state?\"\n"
            "  },\n"
            "  \"contradictions\": [\n"
            "     \"List any contradictory statements found in the uploaded text (e.g., 'page 2 says human-in-the-loop, but page 5 says automatic termination without review'). If none, return an empty array.\"\n"
            "  ],\n"
            "  \"assumptions\": [\n"
            "     \"List key assumptions you had to make about technical details or practices that were not explicitly detailed in the text but are critical for analysis.\"\n"
            "  ],\n"
            "  \"uncertainties\": [\n"
            "     \"List critical uncertainties where information is too thin or vague to draw a firm fact.\"\n"
            "  ]\n"
            "}\n\n"
            "Do not hallucinate facts. Everything must be strictly grounded in the provided text. "
            "If a section is completely missing, write 'Not specified in the documentation' and add an item in uncertainties."
        )

        prompt = (
            f"{system_instruction}\n\n"
            f"Use-case documents text:\n\n{raw_text}\n\n"
            f"Perform extraction and return the JSON object."
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
            logger.info("FactExtractorAgent: Fact extraction complete.")
            return parsed_json
        except Exception as e:
            logger.error(f"FactExtractorAgent failed: {e}")
            # Robust fallback structure
            return {
                "summary": "Error parsing documents. Fallback mode activated.",
                "extracted_facts": {
                    "purpose": "Unknown due to parse error.",
                    "users": "Unknown",
                    "affected_persons": "Unknown",
                    "sector": "Unknown",
                    "input_data": "Unknown",
                    "outputs": "Unknown",
                    "automation_level": "Unknown",
                    "human_oversight": "Unknown",
                    "deployment_context": "Unknown",
                    "use_of_generative_ai": "Unknown",
                    "use_of_gpai": "Unknown",
                    "impact_on_people": "Unknown"
                },
                "contradictions": ["System parsing failure: could not inspect discrepancies securely."],
                "assumptions": ["Assumed system is an AI system for baseline safety."],
                "uncertainties": [f"Technical error: {str(e)}"]
            }
