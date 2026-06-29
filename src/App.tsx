/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Sparkles, 
  History, 
  HelpCircle, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { DecisionInput, AnalysisResult, SavedDecision } from './types';
import TiebreakerWizard from './components/TiebreakerWizard';
import TiebreakerDashboard from './components/TiebreakerDashboard';
import PastDecisions from './components/PastDecisions';

export default function App() {
  const [activeDecision, setActiveDecision] = useState<SavedDecision | null>(null);
  const [history, setHistory] = useState<SavedDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tiebreaker_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newHistory: SavedDecision[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('tiebreaker_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  // Analyze Decision Handler
  const handleAnalyze = async (input: DecisionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Analysis request failed.');
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error('Result was not properly formatted by the server.');
      }

      const result: AnalysisResult = data.result;

      const newSavedItem: SavedDecision = {
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        input,
        result
      };

      // Add to history and set active
      const updatedHistory = [newSavedItem, ...history];
      saveHistory(updatedHistory);
      setActiveDecision(newSavedItem);

    } catch (err: any) {
      console.error('Error during analysis:', err);
      setError(err.message || 'An unexpected error occurred. Please make sure the Gemini API key is configured correctly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPast = (item: SavedDecision) => {
    setActiveDecision(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePast = (id: string) => {
    const filtered = history.filter(item => item.id !== id);
    saveHistory(filtered);
    if (activeDecision && activeDecision.id === id) {
      setActiveDecision(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-darkest text-text-light font-sans selection:bg-brand-gold/20 selection:text-brand-gold pb-16">
      
      {/* Decorative header glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-40 bg-gradient-to-b from-brand-gold/5 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation / Header Branding */}
        <header id="app-header" className="py-6 flex flex-col sm:flex-row justify-between items-center border-b border-[#2a2a2c] mb-8 sm:mb-12 gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveDecision(null)}>
            <div className="w-8 h-8 rounded-full border border-[#d1b06b] flex items-center justify-center text-[#d1b06b] font-serif text-xl italic shrink-0">
              T
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-widest uppercase text-[#d1b06b] flex items-center gap-2">
                The Tiebreaker
                <span className="text-[9px] bg-brand-gold/10 text-brand-gold font-bold px-1.5 py-0.5 rounded tracking-widest uppercase">
                  AI Strategist
                </span>
              </h1>
              <p className="text-zinc-500 text-xs tracking-wide">Unlock clear choice vectors & strategic action paths</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs tracking-widest uppercase text-zinc-400">
            <span className="flex items-center gap-1.5 bg-bg-sidebar border border-[#2a2a2c] px-4 py-2 rounded-full text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d1b06b]" />
              Private Local Sandbox
            </span>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 max-w-4xl mx-auto p-5 bg-bg-panel border border-[#ff6b6b]/30 rounded-2xl flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-[#ff6b6b] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif font-semibold text-[#ff6b6b] text-base tracking-wide">Failed to Analyze Decision</h4>
              <p className="text-zinc-300 text-xs leading-relaxed">{error}</p>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                Tip: Check if the **GEMINI_API_KEY** is properly configured in your environment or Secrets tab.
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        <main className="space-y-12">
          {activeDecision ? (
            <TiebreakerDashboard 
              result={activeDecision.result} 
              onReset={() => setActiveDecision(null)} 
            />
          ) : (
            <>
              {/* Informational Hero Card for new visitors */}
              {history.length === 0 && (
                <div className="max-w-4xl mx-auto bg-bg-sidebar/80 backdrop-blur-md border border-[#2a2a2c] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-2 text-center md:text-left max-w-md">
                    <h2 className="font-serif font-semibold text-white text-2xl italic tracking-tight flex items-center justify-center md:justify-start gap-1.5">
                      <Sparkles className="w-5 h-5 text-[#d1b06b]" />
                      Break The Cycle of Overthinking
                    </h2>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      &ldquo;The Tiebreaker&rdquo; integrates expert strategic SWOT planning, multi-criteria spreadsheets, and balanced pros-cons grids into a single decisive interface. Calibrate your constraint profile below to get a highly customized execution roadmap.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
                    <div className="bg-[#1c1c1e] p-4 rounded-xl border border-[#2a2a2c] text-center shadow-lg min-w-[110px]">
                      <span className="block text-xl">⚖️</span>
                      <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest block mt-2">Pros & Cons</span>
                    </div>
                    <div className="bg-[#1c1c1e] p-4 rounded-xl border border-[#2a2a2c] text-center shadow-lg min-w-[110px]">
                      <span className="block text-xl">📊</span>
                      <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest block mt-2">SWOT Analysis</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Form */}
              <TiebreakerWizard onSubmit={handleAnalyze} isLoading={isLoading} />

              {/* History List */}
              <div className="pt-8 border-t border-[#2a2a2c]">
                <PastDecisions 
                  history={history} 
                  onSelect={handleSelectPast} 
                  onDelete={handleDeletePast} 
                />
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-20 border-t border-[#2a2a2c] pt-8 text-center text-xs text-zinc-500 space-y-2">
          <p>© {new Date().getFullYear()} The Tiebreaker - Decision Analysis Lab. All advice is algorithmically synthesized based on user parameters.</p>
          <p className="font-mono text-[10px] text-zinc-600">Powered by Gemini 3.5 Flash Model • Zero trackers • Fully Private Sandbox</p>
        </footer>

      </div>
    </div>
  );
}
