"use client";

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  ArrowUpRight,
  Copy,
  Check,
  TerminalSquare,
  Truck,
  MapPin,
  Route,
  Send,
  Zap
} from 'lucide-react';

interface ApiResponse {
  priorities: Array<{ issue: string; priority: number; reason: string }>;
  actions: string[];
  messages: Array<{ recipient: string; content: string }>;
  escalations: string[];
}

const QUICK_PROMPTS = [
  "3 drivers absent today, 2 trucks broke down near Gurgaon depot, client delivery delayed by 4 hours",
  "Ashok Leyland shipment stuck at toll, Dabur consignment rerouted, Mahindra pickup missed",
  "Morning fleet: 5 vehicles late, fuel shortage at depot, 2 client complaints pending",
];

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleResolve = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while processing the request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#e2e4e8] text-black font-mono flex flex-col relative overflow-x-hidden">

      {/* ============ TRANSPORTATION THEME BACKGROUND ============ */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Blueprint grid */}
        <div className="absolute inset-0 bg-grid"></div>

        {/* Road center-lines */}
        <div className="bg-road-line" style={{ left: '12%' }}></div>
        <div className="bg-road-line" style={{ left: '38%' }}></div>
        <div className="bg-road-line" style={{ left: '62%' }}></div>
        <div className="bg-road-line" style={{ left: '88%' }}></div>

        {/* SVG Route Topology Map */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.045 }}>
          {/* Highway Routes */}
          <path d="M 0 300 C 200 250, 400 400, 700 300 S 1000 200, 1400 350" fill="none" stroke="black" strokeWidth="3" strokeDasharray="12,8" />
          <path d="M 0 550 C 300 500, 500 650, 900 550 S 1200 450, 1400 600" fill="none" stroke="black" strokeWidth="2" strokeDasharray="8,6" />
          <path d="M 0 800 Q 400 700 800 800 T 1400 750" fill="none" stroke="black" strokeWidth="2" />

          {/* Cross-routes */}
          <path d="M 300 0 Q 350 400 250 900" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="6,6" />
          <path d="M 800 0 Q 750 350 850 900" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="6,6" />
          <path d="M 1100 0 Q 1050 500 1150 900" fill="none" stroke="black" strokeWidth="1.5" strokeDasharray="4,8" />

          {/* Depot Nodes */}
          <circle cx="200" cy="290" r="8" fill="black" />
          <text x="220" y="285" fontFamily="monospace" fontSize="11" fontWeight="bold">MAHINDRA HUB</text>

          <circle cx="700" cy="300" r="8" fill="black" />
          <text x="720" y="295" fontFamily="monospace" fontSize="11" fontWeight="bold">DABUR DEPOT</text>

          <circle cx="400" cy="545" r="8" fill="black" />
          <text x="420" y="540" fontFamily="monospace" fontSize="11" fontWeight="bold">ASHOK LEYLAND</text>

          <circle cx="900" cy="550" r="8" fill="black" />
          <text x="920" y="545" fontFamily="monospace" fontSize="11" fontWeight="bold">CENTRAL HQ</text>

          {/* Small truck indicators along routes */}
          <rect x="450" y="370" width="20" height="10" rx="2" fill="black" />
          <rect x="600" y="580" width="20" height="10" rx="2" fill="black" />
          <rect x="150" y="520" width="20" height="10" rx="2" fill="black" />
          <rect x="1000" y="400" width="20" height="10" rx="2" fill="black" />

          {/* Watermark */}
          <text x="50%" y="97%" textAnchor="middle" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="6" fill="black">
            CABIE OPS DISPATCH NETWORK
          </text>
        </svg>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="relative z-10 flex flex-col min-h-screen p-4 md:p-8 gap-5">

        {/* Header */}
        <header className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <Truck size={22} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-black uppercase tracking-widest leading-none">Cabie Ops Assistant</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Fleet Intelligence Console</p>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex flex-col md:flex-row gap-5 md:gap-6">

          {/* ===== LEFT: Input Panel ===== */}
          <div className="w-full md:w-[38%] flex flex-col gap-4">
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000] flex flex-col h-full">
              {/* Section Header */}
              <div className="flex items-center gap-2.5 mb-4 border-b-2 border-black pb-3">
                <div className="w-7 h-7 bg-black flex items-center justify-center">
                  <Route size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">Operations Dispatch Log</h2>
                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">Paste your morning chaos below</p>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Try an example:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-[10px] font-bold border border-black px-2.5 py-1 hover:bg-black hover:text-white transition-colors truncate max-w-full"
                      title={prompt}
                    >
                      <Zap size={10} className="inline mr-1 -mt-0.5" />
                      {prompt.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                id="ops-input"
                className="w-full flex-1 min-h-[220px] border-2 border-black p-3.5 focus:outline-none font-mono text-sm resize-none bg-gray-50 placeholder:text-gray-400"
                placeholder={"What went wrong this morning?\n\nExamples:\n• \"Driver Rajesh absent, Truck MH-04-AB-1234 broke down\"\n• \"3 deliveries delayed, client is calling for update\"\n• \"Fuel shortage at Gurgaon depot, need rerouting\""}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              {/* Submit Button */}
              <button
                onClick={handleResolve}
                disabled={loading || !input.trim()}
                className="mt-4 w-full bg-black text-white font-black py-3.5 px-4 border-2 border-black shadow-[4px_4px_0_0_#000] hover:bg-white hover:text-black transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:border-gray-200 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Resolve &amp; Generate Plan
                  </>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-3 border-2 border-red-600 bg-red-50 text-red-700 p-3 flex gap-2 items-start">
                  <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                  <span className="text-xs font-bold">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT: Results Dashboard ===== */}
          <div className="w-full md:w-[62%] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center border-2 border-black border-dashed bg-white shadow-[4px_4px_0_0_#000] p-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
                  <h2 className="text-lg font-black uppercase tracking-widest mb-2">Analyzing Operations Data</h2>
                  <p className="text-xs text-gray-500 font-bold">Running AI dispatch analysis...</p>
                </div>
              </div>
            ) : results ? (
              <div className="flex-1 border-2 border-black bg-white shadow-[4px_4px_0_0_#000] p-5 md:p-7 overflow-y-auto max-h-[calc(100vh-11rem)]">
                {/* Results Header */}
                <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Resolution Plan</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">AI-generated action blueprint</p>
                  </div>
                  <span className="text-[10px] font-black bg-black text-white px-3 py-1.5 tracking-wider">RESOLVED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Priorities */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                      <AlertTriangle size={18} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Priorities</h3>
                      <span className="ml-auto text-[10px] font-bold bg-gray-100 px-2 py-0.5 border border-gray-200">{results.priorities.length}</span>
                    </div>
                    <div className="space-y-3">
                      {results.priorities.map((item, idx) => (
                        <div key={idx} className="border-2 border-black p-3 bg-gray-50 flex gap-3">
                          <div className="flex items-center justify-center bg-black text-white font-black w-7 h-7 shrink-0 text-sm">
                            {item.priority}
                          </div>
                          <div>
                            <p className="font-bold text-sm mb-0.5">{item.issue}</p>
                            <p className="text-[11px] text-gray-600 leading-snug">{item.reason}</p>
                          </div>
                        </div>
                      ))}
                      {results.priorities.length === 0 && (
                        <p className="text-gray-400 text-xs font-bold">No priorities identified.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                      <CheckSquare size={18} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Actions</h3>
                      <span className="ml-auto text-[10px] font-bold bg-gray-100 px-2 py-0.5 border border-gray-200">{results.actions.length}</span>
                    </div>
                    <ul className="space-y-2">
                      {results.actions.map((action, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start border-b border-gray-100 pb-2">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-black shrink-0"></div>
                          <span className="text-xs font-bold leading-relaxed">{action}</span>
                        </li>
                      ))}
                      {results.actions.length === 0 && (
                        <p className="text-gray-400 text-xs font-bold">No actions needed.</p>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Messages */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                      <MessageSquare size={18} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Messages to Send</h3>
                      <span className="ml-auto text-[10px] font-bold bg-gray-100 px-2 py-0.5 border border-gray-200">{results.messages.length}</span>
                    </div>
                    <div className="space-y-3">
                      {results.messages.map((msg, idx) => (
                        <div key={idx} className="border-2 border-black p-3.5 relative group hover:bg-gray-50 transition-colors">
                          <div className="mb-2">
                            <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 tracking-wider">
                              TO: {msg.recipient}
                            </span>
                          </div>
                          <p className="text-xs font-bold whitespace-pre-wrap mt-2 leading-relaxed">{msg.content}</p>
                          <button
                            onClick={() => handleCopy(msg.content, idx)}
                            className="absolute top-3 right-3 p-1.5 border-2 border-transparent hover:border-black transition-colors"
                            title="Copy Message"
                          >
                            {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      ))}
                      {results.messages.length === 0 && (
                        <p className="text-gray-400 text-xs font-bold">No messages to send.</p>
                      )}
                    </div>
                  </div>

                  {/* Escalations */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-red-600">
                      <ArrowUpRight size={18} />
                      <h3 className="text-sm font-black uppercase tracking-wide">Escalations</h3>
                      <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 border border-red-200">{results.escalations.length}</span>
                    </div>
                    <ul className="space-y-2.5">
                      {results.escalations.map((esc, idx) => (
                        <li key={idx} className="border-l-4 border-black pl-3 py-1">
                          <span className="text-xs font-bold">{esc}</span>
                        </li>
                      ))}
                      {results.escalations.length === 0 && (
                        <p className="text-gray-400 text-xs font-bold">No escalations required.</p>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* ===== EMPTY STATE — the key to making it intuitive ===== */
              <div className="flex-1 flex items-center justify-center border-2 border-black bg-white p-8 shadow-[4px_4px_0_0_#000]">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-black flex items-center justify-center mx-auto mb-5">
                    <Truck size={32} className="text-white" />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest mb-2">Ready to Resolve</h2>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed mb-6">
                    Paste your morning fleet messages on the left — driver absences, breakdowns, delays, complaints — and the AI will generate a complete resolution plan with priorities, actions, and ready-to-send messages.
                  </p>
                  <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      4 Depots
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Truck size={12} />
                      Fleet Active
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Route size={12} />
                      Routes Live
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Fleet Partners */}
        <footer className="border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000] flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <span className="text-gray-400">Fleet Partners</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-black"></span>Mahindra</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-black"></span>Ashok Leyland</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-black"></span>Dabur</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">Powered by Cabie Ops</span>
        </footer>
      </div>
    </div>
  );
}
