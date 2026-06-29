/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Scale, 
  Columns, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldAlert, 
  Heart, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { DecisionInput, AnalysisType } from '../types';

interface TiebreakerWizardProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

const TEMPLATES = [
  {
    name: '🚗 Buy an EV or hybrid',
    title: 'Should I buy a fully electric vehicle (EV) or a hybrid car?',
    description: 'My daily commute is 40 miles. I want to save on fuel and reduce my carbon footprint, but I am worried about road trips and charging infrastructure.',
    analysisType: 'COMPARISON' as AnalysisType,
    options: ['Fully Electric SUV', 'Plug-in Hybrid Sedan'],
    customFactors: {
      budget: 4,
      timeCommitment: 3,
      riskTolerance: 3,
      excitement: 4,
      customNote: 'Charging is available at my workplace for free. Long road trips happen twice a year.'
    }
  },
  {
    name: '💼 Quit job for freelance',
    title: 'Should I quit my stable 9-to-5 job to go full-time freelance?',
    description: 'I have 3 years of savings and 2 recurring client leads, but no company-sponsored healthcare and no guaranteed monthly income.',
    analysisType: 'SWOT' as AnalysisType,
    options: ['Stay at current stable corporate job', 'Launch independent freelance agency'],
    customFactors: {
      budget: 3,
      timeCommitment: 5,
      riskTolerance: 4,
      excitement: 5,
      customNote: 'I value autonomy and creative freedom above all, but have a young family to support.'
    }
  },
  {
    name: '🏢 Rent vs Buy Home',
    title: 'Is it better to rent a premium apartment in the city center or buy a townhouse in the suburbs?',
    description: 'Comparing urban flexibility and low maintenance with long-term property wealth building and extra space.',
    analysisType: 'PROS_CONS' as AnalysisType,
    options: ['Rent apartment in city center', 'Buy suburban townhouse'],
    customFactors: {
      budget: 5,
      timeCommitment: 4,
      riskTolerance: 2,
      excitement: 3,
      customNote: 'Interest rates are high right now. I plan to stay in the area for at least 6 years.'
    }
  }
];

export default function TiebreakerWizard({ onSubmit, isLoading }: TiebreakerWizardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('PROS_CONS');
  const [optionA, setOptionA] = useState('Yes, do it');
  const [optionB, setOptionB] = useState('No, keep status quo');
  const [budget, setBudget] = useState(3);
  const [timeCommitment, setTimeCommitment] = useState(3);
  const [riskTolerance, setRiskTolerance] = useState(3);
  const [excitement, setExcitement] = useState(3);
  const [customNote, setCustomNote] = useState('');

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setAnalysisType(tpl.analysisType);
    setOptionA(tpl.options[0]);
    setOptionB(tpl.options[1] || '');
    setBudget(tpl.customFactors.budget);
    setTimeCommitment(tpl.customFactors.timeCommitment);
    setRiskTolerance(tpl.customFactors.riskTolerance);
    setExcitement(tpl.customFactors.excitement);
    setCustomNote(tpl.customFactors.customNote || '');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalOptions = [
      optionA.trim() || 'Option A',
      optionB.trim() || 'Option B'
    ];

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      analysisType,
      options: finalOptions,
      customFactors: {
        budget,
        timeCommitment,
        riskTolerance,
        excitement,
        customNote: customNote.trim() || undefined
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Templates Row */}
      <div className="bg-bg-sidebar border border-[#2a2a2c] rounded-2xl p-6 shadow-xl">
        <h3 className="font-serif font-medium text-brand-gold text-base tracking-widest uppercase mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d1b06b]" />
          Stuck? Try a Quick Template
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="text-left px-4 py-3.5 rounded-xl border border-[#2a2a2c] bg-[#1c1c1e] hover:border-[#d1b06b] hover:bg-brand-gold/5 transition-all text-xs font-medium text-zinc-300 flex flex-col justify-between cursor-pointer"
            >
              <span className="text-[#d1b06b] font-serif font-bold block mb-1 text-sm">{tpl.name}</span>
              <span className="text-zinc-400 line-clamp-2 leading-relaxed">{tpl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleFormSubmit} className="bg-bg-panel rounded-3xl border border-[#2a2a2c] shadow-2xl p-6 md:p-8 space-y-8">
        <div>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-white tracking-wide mb-2 italic">
            Formulate Your Dilemma
          </h2>
          <p className="text-zinc-400 text-sm">
            Provide the AI Tiebreaker with context. It will synthesize raw variables and output an optimal choice.
          </p>
        </div>

        {/* Title & Description */}
        <div className="space-y-5">
          <div>
            <label htmlFor="decision-title" className="block text-sm font-semibold text-zinc-300 mb-2">
              What decision are you facing? <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              id="decision-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Should I relocate to San Francisco for the Senior Lead role?"
              className="w-full px-4 py-3 rounded-xl border border-[#2a2a2c] focus:outline-none focus:ring-1 focus:ring-[#d1b06b] focus:border-[#d1b06b] transition-all text-white bg-[#1c1c1e] text-sm md:text-base font-medium placeholder-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="decision-desc" className="block text-sm font-semibold text-zinc-300 mb-2">
              Additional context or background (optional)
            </label>
            <textarea
              id="decision-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context like your main fears, previous research, or what is pulling you in either direction..."
              className="w-full px-4 py-3 rounded-xl border border-[#2a2a2c] focus:outline-none focus:ring-1 focus:ring-[#d1b06b] focus:border-[#d1b06b] transition-all text-white bg-[#1c1c1e] text-sm leading-relaxed placeholder-zinc-600"
            />
          </div>
        </div>

        {/* Options Setup */}
        <div className="p-6 bg-[#131315] rounded-2xl border border-[#2a2a2c] space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#d1b06b] font-bold flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#d1b06b]" />
            Establish the Alternatives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="option-a" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                Option A (Default positive or alternative #1)
              </label>
              <input
                id="option-a"
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="e.g. Relocate to SF"
                className="w-full px-4 py-3 rounded-lg border border-[#2a2a2c] bg-[#1c1c1e] focus:border-[#d1b06b] focus:outline-none text-sm font-medium text-white"
              />
            </div>
            <div>
              <label htmlFor="option-b" className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                Option B (Status quo or alternative #2)
              </label>
              <input
                id="option-b"
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="e.g. Remain in current city"
                className="w-full px-4 py-3 rounded-lg border border-[#2a2a2c] bg-[#1c1c1e] focus:border-[#d1b06b] focus:outline-none text-sm font-medium text-white"
              />
            </div>
          </div>
        </div>

        {/* Analysis Type Picker */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-zinc-300">
            Choose Your Analytical Framework
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pros & Cons Card */}
            <button
              type="button"
              onClick={() => setAnalysisType('PROS_CONS')}
              className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                analysisType === 'PROS_CONS'
                  ? 'border-[#d1b06b] bg-brand-gold/10 ring-1 ring-[#d1b06b] shadow-xl'
                  : 'border-[#2a2a2c] bg-[#1c1c1e] hover:border-zinc-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-brand-gold/10 text-[#d1b06b] w-fit mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#d1b06b] text-base mb-1">Pros & Cons Matrix</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Evaluates specific drivers and barriers with distinct importance scores.
                </p>
              </div>
            </button>

            {/* Comparison Table Card */}
            <button
              type="button"
              onClick={() => setAnalysisType('COMPARISON')}
              className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                analysisType === 'COMPARISON'
                  ? 'border-[#d1b06b] bg-brand-gold/10 ring-1 ring-[#d1b06b] shadow-xl'
                  : 'border-[#2a2a2c] bg-[#1c1c1e] hover:border-zinc-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-brand-gold/10 text-[#d1b06b] w-fit mb-4">
                <Columns className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#d1b06b] text-base mb-1">Comparison Table</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Compares Options A and B across multi-dimensional criteria rated 1–10.
                </p>
              </div>
            </button>

            {/* SWOT Matrix Card */}
            <button
              type="button"
              onClick={() => setAnalysisType('SWOT')}
              className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                analysisType === 'SWOT'
                  ? 'border-[#d1b06b] bg-brand-gold/10 ring-1 ring-[#d1b06b] shadow-xl'
                  : 'border-[#2a2a2c] bg-[#1c1c1e] hover:border-zinc-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-brand-gold/10 text-[#d1b06b] w-fit mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#d1b06b] text-base mb-1">SWOT Matrix</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Unpacks external & internal Strengths, Weaknesses, Opportunities, and Threats.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Constraints Sliders */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">Calibrate Your Constraint Profile</h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              These sliders let the AI strategist customize scores for your specific lifestyle and psychological limits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#131315] p-5 rounded-2xl border border-[#2a2a2c]">
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#d1b06b]" />
                  Budget & Cost Sensitivity
                </span>
                <span className="font-semibold text-[#d1b06b]">
                  {budget === 1 ? 'Flexible (1)' : budget === 3 ? 'Moderate (3)' : budget === 5 ? 'Extremely Strict (5)' : budget}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#d1b06b]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Expense not an issue</span>
                <span>Highly price-sensitive</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#d1b06b]" />
                  Time / Effort Overhead
                </span>
                <span className="font-semibold text-[#d1b06b]">
                  {timeCommitment === 1 ? 'Quick (1)' : timeCommitment === 3 ? 'Average (3)' : timeCommitment === 5 ? 'Hefty Long-term (5)' : timeCommitment}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#d1b06b]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Minimal spare time needed</span>
                <span>Prepared for major commitment</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#d1b06b]" />
                  Risk Tolerance
                </span>
                <span className="font-semibold text-[#d1b06b]">
                  {riskTolerance === 1 ? 'Extremely Safe (1)' : riskTolerance === 3 ? 'Balanced (3)' : riskTolerance === 5 ? 'Adventurous (5)' : riskTolerance}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#d1b06b]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Avoid failures at all costs</span>
                <span>High risk, high reward welcome</span>
              </div>
            </div>

            {/* Slider 4 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#d1b06b]" />
                  Excitement / Passion Factor
                </span>
                <span className="font-semibold text-[#d1b06b]">
                  {excitement === 1 ? 'Pure Logic (1)' : excitement === 3 ? 'Engaged (3)' : excitement === 5 ? 'Obsessed (5)' : excitement}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={excitement}
                onChange={(e) => setExcitement(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#d1b06b]"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Calculated, indifferent</span>
                <span>Must spark joy & meaning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Strategy Instruction */}
        <div>
          <label htmlFor="custom-instruction" className="block text-sm font-semibold text-zinc-300 mb-2">
            Is there a specific trigger or key constraint? (Optional)
          </label>
          <input
            id="custom-instruction"
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. If it requires waking up before 6 AM, it is a hard no."
            className="w-full px-4 py-3 rounded-xl border border-[#2a2a2c] focus:outline-none focus:ring-1 focus:ring-[#d1b06b] focus:border-[#d1b06b] transition-all text-white bg-[#1c1c1e] text-sm placeholder-zinc-600"
          />
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-[#2a2a2c] flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full sm:w-auto px-8 py-4 bg-[#d1b06b] hover:bg-[#b6924d] disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-2xl font-serif uppercase tracking-widest font-bold shadow-xl transition-all flex items-center justify-center gap-2 pulse-button cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing Alternatives...</span>
              </>
            ) : (
              <>
                <span>Consult The Tiebreaker</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
