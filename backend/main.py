from fastapi import FastAPI, HTTPException, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import uvicorn
import pdfplumber
import io
import time

from agents.orchestrator import Orchestrator
from export.audit_trail import build_audit_trail, export_to_json

app = FastAPI(title="Compliance Lens API")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

# Store sessions in memory for demo
session_store: dict[str, dict] = {}

class ClassifyRequest(BaseModel):
    description: str

class ChatRequest(BaseModel):
    question: str

@app.post("/api/classify")
async def classify(request: ClassifyRequest):
    t0 = time.time()
    result = await orchestrator.classify_product(request.description)
    t_total = (time.time() - t0) * 1000
    
    if "metrics" in result:
        result["metrics"]["total_ms"] = round(t_total, 2)
    
    # Store for export
    session_id = str(uuid.uuid4())
    session_store[session_id] = {
        "description": request.description,
        "result": result
    }
    
    return {
        "session_id": session_id,
        **result
    }

@app.post("/api/classify/upload")
async def classify_upload(files: list[UploadFile] = File(...), description: str = Form("")):
    t0 = time.time()
    extracted_text = ""
    
    for file in files:
        content = await file.read()
        extracted_text += f"\n--- Document: {file.filename} ---\n"
        if file.filename.endswith(".pdf"):
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page in pdf.pages:
                        extracted_text += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF {file.filename}: {str(e)}")
        else:
            try:
                extracted_text += content.decode("utf-8") + "\n"
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail=f"Only PDF and text files are supported ({file.filename}).")
    
    t_extract = (time.time() - t0) * 1000
    combined_description = f"User Description: {description}\n\nAttached Documents Content:\n{extracted_text}"
    
    result = await orchestrator.classify_product(combined_description)
    
    if "metrics" in result:
        result["metrics"]["extraction_ms"] = round(t_extract, 2)
        result["metrics"]["total_ms"] = round((time.time() - t0) * 1000, 2)
    
    session_id = str(uuid.uuid4())
    session_store[session_id] = {
        "description": combined_description,
        "result": result
    }
    
    return {
        "session_id": session_id,
        **result
    }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    result = await orchestrator.answer_question(request.question)
    return result

@app.post("/api/chat/upload")
async def chat_upload(files: list[UploadFile] = File(...), question: str = Form("Analyze this document.")):
    extracted_text = ""
    
    for file in files:
        content = await file.read()
        extracted_text += f"\n--- Document: {file.filename} ---\n"
        if file.filename.endswith(".pdf"):
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page in pdf.pages:
                        extracted_text += page.extract_text() + "\n"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse PDF {file.filename}: {str(e)}")
        else:
            try:
                extracted_text += content.decode("utf-8") + "\n"
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail=f"Only PDF and text files are supported ({file.filename}).")
    
    combined_prompt = f"Documents content:\n{extracted_text}\n\nUser Question: {question}"
    result = await orchestrator.answer_question(combined_prompt)
    return result

@app.get("/api/export/{session_id}")
async def export_audit(session_id: str):
    if session_id not in session_store:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_store[session_id]
    audit = build_audit_trail(session["description"], session["result"])
    json_content = export_to_json(audit)
    
    return Response(
        content=json_content,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="compliance_audit_{session_id[:8]}.json"'
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
