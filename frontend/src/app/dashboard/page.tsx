'use client';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pt-16 pb-10">
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-primary">Compliance Lens</span>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/">Classify</a>
            <a className="text-secondary font-body-md text-body-md hover:text-primary transition-colors" href="/chat">Chat (RAG)</a>
            <a className="text-primary border-b-2 border-primary pb-1 font-bold" href="/dashboard">Delta Dashboard</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/contact" className="bg-primary text-on-primary font-body-sm text-body-sm px-4 py-2 rounded hover:opacity-90 transition-opacity">Book Norrin Review</a>
        </div>
      </nav>

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-headline-lg text-headline-lg text-primary">Compliance Delta Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">What changed since your last visit</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h2 className="font-headline-sm text-headline-sm text-primary">Product Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">CV Screening Tool v2</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">HR Operations</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-caps text-label-caps">
                    <span className="w-2 h-2 rounded-full bg-error"></span>
                    HIGH_RISK
                  </span>
                </div>
                <div className="mt-4">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Confidence Trend</span>
                  <div className="h-12 w-full flex items-end gap-1">
                    <div className="w-1/6 bg-secondary-fixed-dim h-[40%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[50%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[45%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[60%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[55%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary h-[55%] rounded-t-sm"></div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">Customer FAQ Bot</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Support Portal</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-label-caps text-label-caps">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    MINIMAL_RISK
                  </span>
                </div>
                <div className="mt-4">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">Confidence Trend</span>
                  <div className="h-12 w-full flex items-end gap-1">
                    <div className="w-1/6 bg-secondary-fixed-dim h-[80%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[85%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[82%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[88%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-secondary-fixed-dim h-[88%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary h-[88%] rounded-t-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Delta Summary</h2>
              <div className="flex items-start gap-3 p-4 bg-surface-container rounded border border-outline-variant border-l-4 border-l-primary">
                <span className="material-symbols-outlined text-primary" data-icon="info">info</span>
                <p className="font-body-md text-body-md text-on-surface">2 open questions remain. Confidence unchanged.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined" data-icon="history">history</span>
                Battle Scars
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Resolved findings log.</p>
              <ul className="flex flex-col gap-3 relative">
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-outline-variant -z-10"></div>
                <li className="flex gap-3 opacity-100 items-start bg-surface p-2 rounded border border-outline-variant/50">
                  <div className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary" data-icon="check">check</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">Art 14 Oversight measures</p>
                    <p className="font-citation text-citation text-on-surface-variant mt-1">Resolved today</p>
                  </div>
                </li>
                <li className="flex gap-3 opacity-60 items-start bg-surface p-2 rounded border border-outline-variant/30">
                  <div className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary" data-icon="check">check</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">Annex IV documentation</p>
                    <p className="font-citation text-citation text-on-surface-variant mt-1">Resolved 3d ago</p>
                  </div>
                </li>
                <li className="flex gap-3 opacity-30 items-start bg-surface p-2 rounded border border-outline-variant/20">
                  <div className="w-6 h-6 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-primary" data-icon="check">check</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">Recital 47 exemption</p>
                    <p className="font-citation text-citation text-on-surface-variant mt-1">Resolved 6d ago</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
