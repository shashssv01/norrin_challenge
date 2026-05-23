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
  Database, 
  RefreshCw, 
  Send, 
  CheckSquare, 
  BookOpen,
  Search,
  ChevronRight,
  Info
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
  
  // Workspace Mode Tabs
  const [activeTab, setActiveTab] = useState<'radar' | 'database'>('radar');
  
  // Chat Panel States
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Advanced Compliance UI States
  const [checkedObligations, setCheckedObligations] = useState<string[]>([]);
  const [drawerContent, setDrawerContent] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<Record<string, boolean>>({});
  
  // Constellation Visualizer States
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [selectedConstellationNode, setSelectedConstellationNode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const prevAssessmentRef = useRef<any>(null);

  // Monitor changes between old and new assessment state for glow pulses
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
        console.log("Prism Session Active:", data.session_id);
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

  // Run Multi-Agent Compliance Pipeline (simulated sequential timeline)
  const handleAnalyze = async () => {
    if (!sessionId) return;
    setIsAnalyzing(true);
    setActiveAgentIndex(1);
    setConsoleMessage("Coordinating analysis matrix... Fact Extractor dispatched.");
    setAssessment(null);
    setAgentLogs([]);
    setCheckedObligations([]);
    setUpdatedFields({});
    setDrawerContent(null);
    setIsDrawerOpen(false);

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

      // Animate agent thoughts
      setTimeout(() => {
        const extractorLog = logs.find(l => l.agent === "Fact Extractor");
        if (extractorLog) {
          setConsoleMessage(`[Fact Extractor] complete.\nThought: ${extractorLog.thought}`);
          setAgentLogs(prev => [...prev, extractorLog]);
        }
        setActiveAgentIndex(2);
        
        setTimeout(() => {
          const retrieverLog = logs.find(l => l.agent === "Retrieval Agent");
          if (retrieverLog) {
            setConsoleMessage(`[Retrieval Agent] complete.\nThought: ${retrieverLog.thought}`);
            setAgentLogs(prev => [...prev, retrieverLog]);
          }
          setActiveAgentIndex(3);
          
          setTimeout(() => {
            const analystLog = logs.find(l => l.agent === "Legal Analyst");
            if (analystLog) {
              setConsoleMessage(`[Legal Analyst] complete.\nThought: ${analystLog.thought}`);
              setAgentLogs(prev => [...prev, analystLog]);
            }
            setActiveAgentIndex(4);
            
            setTimeout(() => {
              const criticLog = logs.find(l => l.agent === "Red-Team Critic");
              if (criticLog) {
                setConsoleMessage(`[Red-Team Critic] complete.\nThought: ${criticLog.thought}`);
                setAgentLogs(prev => [...prev, criticLog]);
              }
              setActiveAgentIndex(5);
              
              setTimeout(() => {
                setAssessment(data.assessment);
                setChatHistory(data.chat_history);
                setIsAnalyzing(false);
                setConsoleMessage("Compliance assessment synthesized.");
              }, 1200);
              
            }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);

    } catch (err) {
      console.error("Pipeline failed:", err);
      alert("Failed to analyze use case.");
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
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (err) {
      console.error("Chat failure:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Open Drawer Helper
  const openObligationInDrawer = (o: any) => {
    setDrawerContent({
      type: 'obligation',
      title: o.obligation,
      risk_tier: o.relevance_tier,
      scope: o.scope,
      relevance: o.relevance,
      citations: o.citations,
      data: o
    });
    setIsDrawerOpen(true);
  };

  const openCitationInDrawer = (citTitle: string) => {
    const citationData = resolveCitation({ title: citTitle });
    setDrawerContent({
      type: 'citation',
      title: citationData.title,
      source: citationData.source,
      url: citationData.url,
      text: citationData.text,
      key_indicators: citationData.key_indicators,
      relevance_summary: citationData.relevance_summary || 'Cited legal statute grounding regulatory obligations.'
    });
    setIsDrawerOpen(true);
  };

  return (
    <div className="app-container">
      {/* 1. Slim Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">▲</div>
          <h1 className="logo-text">Conformity Prism</h1>
          <span className="badge-prism">AI Act Workspace</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Session: {sessionId ? `${sessionId.slice(0, 8)}...` : 'Connecting...'}
          </span>
          {isAnalyzing && <RefreshCw style={{ animation: 'spin 1.5s linear infinite', width: '16px', color: 'var(--accent-cyan)' }} />}
        </div>
      </header>

      {/* 2. Main Workspace Layout Grid */}
      <main className="dashboard-grid">
        
        {/* Left Column: Intake and Local Agent Timelines */}
        <section className="sidebar">
          <div>
            <h2 className="panel-title"><Upload style={{ width: '14px' }} /> Intake Dossier</h2>
            <div 
              className={`upload-container ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <Upload className="upload-icon" />
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <strong>Drag specs here</strong> or browse
              </div>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
              />
            </div>
            {isUploading && <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textAlign: 'center', marginTop: '8px' }}>Parsing file content...</div>}
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="panel-title"><FileText style={{ width: '14px' }} /> Uploaded specs</h3>
              <div className="file-list">
                {files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }} title={file.filename}>{file.filename}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(file.size / 1024)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            className="btn-primary" 
            disabled={files.length === 0 || isAnalyzing} 
            onClick={handleAnalyze}
          >
            <Play style={{ fill: 'currentColor', width: '10px' }} />
            {isAnalyzing ? 'Analyzing matrix...' : 'Evaluate compliance'}
          </button>

          {/* Mini Agent Timeline Progress */}
          <div style={{ marginTop: 'auto' }}>
            <h3 className="panel-title"><Database style={{ width: '14px' }} /> Agent Matrix State</h3>
            <div className="agent-pipeline-min-tracker">
              <div className={`min-pipeline-node ${activeAgentIndex === 1 ? 'active' : activeAgentIndex > 1 ? 'completed' : ''}`}>
                <span>Fact Extractor</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              <div className={`min-pipeline-node ${activeAgentIndex === 2 ? 'active' : activeAgentIndex > 2 ? 'completed' : ''}`}>
                <span>Retriever</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              <div className={`min-pipeline-node ${activeAgentIndex === 3 ? 'active' : activeAgentIndex > 3 ? 'completed' : ''}`}>
                <span>Analyst</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              <div className={`min-pipeline-node ${activeAgentIndex === 4 ? 'active' : activeAgentIndex > 4 ? 'completed' : ''}`}>
                <span>Critic</span>
              </div>
            </div>

            {consoleMessage && (
              <div style={{
                background: 'rgba(8, 12, 20, 0.4)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                marginTop: '10px',
                maxHeight: '100px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.4'
              }}>
                {consoleMessage}
              </div>
            )}
          </div>
        </section>

        {/* Center Column: Visual Map Viewports */}
        <section className="workspace">
          
          {/* Header Tab Bar */}
          <div className="workspace-header">
            <div className="navigation-tabs">
              <button 
                className={`tab-trigger ${activeTab === 'radar' ? 'active' : ''}`}
                onClick={() => setActiveTab('radar')}
              >
                <Shield style={{ width: '14px' }} /> Compliance Radar
              </button>
              <button 
                className={`tab-trigger ${activeTab === 'database' ? 'active' : ''}`}
                onClick={() => setActiveTab('database')}
              >
                <Database style={{ width: '14px' }} /> Corpus Constellation
              </button>
            </div>
            
            {/* Dynamic checklist SVG indicator */}
            {assessment && (
              (() => {
                const total = assessment.legal_obligations?.length || 0;
                const done = assessment.legal_obligations?.filter((o: any) => checkedObligations.includes(o.obligation_id)).length || 0;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div className="checklist-progress-box">
                    <svg width="24" height="24" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="transparent" />
                      <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="var(--accent-cyan)" 
                        strokeWidth="2" 
                        fill="transparent" 
                        strokeDasharray="62.8"
                        strokeDashoffset={62.8 - (percent / 100) * 62.8}
                      />
                    </svg>
                    <span className="dials-percentage">{percent}% <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Ready</span></span>
                  </div>
                );
              })()
            )}
          </div>

          {/* Interactive Visualizer Viewport */}
          <div className="visualizer-viewport-container">
            
            {!assessment && !isAnalyzing ? (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px', textAlign: 'center', zIndex: 10
              }}>
                <div className="logo-icon" style={{ width: '50px', height: '50px', fontSize: '1.4rem', borderRadius: '12px', marginBottom: '16px' }}>▲</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Regulatory Conformity Map</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.5' }}>
                  Intake raw specifications in the left panel to map your use-case obligations orbiting the EU AI Act constellation.
                </p>
              </div>
            ) : isAnalyzing && !assessment ? (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 10
              }}>
                <RefreshCw style={{ animation: 'spin 2s linear infinite', width: '32px', height: '32px', color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginTop: '16px', color: 'var(--text-primary)' }}>Resolving Legal Orbits...</h3>
              </div>
            ) : activeTab === 'radar' && assessment ? (
              
              /* Compliance Radar SVG Orrery Viewport */
              <svg className="visualizer-svg" viewBox="0 0 800 500">
                <defs>
                  <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="70%" stopColor="var(--accent-violet)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Orbit concentric circles */}
                <circle cx="400" cy="250" r="80" className="radar-orbit-ring" />
                <circle cx="400" cy="250" r="140" className="radar-orbit-ring orbiting-pulse-glow" />
                <circle cx="400" cy="250" r="200" className="radar-orbit-ring" />
                <circle cx="400" cy="250" r="260" className="radar-orbit-ring" />

                {/* Central AI System Sun */}
                <circle cx="400" cy="250" r="30" className="radar-central-sun" />
                <text x="400" y="254" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="var(--font-display)">AI SYSTEM</text>

                {/* Orbit 1: AI Definition Status */}
                {(() => {
                  const qualified = assessment.is_ai_system?.qualifies;
                  const x = 400 + Math.cos(-Math.PI / 4) * 80;
                  const y = 250 + Math.sin(-Math.PI / 4) * 80;
                  return (
                    <g 
                      className="radar-planet-node"
                      onClick={() => {
                        setDrawerContent({
                          type: 'aidef',
                          title: 'Art 3(1) AI Qualification',
                          qualifies: qualified,
                          reasoning: assessment.is_ai_system?.reasoning,
                          citations: assessment.is_ai_system?.citations
                        });
                        setIsDrawerOpen(true);
                      }}
                    >
                      <circle cx={x} cy={y} r="12" fill={qualified ? "var(--bg-panel)" : "var(--accent-rose)"} stroke={qualified ? "var(--accent-cyan)" : "var(--accent-rose)"} strokeWidth="1.5" className="planet-glow-transparency" />
                      <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AI</text>
                      <text x={x} y={y - 18} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontWeight="bold">AI System Definition</text>
                    </g>
                  );
                })()}

                {/* Orbit 2: Risk Tier Planet */}
                {(() => {
                  const tier = assessment.risk_classification?.tier || 'High Risk';
                  const isProhibited = tier.toLowerCase().includes('prohibited');
                  const isHigh = tier.toLowerCase().includes('high');
                  const isTransparency = tier.toLowerCase().includes('transparency');
                  const color = isProhibited ? "var(--accent-rose)" : isHigh ? "var(--accent-violet)" : isTransparency ? "var(--accent-cyan)" : "var(--accent-emerald)";
                  const glowClass = isProhibited ? "planet-glow-prohibited" : isHigh ? "planet-glow-high" : "planet-glow-transparency";
                  const x = 400 + Math.cos(Math.PI / 6) * 140;
                  const y = 250 + Math.sin(Math.PI / 6) * 140;
                  return (
                    <g 
                      className="radar-planet-node"
                      onClick={() => {
                        setDrawerContent({
                          type: 'risk',
                          title: 'EU AI Act Risk Classification',
                          tier: tier,
                          reasoning: assessment.risk_classification?.reasoning,
                          citations: assessment.risk_classification?.citations
                        });
                        setIsDrawerOpen(true);
                      }}
                    >
                      <circle cx={x} cy={y} r="16" fill="var(--bg-panel)" stroke={color} strokeWidth="2" className={glowClass} />
                      <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">RISK</text>
                      <text x={x} y={y - 20} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontWeight="bold">Risk: {tier}</text>
                    </g>
                  );
                })()}

                {/* Orbit 3: Role Assessment Planet */}
                {(() => {
                  const role = assessment.role_assessment?.role || 'Deployer';
                  const x = 400 + Math.cos(Math.PI) * 200;
                  const y = 250 + Math.sin(Math.PI) * 200;
                  return (
                    <g 
                      className="radar-planet-node"
                      onClick={() => {
                        setDrawerContent({
                          type: 'role',
                          title: 'Assessed Operational Role',
                          role: role,
                          reasoning: assessment.role_assessment?.reasoning,
                          citations: assessment.role_assessment?.citations
                        });
                        setIsDrawerOpen(true);
                      }}
                    >
                      <circle cx={x} cy={y} r="14" fill="var(--bg-panel)" stroke="var(--accent-violet)" strokeWidth="1.5" className="planet-glow-high" />
                      <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">ROLE</text>
                      <text x={x} y={y - 18} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontWeight="bold">Role: {role}</text>
                    </g>
                  );
                })()}

                {/* Orbit 4: Active Legal Obligations Orbitals */}
                {assessment.legal_obligations?.map((o: any, idx: number) => {
                  const count = assessment.legal_obligations.length;
                  const angle = (idx * (2 * Math.PI) / count) - Math.PI / 2;
                  const x = 400 + Math.cos(angle) * 260;
                  const y = 250 + Math.sin(angle) * 260;
                  const isChecked = checkedObligations.includes(o.obligation_id);
                  const isBlocker = o.relevance_tier?.toLowerCase() === 'blocker';
                  const isCritical = o.relevance_tier?.toLowerCase() === 'critical';
                  const color = isChecked ? "var(--accent-emerald)" : isBlocker ? "var(--accent-rose)" : isCritical ? "var(--accent-violet)" : "var(--accent-cyan)";
                  
                  return (
                    <g 
                      key={o.obligation_id}
                      className="radar-planet-node"
                      onClick={() => openObligationInDrawer(o)}
                    >
                      <circle cx={x} cy={y} r="10" fill="var(--bg-panel)" stroke={color} strokeWidth="2" />
                      {isChecked && <circle cx={x} cy={y} r="4" fill="var(--accent-emerald)" />}
                      <text 
                        x={x} 
                        y={y - 14} 
                        textAnchor="middle" 
                        fill={isChecked ? "var(--accent-emerald)" : "var(--text-primary)"} 
                        fontSize="7" 
                        fontWeight="600"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                      >
                        {o.obligation_id.length > 15 ? `${o.obligation_id.slice(0, 12)}...` : o.obligation_id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              
              /* Corpus Constellation (Database Visualizer Network Graph) */
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                
                {/* Clean search bar */}
                <div className="constellation-search-box">
                  <Search style={{ width: '14px', position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    className="search-input-field"
                    placeholder="Search legal database constellation..."
                    value={dbSearchQuery}
                    style={{ paddingLeft: '32px' }}
                    onChange={e => setDbSearchQuery(e.target.value)}
                  />
                </div>

                <svg className="visualizer-svg" viewBox="0 0 800 500">
                  <defs>
                    <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>

                  {/* Draw relationship pathways */}
                  {CONSTELLATION_LINKS.map((link, idx) => {
                    const fromNode = CONSTELLATION_NODES.find(n => n.id === link.from);
                    const toNode = CONSTELLATION_NODES.find(n => n.id === link.to);
                    if (!fromNode || !toNode) return null;
                    const isActive = selectedConstellationNode === link.from || selectedConstellationNode === link.to;
                    
                    return (
                      <line 
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        className={`constellation-path-link ${isActive ? 'active-link' : ''}`}
                        stroke={isActive ? "var(--accent-cyan)" : "url(#linkGradient)"}
                        strokeWidth={isActive ? "2.5" : "1"}
                      />
                    );
                  })}

                  {/* Renders legal particle nodes */}
                  {CONSTELLATION_NODES.map(node => {
                    const matchesSearch = dbSearchQuery.trim() === '' || 
                      node.label.toLowerCase().includes(dbSearchQuery.toLowerCase()) || 
                      node.id.toLowerCase().includes(dbSearchQuery.toLowerCase());
                      
                    const isSelected = selectedConstellationNode === node.id;
                    const fillOpacity = matchesSearch ? 1 : 0.15;
                    const strokeOpacity = matchesSearch ? 1 : 0.15;
                    
                    return (
                      <g 
                        key={node.id}
                        className="constellation-node-particle"
                        onClick={() => {
                          setSelectedConstellationNode(node.id === selectedConstellationNode ? null : node.id);
                          openCitationInDrawer(node.label);
                        }}
                        style={{ opacity: fillOpacity }}
                      >
                        <circle 
                          cx={node.x} 
                          cy={node.y} 
                          r={isSelected ? "12" : "7"} 
                          fill="var(--bg-panel)" 
                          stroke={node.color} 
                          strokeWidth={isSelected ? "3" : "1.5"}
                          filter={isSelected ? "url(#glowFilter)" : ""}
                        />
                        <circle cx={node.x} cy={node.y} r="3" fill={node.color} />
                        <text 
                          x={node.x} 
                          y={node.y + 18} 
                          textAnchor="middle" 
                          fill={isSelected ? "var(--accent-cyan)" : "var(--text-secondary)"} 
                          fontSize="7.5"
                          fontWeight={isSelected ? "800" : "600"}
                          fontFamily="var(--font-display)"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Bottom left constellation quick popover info */}
                {selectedConstellationNode && (
                  (() => {
                    const node = CONSTELLATION_NODES.find(n => n.id === selectedConstellationNode);
                    const doc = resolveCitation({ title: node?.label });
                    return (
                      <div className="constellation-popover-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{doc.title}</span>
                          <span className="badge-prism">{doc.source}</span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {doc.relevance_summary?.slice(0, 150)}...
                        </p>
                        <button 
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onClick={() => openCitationInDrawer(doc.title)}
                        >
                          View Full verbiage <ChevronRight style={{ width: '12px' }} />
                        </button>
                      </div>
                    );
                  })()
                )}

              </div>
            )}

            {/* Float checked obligations list in a visual card overlay */}
            {assessment && activeTab === 'radar' && (
              <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                width: '320px',
                maxHeight: '180px',
                overflowY: 'auto',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(var(--blur-glass))',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '16px',
                zIndex: 80,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span className="panel-title" style={{ fontSize: '0.72rem', margin: 0 }}><CheckSquare style={{ width: '12px' }} /> Governance Action Checklist</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {assessment.legal_obligations?.map((o: any) => (
                    <div 
                      key={o.obligation_id}
                      className={`action-check-card ${checkedObligations.includes(o.obligation_id) ? 'checked' : ''}`}
                      onClick={() => {
                        if (checkedObligations.includes(o.obligation_id)) {
                          setCheckedObligations(checkedObligations.filter(id => id !== o.obligation_id));
                        } else {
                          setCheckedObligations([...checkedObligations, o.obligation_id]);
                        }
                      }}
                    >
                      <div className="action-checkbox-box">
                        {checkedObligations.includes(o.obligation_id) ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: checkedObligations.includes(o.obligation_id) ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                        {o.obligation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Slide-out details drawer */}
          <div className={`prism-detail-drawer ${isDrawerOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              <span className="badge-prism">Detailed Lens</span>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}>×</button>
            </div>

            {drawerContent && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="drawer-title">{drawerContent.title}</div>
                
                {drawerContent.type === 'obligation' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority Level</span>
                      <span className={`badge-risk ${drawerContent.risk_tier?.toLowerCase() === 'blocker' ? 'prohibited' : drawerContent.risk_tier?.toLowerCase() === 'critical' ? 'high' : 'transparency'}`}>
                        {drawerContent.risk_tier}
                      </span>
                    </div>
                    <div>
                      <div className="drawer-section-title">Legal Scope</div>
                      <p className="drawer-text">{drawerContent.scope}</p>
                    </div>
                    <div>
                      <div className="drawer-section-title">Relevance in Dossier</div>
                      <p className="drawer-text">{drawerContent.relevance}</p>
                    </div>
                    <div>
                      <div className="drawer-section-title">Official Citations</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {drawerContent.citations?.map((cit: string, idx: number) => (
                          <div 
                            key={idx} 
                            style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => openCitationInDrawer(cit)}
                          >
                            <BookOpen style={{ width: '12px' }} /> {cit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {drawerContent.type === 'citation' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-prism" style={{ background: 'rgba(168, 85, 247, 0.08)', color: 'var(--accent-violet)', borderColor: 'rgba(168, 85, 247, 0.2)' }}>{drawerContent.source}</span>
                      {drawerContent.url && (
                        <a href={drawerContent.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          Official OJ Link <ExternalLink style={{ width: '10px' }} />
                        </a>
                      )}
                    </div>
                    {drawerContent.text && (
                      <div>
                        <div className="drawer-section-title">Verbatim Article Text</div>
                        <div className="drawer-text" style={{ 
                          whiteSpace: 'pre-wrap', 
                          background: 'rgba(8,12,20,0.4)', 
                          padding: '10px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-light)',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          fontSize: '0.72rem'
                        }}>{drawerContent.text}</div>
                      </div>
                    )}
                    <div>
                      <div className="drawer-section-title">Impact relevance Summary</div>
                      <p className="drawer-text">{drawerContent.relevance_summary}</p>
                    </div>
                    {drawerContent.key_indicators && (
                      <div>
                        <div className="drawer-section-title">Audit Benchmarks</div>
                        <ul style={{ paddingLeft: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {drawerContent.key_indicators.map((ind: string, idx: number) => (
                            <li key={idx} style={{ marginBottom: '6px' }}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                {drawerContent.type === 'aidef' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
                      <span className={`badge-risk ${drawerContent.qualifies ? 'minimal' : 'prohibited'}`}>
                        {drawerContent.qualifies ? 'Qualifies as AI' : 'Not an AI system'}
                      </span>
                    </div>
                    <div>
                      <div className="drawer-section-title">Analyst Qualification Analysis</div>
                      <p className="drawer-text">{drawerContent.reasoning}</p>
                    </div>
                    <div>
                      <div className="drawer-section-title">Statutory Citations</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {drawerContent.citations?.map((cit: string, idx: number) => (
                          <div 
                            key={idx} 
                            style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => openCitationInDrawer(cit)}
                          >
                            {cit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {drawerContent.type === 'risk' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Risk Tier</span>
                      <span className={`badge-risk ${drawerContent.tier?.toLowerCase().includes('prohibited') ? 'prohibited' : drawerContent.tier?.toLowerCase().includes('high') ? 'high' : 'transparency'}`}>
                        {drawerContent.tier}
                      </span>
                    </div>
                    <div>
                      <div className="drawer-section-title">Risk Assessment Logic</div>
                      <p className="drawer-text">{drawerContent.reasoning}</p>
                    </div>
                    <div>
                      <div className="drawer-section-title">Statutory Citations</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {drawerContent.citations?.map((cit: string, idx: number) => (
                          <div 
                            key={idx} 
                            style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => openCitationInDrawer(cit)}
                          >
                            {cit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {drawerContent.type === 'role' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Role</span>
                      <span className="badge-risk high">{drawerContent.role}</span>
                    </div>
                    <div>
                      <div className="drawer-section-title">Role Assignment Logic</div>
                      <p className="drawer-text">{drawerContent.reasoning}</p>
                    </div>
                    <div>
                      <div className="drawer-section-title">Statutory Citations</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {drawerContent.citations?.map((cit: string, idx: number) => (
                          <div 
                            key={idx} 
                            style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textDecoration: 'underline', cursor: 'pointer' }}
                            onClick={() => openCitationInDrawer(cit)}
                          >
                            {cit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

        </section>

        {/* Right Column: Follow-up Dialogue Chat Panel */}
        <section className="chat-panel">
          <div className="chat-header">
            <MessageSquare style={{ color: 'var(--accent-cyan)', width: '16px' }} />
            <h2 className="chat-header-title">Follow-up Dialogue</h2>
          </div>

          <div className="chat-messages-viewport">
            {chatHistory.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '20px' }}>
                <MessageSquare style={{ width: '28px', height: '28px', color: 'var(--text-muted)', marginBottom: '8px' }} />
                <span>Conversational Follow-up is locked. Upload specs and execute compliance analysis to chat.</span>
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
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>Consulting legal models...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <form className="chat-input-form" onSubmit={handleSendChat}>
            <input 
              type="text" 
              className="chat-text-input" 
              placeholder={chatHistory.length === 0 ? "Analysis required to chat..." : "Ask about articles, obligations or share new facts..."}
              disabled={chatHistory.length === 0 || isSendingChat}
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={chatHistory.length === 0 || isSendingChat || !chatMessage.trim()}
            >
              <Send style={{ width: '14px', height: '14px' }} />
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}

// Simple markdown formatter utility for rich chat bubble messages
function formatMessageMarkdown(text: string): string {
  if (!text) return '';
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/### (.*?)\n/g, '<h4>$1</h4>')
    .replace(/## (.*?)\n/g, '<h3>$1</h3>')
    .replace(/^- (.*?)\n/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
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

// Constellation visual coords and relationships
const CONSTELLATION_NODES = [
  { id: "Art_3_1_AI_Def", label: "Article 3(1) AI Definition", x: 400, y: 250, color: "var(--accent-cyan)" },
  { id: "Art_5_Prohibited_Practices", label: "Article 5 Prohibited AI", x: 230, y: 160, color: "var(--accent-rose)" },
  { id: "Art_6_High_Risk_Rules", label: "Article 6 Classification", x: 570, y: 160, color: "var(--accent-violet)" },
  { id: "Annex_III_High_Risk_Categories", label: "Annex III standalone categories", x: 710, y: 110, color: "var(--accent-violet)" },
  { id: "Art_16_Provider_Obligations", label: "Article 1 provider obligations", x: 620, y: 340, color: "var(--accent-violet)" },
  { id: "Art_22_25_Operators_Value_Chain", label: "Articles 22-25 Supply Chain", x: 500, y: 410, color: "var(--accent-cyan)" },
  { id: "Art_29a_FRIA", label: "Article 29a FRIA duties", x: 380, y: 430, color: "var(--accent-violet)" },
  { id: "Art_50_Transparency_Labelling", label: "Article 50 Labelling duties", x: 220, y: 340, color: "var(--accent-cyan)" },
  { id: "Chapter_V_GPAI_Rules", label: "Chapter V GPAI model rules", x: 90, y: 280, color: "var(--accent-cyan)" },
  { id: "Art_51_GPAI_Systemic_Risk", label: "Article 51 systemic risk", x: 90, y: 140, color: "var(--accent-cyan)" },
  { id: "Art_9_15_HR_Governance", label: "Articles 9-15 governance core", x: 300, y: 80, color: "var(--accent-violet)" },
  { id: "Art_26_Deployer_Obligations", label: "Article 26 Deployer rules", x: 470, y: 80, color: "var(--accent-violet)" },
  { id: "GDPR_Overlap", label: "GDPR profiling overlap", x: 280, y: 410, color: "var(--accent-cyan)" },
  { id: "Finnish_Implementation", label: "Finnish national adapting", x: 320, y: 200, color: "var(--accent-cyan)" },
  { id: "Adjacent_EU_Surveillance", label: "CNIL & BfDI monitoring", x: 480, y: 200, color: "var(--accent-cyan)" },
  { id: "Guidelines_AI_System_Def", label: "Commission AI system guide", x: 420, y: 320, color: "var(--accent-cyan)" },
  { id: "Guidelines_Prohibited_AI", label: "Commission banned AI guide", x: 180, y: 70, color: "var(--accent-rose)" },
  { id: "Guidelines_Marking_Labelling", label: "Commission watermarking draft", x: 100, y: 395, color: "var(--accent-cyan)" }
];

const CONSTELLATION_LINKS = [
  { from: "Art_3_1_AI_Def", to: "Guidelines_AI_System_Def" },
  { from: "Art_3_1_AI_Def", to: "Art_5_Prohibited_Practices" },
  { from: "Art_3_1_AI_Def", to: "Art_6_High_Risk_Rules" },
  { from: "Art_5_Prohibited_Practices", to: "Guidelines_Prohibited_AI" },
  { from: "Art_6_High_Risk_Rules", to: "Annex_III_High_Risk_Categories" },
  { from: "Art_6_High_Risk_Rules", to: "Art_9_15_HR_Governance" },
  { from: "Art_16_Provider_Obligations", to: "Art_22_25_Operators_Value_Chain" },
  { from: "Art_16_Provider_Obligations", to: "Art_9_15_HR_Governance" },
  { from: "Art_26_Deployer_Obligations", to: "Art_29a_FRIA" },
  { from: "Art_26_Deployer_Obligations", to: "GDPR_Overlap" },
  { from: "Art_29a_FRIA", to: "GDPR_Overlap" },
  { from: "Chapter_V_GPAI_Rules", to: "Art_51_GPAI_Systemic_Risk" },
  { from: "Chapter_V_GPAI_Rules", to: "Art_50_Transparency_Labelling" },
  { from: "Art_50_Transparency_Labelling", to: "Guidelines_Marking_Labelling" },
  { from: "Art_6_High_Risk_Rules", to: "Finnish_Implementation" },
  { from: "Art_6_High_Risk_Rules", to: "Adjacent_EU_Surveillance" }
];
