/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazy-loaded or at startup safely
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not defined in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Define the schema for structured output to ensure we get clean JSON back
const decisionAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    decisionTitle: {
      type: Type.STRING,
      description: 'The title of the decision being analyzed.',
    },
    analysisType: {
      type: Type.STRING,
      description: 'The type of analysis: PROS_CONS, COMPARISON, or SWOT.',
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'The list of options analyzed.',
    },
    recommendedOption: {
      type: Type.STRING,
      description: 'The specific option that is highly recommended by the AI.',
    },
    keyTakeaway: {
      type: Type.STRING,
      description: 'A single, powerful, punchy key takeaway sentence summarizing the core dilemma or resolution.',
    },
    aiVerdict: {
      type: Type.STRING,
      description: 'A detailed, objective, multi-sentence expert verdict evaluating the alternatives and advising the path forward.',
    },
    tiebreakerScore: {
      type: Type.INTEGER,
      description: 'An integer from 0 to 100. It represents the percentage leaning or confidence score for Option A (index 0) vs Option B (index 1). A score of 50 is perfectly neutral. A score of 75 means Option A is strongly recommended. A score of 20 means Option B is strongly recommended.',
    },
    recommendationDetails: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A concrete, step-by-step action plan or guidelines for the user to execute the recommendation.',
    },
    prosAndCons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Unique string ID like pro_1, pro_2, con_1' },
          text: { type: Type.STRING, description: 'Brief statement of the pro or con' },
          isPro: { type: Type.BOOLEAN, description: 'True if it is a Pro, false if it is a Con' },
          impact: { type: Type.INTEGER, description: 'An integer from 1 (Low impact) to 5 (Critical impact)' },
          category: { type: Type.STRING, description: 'Category label like Financial, Emotional, Career, Health, Time' },
          explanation: { type: Type.STRING, description: 'A short sentence expanding on why this is a factor' },
        },
        required: ['id', 'text', 'isPro', 'impact', 'category', 'explanation'],
      },
      description: 'Required if analysisType is PROS_CONS. Populate with at least 4-6 balanced pros and cons in total.',
    },
    comparisonAttributes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the comparison criteria, e.g. Cost, Learning Curve, Longevity' },
          description: { type: Type.STRING, description: 'Short description of what this criteria evaluates' },
          scores: {
            type: Type.OBJECT,
            description: 'A map where keys are the exact option names, and values are integers from 1 to 10 rating that option for this criteria.',
          },
          explanations: {
            type: Type.OBJECT,
            description: 'A map where keys are the exact option names, and values are explanations of why the option received that score.',
          },
        },
        required: ['name', 'description'],
      },
      description: 'Required if analysisType is COMPARISON. Return at least 4-5 relevant criteria with ratings for each option.',
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanations: { type: Type.OBJECT, description: 'Map of item text to detailed explanation' },
          },
          required: ['items'],
        },
        weaknesses: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanations: { type: Type.OBJECT, description: 'Map of item text to detailed explanation' },
          },
          required: ['items'],
        },
        opportunities: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanations: { type: Type.OBJECT, description: 'Map of item text to detailed explanation' },
          },
          required: ['items'],
        },
        threats: {
          type: Type.OBJECT,
          properties: {
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanations: { type: Type.OBJECT, description: 'Map of item text to detailed explanation' },
          },
          required: ['items'],
        },
      },
      description: 'Required if analysisType is SWOT. Return balanced SWOT items.',
    },
  },
  required: [
    'decisionTitle',
    'analysisType',
    'options',
    'recommendedOption',
    'keyTakeaway',
    'aiVerdict',
    'tiebreakerScore',
    'recommendationDetails',
  ],
};

// Main Analysis API
app.post('/api/analyze', async (req, res) => {
  try {
    const { title, description, analysisType, options, customFactors } = req.body;

    if (!title || !analysisType || !options || options.length === 0) {
      return res.status(400).json({ error: 'Missing required decision details.' });
    }

    const client = getAIClient();
    
    // Construct prompt based on choices and user parameters
    const prompt = `
      You are "The Tiebreaker", an elite decision strategist and master analytical AI.
      Analyze the following decision scenario and return a highly structured analysis.

      DECISION TO MAKE:
      Title: "${title}"
      Description: "${description || 'No description provided.'}"
      Options to choose between: ${options.map((opt: string, i: number) => `Option ${String.fromCharCode(65 + i)}: "${opt}"`).join(', ')}

      USER PREFERENCES & CONSTRAINT PROFILE:
      - Budget Importance: ${customFactors?.budget || 3}/5
      - Time Commitment: ${customFactors?.timeCommitment || 3}/5
      - Risk Tolerance: ${customFactors?.riskTolerance || 3}/5
      - Personal Excitement/Passion Level: ${customFactors?.excitement || 3}/5
      ${customFactors?.customNote ? `- Additional User Context: "${customFactors.customNote}"` : ''}

      ANALYSIS TYPE REQUESTED:
      "${analysisType}"

      INSTRUCTIONS FOR ANALYSIS:
      1. If the analysisType is "PROS_CONS", formulate a rigorous list of critical Pros and Cons (at least 5-6 total). Group them with categories (like Financial, Growth, Time). Assign an impact score of 1 to 5 to each.
      2. If the analysisType is "COMPARISON", analyze how each of the options compares across at least 4 key evaluation dimensions (like cost-efficiency, speed, stress, skill growth). For each dimension, rate each option on a scale of 1 to 10 and provide a one-sentence rationale.
      3. If the analysisType is "SWOT", evaluate the decision or choice from Strengths, Weaknesses, Opportunities, and Threats angles (at least 3 entries in each quadrant) and link each with a brief rationale.
      4. Formulate an absolute, authoritative recommended option (must match one of the exact options provided). There are NO ties. Choose the option that is truly best for the user's constraint profile (e.g. if their Risk Tolerance is low, recommend the safer option; if Excitement is high, lean towards the passion-project option).
      5. Formulate a 'tiebreakerScore' from 0 to 100 representing how strongly you lean towards Option A (index 0) vs Option B (index 1). Let 50 be neutral. E.g. 80 is strongly in favor of "${options[0]}"; 25 is strongly in favor of "${options[1] || 'No choice'}".
      6. Provide a detailed, highly strategic 'aiVerdict' paragraph explaining your reasoning and a 'keyTakeaway' sentence.
      7. Outline a step-by-step actionable plan under 'recommendationDetails' to help them transition from decision to implementation.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are "The Tiebreaker", an expert strategic advisor. Your outputs must be perfectly parsed JSON according to the schema provided. Your advice must be direct, specific, and clear. Avoid fluffy corporate speak—be analytical, wise, encouraging, and honest.`,
        responseMimeType: 'application/json',
        responseSchema: decisionAnalysisSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parsedResult = JSON.parse(responseText.trim());
    return res.json({ result: parsedResult });

  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({
      error: 'Failed to analyze decision',
      details: error.message || String(error),
    });
  }
});

// Configure Vite integration
async function main() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static build integrated.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
});
