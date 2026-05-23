import logging
import time
from backend.app.agents.extractor import FactExtractorAgent
from backend.app.agents.retriever import RetrievalAgent
from backend.app.agents.analyst import LegalAnalystAgent
from backend.app.agents.critic import RedTeamCriticAgent

logger = logging.getLogger(__name__)

class CoordinatorAgent:
    """
    Main orchestrator that manages the multi-agent compliance pipeline.
    Runs agents sequentially, captures intermediate states/logs/thoughts, 
    and constructs the final grounded synthesis of the AI Act assessment.
    """
    def __init__(self):
        self.extractor = FactExtractorAgent()
        self.retriever = RetrievalAgent()
        self.analyst = LegalAnalystAgent()
        self.critic = RedTeamCriticAgent()

    def run_compliance_pipeline(self, raw_text: str) -> dict:
        logger.info("CoordinatorAgent: Initiating compliance pipeline execution...")
        start_time = time.time()
        agent_logs = []

        # --- STEP 1: FACT EXTRACTION ---
        step_start = time.time()
        logger.info("CoordinatorAgent: Triggering FactExtractorAgent.")
        extraction_result = self.extractor.extract_facts(raw_text)
        
        # Build logical 'thinking process' for the extractor
        extractor_thought = (
            f"Parsed {len(raw_text)} characters of use-case documentation. "
            f"Successfully extracted purpose, sector, data parameters, and actors. "
            f"Detected {len(extraction_result.get('contradictions', []))} discrepancies, "
            f"{len(extraction_result.get('assumptions', []))} key assumptions, and "
            f"{len(extraction_result.get('uncertainties', []))} tech uncertainties."
        )
        
        agent_logs.append({
            "agent": "Fact Extractor",
            "status": "completed",
            "duration": round(time.time() - step_start, 2),
            "thought": extractor_thought,
            "output": extraction_result
        })

        # --- STEP 2: SEMANTIC RETRIEVAL ---
        step_start = time.time()
        logger.info("CoordinatorAgent: Triggering RetrievalAgent.")
        facts = extraction_result.get("extracted_facts", {})
        retrieval_result = self.retriever.analyze_and_retrieve(facts)
        
        retriever_thought = (
            f"Formulated search strategy: '{retrieval_result['search_strategy']}'. "
            f"Executed {len(retrieval_result['search_queries'])} semantic vector search queries. "
            f"Retrieved {len(retrieval_result['retrieved_references'])} authoritative EU AI Act articles, guidelines, or adjacent statutes."
        )
        
        agent_logs.append({
            "agent": "Retrieval Agent",
            "status": "completed",
            "duration": round(time.time() - step_start, 2),
            "thought": retriever_thought,
            "output": {
                "search_strategy": retrieval_result["search_strategy"],
                "search_queries": retrieval_result["search_queries"],
                "retrieved_references_count": len(retrieval_result["retrieved_references"])
            }
        })

        # --- STEP 3: LEGAL ANALYSIS ---
        step_start = time.time()
        logger.info("CoordinatorAgent: Triggering LegalAnalystAgent.")
        references = retrieval_result.get("retrieved_references", [])
        analysis_result = self.analyst.analyze_compliance(facts, references)
        
        is_ai = analysis_result.get("is_ai_system", {}).get("qualifies", True)
        risk_tier = analysis_result.get("risk_classification", {}).get("tier", "High Risk")
        obligations_count = len(analysis_result.get("legal_obligations", []))
        
        analyst_thought = (
            f"Assessed AI qualification: {is_ai}. Determined Risk Category: '{risk_tier}'. "
            f"Identified compliance role as '{analysis_result.get('role_assessment', {}).get('role', 'Unknown')}'. "
            f"Mapped {obligations_count} active compliance obligations. Coded references with URLs."
        )
        
        agent_logs.append({
            "agent": "Legal Analyst",
            "status": "completed",
            "duration": round(time.time() - step_start, 2),
            "thought": analyst_thought,
            "output": analysis_result
        })

        # --- STEP 4: RED-TEAM CRITIQUE ---
        step_start = time.time()
        logger.info("CoordinatorAgent: Triggering RedTeamCriticAgent.")
        critic_result = self.critic.review_analysis(extraction_result, analysis_result)
        
        critic_thought = (
            f"Conducted rigorous skeptical audit. Assessed risk classification certainty at {critic_result.get('certainty_scores', {}).get('risk_classification', {}).get('score', 0)}%. "
            f"Flagged {len(critic_result.get('flagged_assumptions', []))} risky assumptions and "
            f"{len(critic_result.get('information_gaps', []))} missing information gaps. "
            f"Formulated {len(critic_result.get('expert_followup_questions', []))} expert follow-up questions."
        )
        
        agent_logs.append({
            "agent": "Red-Team Critic",
            "status": "completed",
            "duration": round(time.time() - step_start, 2),
            "thought": critic_thought,
            "output": critic_result
        })

        # --- STEP 5: FINAL COORDINATOR SYNTHESIS ---
        logger.info("CoordinatorAgent: Compiling unified synthesis assessment.")
        total_duration = round(time.time() - start_time, 2)
        
        # Combine everything into a beautiful unified model
        assessment = {
            "summary": extraction_result.get("summary", ""),
            "extracted_facts": facts,
            "is_ai_system": analysis_result.get("is_ai_system", {}),
            "risk_classification": analysis_result.get("risk_classification", {}),
            "role_assessment": analysis_result.get("role_assessment", {}),
            "legal_obligations": analysis_result.get("legal_obligations", []),
            "governance_observations": analysis_result.get("governance_observations", {}),
            "adjacent_frameworks": analysis_result.get("adjacent_frameworks", {}),
            "citations": analysis_result.get("citation_library", []),
            "critic_summary": critic_result.get("critic_summary", ""),
            "certainty_scores": critic_result.get("certainty_scores", {}),
            "flagged_assumptions": critic_result.get("flagged_assumptions", []),
            "information_gaps": critic_result.get("information_gaps", []),
            "expert_followup_questions": critic_result.get("expert_followup_questions", []),
            "source_quality_audit": critic_result.get("source_quality_audit", []),
            "contradictions": extraction_result.get("contradictions", []),
            "uncertainties": extraction_result.get("uncertainties", [])
        }

        logger.info(f"CoordinatorAgent: Compliance pipeline finished in {total_duration}s.")
        return {
            "success": True,
            "duration": total_duration,
            "agent_logs": agent_logs,
            "assessment": assessment
        }
