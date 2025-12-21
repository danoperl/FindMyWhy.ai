// =============================================================================
// QC v1 API Route — Quick Clarity Generation Layer
// FindMyWhy.ai v64.0
// =============================================================================

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

/**
 * Vercel Serverless Function
 * POST /api/qc
 * 
 * Accepts: { qc1_decision, qc2_choice_frame, qc3_influences, qc4_forced_pick }
 * Returns: { distilled_choice, what_influenced_it, instinctual_pull, what_this_says_about_this_moment, reframe_want, reframe_need }
 * 
 * Environment: Requires OPENAI_API_KEY in Vercel env vars
 * Optional: OPENAI_MODEL (defaults to 'gpt-4o-mini')
 */

export default async function handler(req, res) {
  // [INSTRUMENTATION] Log handler entry
  console.log(`[QC] HIT ${new Date().toISOString()}`);

  // Only allow POST
  if (req.method !== 'POST') {
    console.log('[QC] FALLBACK PATH USED');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const { qc1_decision, qc2_choice_frame, qc3_influences, qc4_forced_pick } = req.body;
    
    if (!qc1_decision || !qc2_choice_frame || !qc3_influences || !qc4_forced_pick) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(400).json({ error: 'Missing required fields: qc1_decision, qc2_choice_frame, qc3_influences, qc4_forced_pick' });
    }

    // Validate all inputs are strings
    if (typeof qc1_decision !== 'string' || typeof qc2_choice_frame !== 'string' || 
        typeof qc3_influences !== 'string' || typeof qc4_forced_pick !== 'string') {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(400).json({ error: 'All inputs must be strings' });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Read system prompt from .md file at runtime
    let SYSTEM_PROMPT;
    try {
      // Try relative path from API directory first, then fallback to process.cwd()
      let promptPath = join(__dirname, 'prompts', 'qc_v1_system_prompt.md');
      try {
        SYSTEM_PROMPT = readFileSync(promptPath, 'utf-8').trim();
      } catch (firstError) {
        // Fallback: try from project root
        promptPath = join(process.cwd(), 'api', 'prompts', 'qc_v1_system_prompt.md');
        SYSTEM_PROMPT = readFileSync(promptPath, 'utf-8').trim();
      }
    } catch (readError) {
      console.log('[QC] FALLBACK PATH USED - Failed to read system prompt:', readError.message);
      return res.status(500).json({ error: 'Failed to read system prompt' });
    }

    // Validate SYSTEM_PROMPT is present and substantial
    if (!SYSTEM_PROMPT || SYSTEM_PROMPT.length < 2000) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(500).json({ error: 'SYSTEM_PROMPT missing or invalid' });
    }

    // Model configurable via env (default: gpt-4o-mini)
    const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    // Build user message from the four inputs
    const userMessage = `QC Input Data:

qc1_decision: ${qc1_decision}

qc2_choice_frame: ${qc2_choice_frame}

qc3_influences: ${qc3_influences}

qc4_forced_pick: ${qc4_forced_pick}

Generate the QC-5 output JSON with all six required keys.`;

    // [INSTRUMENTATION] Log before OpenAI API call
    console.log('[QC] CALLING OPENAI');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiResponse.ok) {
      console.log('[QC] FALLBACK PATH USED');
      const errorData = await openaiResponse.json().catch(() => ({}));
      return res.status(500).json({ 
        error: 'Failed to generate clarity',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    // [INSTRUMENTATION] Log successful OpenAI response
    console.log('[QC] OPENAI OK');

    const openaiData = await openaiResponse.json();
    const qc5OutputText = openaiData.choices?.[0]?.message?.content?.trim() || '';

    // Fail closed: empty or whitespace-only response
    if (!qc5OutputText || qc5OutputText.length === 0) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(502).json({ error: 'Empty response from OpenAI' });
    }

    // Parse JSON response
    let qc5Output;
    try {
      qc5Output = JSON.parse(qc5OutputText);
    } catch (parseError) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(502).json({ error: 'Invalid JSON response from OpenAI' });
    }

    // Validate all six required keys are present
    const requiredKeys = [
      'distilled_choice',
      'what_influenced_it',
      'instinctual_pull',
      'what_this_says_about_this_moment',
      'reframe_want',
      'reframe_need'
    ];

    const missingKeys = requiredKeys.filter(key => !(key in qc5Output));
    if (missingKeys.length > 0) {
      console.log('[QC] FALLBACK PATH USED');
      return res.status(502).json({ 
        error: 'Missing required keys in response',
        missing: missingKeys
      });
    }

    // Validate all values are strings
    for (const key of requiredKeys) {
      if (typeof qc5Output[key] !== 'string') {
        console.log('[QC] FALLBACK PATH USED');
        return res.status(502).json({ 
          error: `Invalid type for key: ${key} (expected string)`
        });
      }
    }

    // [INSTRUMENTATION] Add metadata to response indicating OpenAI was used
    // Return QC-5 output with instrumentation metadata
    return res.status(200).json({ 
      ...qc5Output,
      qc5Meta: {
        source: 'openai',
        model: OPENAI_MODEL
      }
    });

  } catch (error) {
    console.log('[QC] FALLBACK PATH USED');
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

