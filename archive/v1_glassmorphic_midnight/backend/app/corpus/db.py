import os
import json
import math
import logging
import google.generativeai as genai
from backend.app.config import GEMINI_API_KEY, MODEL_EMBEDDING
from backend.app.corpus.raw_corpus import CORPUS

logger = logging.getLogger(__name__)

# Configure the generativeai client
genai.configure(api_key=GEMINI_API_KEY)

CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "corpus_embeddings.json")

# In-memory store for loaded embeddings
# Format: { "Art_3_1_AI_Def": [0.1, 0.05, ...] }
_EMBEDDINGS_CACHE = {}

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculate the cosine similarity between two vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def get_text_embedding(text: str, task_type: str = "retrieval_document") -> list[float]:
    """Retrieve embedding vector for text using Gemini's text-embedding-004."""
    try:
        response = genai.embed_content(
            model=MODEL_EMBEDDING,
            content=text,
            task_type=task_type
        )
        return response["embedding"]
    except Exception as e:
        logger.error(f"Error fetching embedding from Gemini: {e}")
        # Return empty list to signal failure, triggering fallback search
        return []

def initialize_embeddings(force_refresh: bool = False):
    """
    Load cached embeddings or query Gemini API to build the vector corpus database.
    Saves to a local JSON file to prevent re-indexing on every start.
    """
    global _EMBEDDINGS_CACHE
    
    if not force_refresh and os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                _EMBEDDINGS_CACHE = json.load(f)
            logger.info("Loaded EU AI Act corpus embeddings from local cache.")
            return
        except Exception as e:
            logger.warning(f"Failed to read embedding cache, re-building: {e}")
            
    logger.info("Generating semantic embeddings for the built-in reference corpus...")
    _EMBEDDINGS_CACHE = {}
    
    for doc in CORPUS:
        # Construct dense representation for embedding
        content_to_embed = f"{doc['title']}\n{doc['text']}\nKeywords: {', '.join(doc['key_indicators'])}"
        
        # Query API
        vector = get_text_embedding(content_to_embed, task_type="retrieval_document")
        if vector:
            _EMBEDDINGS_CACHE[doc["id"]] = vector
        else:
            logger.warning(f"Could not generate embedding for {doc['id']}. Will use keyword-based fallback.")
            
    # Save cache
    if _EMBEDDINGS_CACHE:
        try:
            with open(CACHE_PATH, "w", encoding="utf-8") as f:
                json.dump(_EMBEDDINGS_CACHE, f, ensure_ascii=False, indent=2)
            logger.info("Successfully generated and cached reference corpus embeddings.")
        except Exception as e:
            logger.error(f"Failed to write embedding cache: {e}")

def keyword_search_fallback(query: str, top_n: int = 5) -> list[dict]:
    """
    A robust lexical keyword match fallback when embedding APIs are rate-limited or unavailable.
    Calculates simple token overlap and keyword frequencies.
    """
    query_tokens = set(query.lower().split())
    results = []
    
    for doc in CORPUS:
        score = 0.0
        doc_text = f"{doc['title']} {doc['text']} {' '.join(doc['key_indicators'])}".lower()
        
        # Basic word match
        for token in query_tokens:
            if len(token) < 3: # skip tiny words
                continue
            count = doc_text.count(token)
            if count > 0:
                score += count * 1.5
                
        # Bonus for exact ID/article matching in query (e.g. 'article 5' or 'annex iii')
        if doc["id"].lower().replace("_", " ") in query.lower():
            score += 15.0
        if doc["title"].lower() in query.lower():
            score += 10.0
            
        if score > 0:
            results.append({
                "doc": doc,
                "score": score
            })
            
    # Sort and return top_n
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Normalize score between 0.0 and 0.95 for API consistency
    max_score = max([r["score"] for r in results]) if results else 1.0
    for r in results:
        r["score"] = min(0.95, 0.4 + 0.5 * (r["score"] / max_score))
        
    return [r["doc"] for r in results[:top_n]]

def retrieve(query: str, top_n: int = 5) -> list[dict]:
    """
    Retrieves the most relevant documents from the built-in reference corpus.
    Tries semantic cosine similarity first, falling back to lexical search if needed.
    """
    if not _EMBEDDINGS_CACHE:
        initialize_embeddings()
        
    query_vector = get_text_embedding(query, task_type="retrieval_query")
    
    # Fallback to lexical if embedding fails
    if not query_vector or not _EMBEDDINGS_CACHE:
        logger.warning("Embeddings unavailable. Executing lexical keyword search fallback.")
        return keyword_search_fallback(query, top_n)
        
    scored_results = []
    for doc_id, doc_vector in _EMBEDDINGS_CACHE.items():
        similarity = cosine_similarity(query_vector, doc_vector)
        # Find raw document
        doc = next((d for d in CORPUS if d["id"] == doc_id), None)
        if doc:
            scored_results.append({
                "doc": doc,
                "score": similarity
            })
            
    # Sort by similarity score descending
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    
    # Filter results to top_n
    top_matches = scored_results[:top_n]
    
    # Debug logging
    for i, match in enumerate(top_matches):
        logger.debug(f"Retrieved Match {i+1}: {match['doc']['id']} (Score: {match['score']:.4f})")
        
    return [match["doc"] for match in top_matches]
