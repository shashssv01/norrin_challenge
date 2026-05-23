import os

# API Configurations
DEFAULT_API_KEY = "AIzaSyB80g5n4MMwyjSRFkLZVfYy3oIZZRzWNVw"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", DEFAULT_API_KEY)

# Model Settings
# We use gemini-1.5-pro for complex regulatory synthesis and critic red-teaming
# We use gemini-1.5-flash for high-speed extraction, retrieval, and chat
MODEL_REASONING = "models/gemini-3.1-flash-lite"
MODEL_FAST = "models/gemini-3.1-flash-lite"
MODEL_EMBEDDING = "models/gemini-embedding-001"

# Session Store Directory (temporary storage in workspace)
SESSION_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sessions")
os.makedirs(SESSION_DIR, exist_ok=True)
