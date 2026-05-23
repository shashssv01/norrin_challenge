import json
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_FAST
from backend.app.corpus.db import retrieve

logger = logging.getLogger(__name__)

class RetrievalAgent:
    """
    Agent responsible for analyzing the extracted use-case facts, autonomously determining
    which legal and regulatory aspects to search for, generating optimal queries, and 
    retrieving highly relevant legal texts from the built-in corpus.
    """
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=MODEL_FAST,
            generation_config={"response_mime_type": "application/json"}
        )

    def analyze_and_retrieve(self, facts_dict: dict) -> dict:
        logger.info("RetrievalAgent: Analyzing facts to formulate retrieval strategy...")
        
        system_instruction = (
            "You are an expert legal information broker specialized in European digital regulation. "
            "Your job is to read a JSON-structured set of use-case facts and determine what legal "
            "regulations under the EU AI Act, adjacent laws, or official guidelines are triggered.\n\n"
            "You must decide autonomously which categories to prioritize:\n"
            "- Prohibited practices (e.g. if biometrics or emotion tracking is mentioned)\n"
            "- High-risk categories (e.g. if employment, critical infrastructure, credit scoring, education is mentioned)\n"
            "- Transparency / Labelling (e.g. if chatbots, synthetic images, deepfakes, emotion recognition are mentioned)\n"
            "- General-purpose AI rules (e.g. if LLMs, foundation models are integrated)\n"
            "- Adjacent laws (GDPR automated decisions, Finnish national oversight)\n\n"
            "You must output a JSON object containing:\n"
            "{\n"
            "  \"search_strategy\": \"Brief description of your retrieval focus and why (2-3 sentences).\",\n"
            "  \"search_queries\": [\n"
            "     \"Query 1: specific terms like 'Article 5 emotion recognition prohibited'\",\n"
            "     \"Query 2: e.g. 'Annex III employment resume hiring screening high risk'\"\n"
            "  ]\n"
            "}"
        )

        prompt = f"Use-case facts:\n\n{json.dumps(facts_dict, indent=2)}\n\nFormulate your search strategy and queries."

        # Initialize fallback queries
        queries = ["EU AI Act high risk Annex III", "Article 5 prohibited practices", "Article 50 transparency chatbot"]
        strategy = "General AI Act compliance retrieval fallback due to API parser constraints."

        try:
            response = self.model.generate_content(
                contents=prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            parsed_json = json.loads(response.text)
            strategy = parsed_json.get("search_strategy", strategy)
            queries = parsed_json.get("search_queries", queries)
            logger.info(f"RetrievalAgent generated {len(queries)} targeted search queries autonomously.")
        except Exception as e:
            logger.error(f"RetrievalAgent strategy formulation failed: {e}. Falling back to default search.")

        # Execute semantic vector search for each query
        retrieved_docs = {}
        
        for q in queries:
            # Extract query text safely if LLM returns a structured dictionary
            if isinstance(q, dict):
                query_str = q.get("query_string") or q.get("query") or q.get("search_term") or q.get("text") or str(q)
            else:
                query_str = str(q)
                
            logger.info(f"RetrievalAgent executing vector search for: '{query_str}'")
            matches = retrieve(query_str, top_n=3)
            for doc in matches:
                # Store in dictionary to de-duplicate documents automatically
                retrieved_docs[doc["id"]] = doc
                
        retrieved_list = list(retrieved_docs.values())
        logger.info(f"RetrievalAgent retrieved {len(retrieved_list)} unique regulatory sections from corpus.")

        return {
            "search_strategy": strategy,
            "search_queries": queries,
            "retrieved_references": retrieved_list
        }
