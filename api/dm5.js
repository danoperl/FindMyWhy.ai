// =============================================================================
// DM5 v1 API Route — Insight Generation Layer
// FindMyWhy.ai v62.0
// =============================================================================

import { DM5_V1_SYSTEM_PROMPT } from './prompts/dm5_v1_system_prompt.js';

/**
 * Vercel Serverless Function
 * POST /api/dm5
 * 
 * Accepts: { dm4PayloadJson: string }
 * Returns: { dm5OutputText: string }
 * 
 * Environment: Requires OPENAI_API_KEY in Vercel env vars
 * Optional: OPENAI_MODEL (defaults to 'gpt-4o-mini')
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const { dm4PayloadJson } = req.body;
    
    if (!dm4PayloadJson) {
      return res.status(400).json({ error: 'Missing dm4PayloadJson' });
    }

    // Handle both string and object input
    let dm4Payload;
    let payloadString;
    
    if (typeof dm4PayloadJson === 'string') {
      payloadString = dm4PayloadJson;
      try {
        dm4Payload = JSON.parse(dm4PayloadJson);
      } catch (parseError) {
        return res.status(400).json({ error: 'Invalid JSON in dm4PayloadJson' });
      }
    } else if (typeof dm4PayloadJson === 'object') {
      try {
        payloadString = JSON.stringify(dm4PayloadJson);
        dm4Payload = dm4PayloadJson;
      } catch (stringifyError) {
        return res.status(400).json({ error: 'Failed to stringify dm4PayloadJson' });
      }
    } else {
      return res.status(400).json({ error: 'dm4PayloadJson must be a string or object' });
    }

    // Validate payload is not empty
    if (!payloadString || payloadString.trim().length === 0) {
      return res.status(400).json({ error: 'dm4PayloadJson is empty' });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Validate SYSTEM_PROMPT is present and substantial
    const SYSTEM_PROMPT = DM5_V1_SYSTEM_PROMPT.trim();
    if (!SYSTEM_PROMPT || SYSTEM_PROMPT.length < 2000) {
      return res.status(500).json({ error: 'SYSTEM_PROMPT missing or invalid' });
    }

    // Model configurable via env (default: gpt-4o-mini)
    const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    // Build user message from DM4 payload
    const userMessage = `DM4 Analysis Data:

Surface Question: ${dm4Payload.surfaceQuestion || 'Not provided'}

WHY Chain:
${dm4Payload.whyChain?.map((why, i) => `${i + 1}. ${why}`).join('\n') || 'None'}

Themes Detected:
${dm4Payload.themes?.map(t => `- ${t.label} (${t.category})`).join('\n') || 'None'}

Evidence:
${dm4Payload.evidence?.slice(0, 10).map(e => `  Pattern: ${e.patternId}, Step ${e.step}: "${e.text}"`).join('\n') || 'None'}

Tensions:
${dm4Payload.tensions?.map(t => `- ${t.description}`).join('\n') || 'None'}

Directional Signals:
${dm4Payload.directionalSignals?.join(', ') || 'None'}

Fog Indicators:
${dm4Payload.fogIndicators?.join(', ') || 'None'}

Generate clarity-producing insight based on this analysis.`;

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
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      return res.status(500).json({ 
        error: 'Failed to generate insight',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const openaiData = await openaiResponse.json();
    const dm5OutputText = openaiData.choices?.[0]?.message?.content?.trim() || '';

    // Fail closed: empty or whitespace-only response
    if (!dm5OutputText || dm5OutputText.length === 0) {
      return res.status(502).json({ error: 'Empty response from OpenAI' });
    }

    // Return DM5 output
    return res.status(200).json({ dm5OutputText });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
