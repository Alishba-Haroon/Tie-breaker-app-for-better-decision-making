/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Calendar, Trash2, ArrowUpRight, Scale, Columns, TrendingUp } from 'lucide-react';
import { SavedDecision } from '../types';

interface PastDecisionsProps {
  history: SavedDecision[];
  onSelect: (decision: SavedDecision) => void;
  onDelete: (id: string) => void;
}

export default function PastDecisions({ history, onSelect, onDelete }: PastDecisionsProps) {
  if (history.length === 0) {
    return (
      <div className="bg-bg-sidebar rounded-3xl border border-[#2a2a2c] p-8 text-center max-w-2xl mx-auto space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-[#1c1c1e] flex items-center justify-center mx-auto text-brand-gold border border-[#2a2a2c]">
          <History className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif font-bold text-[#d1b06b] text-base">No Decisions Saved Yet</h4>
          <p className="text-zinc-400 text-xs max-w-xs mx-auto leading-relaxed">
            Your analyzed decisions will automatically be stored securely in your local browser history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-2 px-1">
        <History className="w-4 h-4 text-brand-gold" />
        <h3 className="font-serif font-medium text-zinc-300 text-sm uppercase tracking-widest">
          Decision History Journal ({history.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item) => {
          const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const typeBadge = item.result.analysisType;

          return (
            <div 
              key={item.id} 
              className="bg-bg-panel rounded-2xl border border-[#2a2a2c] hover:border-[#d1b06b]/40 p-5 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Decorator background for group hover */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 rounded-full blur-xl translate-x-10 -translate-y-10 group-hover:bg-brand-gold/10 transition-all"></div>

              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold bg-[#1c1c1e] text-brand-gold border border-[#2a2a2c] px-2.5 py-1 rounded">
                    {typeBadge === 'PROS_CONS' && <Scale className="w-2.5 h-2.5" />}
                    {typeBadge === 'COMPARISON' && <Columns className="w-2.5 h-2.5" />}
                    {typeBadge === 'SWOT' && <TrendingUp className="w-2.5 h-2.5" />}
                    {typeBadge.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {dateStr}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-white text-base line-clamp-1 group-hover:text-brand-gold transition-all">
                    {item.input.title}
                  </h4>
                  {item.input.description && (
                    <p className="text-zinc-500 text-xs mt-1 line-clamp-1 italic">
                      &ldquo;{item.input.description}&rdquo;
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#1c1c1e] border border-[#2a2a2c] text-xs space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Leaning:</span>
                    <span className="font-semibold text-brand-gold">
                      {item.result.recommendedOption}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Confidence Score:</span>
                    <span className="font-bold text-[#d1b06b]">
                      {Math.abs(item.result.tiebreakerScore - 50) * 2 + 50}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#2a2a2c] relative z-10">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold text-[#d1b06b] hover:text-black rounded-xl font-serif text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                >
                  Retrieve Analysis
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-zinc-500 hover:text-[#ff6b6b] rounded-lg hover:bg-[#ff6b6b]/10 transition-all cursor-pointer"
                  title="Delete decision"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
