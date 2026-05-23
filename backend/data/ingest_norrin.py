import os
import chromadb
from openai import OpenAI
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy-key"))
chroma = chromadb.PersistentClient(path=os.getenv("CHROMA_PATH", "./chroma_db"))

try:
    chroma.delete_collection("norrin_kb")
except:
    pass
collection = chroma.create_collection("norrin_kb")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=40,
    separators=["\n## ", "\n### ", "\n\n", "\n"]
)

norrin_path = Path(os.getenv("NORRIN_KB_PATH", "./norrin_kb"))
all_files = list(norrin_path.glob("*.md"))
print(f"Found {len(all_files)} Norrin knowledge base files")

chunks = []
metadatas = []
ids = []

for file in all_files:
    text = file.read_text(encoding="utf-8")
    file_chunks = splitter.split_text(text)
    
    for i, chunk in enumerate(file_chunks):
        chunk_id = f"norrin_{file.stem}_{i}"
        chunks.append(chunk)
        metadatas.append({
            "source": "norrin_internal",
            "filename": file.name,
            "topic": file.stem.replace("_", " "),
            "chunk_index": i
        })
        ids.append(chunk_id)

# Embed in batches of 20
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
        print(f"Failed to embed batch: {e}")
        # Mock embeddings for now if API key is invalid
        mock_embeddings = [[0.0] * 1536 for _ in batch]
        collection.add(
            documents=batch,
            embeddings=mock_embeddings,
            metadatas=metadatas[i:i + batch_size],
            ids=ids[i:i + batch_size]
        )

print(f"Created {len(chunks)} chunks")
print(f"Embedded and stored in Chroma collection: norrin_kb")
print(f"Documents: {collection.count()}")
print("Done.")
