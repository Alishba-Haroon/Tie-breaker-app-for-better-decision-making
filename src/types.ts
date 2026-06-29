/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AnalysisType = 'PROS_CONS' | 'COMPARISON' | 'SWOT';

export interface DecisionInput {
  title: string;
  description?: string;
  analysisType: AnalysisType;
  options: string[]; // Options to compare (usually 1 or 2, e.g. "Option A" and "Option B")
  customFactors: {
    budget: number;       // 1 (Low) to 5 (High) importance
    timeCommitment: number;
    riskTolerance: number;
    excitement: number;
    customNote?: string;
  };
}

export interface ProConItem {
  id: string;
  text: string;
  isPro: boolean;
  impact: number;      // 1 to 5 scale
  category: string;    // e.g. "Financial", "Personal", "Career"
  explanation: string; // Elaborate on why this is a factor
  userWeight: number;  // Interactive weight modifier (defaults to 1. 0x, 1x, 2x, 3x)
}

export interface ComparisonAttribute {
  name: string;        // e.g. "Cost", "Time", "Enjoyment"
  description: string;
  scores: {
    [option: string]: number; // score 1-10
  };
  explanations: {
    [option: string]: string;
  };
}

export interface SWOTQuadrant {
  items: string[];
  explanations: { [item: string]: string };
}

export interface SWOTData {
  strengths: SWOTQuadrant;
  weaknesses: SWOTQuadrant;
  opportunities: SWOTQuadrant;
  threats: SWOTQuadrant;
}

export interface AnalysisResult {
  decisionTitle: string;
  analysisType: AnalysisType;
  options: string[];
  
  // Pros and Cons (Only present if analysisType === 'PROS_CONS')
  prosAndCons?: ProConItem[];
  
  // Comparison Table (Only present if analysisType === 'COMPARISON')
  comparisonAttributes?: ComparisonAttribute[];
  
  // SWOT (Only present if analysisType === 'SWOT')
  swot?: SWOTData;
  
  // Shared metrics
  aiVerdict: string;        // Paragraph explaining the decision/analysis recommendation
  tiebreakerScore: number;  // 0 to 100 percentage in favor of Option A (or Yes) vs Option B (or No)
  recommendedOption: string; // The specific choice/option recommended
  keyTakeaway: string;      // A single powerful summary sentence
  recommendationDetails: string[]; // Step-by-step action plan
}

export interface SavedDecision {
  id: string;
  createdAt: string;
  input: DecisionInput;
  result: AnalysisResult;
}
