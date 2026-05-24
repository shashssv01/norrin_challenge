'use client';
import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I am the EU AI Act assistant. Ask me anything about compliance.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    const loadingMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', isLoading: true };
    
    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      let data;
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        formData.append('question', userMsg.content || 'Analyze this document.');
        
        const res = await fetch('http://localhost:8000/api/chat/upload', {
          method: 'POST',
          body: formData
        });
        data = await res.json();
      } else {
        const res = await fetch('http://localhost:8000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: userMsg.content })
        });
        data = await res.json();
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsg.id 
          ? { ...msg, content: data.answer || data.detail || 'Analysis complete.', isLoading: false } 
          : msg
      ));
      setSelectedFiles([]);
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsg.id 
          ? { ...msg, content: 'Error communicating with the assistant.', isLoading: false } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right">
          {/* Header */}
          <div className="bg-primary text-on-primary p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              <span className="font-headline-sm text-[16px] font-semibold">Compliance Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-body-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface-container border border-outline-variant text-on-surface rounded-tl-none'
                }`}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-secondary">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="p-3 bg-surface-container-lowest border-t border-outline-variant flex flex-col gap-2">
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex-shrink-0 flex items-center justify-between bg-surface-container px-3 py-1 rounded text-body-sm text-secondary">
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="hover:text-error ml-2">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                  }
                }} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="text-secondary hover:text-primary transition-colors flex items-center justify-center w-8 h-8 rounded-full disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="flex-1 bg-surface border border-outline-variant rounded-full px-4 py-2 text-body-sm text-on-surface focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="Ask a question or upload file..."
              />
            <button 
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
              className="bg-[#556b2f] text-white w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
            </div>
          </div>
        </div>
      )}
      
      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#556b2f] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
      </button>
    </div>
  );
}
