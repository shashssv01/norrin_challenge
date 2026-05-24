import os
import urllib.request

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PDF_PATH = os.path.join(DATA_DIR, "eu_ai_act.pdf")
PDF_URL = "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ:L_202401689"

def download_pdf():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    if os.path.exists(PDF_PATH):
        print(f"PDF already exists at {PDF_PATH}")
        return

    print(f"Downloading EU AI Act PDF from {PDF_URL}...")
    try:
        # We might need headers to simulate a browser if eur-lex blocks it, but let's try direct first.
        req = urllib.request.Request(PDF_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(PDF_PATH, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Downloaded successfully to {PDF_PATH}")
    except Exception as e:
        print(f"Error downloading PDF: {e}")

if __name__ == "__main__":
    download_pdf()
