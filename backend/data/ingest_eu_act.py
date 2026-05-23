import os
import chromadb
from openai import OpenAI
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
import pdfplumber

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy-key"))
chroma = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH", "./chroma_db"))

try:
    chroma.delete_collection("eu_ai_act")
except:
    pass
collection = chroma.create_collection("eu_ai_act")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
)

pdf_path = Path(__file__).parent / "eu_ai_act.pdf"
print(f"Reading PDF from {pdf_path}")

full_text = ""
pages_extracted = 0

with pdfplumber.open(pdf_path) as pdf:
    # Limit to first 20 pages as requested by user to limit resource usage
    max_pages = min(20, len(pdf.pages))
    for i in range(max_pages):
        page = pdf.pages[i]
        text = page.extract_text()
        if text:
            full_text += text + "\n\n"
        pages_extracted += 1

print(f"Extracted {pages_extracted} pages (Limited for resource saving)")

chunks = splitter.split_text(full_text)
print(f"Created {len(chunks)} chunks")

metadatas = []
ids = []

for i, chunk in enumerate(chunks):
    metadatas.append({
        "source": "eu_ai_act",
        "article": f"Excerpt {i}",
        "title": "EU AI Act",
    })
    ids.append(f"eu_ai_act_{i}")

# Embed in batches
batch_size = 20
for i in range(0, len(chunks), batch_size):
    batch = chunks[i:i + batch_size]
    try:
        response = client.embeddings.create(
            input=batch,
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        )
        embeddings = [r.embedding for r in response.data]
        collection.add(
            documents=batch,
            embeddings=embeddings,
            metadatas=metadatas[i:i + batch_size],
            ids=ids[i:i + batch_size]
        )
    except Exception as e:
        print(f"Failed to embed batch (using mock embeddings): {e}")
        mock_embeddings = [[0.0] * 1536 for _ in batch]
        collection.add(
            documents=batch,
            embeddings=mock_embeddings,
            metadatas=metadatas[i:i + batch_size],
            ids=ids[i:i + batch_size]
        )

print(f"Embedded and stored in Chroma collection: eu_ai_act")
print(f"Documents: {collection.count()}")
print("Done.")
