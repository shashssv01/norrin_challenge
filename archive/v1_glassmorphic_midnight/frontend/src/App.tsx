import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Play, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  ExternalLink, 
  HelpCircle, 
  Shield, 
  Briefcase, 
  Database, 
  RefreshCw, 
  Send, 
  CheckSquare, 
  Award,
  BookOpen
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface UploadedFile {
  filename: string;
  size: number;
}

interface AgentLog {
  agent: string;
  status: string;
  duration: number;
  thought: string;
  output: any;
}

export default function App() {
  // Session States
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Pipeline Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0); // 0: idle, 1: Extractor, 2: Retriever, 3: Analyst, 4: Critic, 5: Done
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [consoleMessage, setConsoleMessage] = useState<string>('');
  const [assessment, setAssessment] = useState<any>(null);
  
  // Workspace UI States
  const [activeTab, setActiveTab] = useState<'summary' | 'assessment' | 'governance' | 'critique'>('summary');
  
  // Chat Panel States
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Advanced Compliance UI States
  const [checkedObligations, setCheckedObligations] = useState<string[]>([]);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevAssessmentRef = useRef<any>(null);

  // Monitor changes between old and new assessment state
  useEffect(() => {
    if (assessment && prevAssessmentRef.current) {
      const prev = prevAssessmentRef.current;
      const changes: Record<string, boolean> = {};
      
      if (JSON.stringify(prev.extracted_facts) !== JSON.stringify(assessment.extracted_facts)) {
        changes['extracted_facts'] = true;
      }
      if (JSON.stringify(prev.risk_classification) !== JSON.stringify(assessment.risk_classification)) {
        changes['risk_classification'] = true;
      }
      if (JSON.stringify(prev.role_assessment) !== JSON.stringify(assessment.role_assessment)) {
        changes['role_assessment'] = true;
      }
      if (JSON.stringify(prev.governance_observations) !== JSON.stringify(assessment.governance_observations)) {
        changes['governance_observations'] = true;
      }
      if (JSON.stringify(prev.legal_obligations) !== JSON.stringify(assessment.legal_obligations)) {
        changes['legal_obligations'] = true;
      }

      if (Object.keys(changes).length > 0) {
        setUpdatedFields(changes);
        const timer = setTimeout(() => {
          setUpdatedFields({});
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
    prevAssessmentRef.current = assessment;
  }, [assessment]);

  // Initialize session on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/session/create`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setSessionId(data.session_id);
        console.log("Initialized compliance session:", data.session_id);
      })
      .catch(err => console.error("Error creating session:", err));
  }, []);

  // Scroll chat to bottom when message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Upload Files API Call
  const uploadFiles = async (fileList: FileList) => {
    if (!sessionId) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('session_id', sessionId);
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/session/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setFiles(data.files);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload files. Make sure the backend server is running.");
    } finally {
      setIsUploading(false);
    }
  };

  // Run Multi-Agent Compliance Pipeline (with timeline player simulation!)
  const handleAnalyze = async () => {
    if (!sessionId) return;
    setIsAnalyzing(true);
    setActiveAgentIndex(1);
    setConsoleMessage("Initializing orchestration matrix... fact extraction starting.");
    setAssessment(null);
    setAgentLogs([]);
    setCheckedObligations([]);
    setUpdatedFields({});

    const formData = new FormData();
    formData.append('session_id', sessionId);

    try {
      const res = await fetch(`${API_BASE}/api/session/analyze`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        throw new Error("Pipeline compilation error");
      }
      
      const data = await res.json();
      const logs = data.agent_logs as AgentLog[];

      // Animate/simulate the sequential agent thoughts for pure premium UX visual wow factor
      // Step 1: Fact Extractor
      setTimeout(() => {
        const extractorLog = logs.find(l => l.agent === "Fact Extractor");
        if (extractorLog) {
          setConsoleMessage(`[Fact Extractor] completed in ${extractorLog.duration}s.\nThought: ${extractorLog.thought}`);
          setAgentLogs(prev => [...prev, extractorLog]);
        }
        setActiveAgentIndex(2);
        
        // Step 2: Retrieval Agent
        setTimeout(() => {
          const retrieverLog = logs.find(l => l.agent === "Retrieval Agent");
          if (retrieverLog) {
            setConsoleMessage(`[Retrieval Agent] completed in ${retrieverLog.duration}s.\nThought: ${retrieverLog.thought}`);
            setAgentLogs(prev => [...prev, retrieverLog]);
          }
          setActiveAgentIndex(3);
          
          // Step 3: Legal Analyst
          setTimeout(() => {
            const analystLog = logs.find(l => l.agent === "Legal Analyst");
            if (analystLog) {
              setConsoleMessage(`[Legal Analyst] completed in ${analystLog.duration}s.\nThought: ${analystLog.thought}`);
              setAgentLogs(prev => [...prev, analystLog]);
            }
            setActiveAgentIndex(4);
            
            // Step 4: Red-Team Critic
            setTimeout(() => {
              const criticLog = logs.find(l => l.agent === "Red-Team Critic");
              if (criticLog) {
                setConsoleMessage(`[Red-Team Critic] completed in ${criticLog.duration}s.\nThought: ${criticLog.thought}`);
                setAgentLogs(prev => [...prev, criticLog]);
              }
              setActiveAgentIndex(5);
              
              // Synthesis Finish
              setTimeout(() => {
                setAssessment(data.assessment);
                setChatHistory(data.chat_history);
                setIsAnalyzing(false);
                setConsoleMessage("Coordinated compliance assessment successfully synthesized.");
              }, 1200);
              
            }, 2500);
          }, 2500);
        }, 2500);
      }, 2500);

    } catch (err) {
      console.error("Pipeline failed:", err);
      alert("Failed to analyze use case. Check backend logs.");
      setIsAnalyzing(false);
      setActiveAgentIndex(0);
    }
  };

  // Follow-up Chat Message API Call
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !chatMessage.trim() || isSendingChat) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setIsSendingChat(true);

    // Optimistically update chat history in UI
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await fetch(`${API_BASE}/api/session/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMsg
        })
      });
      const data = await res.json();
      
      setChatHistory(data.chat_history);
      
      // Update assessment state if ChatAgent revised anything
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.error("Chat communication failure:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">⚖</div>
          <h1 className="logo-text">AI Act Compliance Assistant</h1>
          <span className="badge-demo">Decision Support System</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="file-size">Session: {sessionId ? `${sessionId.slice(0, 8)}...` : 'Connecting...'}</span>
          {isAnalyzing && <RefreshCw className="upload-icon" style={{ animation: 'spin 1.5s linear infinite', width: '18px', height: '18px' }} />}
        </div>
      </header>

      {/* 2. Main Dashboard Layout Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column: Document Intake and List */}
        <section className="sidebar">
          <div>
            <h2 className="panel-title">1. Intake Supporting Docs</h2>
            <div 
              className={`upload-container ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <Upload className="upload-icon" />
              <div className="upload-text">
                <strong>Drag & drop supporting files</strong> or click to browse
              </div>
              <span className="upload-subtext">PDF, MD, TXT supported</span>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
              />
            </div>
            {isUploading && <div className="file-size" style={{ textAlign: 'center', marginTop: '10px' }}>Parsing file formats...</div>}
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="panel-title">Uploaded Materials</h3>
              <div className="file-list">
                {files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText style={{ color: 'var(--accent-indigo)', width: '14px' }} />
                      <span className="file-name" title={file.filename}>{file.filename}</span>
                    </div>
                    <span className="file-size">{Math.round(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            className="analyze-btn" 
            disabled={files.length === 0 || isAnalyzing} 
            onClick={handleAnalyze}
          >
            <Play style={{ fill: 'currentColor', width: '12px' }} />
            {isAnalyzing ? 'Orchestrating Agents...' : 'Analyze AI Use Case'}
          </button>
        </section>

        {/* Center Column: Multi-Agent Monitor timeline and Workspace */}
        <section className="workspace">
          
          {/* Real-time Multi-Agent visual timelines */}
          <div className="agent-visualizer">
            <div className="visualizer-header">
              <span className="panel-title" style={{ margin: 0 }}>Multi-Agent Team Orchestration</span>
              <span className="file-size" style={{ color: isAnalyzing ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
                {isAnalyzing ? 'Active Pipeline Processing' : 'Pipeline Idle'}
              </span>
            </div>
            
            <div className="agent-timeline">
              <div className={`agent-node ${activeAgentIndex === 1 ? 'active' : activeAgentIndex > 1 ? 'completed' : ''}`}>
                <div className="node-bullet">1</div>
                <span className="node-label">Fact Extractor</span>
              </div>
              <div className={`agent-node ${activeAgentIndex === 2 ? 'active' : activeAgentIndex > 2 ? 'completed' : ''}`}>
                <div className="node-bullet">2</div>
                <span className="node-label">Retrieval Agent</span>
              </div>
              <div className={`agent-node ${activeAgentIndex === 3 ? 'active' : activeAgentIndex > 3 ? 'completed' : ''}`}>
                <div className="node-bullet">3</div>
                <span className="node-label">Legal Analyst</span>
              </div>
              <div className={`agent-node ${activeAgentIndex === 4 ? 'active' : activeAgentIndex > 4 ? 'completed' : ''}`}>
                <div className="node-bullet">4</div>
                <span className="node-label">Red-Team Critic</span>
              </div>
            </div>

            {consoleMessage && (
              <div className="agent-console-box">
                <div>
                  <span className="console-agent-tag">SYSTEM_LOGS &gt;&gt;</span> {consoleMessage}
                </div>
              </div>
            )}
          </div>

          {/* Central Workspace Tabbed Viewports */}
          {!assessment && !isAnalyzing ? (
            <div className="empty-workspace-state">
              <div className="logo-icon" style={{ width: '60px', height: '60px', borderRadius: '15px', fontSize: '2rem' }}>⚖</div>
              <h2 className="empty-title">Ready for Regulatory Audit</h2>
              <p className="empty-desc">
                Upload your AI use-case documents (technical designs, product specs, or process notes) in the left panel. 
                Our multi-agent system will perform a grounded compliance review under the EU AI Act.
              </p>
            </div>
          ) : isAnalyzing && !assessment ? (
            <div className="empty-workspace-state">
              <RefreshCw className="upload-icon" style={{ animation: 'spin 2s linear infinite', width: '40px', height: '40px', color: 'var(--accent-indigo)' }} />
              <h2 className="empty-title">Compiling Assessment</h2>
              <p className="empty-desc">
                The AI Act compliance agents are reviewing your files, performing vector lookup, and auditing evidence grounding...
              </p>
            </div>
          ) : (
            <div className="dashboard-content-panels">
              {/* Tab Navigation Bars with Glow Alerts */}
              {(() => {
                const hasSummaryUpdate = updatedFields['extracted_facts'];
                const hasAssessmentUpdate = updatedFields['risk_classification'] || updatedFields['role_assessment'];
                const hasGovernanceUpdate = updatedFields['governance_observations'] || updatedFields['legal_obligations'];

                return (
                  <nav className="tabs-nav">
                    <button 
                      className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('summary')}
                    >
                      <FileText style={{ width: '16px' }} /> Use Case Summary
                      {hasSummaryUpdate && <span className="tab-badge-glow" />}
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'assessment' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('assessment')}
                    >
                      <Shield style={{ width: '16px' }} /> Legal Assessment
                      {hasAssessmentUpdate && <span className="tab-badge-glow" />}
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('governance')}
                    >
                      <CheckSquare style={{ width: '16px' }} /> Governance Obligations
                      {hasGovernanceUpdate && <span className="tab-badge-glow" />}
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'critique' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('critique')}
                    >
                      <Award style={{ width: '16px' }} /> Red-Team Critique
                    </button>
                  </nav>
                );
              })()}

              {/* Viewports Tab Contents */}
              <div className="tab-content-viewport">
                
                {/* TAB 1: Use Case Summary & Extracted Facts */}
                {activeTab === 'summary' && (
                  <div>
                    <div className={`dashboard-card ${updatedFields['extracted_facts'] ? 'field-updated-pulse' : ''}`}>
                      <h3 className="card-title"><FileText /> Conciliated Case Summary</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px' }}>
                        {assessment.summary}
                      </p>
                    </div>

                    <div className={`dashboard-card ${updatedFields['extracted_facts'] ? 'field-updated-pulse' : ''}`}>
                      <div className="card-header-with-action">
                        <h3 className="card-title"><Database /> Grounded Key Facts</h3>
                        <span className="file-size" style={{ color: 'var(--color-success)' }}>Extracted fact sheet verified</span>
                      </div>
                      <div className="facts-grid">
                        <div className="fact-card-small">
                          <label>Intended Purpose</label>
                          <p>{assessment.extracted_facts?.purpose}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Primary Operators (Users)</label>
                          <p>{assessment.extracted_facts?.users}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Affected Demographics</label>
                          <p>{assessment.extracted_facts?.affected_persons}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Sector Category</label>
                          <p>{assessment.extracted_facts?.sector}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Inputs Data Triggers</label>
                          <p>{assessment.extracted_facts?.input_data}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Outputs / Infers</label>
                          <p>{assessment.extracted_facts?.outputs}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Automation Level</label>
                          <p>{assessment.extracted_facts?.automation_level}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Human Oversight Mechanisms</label>
                          <p>{assessment.extracted_facts?.human_oversight}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>Generative AI Trigger</label>
                          <p>{assessment.extracted_facts?.use_of_generative_ai}</p>
                        </div>
                        <div className="fact-card-small">
                          <label>General-Purpose AI Overlay</label>
                          <p>{assessment.extracted_facts?.use_of_gpai}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Legal compliance classification assessment */}
                {activeTab === 'assessment' && (
                  <div>
                    <div className={`dashboard-card ${updatedFields['risk_classification'] ? 'field-updated-pulse' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 className="card-title" style={{ fontSize: '1.25rem' }}><Shield /> EU AI Act Classification</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Assessment mapped autonomously by Legal Analyst
                        </p>
                      </div>
                      <span className={`risk-badge ${
                        assessment.risk_classification?.tier?.toLowerCase().includes('prohibited') ? 'prohibited' :
                        assessment.risk_classification?.tier?.toLowerCase().includes('high') ? 'high' :
                        assessment.risk_classification?.tier?.toLowerCase().includes('transparency') ? 'transparency' : 'minimal'
                      }`}>
                        {assessment.risk_classification?.tier || 'High Risk'}
                      </span>
                    </div>

                    <div className={`dashboard-card ${updatedFields['risk_classification'] ? 'field-updated-pulse' : ''}`}>
                      <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '8px' }}>AI System Qualification (Art. 3(1))</h4>
                      <div className="checklist-item" style={{ borderLeft: '3px solid var(--accent-indigo)' }}>
                        <div className="checklist-checkbox" style={{ background: 'var(--color-success-glass)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>✓</div>
                        <div className="checklist-details">
                          <span className="checklist-title">
                            {assessment.is_ai_system?.qualifies ? "Qualifies as an AI System" : "Does Not Qualify as an AI System"}
                          </span>
                          <p className="checklist-desc">{assessment.is_ai_system?.reasoning}</p>
                          <span 
                            className="checklist-ref"
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => {
                              setSelectedCitation({
                                title: "Article 3(1) - Definition of an AI System",
                                source: "Legislation - EU AI Act",
                                url: "http://data.europa.eu/eli/reg/2024/1689/oj",
                                relevance_summary: assessment.is_ai_system?.reasoning
                              });
                            }}
                          >
                            Citations: {assessment.is_ai_system?.citations?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`dashboard-card ${updatedFields['risk_classification'] ? 'field-updated-pulse' : ''}`}>
                      <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Grounded Risk Tier Analysis</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                        {assessment.risk_classification?.reasoning}
                      </p>
                      <div 
                        className="file-size" 
                        style={{ color: 'var(--accent-purple)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => {
                          const firstCit = assessment.risk_classification?.citations?.[0] || "Article 6 - Classification Rules for High-Risk AI Systems";
                          setSelectedCitation({
                            title: firstCit,
                            source: "Legislation - EU AI Act",
                            url: "http://data.europa.eu/eli/reg/2024/1689/oj",
                            relevance_summary: assessment.risk_classification?.reasoning
                          });
                        }}
                      >
                        Citations cited: {assessment.risk_classification?.citations?.join(', ')}
                      </div>
                    </div>

                    <div className={`dashboard-card ${updatedFields['role_assessment'] ? 'field-updated-pulse' : ''}`}>
                      <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Operational Role Assessment</h4>
                      <div className="checklist-item" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
                        <div className="checklist-details">
                          <span className="checklist-title">Assessed Role: {assessment.role_assessment?.role}</span>
                          <p className="checklist-desc">{assessment.role_assessment?.reasoning}</p>
                          <span 
                            className="checklist-ref"
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => {
                              setSelectedCitation({
                                title: "Article 3 Definitions",
                                source: "Legislation - EU AI Act",
                                url: "http://data.europa.eu/eli/reg/2024/1689/oj",
                                relevance_summary: assessment.role_assessment?.reasoning
                              });
                            }}
                          >
                            Citations: {assessment.role_assessment?.citations?.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {assessment.adjacent_frameworks && (
                      <div className="dashboard-card">
                        <h4 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}><BookOpen /> Adjacent Legal Overlaps</h4>
                        <div className="facts-grid">
                          <div className="fact-card-small">
                            <label>GDPR Data Privacy Overlap</label>
                            <p>{assessment.adjacent_frameworks.gdpr_overlap}</p>
                          </div>
                          <div className="fact-card-small">
                            <label>Finnish Administrative Context</label>
                            <p>{assessment.adjacent_frameworks.finnish_context}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Governance checklist & Action item logs */}
                {activeTab === 'governance' && (
                  <div>
                    {/* Circle SVGs and Percentage indicators */}
                    {(() => {
                      const totalObligations = assessment.legal_obligations?.length || 0;
                      const completedCount = assessment.legal_obligations?.filter((o: any) => checkedObligations.includes(o.obligation_id)).length || 0;
                      const readinessScore = totalObligations > 0 ? Math.round((completedCount / totalObligations) * 100) : 0;
                      
                      return (
                        <div className="readiness-widget-container">
                          <div className="readiness-progress-ring">
                            <svg width="80" height="80">
                              <circle
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeWidth="6"
                                fill="transparent"
                                r="34"
                                cx="40"
                                cy="40"
                              />
                              <circle
                                className="progress-ring-circle"
                                stroke="url(#progressGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="transparent"
                                r="34"
                                cx="40"
                                cy="40"
                                strokeDasharray="213.6"
                                strokeDashoffset={213.6 - (readinessScore / 100) * 213.6}
                              />
                              <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="var(--accent-indigo)" />
                                  <stop offset="100%" stopColor="var(--accent-purple)" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="readiness-percentage-label">{readinessScore}%</div>
                          </div>
                          <div className="readiness-details">
                            <span className="readiness-title">Compliance Readiness Rating</span>
                            <span className="readiness-subtitle">
                              {completedCount} of {totalObligations} active statutory obligations met. Toggle checked obligations below as you audit operations.
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className={`dashboard-card ${updatedFields['legal_obligations'] ? 'field-updated-pulse' : ''}`}>
                      <h3 className="card-title"><CheckSquare /> Practical Compliance Action Checklist</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>
                        Documented structures, testing loops, and operational pipelines required based on {assessment.role_assessment?.role} obligations.
                      </p>
                      
                      <div className="checklist-container">
                        {assessment.legal_obligations && assessment.legal_obligations.length > 0 ? (
                          assessment.legal_obligations.map((o: any) => (
                            <div 
                              key={o.obligation_id}
                              className={`checklist-item checklist-interactive-card ${checkedObligations.includes(o.obligation_id) ? 'checked' : ''}`}
                              onClick={() => {
                                if (checkedObligations.includes(o.obligation_id)) {
                                  setCheckedObligations(checkedObligations.filter(id => id !== o.obligation_id));
                                } else {
                                  setCheckedObligations([...checkedObligations, o.obligation_id]);
                                }
                              }}
                            >
                              <div className="checklist-checkbox">
                                {checkedObligations.includes(o.obligation_id) ? '✓' : ''}
                              </div>
                              <div className="checklist-details" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className="checklist-title">{o.obligation}</span>
                                  <span className={`tier-badge ${o.relevance_tier?.toLowerCase() || 'recommended'}`}>
                                    {o.relevance_tier || 'Recommended'}
                                  </span>
                                </div>
                                <p className="checklist-desc" style={{ marginTop: '6px' }}><strong>Scope:</strong> {o.scope}</p>
                                <p className="checklist-desc" style={{ marginTop: '4px' }}><strong>Relevance:</strong> {o.relevance}</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                  {o.citations?.map((cit: string, cIdx: number) => (
                                    <span 
                                      key={cIdx} 
                                      className="checklist-ref" 
                                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                      onClick={(e) => {
                                        e.stopPropagation(); // prevent checklist card toggle
                                        const foundCit = assessment.citations?.find((c: any) => c.title.toLowerCase().includes(cit.toLowerCase()) || cit.toLowerCase().includes(c.title.toLowerCase())) 
                                          || { title: cit, source: 'EU AI Act Citation', url: 'http://data.europa.eu/eli/reg/2024/1689/oj', relevance_summary: 'Cited legal framework grounding this specific obligation.' };
                                        setSelectedCitation(foundCit);
                                      }}
                                    >
                                      {cit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                            No active legal obligations identified for this risk profile.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <h3 className="card-title"><Database /> Corpus Citations & Authoritative URLs</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>
                        Authoritative legal statutes and guidance codes referenced to ground the analysis.
                      </p>
                      
                      <div className="citation-list">
                        {assessment.citations?.map((cit: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="citation-card" 
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            onClick={() => setSelectedCitation(cit)}
                          >
                            <div className="citation-card-header">
                              <span className="citation-title-text">{cit.title}</span>
                              <span className="badge-demo" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>{cit.source}</span>
                            </div>
                            <p className="citation-body-text">{cit.relevance_summary}</p>
                            {cit.url && (
                              <span className="citation-link-anchor" style={{ marginTop: '8px', display: 'inline-flex' }}>
                                View Official OJ Source <ExternalLink style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: Red-Team skepticism audit & Gap identification */}
                {activeTab === 'critique' && (
                  <div>
                    <div className="dashboard-card">
                      <h3 className="card-title"><Award /> Independent Red-Team Skepticism Audit</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '12px 0 20px 0', lineHeight: '1.6' }}>
                        {assessment.critic_summary}
                      </p>
                      
                      <div className="audit-metric-row">
                        <div className="audit-metric-card">
                          <div className={`metric-circle-box ${
                            (assessment.certainty_scores?.ai_system_definition?.score || 0) >= 80 ? 'high-score' :
                            (assessment.certainty_scores?.ai_system_definition?.score || 0) >= 60 ? 'mid-score' : 'low-score'
                          }`}>
                            {assessment.certainty_scores?.ai_system_definition?.score || 0}%
                          </div>
                          <span className="metric-label">AI Definition Confidence</span>
                          <span className="file-size" style={{ lineHeight: '1.3' }}>
                            {assessment.certainty_scores?.ai_system_definition?.justification}
                          </span>
                        </div>
                        
                        <div className="audit-metric-card">
                          <div className={`metric-circle-box ${
                            (assessment.certainty_scores?.risk_classification?.score || 0) >= 80 ? 'high-score' :
                            (assessment.certainty_scores?.risk_classification?.score || 0) >= 60 ? 'mid-score' : 'low-score'
                          }`}>
                            {assessment.certainty_scores?.risk_classification?.score || 0}%
                          </div>
                          <span className="metric-label">Risk Tier Confidence</span>
                          <span className="file-size" style={{ lineHeight: '1.3' }}>
                            {assessment.certainty_scores?.risk_classification?.justification}
                          </span>
                        </div>
                        
                        <div className="audit-metric-card">
                          <div className={`metric-circle-box ${
                            (assessment.certainty_scores?.roles_and_obligations?.score || 0) >= 80 ? 'high-score' :
                            (assessment.certainty_scores?.roles_and_obligations?.score || 0) >= 60 ? 'mid-score' : 'low-score'
                          }`}>
                            {assessment.certainty_scores?.roles_and_obligations?.score || 0}%
                          </div>
                          <span className="metric-label">Role Boundaries Confidence</span>
                          <span className="file-size" style={{ lineHeight: '1.3' }}>
                            {assessment.certainty_scores?.roles_and_obligations?.justification}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <h3 className="card-title"><AlertTriangle style={{ color: 'var(--color-warning)' }} /> Flagged Gaps & Key Assumptions</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>
                        Critical gaps in supporting papers and logical leaps assumed by the analyst.
                      </p>
                      
                      <div className="gaps-container">
                        {assessment.flagged_assumptions?.map((item: any, idx: number) => (
                          <div key={idx} className="gap-alert-card">
                            <AlertCircle className="gap-icon" style={{ color: 'var(--color-info)' }} />
                            <div className="gap-details">
                              <span className="gap-title">Assumption: {item.assumption}</span>
                              <p className="gap-desc"><strong>Compliance Risk:</strong> {item.risk}</p>
                            </div>
                          </div>
                        ))}
                        
                        {assessment.information_gaps?.map((item: any, idx: number) => (
                          <div key={idx} className="gap-alert-card">
                            <AlertTriangle className="gap-icon" />
                            <div className="gap-details">
                              <span className="gap-title">Missing Information Gap: {item.gap}</span>
                              <p className="gap-desc"><strong>Legal Assessment Impact:</strong> {item.impact}</p>
                            </div>
                          </div>
                        ))}

                        {assessment.contradictions?.length > 0 && assessment.contradictions.map((contra: string, idx: number) => (
                          <div key={idx} className="gap-alert-card" style={{ background: 'var(--color-danger-glass)', borderLeftColor: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <AlertCircle className="gap-icon" style={{ color: 'var(--color-danger)' }} />
                            <div className="gap-details">
                              <span className="gap-title" style={{ color: 'var(--color-danger)' }}>Evidentiary Contradiction Flagged</span>
                              <p className="gap-desc">{contra}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <h3 className="card-title"><HelpCircle /> Suggested Expert Follow-up Questions</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>
                        Questions an external auditor or a legal compliance expert would raise next.
                      </p>
                      <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        {assessment.expert_followup_questions?.map((q: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: '8px' }}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    {assessment.source_quality_audit && (
                      <div className="dashboard-card">
                        <h3 className="card-title"><BookOpen /> Cited Source Quality Audit</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 16px 0' }}>
                          Analysis of validity, version relevance, and strength of cited legal frameworks.
                        </p>
                        <div className="checklist-container">
                          {assessment.source_quality_audit.map((sq: any, idx: number) => (
                            <div key={idx} className="file-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{sq.citation}</strong>
                                <span className={`risk-badge ${sq.reliability === 'High' ? 'minimal' : sq.reliability === 'Medium' ? 'transparency' : 'prohibited'}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                                  Reliability: {sq.reliability}
                                </span>
                              </div>
                              <span className="file-size">Type: {sq.type} | Notes: {sq.notes}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

        </section>

        {/* Right Column: Follow-up interactive Chat Panel */}
        <section className="chat-panel">
          <div className="chat-header">
            <MessageSquare style={{ color: 'var(--accent-indigo)' }} />
            <h2 className="chat-header-title">Follow-up Dialogue</h2>
          </div>

          <div className="chat-messages-viewport">
            {chatHistory.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--text-muted)', marginBottom: '8px' }} />
                <span>Conversational Follow-up is locked. Upload docs and execute compliance analysis to chat.</span>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMessageMarkdown(msg.content) }} />
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
              ))
            )}
            {isSendingChat && (
              <div className="chat-bubble assistant" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
                <span className="file-size">Consulting agents and retrieving reference articles...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendChat}>
            <input 
              type="text" 
              className="chat-text-input" 
              placeholder={chatHistory.length === 0 ? "Analysis required to converse..." : "Ask about articles, obligations or share new facts..."}
              disabled={chatHistory.length === 0 || isSendingChat}
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={chatHistory.length === 0 || isSendingChat || !chatMessage.trim()}
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        </section>

        {/* Glassmorphic Citation Popover Modal Overlay */}
        {(() => {
          const activeCitation = resolveCitation(selectedCitation);
          return activeCitation && (
            <div className="glass-modal-backdrop" onClick={() => setSelectedCitation(null)}>
              <div className="glass-modal-panel" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setSelectedCitation(null)}>×</button>
                <div className="modal-title">{activeCitation.title}</div>
                <div className="modal-meta-row">
                  <span className="badge-demo">{activeCitation.source}</span>
                  {activeCitation.url && (
                    <a 
                      href={activeCitation.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="badge-demo"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.75rem', 
                        textDecoration: 'none',
                        background: 'var(--color-info-glass)',
                        color: 'var(--color-info)',
                        borderColor: 'rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      Official OJ Link <ExternalLink style={{ width: '12px', height: '12px' }} />
                    </a>
                  )}
                </div>
                
                <div className="modal-content-body">
                  {activeCitation.text ? (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Verbatim Regulation:</div>
                      <div style={{ whiteSpace: 'pre-line' }}>{activeCitation.text}</div>
                      {selectedCitation.relevance_summary && selectedCitation.relevance_summary !== activeCitation.text && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Relevance in Assessment:</div>
                          <p>{selectedCitation.relevance_summary}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Audited Significance:</div>
                      <p>{selectedCitation.relevance_summary}</p>
                    </div>
                  )}
                </div>

                {activeCitation.key_indicators && activeCitation.key_indicators.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '8px' }}>Key Indicators & Audit Benchmarks:</div>
                    <div className="modal-indicators-box">
                      {activeCitation.key_indicators.map((ind: string, idx: number) => (
                        <div className="modal-indicator-item" key={idx}>
                          <div className="modal-indicator-bullet" />
                          <span>{ind}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>
    </div>
  );
}

// Simple markdown formatter utility for rich chat message displays
function formatMessageMarkdown(text: string): string {
  if (!text) return '';
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // headers
    .replace(/### (.*?)\n/g, '<h4>$1</h4>')
    .replace(/## (.*?)\n/g, '<h3>$1</h3>')
    // lists
    .replace(/^- (.*?)\n/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>')
    // clean up duplicate adjacent lists
    .replace(/<\/ul>\s*<ul>/g, '')
    // paragraph splits
    .replace(/\n\n/g, '</p><p>');

  return `<p>${formatted}</p>`;
}

// Helper to look up verbatim reference in our local corpus replica
function resolveCitation(citationObj: any) {
  if (!citationObj) return null;
  if (citationObj.text) return citationObj;
  
  const found = CORPUS_LOCAL.find(c => 
    c.id === citationObj.id ||
    c.title.toLowerCase().includes(citationObj.title?.toLowerCase()) || 
    citationObj.title?.toLowerCase().includes(c.title?.toLowerCase()) ||
    c.id.toLowerCase().includes(citationObj.title?.toLowerCase()) ||
    citationObj.title?.toLowerCase().includes(c.id?.toLowerCase())
  );
  if (found) {
    return {
      ...found,
      relevance_summary: citationObj.relevance_summary || found.text
    };
  }
  return citationObj;
}

// Local Corpus Replica to display verbatim statutory texts in popovers
const CORPUS_LOCAL = [
  {
    id: "Art_3_1_AI_Def",
    title: "Article 3(1) - Definition of an AI System",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "An 'artificial intelligence system' (AI system) means a machine-based system designed to operate with varying levels of autonomy, that may exhibit adaptiveness after deployment and that, for explicit or implicit objectives, infers, from the input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.",
    key_indicators: [
      "Machine-based: Operates on electronic computing hardware.",
      "Autonomy: Can execute tasks without constant manual human steering.",
      "Adaptiveness: Learns or alters its model parameters during/after deployment.",
      "Inference: Converts inputs into predictions, content, decisions, or recommendations via statistical, machine learning, or logical logic (not simple deterministic rule sheets)."
    ]
  },
  {
    id: "Art_5_Prohibited_Practices",
    title: "Article 5 - Prohibited Artificial Intelligence Practices",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "The following AI practices shall be prohibited:\n1. Cognitive behavioral manipulation: AI systems that deploy subliminal techniques beyond human consciousness or purposeful manipulative/deceptive techniques, with the objective or effect of materially distorting behavior in a manner that causes or is likely to cause significant harm.\n2. Exploitation of vulnerabilities: AI systems that exploit vulnerabilities of a person or a specific group due to their age, disability, specific social or economic situation, to distort behavior in a harmful manner.\n3. Social Scoring: AI systems used by public authorities (or on their behalf) for the evaluation or classification of natural persons over a period of time based on their social behavior, leading to detrimental or unfavorable treatment in social contexts unrelated to where the data was collected.\n4. Biometric Categorization: AI systems that categorize natural persons individually based on their biometric data to deduce or infer their race, political opinions, trade union membership, religious beliefs, sex life or sexual orientation. (Exceptions apply to law enforcement under strict judicial warrants).\n5. Untargeted Scraping: AI systems that create or expand facial recognition databases through the untargeted scraping of facial images from the internet or CCTV footage.\n6. Emotion Recognition: AI systems used to detect or infer emotions of natural persons in the areas of workplace and educational institutions, except where the use is for safety or medical purposes.",
    key_indicators: [
      "Subliminal/deceptive manipulation leading to physical/psychological harm.",
      "Targeting vulnerable demographics (elderly, kids, disabled, economically distressed).",
      "State or administrative social scoring networks.",
      "Workplace or school-based automated emotion trackers.",
      "Biometric categorization of protected sensitive traits (race, religion, sexuality).",
      "Mass scraping of public face databases (e.g. Clearview AI model)."
    ]
  },
  {
    id: "Art_6_High_Risk_Rules",
    title: "Article 6 - Classification Rules for High-Risk AI Systems",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "An AI system shall be considered high-risk if both of the following conditions are fulfilled:\n(a) The AI system is intended to be used as a safety component of a product, or is itself a product, covered by the Union harmonization legislation listed in Annex I (e.g. machinery, toys, elevators, medical devices, aviation, marine equipment), AND\n(b) The product or the safety component is required to undergo a third-party conformity assessment under that harmonization legislation.\nAdditionally, AI systems referred to in Annex III shall be considered high-risk unless they do not pose a significant risk of harm to the health, safety or fundamental rights of natural persons.",
    key_indicators: [
      "Part of regulated hardware products (lifts, medical devices, cars, toys).",
      "Subject to third-party safety audits under Annex I harmonization.",
      "Standalone AI system listed under the Annex III specific categories."
    ]
  },
  {
    id: "Annex_III_High_Risk_Categories",
    title: "Annex III - High-Risk AI Use Cases (Standalone Systems)",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "The following standalone AI systems are high-risk:\n1. Biometrics: Remote biometric identification systems (real-time and post); Biometric categorization based on sensitive traits; Emotion recognition systems (outside workplace/education exception).\n2. Critical Infrastructure: AI systems intended to be used as safety components in the management and operation of road, water, gas, heating, electricity, and digital infrastructure.\n3. Education and Vocational Training: AI systems used to determine access or admission to education; AI systems used to evaluate learning outcomes or monitor student behavior during exams.\n4. Employment, Workers Management: AI systems used for recruitment or selection (sorting resumes, ranking applicants); AI systems used to make decisions on promotions, termination, task allocation, or performance monitoring.\n5. Access to Essential Services: AI systems used by public authorities to determine eligibility for social benefits; AI credit scoring systems used to assess creditworthiness of natural persons; AI systems for pricing and risk assessment in life and health insurance; AI systems for prioritizing emergency responses (police, fire, ambulance).\n6. Law Enforcement: AI systems used to assess recidivism risk, polygraphs, profiling of offenders, or detecting deepfakes for crime prevention.\n7. Migration, Asylum, Border Control: AI systems used to assess security risks, verify travel documents, or polygraphs.\n8. Administration of Justice: AI systems used by a judicial authority to assist in interpreting facts and the law.",
    key_indicators: [
      "Resume parsing and hiring screening tools.",
      "Credit scoring, lending eligibility, and insurance risk rating.",
      "Student admissions, grading, and proctoring.",
      "Utility grids, power plants, and telecom switching centers.",
      "Border checks, travel risk profiling, and visa vetting.",
      "Recidivism calculators or profiling tools used by police."
    ]
  },
  {
    id: "Art_16_Provider_Obligations",
    title: "Article 16 - General Obligations of Providers of High-Risk AI Systems",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "Providers of high-risk AI systems shall comply with the following structural duties:\n1. Ensure conformity: Ensure that their high-risk AI systems comply with the requirements set out in Chapter II (Articles 9-15 risk systems, data, documentation, logs, human oversight, cybersecurity).\n2. Quality Management System (QMS): Establish, document and maintain a quality management system ensuring systematic compliance (Art 17).\n3. Conformity Assessment: Draw up technical documentation and undergo the relevant conformity assessment procedure (Art 43) prior to placing on market.\n4. Keep logs: Retain automatically generated logs for at least 6 months (Art 20).\n5. Corrective Action: Immediately take necessary corrective actions, or recall/withdraw the system, if it is not in conformity (Art 21).\n6. CE Marking: Affix the CE marking of conformity to the system or packaging to certify compliance (Art 48).\n7. Registration: Register themselves and their specific high-risk system in the official EU database for high-risk AI systems (Art 49).",
    key_indicators: [
      "Quality management systems and compliance officer appointments.",
      "Affixing CE marks on software delivery channels.",
      "Mandatory registration in the public EU AI Registry.",
      "Initiating immediate recall or shutoff processes if models drift."
    ]
  },
  {
    id: "Art_22_25_Operators_Value_Chain",
    title: "Articles 22-25 - Obligations of Value-Chain Operators (Importers & Distributors)",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "Any operator in the AI supply value-chain is subject to distinct requirements to ensure regulatory integrity:\n1. Article 22 (Authorized Representatives): Downstream providers based outside the EU must designate a legal representative within the Union with access to technical files and authority to coordinate with Market Surveillance Authorities.\n2. Article 23 (Importers): Entities importing an AI system from outside the EU must verify that the provider completed conformity assessments, compiled technical files, registered the system, and marked CE compliance. Importers must list their name/address on the system.\n3. Article 24 (Distributors): Distributors (resellers, retailers) must inspect the system to confirm it bears the CE mark and instructions of use.\n4. Article 25 (Downstream Integrators): Any distributor, importer or deployer that puts a high-risk AI system on the market under their own brand, or substantially modifies a model, shall be considered a 'Provider' and must assume all Article 16 responsibilities.",
    key_indicators: [
      "Importing software from US/UK/Asia into the EU market.",
      "Re-branding a white-labeled AI software package.",
      "Making significant modifications to models (fine-tuning, prompt architectures changing safety boundaries).",
      "Retailing third-party compliance products."
    ]
  },
  {
    id: "Art_29a_FRIA",
    title: "Article 29a - Fundamental Rights Impact Assessment (FRIA)",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "Prior to deploying a high-risk AI system, specific deployers must conduct a detailed Fundamental Rights Impact Assessment (FRIA). The assessment must analyze:\n1. Description of the deployer's specific processes and target populations.\n2. The specific categories of natural persons and vulnerable groups likely to be affected.\n3. The specific risks of harm to fundamental rights (equality, privacy, non-discrimination, fair trial).\n4. The human oversight measures and override rules configured to prevent these risks.\n5. The measures to be taken in case of actual realization of risks (incident response).\nFRIA is mandatory for deployers in specific sectors, including public authorities, banks/lenders, health insurance providers, education institutions (grading/admissions), and recruitment/employment software deployers.",
    key_indicators: [
      "Mandatory FRIA for employment ranking, screening, or firing.",
      "Credit scoring, life insurance pricing, or welfare eligibility checks.",
      "Public schools, universities, and grading systems.",
      "Government offices and administrative authorities."
    ]
  },
  {
    id: "Art_50_Transparency_Labelling",
    title: "Article 50 - Specific Transparency and Labelling Obligations",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "1. Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system, unless this is obvious from the circumstances.\n2. Providers of AI systems, including GPAI systems, generating synthetic audio, image, video or text content, shall ensure that the outputs of the AI system are marked in a machine-readable format and detectable as artificially generated or manipulated (marking/watermarking obligations). Exceptions apply to authorized crime prevention, and creative/artistic/satirical works where marking does not impede display.\n3. Deployers of an emotion recognition system or a biometric categorization system shall inform the natural persons exposed thereto of the operation of the system.\n4. Deployers of an AI system that generates or manipulates image, audio or video content constituting a deepfake shall disclose that the content has been artificially generated or manipulated, by labeling the output accordingly.",
    key_indicators: [
      "Conversational chatbots and automated customer service avatars.",
      "Generative AI tools (Midjourney, DALL-E, GPT text writers).",
      "Synthetic audio generators and voice-cloning tools.",
      "Biometric trait classifiers or workplace safety checkups.",
      "Deepfakes, face-swapping, and video manipulations."
    ]
  },
  {
    id: "Chapter_V_GPAI_Rules",
    title: "Chapter V - General-Purpose AI (GPAI) Models & Obligations",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "A 'general-purpose AI model' (GPAI) is an AI model, including when trained with a large amount of data using self-supervision at scale, that displays significant generality and is capable of competently performing a wide range of distinct tasks and that can be integrated into a variety of downstream applications.\nGPAI Model Provider Obligations:\n- Draw up and maintain technical documentation of the model (training process, evaluation results).\n- Draw up information and documentation to downstream providers who intend to integrate the model.\n- Establish a policy to comply with Union copyright law.\n- Publish a sufficiently detailed summary about the content used for training.\nGPAI Models with Systemic Risks (compute > 10^25 FLOPs or designated as such):\n- Perform model evaluations, adversarial testing (red-teaming).\n- Assess and mitigate systemic risks at Union level.\n- Track and report serious incidents to the AI Office.",
    key_indicators: [
      "Large language models (LLMs like GPT-4, Gemini 1.5, Claude 3).",
      "Foundation models integrated as APIs into downstream SaaS apps.",
      "Models with high floating-point training compute (> 10^25 FLOP compute).",
      "Copyright crawler policies and training data corpus disclosures."
    ]
  },
  {
    id: "Art_51_GPAI_Systemic_Risk",
    title: "Article 51 - General-Purpose AI Models with Systemic Risk",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "A GPAI model is classified as having systemic risk if it meets specific computing benchmarks:\n1. Cumulative compute: The model was trained using cumulative floating-point operations (FLOPs) greater than 10^25.\n2. AI Office decision: The European AI Office designates it as such due to high capability, downstream network reach, or potential risks of cyber-attacks, bioweapon design, or autonomous replication.\nProviders of systemic-risk GPAI models must:\n- Perform exhaustive adversarial testing, automated safety benchmarks, and red-teaming (Art 52).\n- Document and mitigate systemic risks, reporting security gaps and incident logs to the EU AI Office.\n- Establish robust cyber-resilience policies protecting weights and API channels.",
    key_indicators: [
      "Ultra-large language models (10^25 FLOP compute class).",
      "Involvement of EU AI Office in designation audits.",
      "National security adversarial red-teaming (cyber-weapons, chemical threats).",
      "Model weight leaks prevention."
    ]
  },
  {
    id: "Art_9_15_HR_Governance",
    title: "Articles 9-15 - Compliance Requirements for High-Risk AI Systems",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "Providers of High-Risk AI systems must establish a robust governance system:\n1. Article 9 (Risk Management System): Establish a continuous, iterative risk management system throughout the lifecycle of the AI system, including risk identification, estimation, and adoption of mitigation measures.\n2. Article 10 (Data and Data Governance): Training, validation, and testing datasets must be subject to appropriate data governance, including design choices, data collection, preparation, checks for bias, and data representation.\n3. Article 11 (Technical Documentation): Create and update technical documentation before putting the system on the market, showing compliance with all regulations.\n4. Article 12 (Record-keeping / Logging): Enable automatic logging of events ('system logs') during operation to ensure traceability, monitoring of operation, and post-market tracking.\n5. Article 13 (Transparency and Information): Design systems to allow deployers to understand the system's operations, outputs, and limitations. Provide a detailed 'instructions for use' document.\n6. Article 14 (Human Oversight): Design systems so that they can be effectively overseen by natural persons to prevent or minimize risks (e.g. override, shutoff, or validation switches).\n7. Article 15 (Accuracy, Robustness, Cybersecurity): Ensure appropriate levels of technical robustness, cyber-resilience, protection against model poisoning, adversarial inputs, and functional reliability.",
    key_indicators: [
      "Need for documented Risk Assessment spreadsheets.",
      "Auditable data cleaning, bias detection, and training pipelines.",
      "Automated system event logging (who accessed, when, what decision).",
      "User manuals and clear explanations of confidence intervals.",
      "Kill switches, human verification queues, and override buttons."
    ]
  },
  {
    id: "Art_26_Deployer_Obligations",
    title: "Article 26 - Obligations of Deployers of High-Risk AI",
    source: "Legislation - EU AI Act",
    url: "http://data.europa.eu/eli/reg/2024/1689/oj",
    text: "Deployers (organizations using high-risk AI systems in their professional activities) must comply with:\n1. Take appropriate technical and organizational measures to ensure they use the systems in accordance with the provided instructions of use.\n2. Assign human oversight to competent, trained natural persons who possess the necessary authority and support.\n3. Monitor the operation of the AI system based on instructions, and inform the provider/distributor of any serious incident or malfunctioning.\n4. Keep the logs automatically generated by the high-risk AI system for a period appropriate to its purpose (at least 6 months).\n5. Conduct a Fundamental Rights Impact Assessment (FRIA) prior to deploying high-risk systems in specific sectors (like public services, banking, or healthcare) assessing the impact on vulnerable groups, data processing, and oversight.",
    key_indicators: [
      "Downstream SaaS deployers using enterprise recruitment tools.",
      "Banks running vendor-provided credit scoring models.",
      "Mandatory Fundamental Rights Impact Assessments (FRIA).",
      "Human oversight training certifications and 6-month log archival."
    ]
  },
  {
    id: "GDPR_Overlap",
    title: "GDPR Overlap - Articles 22 and 35 (Data Protection)",
    source: "Adjacent Law - GDPR",
    url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    text: "Where an AI system processes personal data, GDPR applies concurrently with the AI Act:\n1. Article 22 (Automated Individual Decision-Making): Data subjects have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects them, unless authorized by law, explicit consent, or contract.\n2. Article 35 (Data Protection Impact Assessment - DPIA): A DPIA is mandatory before processing personal data when using new technologies that are likely to result in a high risk to the rights and freedoms of natural persons (such as systematic profiling or large-scale surveillance).",
    key_indicators: [
      "Solely automated decision-making (no meaningful human review).",
      "Processing of personal data (names, emails, behavior, telemetry).",
      "Processing of special category sensitive data (health, politics, genetics).",
      "Mandatory DPIA triggers prior to system rollout."
    ]
  },
  {
    id: "Finnish_Implementation",
    title: "Finnish Implementation Context - Traficom & TEM",
    source: "National - Finnish Implementation",
    url: "https://traficom.fi/fi/tekoalyn-saantely/tietoa-eun-tekoalyasetuksesta",
    text: "In Finland, the national implementation of the EU AI Act is led by:\n1. Traficom (Finnish Transport and Communications Agency): Acts as the primary National Market Surveillance Authority (MSA) overseeing AI compliance, auditing technical documentation, and issuing penalties.\n2. TEM (Ministry of Economic Affairs and Employment): Coordinates legislative adaptation, setting up national administrative bodies, and facilitating domestic sandbox participation.\n3. Finnish Data Protection Act: Works alongside the AI Act to enforce privacy protections, overseen by the Finnish Office of the Data Protection Ombudsman (Tietosuojavaltuutettu).",
    key_indicators: [
      "Deployments within Finnish borders or targeting Finnish citizens.",
      "Reporting requirements to the Finnish Market Surveillance Authority.",
      "Finnish Tietosuojavaltuutettu privacy overlap for consumer profiling."
    ]
  },
  {
    id: "Adjacent_EU_Surveillance",
    title: "Adjacent National Surveillance Context - CNIL, BfDI & AEPD",
    source: "National - EU Implementation Boards",
    url: "https://digital-strategy.ec.europa.eu/en/policies/national-market-surveillance-authorities",
    text: "Across the European Union, national market surveillance authorities coordinate enforcement of the AI Act:\n1. France - CNIL (Commission Nationale de l'Informatique et des Libertés): France's data watchdog acts as the leading authority, auditing AI systems for compliance with biometric limits, data training inputs bias, and profiling rules.\n2. Germany - BfDI (Federal Commissioner for Data Protection and Freedom of Information) & Federal Network Agency: Lead digital market oversight, ensuring human-in-the-loop and cyber robustness compliance.\n3. Spain - AEPD (Agencia Española de Protección de Datos): The first national body to implement active AI sandbox audits, vouching for robust conformity assessment registries and transparency guidelines.",
    key_indicators: [
      "AI systems operating in France, Germany, or Spain.",
      "CNIL biometric reviews and profiling audits.",
      "AEPD sandbox audit participation requests."
    ]
  },
  {
    id: "Guidelines_AI_System_Def",
    title: "Commission Guidelines on the AI System Definition",
    source: "Official Guidance - Commission",
    url: "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application",
    text: "The European Commission clarifies the distinction between simple software and AI systems:\n- A system is not 'AI' if it relies solely on pre-defined, deterministic logic written directly by programmers where the outputs map 1:1 to human-designed rules.\n- AI systems involve the creation of a mathematical model that infers parameters from data, allowing generalization and predictions on unseen inputs.\n- Varying levels of autonomy mean the system can perform actions without human intervention, ranging from highly automated batch systems to continuous active agents.",
    key_indicators: [
      "Machine learning, neural networks, or deep learning architectures.",
      "Evolutionary computation, probabilistic inference, or Bayesian networks.",
      "Deterministic excel sheets vs machine-learned models."
    ]
  },
  {
    id: "Guidelines_Prohibited_AI",
    title: "Commission Guidelines on Prohibited AI Practices",
    source: "Official Guidance - Commission",
    url: "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelinesprohibited-artificial-intelligence-ai-practices-defined-ai-act",
    text: "The Commission's guidelines on Article 5 prohibitions provide detailed testing criteria:\n- 'Subliminal techniques' mean stimuli presented below the threshold of conscious perception (e.g. ultra-fast flashes, acoustic frequencies, or micro-targeted UI changes designed to bypass rational thought).\n- 'Exploitation of vulnerabilities' is assessed against the average member of that group. Vulnerabilities can be situational (e.g., severe temporary financial distress, extreme sleep deprivation, grief) in addition to demographic.\n- 'Significant harm' includes physical, psychological, financial, or reputation damage resulting directly from the behavioral distortion caused by the AI system.",
    key_indicators: [
      "Gamification loops triggering compulsive micro-transactions in children.",
      "SaaS pricing micro-adjustments exploiting urgent individual financial pressure.",
      "Subliminal UI tricks in dark pattern web designs."
    ]
  },
  {
    id: "Guidelines_Marking_Labelling",
    title: "Commission Draft Code of Practice on Marking and Labelling",
    source: "Official Guidance - Commission",
    url: "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-second-draft-code-practice-marking-and-labelling-ai-generated-content",
    text: "The Code of Practice defines technological standards for watermarking and metadata injection:\n- Watermarking: Visible or invisible signals embedded directly in the content structure (e.g., noise in images, frequency modulations in audio) that survive compression, cropping, and format changes.\n- Metadata: Standardized C2PA (Coalition for Content Provenance and Authenticity) metadata headers injected into files to detail creator, editor, and generative AI origin.\n- Verification interfaces: Providers must provide public or downstream tools to verify whether an output was generated by their models.",
    key_indicators: [
      "C2PA metadata manifest compliance.",
      "Robust digital watermarking for text, image, and video generators.",
      "Detection API endpoints for public verification."
    ]
  }
];
