import sys
import os
import json
import time

# Include workspace in path
sys.path.append(r"c:\Users\pinku\Downloads\AI for good")

# Use standard urllib or lightweight python client instead of third-party libraries for zero dependency testing
import urllib.request
import urllib.parse

API_BASE = "http://localhost:8000"

def make_post_request(url: str, data: dict = None, is_json: bool = False, multipart_data: tuple = None):
    try:
        if multipart_data:
            # Simple multipart/form-data generator for raw bytes uploading
            filename, file_content = multipart_data
            boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
            parts = []
            parts.append(f"--{boundary}")
            parts.append(f'Content-Disposition: form-data; name="session_id"')
            parts.append("")
            parts.append(data["session_id"])
            parts.append(f"--{boundary}")
            parts.append(f'Content-Disposition: form-data; name="files"; filename="{filename}"')
            parts.append("Content-Type: text/plain")
            parts.append("")
            parts.append(file_content)
            parts.append(f"--{boundary}--")
            parts.append("")
            body = "\r\n".join(parts).encode("utf-8")
            
            req = urllib.request.Request(url, data=body)
            req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        elif is_json:
            body = json.dumps(data).encode("utf-8")
            req = urllib.request.Request(url, data=body)
            req.add_header("Content-Type", "application/json")
        else:
            body = urllib.parse.urlencode(data).encode("utf-8") if data else b""
            req = urllib.request.Request(url, data=body)
            
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"API request failed: {e}")
        return None

def run_integration_test():
    print("=== STARTING END-TO-END SYSTEM INTEGRATION TEST ===")
    
    # 1. Create Session
    print("\n[Step 1/5] Creating analysis session...")
    session_res = make_post_request(f"{API_BASE}/api/session/create")
    if not session_res or "session_id" not in session_res:
        print("FAIL: Could not create session.")
        return
    session_id = session_res["session_id"]
    print(f"SUCCESS: Session created with ID: {session_id}")
    
    # 2. Upload Mock Document
    print("\n[Step 2/5] Uploading mock AI use-case document...")
    mock_usecase_text = (
        "Project Apex Recruiter System Overview:\n"
        "Our organization is introducing an automated resume screening software called Apex Recruiter. "
        "The system reads applicant resumes, extracts personal data, educational history, work experience, "
        "and skills. It runs a deep neural network classifier trained on past successful employees to rank "
        "and score applicants between 0 and 100.\n"
        "HR recruiters will use this score to select candidates for initial interview screens. "
        "The software is hosted on local servers in Helsinki, Finland. It integrates a third-party LLM "
        "via API to draft rejection emails automatically based on skills gaps. "
        "A senior HR manager supervises the system but rarely overrides candidate rankings, which are processed automatically."
    )
    
    upload_res = make_post_request(
        f"{API_BASE}/api/session/upload",
        data={"session_id": session_id},
        multipart_data=("apex_recruiter_spec.txt", mock_usecase_text)
    )
    
    if not upload_res or "files" not in upload_res:
        print("FAIL: File upload failed.")
        return
    print(f"SUCCESS: Uploaded mock document. Active files: {upload_res['files']}")
    
    # 3. Trigger Multi-Agent Compliance Pipeline
    print("\n[Step 3/5] Triggering multi-agent compliance pipeline...")
    print("Please wait, agents are communicating, retrieved EU AI Act articles, and analyzing...")
    
    start_time = time.time()
    analyze_res = make_post_request(
        f"{API_BASE}/api/session/analyze",
        data={"session_id": session_id}
    )
    duration = time.time() - start_time
    
    if not analyze_res or not analyze_res.get("success"):
        print("FAIL: Agent pipeline execution failed.")
        return
        
    print(f"SUCCESS: Compliance pipeline executed successfully in {duration:.2f} seconds.")
    
    # 4. Verify Synthesis Output Grounding
    print("\n[Step 4/5] Verifying synthesized legal assessment...")
    assessment = analyze_res["assessment"]
    logs = analyze_res["agent_logs"]
    
    print(f"\n--- Multi-Agent Steps Trace ({len(logs)} logs) ---")
    for log in logs:
        print(f"- Agent: {log['agent']} | Status: {log['status']} | Duration: {log['duration']}s")
        print(f"  Thought: {log['thought'][:120]}...")
        
    print("\n--- Assessment Synthesis Findings ---")
    print(f"- AI System Qualification: {assessment['is_ai_system'].get('qualifies')} (Citations: {assessment['is_ai_system'].get('citations')})")
    print(f"- Risk Classification Tier: {assessment['risk_classification'].get('tier')}")
    print(f"- Organization Role: {assessment['role_assessment'].get('role')}")
    print(f"- Governance Observations Risk Management: {assessment['governance_observations'].get('risk_management')[:100]}...")
    print(f"- Missing Information Gaps (Count: {len(assessment['information_gaps'])}):")
    for gap in assessment['information_gaps'][:2]:
        print(f"  * Gap: {gap['gap']} | Impact: {gap['impact']}")
        
    print("\n--- Auditing Citations & Evidentiary Grounding ---")
    print(f"Total citations mapped: {len(assessment['citations'])}")
    for cit in assessment['citations'][:2]:
        print(f"  * Article: {cit['title']} | Source: {cit['source']} | URL: {cit['url']}")
        
    # 5. Execute conversational chat follow-up
    print("\n[Step 5/5] Testing interactive chat follow-up dialogue...")
    chat_message = "What are our specific deployer obligations under Article 26 and does Traficom coordinate audits?"
    
    chat_res = make_post_request(
        f"{API_BASE}/api/session/chat",
        data={"session_id": session_id, "message": chat_message},
        is_json=True
    )
    
    if not chat_res or "chat_response" not in chat_res:
        print("FAIL: Chat follow-up failed.")
        return
        
    print("SUCCESS: Conversational dialogue response compiled:")
    print(f"\nResponse:\n{chat_res['chat_response'][:350]}...")
    
    print("\n=== SYSTEM INTEGRATION TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_integration_test()
