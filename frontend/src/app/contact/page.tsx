'use client';
import React from 'react';

export default function ContactPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <div className="font-headline-md text-headline-md font-bold text-primary">Compliance Lens</div>
          <div className="hidden md:flex gap-6 h-full items-center">
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/">Classify</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/chat">Chat (RAG)</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/dashboard">Delta Dashboard</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/contact" className="bg-primary text-on-primary font-body-sm text-body-sm px-4 py-2 rounded">Book Norrin Review</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-16 w-full max-w-3xl mx-auto p-6">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-4 text-center">Contact Norrin Legal</h1>
        <p className="text-secondary text-center mb-8">Schedule a deep-dive review of your AI compliance architecture with our legal experts.</p>
        
        <form className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-8 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-secondary">Full Name</label>
            <input type="text" className="border border-outline-variant rounded p-3 bg-surface focus:outline-none focus:border-primary" placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-secondary">Work Email</label>
            <input type="email" className="border border-outline-variant rounded p-3 bg-surface focus:outline-none focus:border-primary" placeholder="jane@company.com" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-secondary">AI System Summary</label>
            <textarea className="border border-outline-variant rounded p-3 bg-surface focus:outline-none focus:border-primary resize-none" rows={4} placeholder="Briefly describe the system you need reviewed..."></textarea>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded font-label-caps text-label-caps mt-4 hover:opacity-90 transition-opacity">Submit Request</button>
        </form>
      </main>
    </div>
  );
}
