import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

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

class ValidatorAgent:
    def __init__(self):
        self.model = os.getenv("OPENAI_MODEL", "gemini-2.5-flash")

    async def validate(self, description: str, context: dict, classification: dict) -> dict:
        prompt = f"""
Product Description:
{description}

Junior Analyst Classification to Review:
{json.dumps(classification, indent=2)}
"""
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": VALIDATOR_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Error calling LLM: {e}")
            return {
                "agrees_with_tier": True,
                "confidence_score": 50,
                "concerns": "Fallback mock due to API error.",
                "missing_from_description": [],
                "suggested_followup_questions": [],
                "alternative_tier_possible": False,
                "alternative_tier": None,
                "alternative_rationale": None
            }
