"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      setLoading(false);
      // Redirect to the dashboard
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-outline-variant rounded-lg p-8 shadow-sm">
        <div className="flex justify-center mb-8">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">Compliance Lens</h1>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-secondary">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-outline-variant rounded p-3 bg-surface focus:outline-none focus:border-primary transition-colors" 
              placeholder="you@company.com" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-secondary">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-outline-variant rounded p-3 bg-surface focus:outline-none focus:border-primary transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#556b2f] text-white px-6 py-3 rounded font-label-caps text-label-caps mt-2 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-secondary">
          <a href="#" className="font-body-sm text-body-sm hover:text-primary transition-colors hover:underline">Forgot password?</a>
          <span className="font-body-sm text-body-sm">
            Don't have an account? <a href="/contact" className="text-[#556b2f] hover:underline font-bold">Contact Norrin</a>
          </span>
        </div>
      </div>
      
      <div className="mt-8 text-secondary text-xs font-body-sm opacity-60">
        &copy; {new Date().getFullYear()} Norrin Enterprise AI.
      </div>
    </div>
  );
}
