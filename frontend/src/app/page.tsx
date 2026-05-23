'use client';
import { useState, useRef } from 'react';
import FloatingChat from '../components/FloatingChat';

export default function ClassifyPage() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeCompliance = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('description', description);
        
        const res = await fetch('http://localhost:8000/api/classify/upload', {
          method: 'POST',
          body: formData
        });
        data = await res.json();
      } else {
        const res = await fetch('http://localhost:8000/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description })
        });
        data = await res.json();
      }
      setResult(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!result?.session_id) return;
    try {
      const res = await fetch(`http://localhost:8000/api/export/${result.session_id}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_audit_${result.session_id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen pt-16 pb-10 flex flex-col font-body-md text-body-md">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md text-primary font-bold">Compliance Lens</span>
          <div className="hidden md:flex gap-6">
            <a className="text-primary border-b-2 border-primary pb-1 font-bold font-headline-sm text-headline-sm hover:text-primary transition-colors duration-150" href="/">Classify</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/chat">Chat (RAG)</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/dashboard">Delta Dashboard</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/contact" className="bg-primary text-on-primary px-4 py-2 rounded font-label-caps text-label-caps hover:bg-opacity-90 transition-opacity">Book Norrin Review</a>
        </div>
      </nav>

      <div className="w-full bg-secondary-container text-on-secondary-container px-margin-desktop py-2 flex justify-center items-center gap-4">
        <span className="font-body-sm text-body-sm">AI-generated classification — not legal advice</span>
      </div>

      <main className="flex-grow flex flex-col w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 gap-8">
        <section className="w-full max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-body-sm text-body-sm text-on-surface-variant">AI Product Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:border-2 resize-none transition-colors" 
              placeholder="Describe the AI system's intended purpose..." 
              rows={4} 
              disabled={loading}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-surface-container-high text-on-surface p-3 rounded-full hover:bg-surface-container-highest transition-colors flex items-center justify-center disabled:opacity-50"
                title="Attach Document"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              {selectedFile && (
                <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded text-body-sm font-medium">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="hover:text-error flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}
            </div>
            <button onClick={analyzeCompliance} disabled={loading || (!description && !selectedFile)} className="bg-primary text-on-primary px-6 py-3 rounded font-label-caps text-label-caps hover:bg-opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Analyzing (This takes 1-2 minutes)..." : "Analyze Compliance"}
            </button>
          </div>
        </section>

        {loading && (
          <div className="w-full flex flex-col items-center justify-center py-12 gap-4">
            <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-2xl">
              <div className="h-4 bg-surface-variant rounded w-3/4"></div>
              <div className="h-4 bg-surface-variant rounded w-1/2"></div>
              <div className="h-4 bg-surface-variant rounded w-5/6"></div>
            </div>
            <p className="text-secondary font-body-sm mt-4 animate-pulse">Running dual-agent analysis on EU AI Act articles...</p>
          </div>
        )}

        {result && !loading && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter w-full">
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded p-6 flex flex-col gap-6 relative">
              <div className="absolute top-0 right-0 bg-[#eff6ff] text-[#1e40af] px-3 py-1 rounded-bl border-b border-l border-outline-variant font-label-caps text-label-caps flex items-center gap-1">
                Source: AI
              </div>
              <div className="flex items-center gap-4 mt-2">
                <h2 className="font-headline-sm text-headline-sm">Classification Results</h2>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="font-label-caps text-label-caps">Risk Tier: {result.classification.tier}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Rationale</h3>
                  <p className="font-body-md text-body-md text-on-surface">{result.classification.rationale}</p>
                </div>
                <div>
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Citations</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.classification.citations.map((c: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-2 py-1 bg-surface-container border border-outline-variant rounded font-citation text-citation text-on-surface">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-outline-variant pt-4 mt-2">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">What would change this</h3>
                  <p className="font-body-sm text-body-sm text-on-surface">{result.classification.what_would_change_this}</p>
                </div>
                
                <div className="mt-4">
                  <button onClick={handleExport} className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700 transition">
                    ↓ Export JSON Audit
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-[#f8fafc] border border-outline-variant rounded p-6 flex flex-col gap-6 relative">
              <div className="absolute top-0 right-0 bg-[#f1f5f9] text-[#475569] px-3 py-1 rounded-bl border-b border-l border-outline-variant font-label-caps text-label-caps flex items-center gap-1">
                Source: Expert
              </div>
              <h2 className="font-headline-sm text-headline-sm mt-2">Validator Feedback</h2>
              <div className="flex flex-col items-center justify-center py-4">
                <span className="font-label-caps text-label-caps text-on-surface-variant mt-2">Confidence Score: {result.validation.confidence_score}/100</span>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Concerns</h3>
                  <p className="font-body-sm text-body-sm text-on-surface">{result.validation.concerns}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <FloatingChat />
    </div>
  );
}
