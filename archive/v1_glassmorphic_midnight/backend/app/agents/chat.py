import json
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_FAST
from backend.app.corpus.db import retrieve

logger = logging.getLogger(__name__)

class ChatAgent:
    """
    Agent responsible for interactive conversational follow-ups.
    Answers regulatory questions and dynamically updates the compliance assessment
    when the user shares new details about the AI system.
    """
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=MODEL_FAST,
            generation_config={"response_mime_type": "application/json"}
        )

    def answer_question(self, user_message: str, chat_history: list[dict], assessment: dict) -> dict:
        logger.info("ChatAgent: Processing user follow-up message...")
        
        # Determine if we need to retrieve additional articles for this question
        # For example, if the user mentions specific articles or keywords
        retrieved_refs_text = ""
        if any(keyword in user_message.lower() for keyword in ["article", "annex", "gdpr", "traficom", "rules"]):
            logger.info(f"ChatAgent: Triggering semantic retrieval for chat query: '{user_message}'")
            matches = retrieve(user_message, top_n=2)
            for m in matches:
                retrieved_refs_text += f"\n- {m['title']}: {m['text']} (URL: {m['url']})\n"

        system_instruction = (
            "You are an interactive AI Act Compliance Assistant. Your role is to guide the user "
            "through their follow-up questions about their AI compliance assessment. You must be polite, "
            "precise, and legally grounded.\n\n"
            "Here is the current AI Use-Case Assessment state:\n"
            f"{json.dumps(assessment, indent=2)}\n\n"
            "If the user provides new technical specifications, governance policies, or operational "
            "details (e.g. 'We added manual veto controls' or 'We don't process biometric data anymore'), "
            "you must autonomously update the assessment. Determine which fields in the assessment should "
            "be changed and return them in the 'updated_assessment' field of your response.\n\n"
            "You must return a valid JSON object matching this schema exactly:\n"
            "{\n"
            "  \"chat_response\": \"Your thorough, grounded response to the user's follow-up question. Format it nicely with markdown. Limit to 3-4 paragraphs.\",\n"
            "  \"updated_assessment\": {\n"
            "     \"Optional revised assessment fields. For example, if they added a human oversight override switch, return:\",\n"
            "     \"extracted_facts\": {\n"
            "         \"human_oversight\": \"Updated human oversight facts here...\"\n"
            "     },\n"
            "     \"governance_observations\": {\n"
            "         \"human_oversight\": \"Updated legal guidance regarding human oversight...\"\n"
            "     }\n"
            "  }\n"
            "}\n"
            "If no information is updated, return an empty object or null for 'updated_assessment'.\n"
            "Do not provide final legal advice. Always maintain a decision-support advisor tone."
        )

        # Format conversation history
        formatted_history = []
        for msg in chat_history[-6:]:  # Keep last 6 exchanges for context
            formatted_history.append(f"{msg['role'].capitalize()}: {msg['content']}")
        history_text = "\n".join(formatted_history)

        prompt = (
            f"{system_instruction}\n\n"
            f"Conversation History:\n{history_text}\n"
            f"User's new message: {user_message}\n"
            f"Additional retrieved laws (if any): {retrieved_refs_text}\n\n"
            "Generate your response in the required JSON format."
        )

        try:
            response = self.model.generate_content(
                contents=prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            parsed_json = json.loads(response.text)
            logger.info("ChatAgent: Successfully generated conversational response.")
            return parsed_json
        except Exception as e:
            logger.error(f"ChatAgent failed to answer: {e}")
            return {
                "chat_response": f"I'm sorry, I encountered an error while analyzing your question. Technical error: {str(e)}",
                "updated_assessment": None
            }
