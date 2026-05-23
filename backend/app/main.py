import os
import uuid
import json
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.app.config import SESSION_DIR
from backend.app.utils.pdf import extract_text_from_bytes
from backend.app.corpus.db import initialize_embeddings
from backend.app.agents.coordinator import CoordinatorAgent
from backend.app.agents.chat import ChatAgent

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("backend_main")

app = FastAPI(title="AI Act Compliance Assistant API", version="1.0.0")

# Enable CORS for React local dev server (port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In hackathon context, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (with JSON file backup)
SESSIONS = {}

def load_session(session_id: str) -> dict:
    if session_id in SESSIONS:
        return SESSIONS[session_id]
        
    session_file = os.path.join(SESSION_DIR, f"{session_id}.json")
    if os.path.exists(session_file):
        try:
            with open(session_file, "r", encoding="utf-8") as f:
                session_data = json.load(f)
                SESSIONS[session_id] = session_data
                return session_data
        except Exception as e:
            logger.error(f"Error loading session {session_id} from disk: {e}")
            
    raise HTTPException(status_code=404, detail="Session not found")

def save_session(session_data: dict):
    session_id = session_data["session_id"]
    SESSIONS[session_id] = session_data
    
    session_file = os.path.join(SESSION_DIR, f"{session_id}.json")
    try:
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(session_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Error saving session {session_id} to disk: {e}")

@app.on_event("startup")
def startup_event():
    """Build the reference corpus embedding cache on server boot to avoid request lags."""
    logger.info("Server startup: Initializing vector reference corpus...")
    try:
        initialize_embeddings(force_refresh=False)
        logger.info("Vector reference corpus successfully loaded and ready.")
    except Exception as e:
        logger.error(f"Critical error initializing embeddings on startup: {e}")

@app.get("/")
def read_root():
    return {"status": "running", "app": "AI Act Compliance Assistant"}

@app.post("/api/session/create")
def create_session():
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "files": [],
        "raw_text": "",
        "assessment": None,
        "chat_history": [],
        "agent_logs": []
    }
    save_session(session_data)
    logger.info(f"Created new session: {session_id}")
    return {"session_id": session_id}

@app.post("/api/session/upload")
async def upload_document(
    session_id: str = Form(...),
    files: list[UploadFile] = File(...)
):
    session = load_session(session_id)
    
    new_text_segments = []
    
    for file in files:
        contents = await file.read()
        try:
            text = extract_text_from_bytes(contents, file.filename)
            new_text_segments.append(text)
            session["files"].append({
                "filename": file.filename,
                "size": len(contents)
            })
            logger.info(f"Processed file {file.filename} ({len(contents)} bytes) in session {session_id}")
        except Exception as e:
            logger.error(f"Failed to process uploaded file {file.filename}: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to parse {file.filename}: {str(e)}")
            
    # Concatenate texts with markdown separators
    if new_text_segments:
        separator = "\n\n" + "="*40 + "\n\n"
        session["raw_text"] = (session["raw_text"] + separator if session["raw_text"] else "") + separator.join(new_text_segments)
        
    save_session(session)
    return {
        "session_id": session_id,
        "files": session["files"],
        "text_length": len(session["raw_text"])
    }

@app.post("/api/session/analyze")
def analyze_session(session_id: str = Form(...)):
    session = load_session(session_id)
    
    if not session["raw_text"]:
        raise HTTPException(status_code=400, detail="No documents uploaded. Upload use-case materials first.")
        
    logger.info(f"Analyzing compliance for session: {session_id}")
    coordinator = CoordinatorAgent()
    
    try:
        pipeline_output = coordinator.run_compliance_pipeline(session["raw_text"])
        
        session["assessment"] = pipeline_output["assessment"]
        session["agent_logs"] = pipeline_output["agent_logs"]
        
        # Add welcome bot chat message introducing the results
        session["chat_history"] = [
            {
                "role": "assistant",
                "content": (
                    f"### Initial Assessment Compiled!\n"
                    f"Our multi-agent system has completed the compliance audit for your use case.\n\n"
                    f"**Summary of findings:**\n"
                    f"- **AI System Qualification:** {session['assessment']['is_ai_system'].get('qualifies', True)}\n"
                    f"- **Assessed Risk Level:** {session['assessment']['risk_classification'].get('tier', 'High Risk')}\n"
                    f"- **Compliance Role:** {session['assessment']['role_assessment'].get('role', 'Provider')}\n\n"
                    f"Please review the tabs in the main workspace for a full breakdown. "
                    f"I am ready to answer any questions, retrieve specific texts, or update this analysis if you have new details!"
                )
            }
        ]
        
        save_session(session)
        return {
            "success": True,
            "agent_logs": session["agent_logs"],
            "assessment": session["assessment"],
            "chat_history": session["chat_history"]
        }
    except Exception as e:
        logger.error(f"Compliance pipeline execution failed for session {session_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Compliance assessment failed: {str(e)}")

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/api/session/chat")
def chat_followup(request: ChatRequest):
    session = load_session(request.session_id)
    
    if not session["assessment"]:
        raise HTTPException(status_code=400, detail="Cannot run chat before executing the initial analysis.")
        
    logger.info(f"Chat message received in session {request.session_id}: '{request.message[:40]}...'")
    chat_agent = ChatAgent()
    
    # Store user message
    session["chat_history"].append({
        "role": "user",
        "content": request.message
    })
    
    try:
        chat_output = chat_agent.answer_question(
            request.message,
            session["chat_history"],
            session["assessment"]
        )
        
        # Store assistant response
        session["chat_history"].append({
            "role": "assistant",
            "content": chat_output["chat_response"]
        })
        
        # Merge updated assessment fields if any
        if chat_output.get("updated_assessment"):
            logger.info("ChatAgent triggered dynamic assessment update based on conversation.")
            merge_assessment_patches(session["assessment"], chat_output["updated_assessment"])
            
        save_session(session)
        return {
            "chat_response": chat_output["chat_response"],
            "chat_history": session["chat_history"],
            "assessment": session["assessment"]
        }
    except Exception as e:
        logger.error(f"Chat response generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")

def merge_assessment_patches(base: dict, patch: dict):
    """Recursively merges a patch dictionary into the base assessment dictionary."""
    for key, val in patch.items():
        if isinstance(val, dict) and key in base and isinstance(base[key], dict):
            merge_assessment_patches(base[key], val)
        else:
            base[key] = val
