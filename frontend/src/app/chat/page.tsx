'use client';
import React, { useState } from 'react';

export default function ChatPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-background text-on-background h-screen flex flex-col font-body-md text-body-md overflow-hidden">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <div className="font-headline-md text-headline-md font-bold text-primary">Compliance Lens</div>
          <div className="hidden md:flex gap-6 h-full items-center">
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/">Classify</a>
            <a className="text-primary border-b-2 border-primary font-bold opacity-80" href="/chat">Chat (RAG)</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/dashboard">Delta Dashboard</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/contact" className="bg-primary text-on-primary font-body-sm text-body-sm px-4 py-2 rounded">Book Norrin Review</a>
        </div>
      </nav>

      <main className="flex-1 flex pt-16 w-full max-w-container-max mx-auto h-full">
        <aside className="w-64 bg-surface border-r border-outline-variant hidden md:flex flex-col flex-shrink-0 h-full overflow-y-auto">
          <div className="p-6 border-b border-outline-variant">
            <button className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px]">add</span> New Chat
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-label-caps text-label-caps text-secondary mb-4 px-2">Legal Q&A History</h3>
            <nav className="space-y-1">
              <button className="w-full text-left px-2 py-2 rounded bg-surface-container-highest text-primary font-body-sm text-body-sm truncate">Current Session</button>
            </nav>
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-surface-container-lowest h-full relative">
          <div className="absolute top-0 w-full bg-surface-container-lowest/80 backdrop-blur-sm border-b border-outline-variant z-10 p-4 px-8">
            <h1 className="font-headline-sm text-headline-sm text-primary">Ask the EU AI Act</h1>
            <p className="font-body-sm text-body-sm text-secondary">RAG-powered query engine. Confidence scores apply.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8 pt-24 space-y-8 pb-32">
            {loading && !response && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-surface-container-lowest border border-outline-variant rounded-lg rounded-tl-none overflow-hidden flex flex-col shadow-sm">
                  <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px]">smart_toy</span>
                      <span className="font-label-caps text-label-caps text-secondary">Source: AI Lens</span>
                    </div>
                  </div>
                  <div className="p-6 flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-body-md text-secondary animate-pulse">Researching EU AI Act guidelines...</p>
                  </div>
                </div>
              </div>
            )}
            {response && (
              <>
                <div className="flex justify-end">
                  <div className="max-w-[75%] bg-surface-container text-on-surface p-4 rounded-lg rounded-tr-none border border-outline-variant">
                    <p className="font-body-md text-body-md">{question}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-surface-container-lowest border border-outline-variant rounded-lg rounded-tl-none overflow-hidden flex flex-col shadow-sm">
                    <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-[16px]">smart_toy</span>
                        <span className="font-label-caps text-label-caps text-secondary">Source: AI Lens</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="font-body-md text-body-md mb-4 text-on-surface whitespace-pre-wrap">{response.answer}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant absolute bottom-0 w-full">
            <div className="relative max-w-4xl mx-auto flex gap-2">
              <input 
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                className="w-full bg-surface border border-outline-variant rounded-lg p-4 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0" 
                placeholder="Enter your regulatory query..."
                disabled={loading}
              />
              <button onClick={handleAsk} disabled={loading} className="bg-primary text-on-primary p-4 rounded hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {loading ? 'hourglass_empty' : 'send'}
                </span>
              </button>
            </div>
          </div>
        </section>

        <aside className="w-72 bg-surface border-l border-outline-variant hidden lg:flex flex-col flex-shrink-0 h-full overflow-y-auto">
          <div className="p-6 border-b border-outline-variant bg-surface-container-low">
            <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">library_books</span> Context Used
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="font-body-sm text-body-sm text-secondary">The following regulatory fragments were synthesized for this response:</p>
            {response?.context_used?.eu_act_chunks?.map((chunk: any, i: number) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-citation text-citation bg-inverse-on-surface border border-outline-variant rounded px-1.5 py-0.5">{chunk.article}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">{chunk.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
