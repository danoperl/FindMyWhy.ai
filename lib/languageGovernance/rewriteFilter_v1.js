// =============================================================================
// Rewrite Filter v1 — Enforcement Module
// FindMyWhy.ai
// Version: RF_v1
// Status: LOCK CANDIDATE
// =============================================================================
//
// This module enforces OAI_SYS_v68.4 compliance by deterministically
// inspecting model output and either passing, rewriting, or rejecting it.
//
// AUTHORITATIVE SOURCES:
// - RF_v1.rewrite_filter.spec.txt (logic)
// - RF_v1.tokens.txt (token tables)
//
// DO NOT MODIFY without version bump.
// =============================================================================

// =============================================================================
// TOKEN TABLES — RF_v1.tokens (EXACT AS SPECIFIED)
// =============================================================================

const A_SERIES_TOKENS = {
  A1: [
    /\b(i hear you|i hear that|i'm glad you said|i'm glad you said|that sounds hard|that must be hard)\b/i,
    /\b(you are not broken|you're not broken|this is normal|that's normal|you'll be okay|you will be okay)\b/i,
    /\b(i'm here with you|i am here with you|i can stay with you|we can do this together)\b/i,
    /\b(reassure|reassurance|comfort|support|grounded|steady)\b/i,
    /\b(take a breath|slow breath|deep breath|feel your feet|relax your shoulders|drop your shoulders)\b/i,
  ],
  A2: [
    /\b(try|consider|focus on|work on|you should|you could|you might want to)\b/i,
    /\b(one thing you can do|a good next step|start by|the best way)\b/i,
    /\?/g, // Question mark - matches anywhere
  ],
  A3: [
    /\b(i want to help|i can help|i'm here to help|i'm here for you)\b/i,
    /\b(as your guide|as your coach|as your therapist|as an assistant)\b/i,
    /\b(let's|we can|we'll)\b/i,
  ],
};

const B_SERIES_TOKENS = {
  B1: [
    /\b(maybe|perhaps|it seems|it could be|one possibility|this may suggest|likely|probably)\b/i,
  ],
  B2: [
    /\b(better|worse|healthier|unhealthier|more authentic|more evolved|higher consciousness)\b/i,
  ],
  B3: [
    /\b(because|due to|driven by|caused by).*(fear|avoidance|discomfort|anxiety|resistance|relief)\b/i,
  ],
  B4: [
    /\b(it makes sense|understandable|reasonable to feel|naturally)\b/i,
  ],
};

// =============================================================================
// FALLBACK TEXTS (FIXED, AS PER SPEC)
// =============================================================================

const FALLBACK_A_INSUFFICIENT_OBSERVABLES = `The patterns here are not yet clear enough to state with certainty. More specific observations would be needed.`;

const FALLBACK_B_MINIMAL_TRADEOFF_FRAME = `A pattern is present, but the underlying mechanism requires clearer articulation.`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Checks if text matches any A-series token
 * @param {string} text - Text to check
 * @returns {string|null} - Matching A-code (A1, A2, A3) or null
 */
function checkASeries(text) {
  // Check for question mark first (A2) - global match
  if (/\?/.test(text)) {
    return 'A2';
  }

  // Check A1 tokens
  for (const pattern of A_SERIES_TOKENS.A1) {
    if (pattern.test(text)) {
      return 'A1';
    }
  }

  // Check A2 tokens (excluding question mark, already checked)
  for (const pattern of A_SERIES_TOKENS.A2) {
    if (pattern !== /\?/g && pattern.test(text)) {
      return 'A2';
    }
  }

  // Check A3 tokens
  for (const pattern of A_SERIES_TOKENS.A3) {
    if (pattern.test(text)) {
      return 'A3';
    }
  }

  return null;
}

/**
 * Checks if a value term is explicitly defined in user input
 * @param {string} valueTerm - The value term to check (e.g., "better", "healthier")
 * @param {string} userInput - User input text to search in
 * @returns {boolean}
 */
function isValueDefinedInUserInput(valueTerm, userInput) {
  if (!userInput || !valueTerm) return false;
  // Simple check: does user input contain the value term or related definitions?
  // This is a basic implementation - may need refinement based on actual use cases
  const normalizedInput = userInput.toLowerCase();
  const normalizedTerm = valueTerm.toLowerCase();
  return normalizedInput.includes(normalizedTerm);
}

/**
 * Removes hedge terms (B1)
 * @param {string} text - Text to process
 * @returns {string} - Text with hedge terms removed
 */
function removeHedgeTerms(text) {
  let result = text;
  for (const pattern of B_SERIES_TOKENS.B1) {
    result = result.replace(pattern, '').trim();
  }
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

/**
 * Removes B3 causal clauses
 * @param {string} text - Text to process
 * @returns {string} - Text with causal clauses removed
 */
function removeCausalClauses(text) {
  let result = text;
  for (const pattern of B_SERIES_TOKENS.B3) {
    result = result.replace(pattern, '').trim();
  }
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

/**
 * Removes B4 tone softening phrases
 * @param {string} text - Text to process
 * @returns {string} - Text with phrases removed
 */
function removeToneSoftening(text) {
  let result = text;
  for (const pattern of B_SERIES_TOKENS.B4) {
    result = result.replace(pattern, '').trim();
  }
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

/**
 * Checks if sentence/text can stand without removed content
 * Simple heuristic: must have at least one word after cleanup
 * @param {string} text - Text to check
 * @returns {boolean}
 */
function isNonEmptyAfterCleanup(text) {
  if (!text) return false;
  const cleaned = text.trim();
  if (cleaned.length === 0) return false;
  // Must have at least one word
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  return words.length > 0;
}

/**
 * Checks for required structural sections (per spec)
 * This is a simplified check - may need refinement based on actual output format
 * @param {string} text - Text to check
 * @returns {boolean}
 */
function hasRequiredStructure(text) {
  // Per spec, output must contain in order:
  // 1. Observable pattern
  // 2. Structural / sequence mechanism
  // 3. Neutral tradeoff (buy and cost)
  // 4. Agency-preserving close
  //
  // This is a placeholder implementation that checks for basic structure.
  // In practice, this may need pattern matching or more sophisticated parsing.
  // For now, we'll do a basic check: text must be non-empty and substantive.
  
  if (!text || text.trim().length < 10) return false;
  
  // TODO: Implement more sophisticated structural checks if needed
  // For initial implementation, we'll do a basic validation
  // This should be enhanced based on actual output patterns
  
  return true;
}

// =============================================================================
// MAIN FILTER FUNCTION
// =============================================================================

/**
 * Rewrite Filter v1 — Main evaluation function
 * @param {Object} params
 * @param {string} params.model_output_text - Model output to filter
 * @param {string} [params.user_input_text] - User input (for value-definition checks)
 * @param {string} [params.system_prompt_version] - System prompt version (default: OAI_SYS_v68.4)
 * @param {string} [params.model_name] - Model name (for logging)
 * @returns {Object} - { outcome, reason_code, final_text, log_data }
 */
export function rewriteFilterV1({
  model_output_text,
  user_input_text = '',
  system_prompt_version = 'OAI_SYS_v68.4',
  model_name = 'unknown',
}) {
  const startTime = Date.now();
  
  // Initialize log data
  const logData = {
    system_prompt_version,
    rewrite_filter_version: 'RF_v1',
    token_table_version: 'RF_v1.tokens',
    model_name,
    timestamp: new Date().toISOString(),
    outcome: null,
    reason_code: null,
  };

  // Validate input
  if (!model_output_text || typeof model_output_text !== 'string') {
    logData.outcome = 'REJECT';
    logData.reason_code = 'REJECT_INVALID_INPUT';
    return {
      outcome: 'REJECT',
      reason_code: 'REJECT_INVALID_INPUT',
      final_text: FALLBACK_A_INSUFFICIENT_OBSERVABLES,
      log_data: logData,
    };
  }

  const text = model_output_text.trim();
  if (text.length === 0) {
    logData.outcome = 'REJECT';
    logData.reason_code = 'REJECT_EMPTY';
    return {
      outcome: 'REJECT',
      reason_code: 'REJECT_EMPTY',
      final_text: FALLBACK_A_INSUFFICIENT_OBSERVABLES,
      log_data: logData,
    };
  }

  // ========================================================================
  // STAGE 1 — A-SERIES HARD REJECT
  // ========================================================================
  const aSeriesMatch = checkASeries(text);
  if (aSeriesMatch) {
    logData.outcome = 'REJECT';
    logData.reason_code = `REJECT_${aSeriesMatch}`;
    
    // Route to fallback based on rules
    // Use Fallback A if no clear pattern, Fallback B otherwise
    const final_text = hasRequiredStructure(text) 
      ? FALLBACK_B_MINIMAL_TRADEOFF_FRAME 
      : FALLBACK_A_INSUFFICIENT_OBSERVABLES;
    
    return {
      outcome: 'REJECT',
      reason_code: `REJECT_${aSeriesMatch}`,
      final_text,
      log_data: logData,
    };
  }

  // ========================================================================
  // STAGE 2 — B-SERIES REWRITE / REJECT
  // ========================================================================
  let rewrittenText = text;
  let rewriteOccurred = false;
  let rewriteReason = null;

  // B1 — Hedging / speculation
  for (const pattern of B_SERIES_TOKENS.B1) {
    if (pattern.test(rewrittenText)) {
      const beforeRewrite = rewrittenText;
      rewrittenText = removeHedgeTerms(rewrittenText);
      if (!isNonEmptyAfterCleanup(rewrittenText) || rewrittenText.length < beforeRewrite.length * 0.5) {
        // Sentence collapsed, reject
        logData.outcome = 'REJECT';
        logData.reason_code = 'REJECT_B1';
        return {
          outcome: 'REJECT',
          reason_code: 'REJECT_B1',
          final_text: FALLBACK_A_INSUFFICIENT_OBSERVABLES,
          log_data: logData,
        };
      }
      rewriteOccurred = true;
      rewriteReason = 'REWRITE_B1';
    }
  }

  // B2 — Value hierarchy leakage
  for (const pattern of B_SERIES_TOKENS.B2) {
    const matches = rewrittenText.match(pattern);
    if (matches) {
      const valueTerm = matches[0];
      if (!isValueDefinedInUserInput(valueTerm, user_input_text)) {
        // Value not defined, reject
        logData.outcome = 'REJECT';
        logData.reason_code = 'REJECT_B2';
        return {
          outcome: 'REJECT',
          reason_code: 'REJECT_B2',
          final_text: FALLBACK_B_MINIMAL_TRADEOFF_FRAME,
          log_data: logData,
        };
      }
      // If defined, rewrite by neutral restatement only (per spec)
      // Note: "neutral restatement" is not fully specified in the token table.
      // Current implementation: if value is defined in user input, allow it through
      // (which is effectively a pass with acknowledgment of rewrite requirement).
      // This may need refinement to perform actual neutral word substitution
      // based on predefined neutral substitution list.
      rewriteOccurred = true;
      if (!rewriteReason) rewriteReason = 'REWRITE_B2';
    }
  }

  // B3 — Internal state as cause
  for (const pattern of B_SERIES_TOKENS.B3) {
    if (pattern.test(rewrittenText)) {
      const beforeRewrite = rewrittenText;
      rewrittenText = removeCausalClauses(rewrittenText);
      if (!isNonEmptyAfterCleanup(rewrittenText) || rewrittenText.length < beforeRewrite.length * 0.5) {
        // Mechanism collapsed, reject
        logData.outcome = 'REJECT';
        logData.reason_code = 'REJECT_B3';
        return {
          outcome: 'REJECT',
          reason_code: 'REJECT_B3',
          final_text: FALLBACK_A_INSUFFICIENT_OBSERVABLES,
          log_data: logData,
        };
      }
      rewriteOccurred = true;
      if (!rewriteReason) rewriteReason = 'REWRITE_B3';
    }
  }

  // B4 — Tone softening / validation
  for (const pattern of B_SERIES_TOKENS.B4) {
    if (pattern.test(rewrittenText)) {
      const beforeRewrite = rewrittenText;
      rewrittenText = removeToneSoftening(rewrittenText);
      if (!isNonEmptyAfterCleanup(rewrittenText)) {
        // Sentence empty, reject
        logData.outcome = 'REJECT';
        logData.reason_code = 'REJECT_B4';
        return {
          outcome: 'REJECT',
          reason_code: 'REJECT_B4',
          final_text: FALLBACK_B_MINIMAL_TRADEOFF_FRAME,
          log_data: logData,
        };
      }
      rewriteOccurred = true;
      if (!rewriteReason) rewriteReason = 'REWRITE_B4';
    }
  }

  // ========================================================================
  // STAGE 3 — STRUCTURAL CHECKS
  // ========================================================================
  const textToCheck = rewriteOccurred ? rewrittenText : text;
  if (!hasRequiredStructure(textToCheck)) {
    logData.outcome = 'REJECT';
    logData.reason_code = 'REJECT_STRUCT';
    return {
      outcome: 'REJECT',
      reason_code: 'REJECT_STRUCT',
      final_text: FALLBACK_A_INSUFFICIENT_OBSERVABLES,
      log_data: logData,
    };
  }

  // ========================================================================
  // STAGE 4 — PASS
  // ========================================================================
  logData.outcome = rewriteOccurred ? 'REWRITE' : 'PASS';
  logData.reason_code = rewriteReason || 'PASS';

  return {
    outcome: rewriteOccurred ? 'REWRITE' : 'PASS',
    reason_code: rewriteReason || 'PASS',
    final_text: rewriteOccurred ? rewrittenText : text,
    log_data: logData,
  };
}

// =============================================================================
// LOGGING FUNCTION
// =============================================================================

/**
 * Logs filter execution results
 * @param {Object} logData - Log data from filter
 */
export function logFilterExecution(logData) {
  // Server-side logging - console.log for Vercel serverless functions
  console.log('[REWRITE_FILTER_V1]', JSON.stringify(logData, null, 2));
  
  // TODO: If additional logging infrastructure is needed (e.g., external service),
  // add it here. For now, console.log is sufficient for Vercel.
}

// =============================================================================
// EXPORT FOR TESTING
// =============================================================================

export {
  A_SERIES_TOKENS,
  B_SERIES_TOKENS,
  FALLBACK_A_INSUFFICIENT_OBSERVABLES,
  FALLBACK_B_MINIMAL_TRADEOFF_FRAME,
};

