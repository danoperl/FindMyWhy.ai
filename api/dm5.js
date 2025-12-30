// =============================================================================
// DM5 v1 API Route — Insight Generation Layer
// FindMyWhy.ai v62.0
// =============================================================================

import { DM5_V1_SYSTEM_PROMPT } from './prompts/dm5_v1_system_prompt.js';
import { rewriteFilterV1, logFilterExecution } from '../lib/languageGovernance/rewriteFilter_v1.js';

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
  // [INSTRUMENTATION] Log handler entry
  console.log(`[DM5] HIT ${new Date().toISOString()}`);

  // Only allow POST
  if (req.method !== 'POST') {
    console.log('[DM5] FALLBACK PATH USED');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    const { dm4PayloadJson } = req.body;
    
    if (!dm4PayloadJson) {
      console.log('[DM5] FALLBACK PATH USED');
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
        console.log('[DM5] FALLBACK PATH USED');
        return res.status(400).json({ error: 'Invalid JSON in dm4PayloadJson' });
      }
    } else if (typeof dm4PayloadJson === 'object') {
      try {
        payloadString = JSON.stringify(dm4PayloadJson);
        dm4Payload = dm4PayloadJson;
      } catch (stringifyError) {
        console.log('[DM5] FALLBACK PATH USED');
        return res.status(400).json({ error: 'Failed to stringify dm4PayloadJson' });
      }
    } else {
      console.log('[DM5] FALLBACK PATH USED');
      return res.status(400).json({ error: 'dm4PayloadJson must be a string or object' });
    }

    // Validate payload is not empty
    if (!payloadString || payloadString.trim().length === 0) {
      console.log('[DM5] FALLBACK PATH USED');
      return res.status(400).json({ error: 'dm4PayloadJson is empty' });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('[DM5] FALLBACK PATH USED');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Validate SYSTEM_PROMPT is present and substantial
    const SYSTEM_PROMPT = DM5_V1_SYSTEM_PROMPT.trim();
    if (!SYSTEM_PROMPT || SYSTEM_PROMPT.length < 2000) {
      console.log('[DM5] FALLBACK PATH USED');
      return res.status(500).json({ error: 'SYSTEM_PROMPT missing or invalid' });
    }

    // Model configurable via env (default: gpt-4o-mini)
    const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

    // Format domain labels for display
    const formatDomainLabel = (domain) => {
      const labelMap = {
        work: 'Work',
        relationships: 'Relationships',
        identity: 'Identity',
        habit: 'Habit',
        purpose: 'Purpose',
        values: 'Values',
        other: 'Other',
      };
      // Handle "other:specify" format by extracting just "other"
      const baseDomain = domain.includes(':') ? domain.split(':')[0] : domain;
      return labelMap[baseDomain] || 'Other';
    };

    // Build domains context line if domains exist
    let domainsContextLine = '';
    if (dm4Payload.domains && Array.isArray(dm4Payload.domains) && dm4Payload.domains.length > 0) {
      const domainLabels = dm4Payload.domains.map(formatDomainLabel);
      domainsContextLine = `Domains involved: ${domainLabels.join(', ')}.\n\n`;
    }

    // Build user message from DM4 payload
    const userMessage = `DM4 Analysis Data:

Surface Question: ${dm4Payload.surfaceQuestion || 'Not provided'}

${domainsContextLine}WHY Chain:
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

    // [INSTRUMENTATION] Log before OpenAI API call
    console.log('[DM5] CALLING OPENAI');

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
      console.log('[DM5] FALLBACK PATH USED');
      const errorData = await openaiResponse.json().catch(() => ({}));
      return res.status(500).json({ 
        error: 'Failed to generate insight',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    // [INSTRUMENTATION] Log successful OpenAI response
    console.log('[DM5] OPENAI OK');

    const openaiData = await openaiResponse.json();
    const dm5OutputTextRaw = openaiData.choices?.[0]?.message?.content?.trim() || '';

    // Fail closed: empty or whitespace-only response
    if (!dm5OutputTextRaw || dm5OutputTextRaw.length === 0) {
      console.log('[DM5] FALLBACK PATH USED');
      return res.status(502).json({ error: 'Empty response from OpenAI' });
    }

    // ========================================================================
    // REWRITE FILTER V1 — ENFORCEMENT (MANDATORY, NON-BYPASSABLE)
    // ========================================================================
    // Build user input text from DM4 payload for value-definition checks
    const userInputText = payloadString; // Use the full DM4 payload as user input context
    
    // Apply Rewrite Filter v1
    const filterResult = rewriteFilterV1({
      model_output_text: dm5OutputTextRaw,
      user_input_text: userInputText,
      system_prompt_version: 'OAI_SYS_v68.4',
      model_name: OPENAI_MODEL,
    });

    // Log filter execution
    logFilterExecution({
      ...filterResult.log_data,
      endpoint: 'dm5',
    });

    // [INSTRUMENTATION] Log filter result
    console.log(`[DM5] REWRITE_FILTER_V1: ${filterResult.outcome} (${filterResult.reason_code})`);

    // Use filtered/fallback text - client must never see rejected or unfiltered text
    const dm5OutputText = filterResult.final_text;

    // [INSTRUMENTATION] Add metadata to response indicating OpenAI was used
    // Return DM5 output with instrumentation metadata
    return res.status(200).json({ 
      dm5OutputText,
      dm5Meta: {
        source: 'openai',
        model: OPENAI_MODEL,
        filter_applied: true,
        filter_version: 'RF_v1',
        filter_outcome: filterResult.outcome,
        filter_reason_code: filterResult.reason_code,
      }
    });

  } catch (error) {
    console.log('[DM5] FALLBACK PATH USED');
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
