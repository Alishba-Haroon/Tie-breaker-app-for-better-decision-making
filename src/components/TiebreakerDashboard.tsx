/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Plus, 
  Minus, 
  Sparkles, 
  Share2, 
  HelpCircle, 
  RotateCw, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Award,
  CheckSquare,
  ShieldAlert
} from 'lucide-react';
import { AnalysisResult, ProConItem, SWOTQuadrant } from '../types';

interface TiebreakerDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export default function TiebreakerDashboard({ result, onReset }: TiebreakerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'playground'>('analysis');
  
  // Interactive Weights for Pros & Cons
  const [prosAndCons, setProsAndCons] = useState<ProConItem[]>([]);
  const [currentScore, setCurrentScore] = useState<number>(result.tiebreakerScore);
  
  // Coin Flip State
  const [coinFlipped, setCoinFlipped] = useState(false);
  const [coinIsFlipping, setCoinIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<string | null>(null);

  // Checklist State for action roadmap
  const [checkedItems, setCheckedItems] = useState<{ [index: number]: boolean }>({});

  // Initialize weights if Pros & Cons are present
  useEffect(() => {
    if (result.prosAndCons) {
      setProsAndCons(result.prosAndCons.map(item => ({
        ...item,
        userWeight: 1 // Default to normal weight (1x)
      })));
    }
    setCurrentScore(result.tiebreakerScore);
  }, [result]);

  // Recalculate Pros & Cons score dynamically
  const handleWeightChange = (itemId: string, newWeight: number) => {
    const updated = prosAndCons.map(item => {
      if (item.id === itemId) {
        return { ...item, userWeight: newWeight };
      }
      return item;
    });
    setProsAndCons(updated);

    // Calc score
    let totalProImpact = 0;
    let totalConImpact = 0;

    updated.forEach(item => {
      const weightMultiplier = item.userWeight;
      if (item.isPro) {
        totalProImpact += item.impact * weightMultiplier;
      } else {
        totalConImpact += item.impact * weightMultiplier;
      }
    });

    if (totalProImpact + totalConImpact === 0) {
      setCurrentScore(50);
    } else {
      // Score represents Option A %
      const proPercentage = (totalProImpact / (totalProImpact + totalConImpact)) * 100;
      setCurrentScore(Math.round(proPercentage));
    }
  };

  // Weighted Coin Flipper
  const handleCoinFlip = () => {
    if (coinIsFlipping) return;
    setCoinIsFlipping(true);
    setCoinFlipped(false);
    
    setTimeout(() => {
      // Choose option based on currentScore weight
      const roll = Math.random() * 100;
      // If currentScore is 70, Option A has 70% chance (roll < 70)
      const outcome = roll < currentScore ? result.options[0] : (result.options[1] || 'Alternative');
      setCoinResult(outcome);
      setCoinIsFlipping(false);
      setCoinFlipped(true);
    }, 1200);
  };

  // Clipboard Copier
  const handleCopySummary = () => {
    const summaryText = `
🧠 THE TIEBREAKER - AI DECISION STRATEGY JOURNAL
Decision: "${result.decisionTitle}"
Recommended Option: ${result.recommendedOption} (AI Score: ${result.tiebreakerScore}%)
Key Takeaway: "${result.keyTakeaway}"

AI Expert Verdict:
"${result.aiVerdict}"

Action Plan:
${result.recommendationDetails.map((step, i) => `${i + 1}. [ ] ${step}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    alert('Decision journal copied to clipboard! You can paste it into your notes.');
  };

  // Determine leaning and text colors
  const optionA = result.options[0] || 'Option A';
  const optionB = result.options[1] || 'Option B';
  const isOptionALeading = currentScore >= 50;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Bar with Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-panel p-4 rounded-2xl border border-[#2a2a2c] shadow-lg">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-zinc-400 hover:text-white font-serif font-semibold text-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#d1b06b]" />
          Analyze New Decision
        </button>

        <div className="flex items-center gap-1.5 p-1 bg-bg-sidebar border border-[#2a2a2c] rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-brand-gold/10 text-[#d1b06b] shadow-sm font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Analytical Report
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'playground'
                ? 'bg-brand-gold/10 text-[#d1b06b] shadow-sm font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d1b06b] animate-pulse" />
            Decision Playground
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-[#141416] border border-[#2a2a2c] text-white rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#d1b06b]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#d1b06b]/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-[10px] uppercase tracking-widest font-bold text-[#d1b06b]">
            {result.analysisType === 'PROS_CONS' ? '⚖️ Pros & Cons framework' : result.analysisType === 'COMPARISON' ? '📊 Multi-Criteria Comparison' : '🎯 SWOT Analysis'}
          </div>

          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl leading-tight text-white tracking-tight italic">
            {result.decisionTitle}
          </h1>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 pt-4 border-t border-[#2a2a2c]">
            {/* Horizontal Balance Dial */}
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span className={isOptionALeading ? 'font-serif text-[#d1b06b] text-sm' : ''}>
                  {optionA} ({currentScore}%)
                </span>
                <span className={!isOptionALeading ? 'font-serif text-[#d1b06b] text-sm' : ''}>
                  {optionB} ({100 - currentScore}%)
                </span>
              </div>
              <div className="w-full h-3 bg-[#1c1c1e] border border-[#2a2a2c] rounded-full relative overflow-hidden p-0.5">
                <div 
                  className="h-full bg-[#d1b06b] rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${currentScore}%` }}
                />
                {/* Center marker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-700 -translate-x-1/2" />
              </div>
              <p className="text-[11px] text-zinc-400 italic">
                {currentScore === 50 ? 'The dilemma is perfectly balanced.' : `The decision leans toward "${isOptionALeading ? optionA : optionB}" by a margin of ${Math.abs(currentScore - 50) * 2}%.`}
              </p>
            </div>

            {/* Recommended Badge */}
            <div className="bg-[#1c1c1e] border border-[#2a2a2c] rounded-2xl p-4 flex flex-col justify-center items-center md:items-end text-center md:text-right min-w-[200px]">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold block mb-0.5">Recommended Course</span>
              <span className="text-[#d1b06b] font-serif font-bold text-lg flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-[#d1b06b] shrink-0" />
                {isOptionALeading ? optionA : optionB}
              </span>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pull Quote Takeaway */}
            <div className="bg-bg-sidebar border-l-4 border-[#d1b06b] border border-y-0 border-r-0 rounded-r-2xl p-6 shadow-xl">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#d1b06b] block mb-1">Key Takeaway</span>
              <p className="font-serif font-medium text-white text-lg md:text-xl italic leading-relaxed">
                &ldquo;{result.keyTakeaway}&rdquo;
              </p>
            </div>

            {/* Framework-Specific Renderings */}
            
            {/* 1. PROS & CONS WITH INTERACTIVE WEIGHTS */}
            {result.analysisType === 'PROS_CONS' && prosAndCons.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-white text-lg">Interactive Weighting Dashboard</h3>
                    <p className="text-zinc-400 text-xs">Tune the relevance of each factor. Watch the dial recalculate immediately.</p>
                  </div>
                  {/* Dynamic score reset button if modified */}
                  {currentScore !== result.tiebreakerScore && (
                    <button
                      onClick={() => {
                        setProsAndCons(result.prosAndCons!.map(item => ({ ...item, userWeight: 1 })));
                        setCurrentScore(result.tiebreakerScore);
                      }}
                      className="px-2.5 py-1 text-xs border border-brand-gold/20 rounded-lg bg-brand-gold/10 hover:bg-brand-gold/20 text-[#d1b06b] font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3" />
                      Reset Weights
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pros Column */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-4">
                    <h4 className="font-serif font-bold text-[#d1b06b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d1b06b]"></span>
                      Pros ({optionA})
                    </h4>
                    <div className="space-y-3">
                      {prosAndCons.filter(item => item.isPro).map(item => (
                        <div key={item.id} className="bg-[#1c1c1e] rounded-xl border border-[#2a2a2c] p-4 shadow-md hover:border-zinc-700 transition-all space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="px-1.5 py-0.5 bg-brand-gold/10 text-[#d1b06b] border border-brand-gold/20 rounded text-[9px] font-bold uppercase tracking-widest">
                                {item.category}
                              </span>
                              <h5 className="font-serif font-bold text-white text-sm mt-1">{item.text}</h5>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-[10px] text-zinc-500">Impact</span>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span 
                                    key={i} 
                                    className={`w-1.5 h-1.5 rounded-full ${i < item.impact ? 'bg-[#d1b06b]' : 'bg-zinc-800'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{item.explanation}</p>
                          
                          {/* Weight Controller */}
                          <div className="flex justify-between items-center pt-2.5 border-t border-[#2a2a2c]">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">My Importance Weight</span>
                            <div className="flex items-center gap-1">
                              {[0, 1, 2, 3].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => handleWeightChange(item.id, w)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    item.userWeight === w
                                      ? 'bg-brand-gold text-black shadow-md'
                                      : 'bg-bg-panel border border-[#2a2a2c] hover:bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {w}x
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cons Column */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-4">
                    <h4 className="font-serif font-bold text-[#ff6b6b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b]"></span>
                      Cons (Negatives & Obstacles)
                    </h4>
                    <div className="space-y-3">
                      {prosAndCons.filter(item => !item.isPro).map(item => (
                        <div key={item.id} className="bg-[#1c1c1e] rounded-xl border border-rose-950/20 p-4 shadow-md hover:border-zinc-700 transition-all space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="px-1.5 py-0.5 bg-rose-950/40 text-[#ff6b6b] border border-rose-900/30 rounded text-[9px] font-bold uppercase tracking-widest">
                                {item.category}
                              </span>
                              <h5 className="font-serif font-bold text-white text-sm mt-1">{item.text}</h5>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-[10px] text-zinc-500">Impact</span>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span 
                                    key={i} 
                                    className={`w-1.5 h-1.5 rounded-full ${i < item.impact ? 'bg-[#ff6b6b]' : 'bg-zinc-800'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{item.explanation}</p>
                          
                          {/* Weight Controller */}
                          <div className="flex justify-between items-center pt-2.5 border-t border-[#2a2a2c]">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">My Importance Weight</span>
                            <div className="flex items-center gap-1">
                              {[0, 1, 2, 3].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => handleWeightChange(item.id, w)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                    item.userWeight === w
                                      ? 'bg-brand-gold text-black shadow-md'
                                      : 'bg-bg-panel border border-[#2a2a2c] hover:bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {w}x
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPARISON TABLE */}
            {result.analysisType === 'COMPARISON' && result.comparisonAttributes && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-white text-lg">Side-by-Side Evaluation Dimensions</h3>
                  <p className="text-zinc-400 text-xs">A comprehensive assessment of attributes scored on a 1–10 scale.</p>
                </div>

                <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] shadow-xl overflow-hidden divide-y divide-[#2a2a2c]">
                  {result.comparisonAttributes.map((attr) => {
                    const scoreA = attr.scores[optionA] || 5;
                    const scoreB = attr.scores[optionB] || 5;
                    const explA = attr.explanations[optionA] || '';
                    const explB = attr.explanations[optionB] || '';
                    const hasWinner = scoreA !== scoreB;
                    const winnerText = scoreA > scoreB ? optionA : optionB;

                    return (
                      <div key={attr.name} className="p-5 md:p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <h4 className="font-serif font-bold text-white text-sm">{attr.name}</h4>
                            <p className="text-xs text-zinc-400 leading-normal">{attr.description}</p>
                          </div>
                          {hasWinner && (
                            <span className="px-2 py-0.5 bg-brand-gold/10 border border-brand-gold/20 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#d1b06b]">
                              🏆 Wins: {winnerText}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Option A Box */}
                          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#1c1c1e] border border-[#2a2a2c] hover:border-zinc-700 transition-all">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-300">{optionA}</span>
                              <span className="font-bold text-[#d1b06b]">{scoreA} / 10</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full">
                              <div className="h-full bg-[#d1b06b] rounded-full" style={{ width: `${scoreA * 10}%` }} />
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 italic">&ldquo;{explA}&rdquo;</p>
                          </div>

                          {/* Option B Box */}
                          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#1c1c1e] border border-[#2a2a2c] hover:border-zinc-700 transition-all">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-300">{optionB}</span>
                              <span className="font-bold text-[#d1b06b]">{scoreB} / 10</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full">
                              <div className="h-full bg-[#d1b06b] rounded-full" style={{ width: `${scoreB * 10}%` }} />
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed mt-1.5 italic">&ldquo;{explB}&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SWOT MATRIX */}
            {result.analysisType === 'SWOT' && result.swot && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-white text-lg">SWOT Matrix Diagram</h3>
                  <p className="text-zinc-400 text-xs">Strategic summary breakdown of internal & external environment factors.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-3">
                    <h4 className="font-serif font-bold text-[#d1b06b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <TrendingUp className="w-4 h-4 text-[#d1b06b]" />
                      Strengths (S)
                    </h4>
                    <ul className="space-y-2">
                      {result.swot.strengths.items.map((item, i) => (
                        <li key={i} className="bg-[#1c1c1e] border border-zinc-800/80 p-3 rounded-xl shadow-md text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold font-serif text-[#d1b06b] block mb-0.5">{item}</span>
                          {result.swot?.strengths.explanations?.[item] && (
                            <span className="text-zinc-400 mt-1 block pl-2 border-l border-brand-gold/30 italic">
                              {result.swot.strengths.explanations[item]}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-3">
                    <h4 className="font-serif font-bold text-[#ff6b6b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <AlertTriangle className="w-4 h-4 text-[#ff6b6b]" />
                      Weaknesses (W)
                    </h4>
                    <ul className="space-y-2">
                      {result.swot.weaknesses.items.map((item, i) => (
                        <li key={i} className="bg-[#1c1c1e] border border-zinc-800/80 p-3 rounded-xl shadow-md text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold font-serif text-[#ff6b6b] block mb-0.5">{item}</span>
                          {result.swot?.weaknesses.explanations?.[item] && (
                            <span className="text-zinc-400 mt-1 block pl-2 border-l border-[#ff6b6b]/30 italic">
                              {result.swot.weaknesses.explanations[item]}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-3">
                    <h4 className="font-serif font-bold text-[#d1b06b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <Lightbulb className="w-4 h-4 text-[#d1b06b]" />
                      Opportunities (O)
                    </h4>
                    <ul className="space-y-2">
                      {result.swot.opportunities.items.map((item, i) => (
                        <li key={i} className="bg-[#1c1c1e] border border-zinc-800/80 p-3 rounded-xl shadow-md text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold font-serif text-[#d1b06b] block mb-0.5">{item}</span>
                          {result.swot?.opportunities.explanations?.[item] && (
                            <span className="text-zinc-400 mt-1 block pl-2 border-l border-brand-gold/30 italic">
                              {result.swot.opportunities.explanations[item]}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Threats */}
                  <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] p-5 space-y-3">
                    <h4 className="font-serif font-bold text-[#ff6b6b] text-sm flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
                      <ShieldAlert className="w-4 h-4 text-[#ff6b6b]" />
                      Threats (T)
                    </h4>
                    <ul className="space-y-2">
                      {result.swot.threats.items.map((item, i) => (
                        <li key={i} className="bg-[#1c1c1e] border border-zinc-800/80 p-3 rounded-xl shadow-md text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold font-serif text-[#ff6b6b] block mb-0.5">{item}</span>
                          {result.swot?.threats.explanations?.[item] && (
                            <span className="text-zinc-400 mt-1 block pl-2 border-l border-[#ff6b6b]/30 italic">
                              {result.swot.threats.explanations[item]}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Column (Expert Verdict & Action Plan) */}
          <div className="space-y-8">
            
            {/* Expert Verdict */}
            <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] shadow-xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#d1b06b]" />
                Executive Strategy Report
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {result.aiVerdict}
              </p>
              <div className="pt-3 border-t border-[#2a2a2c] flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-500">Strategy Confidence:</span>
                <span className="text-[#d1b06b] bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {Math.abs(result.tiebreakerScore - 50) * 2 + 50}%
                </span>
              </div>
            </div>

            {/* Implementation Action Items with Interactive Checklist */}
            <div className="bg-bg-sidebar rounded-2xl border border-[#2a2a2c] shadow-xl p-6 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#d1b06b]" />
                  Tactical Implementation Plan
                </h3>
                <p className="text-zinc-500 text-[11px] mt-0.5">Check off items as you make your transitional moves.</p>
              </div>

              <div className="space-y-3">
                {result.recommendationDetails.map((step, i) => {
                  const isChecked = !!checkedItems[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCheckedItems({ ...checkedItems, [i]: !isChecked })}
                      className="w-full text-left flex items-start gap-3 p-3 rounded-xl border bg-[#1c1c1e] hover:bg-zinc-800 transition-all text-xs cursor-pointer"
                      style={{ 
                        borderColor: isChecked ? '#2a2a2c' : '#3a3a3c',
                        opacity: isChecked ? 0.5 : 1
                      }}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked 
                          ? 'bg-brand-gold border-brand-gold text-black font-bold' 
                          : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current text-black" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        )}
                      </span>
                      <span className={`leading-relaxed ${isChecked ? 'line-through text-zinc-500 font-medium' : 'text-zinc-300'}`}>
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Share Widget */}
            <button
              onClick={handleCopySummary}
              className="w-full py-3 border border-[#2a2a2c] hover:border-brand-gold rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-[#d1b06b] font-bold text-xs tracking-widest uppercase transition-all bg-[#1c1c1e] hover:bg-brand-gold/10 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-brand-gold" />
              Copy Strategy Journal
            </button>
          </div>
        </div>
      ) : (
        /* PLAYGROUND TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          
          {/* Weighted Coin Flipper */}
          <div className="bg-bg-sidebar rounded-3xl border border-[#2a2a2c] shadow-xl p-6 md:p-8 space-y-6 flex flex-col justify-between items-center text-center">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-brand-gold/10 text-[#d1b06b] border border-brand-gold/20 rounded-full text-[10px] uppercase font-bold tracking-widest">
                The Weighted Balance Flipper
              </span>
              <h3 className="font-serif font-bold text-white text-xl">
                Still Skeptical? Flip a Weighted Coin
              </h3>
              <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                We&apos;ve weighted this coin based on the AI&apos;s Tiebreaker confidence score ({currentScore}%). Let fate validate your immediate gut reaction.
              </p>
            </div>

            {/* Animated Coin */}
            <div className="my-6 relative w-36 h-36 flex items-center justify-center">
              <div 
                className={`w-32 h-32 rounded-full border-4 border-[#2a2a2c] bg-gradient-to-br from-[#d1b06b] via-[#e5c583] to-[#a37c35] shadow-2xl flex flex-col justify-center items-center font-serif font-bold text-zinc-950 tracking-tight transition-all duration-1000 ${
                  coinIsFlipping ? 'animate-spin scale-90 opacity-80' : ''
                }`}
              >
                <div className="text-center p-2 select-none">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-900/60 mb-0.5 font-bold">Tiebreaker</div>
                  <div className="text-2xl font-black">⚖️</div>
                  <div className="text-[10px] mt-1 text-zinc-900/80 font-bold">COIN</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 w-full">
              <button
                onClick={handleCoinFlip}
                disabled={coinIsFlipping}
                className="w-full py-3 bg-brand-gold hover:bg-brand-gold/85 text-black rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer"
              >
                {coinIsFlipping ? 'Flipping...' : 'Flip Weighted Coin'}
              </button>

              {coinFlipped && coinResult && (
                <div className="p-4 bg-brand-gold/10 rounded-xl border border-brand-gold/20 animate-pulse">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#d1b06b] block mb-1">The coin lands on:</span>
                  <p className="font-serif font-bold text-white text-sm italic">
                    &ldquo;{coinResult}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Quiz: Heart vs Brain */}
          <div className="bg-bg-sidebar rounded-3xl border border-[#2a2a2c] shadow-xl p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-brand-gold/10 text-[#d1b06b] border border-brand-gold/20 rounded-full text-[10px] uppercase font-bold tracking-widest">
                Psychological Alignment Quiz
              </span>
              <h3 className="font-serif font-bold text-white text-xl">
                The Gut-Check Challenge
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Sometimes the best way to choose is to test your immediate reaction to the options. Answer this diagnostic micro-prompt:
              </p>
            </div>

            <div className="p-4 bg-[#141416] rounded-xl border border-[#2a2a2c] space-y-3">
              <p className="text-xs font-serif font-semibold text-zinc-200 leading-relaxed">
                Close your eyes and imagine that Option B (&ldquo;{optionB}&rdquo;) was completely erased from history and impossible to do.
              </p>
              <p className="text-xs text-zinc-500 italic">
                How did your chest feel immediately upon reading that?
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 bg-[#1c1c1e] border border-[#2a2a2c] rounded-lg text-center cursor-pointer hover:border-[#d1b06b] transition-all group">
                  <span className="block text-sm">😌</span>
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-[#d1b06b] block mt-1 uppercase tracking-widest">Relief</span>
                  <p className="text-[9px] text-zinc-500 leading-normal mt-0.5">Your gut wanted Option A all along.</p>
                </div>
                <div className="p-3 bg-[#1c1c1e] border border-[#2a2a2c] rounded-lg text-center cursor-pointer hover:border-[#d1b06b] transition-all group">
                  <span className="block text-sm">😢</span>
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-[#d1b06b] block mt-1 uppercase tracking-widest">Regret/Panic</span>
                  <p className="text-[9px] text-zinc-500 leading-normal mt-0.5">You actually prefer Option B.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-serif font-bold text-[#d1b06b] uppercase tracking-widest">Why does this work?</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Decisions aren&apos;t just logical spreadsheet calculations; they are emotional commitments. If the AI recommends an option and you feel disappointed, that disappointment is your true answer. Follow the advice, or defy it deliberately—either way, you have broken the tie!
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
