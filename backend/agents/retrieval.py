import os

class RetrievalAgent:
    def __init__(self):
        # Without Chroma installed, we will mock retrieval to avoid C++ build issues on Windows.
        pass

    async def search(self, query: str) -> dict:
        print(f"Retrieving context for: {query[:50]}...")
        # Mocking retrieval results based on typical HR / Employment context 
        # (This avoids heavy embedding queries during the demo unless needed)
        eu_chunks = [{
            "text": "Article 6(2) exemption criteria...",
            "source": "eu_ai_act",
            "article": "Article 6",
            "title": "EU AI Act",
            "relevance_score": 0.92
        }, {
            "text": "Annex III point 4(a): Systems intended to be used for recruitment or selection of natural persons...",
            "source": "eu_ai_act",
            "article": "Annex III",
            "title": "EU AI Act",
            "relevance_score": 0.89
        }]
        
        norrin_chunks = [{
            "text": "HR Technology AI Systems: For any HR AI system that ranks or scores candidates, default to HIGH_RISK...",
            "source": "norrin_internal",
            "article": "HR Tech Guidance",
            "title": "hr_tech_guidance.md",
            "relevance_score": 0.85
        }]
        
        return {
            "eu_act_chunks": eu_chunks,
            "norrin_chunks": norrin_chunks
        }
