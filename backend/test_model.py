import sys
import google.generativeai as genai

sys.path.append(r"c:\Users\pinku\Downloads\AI for good")
from backend.app.config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

models_to_test = [
    "models/gemini-3.1-pro-preview",
    "models/gemini-3.1-flash-lite",
    "models/gemini-3-pro-preview",
    "models/gemini-3-flash-preview",
    "models/gemini-2.5-flash-lite"
]

for model_name in models_to_test:
    print(f"\n--- Testing Model: {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello in one word.")
        print(f"Response: {response.text.strip()}")
        print(f"SUCCESS: {model_name} is active and has available quota!")
    except Exception as e:
        print(f"FAILED: {model_name} failed with error: {e}")
