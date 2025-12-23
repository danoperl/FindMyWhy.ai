// =============================================================================
// Logbook Service — Local-first Session Storage
// FindMyWhy.ai v64.2
// =============================================================================

const STORAGE_KEY = 'fmy_logbook_v1';
const MAX_ENTRIES = 200;

/**
 * Generate a UUID using crypto.randomUUID() or fallback
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate a log entry has required fields
 */
function validateLogEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (!entry.id || typeof entry.id !== 'string') return false;
  if (!entry.createdAt || typeof entry.createdAt !== 'string') return false;
  if (!entry.mode || (entry.mode !== 'QC' && entry.mode !== 'DM')) return false;
  if (!entry.question || typeof entry.question !== 'string') return false;
  return true;
}

/**
 * Validate entry for reading (more lenient - allows missing mode, defaults to QC)
 */
function validateLogEntryForRead(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (!entry.id || typeof entry.id !== 'string') return false;
  // createdAt is optional for backward compatibility, but preferred
  if (entry.createdAt && typeof entry.createdAt !== 'string') return false;
  // mode is optional - defaults to "QC" per v64.3 contract
  if (entry.mode && entry.mode !== 'QC' && entry.mode !== 'DM') return false;
  // question or title required
  if (!entry.question && !entry.title) return false;
  if (entry.question && typeof entry.question !== 'string') return false;
  if (entry.title && typeof entry.title !== 'string') return false;
  return true;
}

/**
 * Get all log entries, sorted newest-first
 * Uses lenient validation for backward compatibility
 */
export function getLogEntries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const entries = JSON.parse(stored);
    if (!Array.isArray(entries)) return [];
    
    // Filter out invalid entries and sort by createdAt (newest first)
    // Use lenient validation for reading
    const validEntries = entries.filter(validateLogEntryForRead);
    return validEntries.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.timestamp || 0);
      const dateB = new Date(b.createdAt || b.timestamp || 0);
      return dateB - dateA; // Descending (newest first)
    });
  } catch (error) {
    console.error('[Logbook] Error reading entries:', error);
    return [];
  }
}

/**
 * Save a new log entry (inserts at top, caps list length)
 */
export function saveLogEntry(entry) {
  try {
    // Validate entry
    if (!validateLogEntry(entry)) {
      console.error('[Logbook] Invalid entry, not saving:', entry);
      return false;
    }
    
    // Get existing entries
    const existing = getLogEntries();
    
    // Check for duplicate by id
    const isDuplicate = existing.some(e => e.id === entry.id);
    if (isDuplicate) {
      console.warn('[Logbook] Duplicate entry detected, skipping save:', entry.id);
      return false;
    }
    
    // Insert at top (newest first)
    const updated = [entry, ...existing];
    
    // Cap at MAX_ENTRIES
    const capped = updated.slice(0, MAX_ENTRIES);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
    return true;
  } catch (error) {
    console.error('[Logbook] Error saving entry:', error);
    return false;
  }
}

/**
 * Delete a log entry by id
 */
export function deleteLogEntry(id) {
  try {
    const entries = getLogEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('[Logbook] Error deleting entry:', error);
    return false;
  }
}

/**
 * Update an existing log entry (for tag editing)
 * Only updates fields that are provided; preserves all other fields
 */
export function updateLogEntry(id, updates) {
  try {
    const entries = getLogEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) {
      console.warn('[Logbook] Entry not found for update:', id);
      return false;
    }
    
    // Merge updates into existing entry
    const updated = { ...entries[index], ...updates };
    
    // Replace entry in array
    const updatedEntries = [...entries];
    updatedEntries[index] = updated;
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('[Logbook] Error updating entry:', error);
    return false;
  }
}

/**
 * Export a log entry as Markdown
 */
export function exportLogEntryMarkdown(entry) {
  if (!entry || !validateLogEntry(entry)) {
    return '# Invalid Entry\n\nThis entry could not be exported.';
  }
  
  const lines = [];
  
  // Header
  lines.push('# FindMyWhy.ai Log Entry');
  lines.push('');
  
  // Metadata
  const date = new Date(entry.createdAt);
  lines.push(`**Created:** ${date.toLocaleString()}`);
  lines.push(`**Mode:** ${entry.mode}`);
  lines.push(`**Title:** ${entry.title || 'Untitled'}`);
  lines.push(`**Question:** ${entry.question}`);
  lines.push('');
  
  // Tags
  if (entry.tags && entry.tags.length > 0) {
    lines.push(`**Tags:** ${entry.tags.join(', ')}`);
    lines.push('');
  }
  
  // Domains (if present)
  if (entry.domains && entry.domains.length > 0) {
    lines.push(`**Domains:** ${entry.domains.join(', ')}`);
    lines.push('');
  }
  
  // Mode-specific sections
  if (entry.mode === 'QC') {
    // QC Inputs
    if (entry.qcInputs) {
      lines.push('## QC Inputs');
      if (entry.qcInputs.qc1) lines.push(`- **QC1 (Decision):** ${entry.qcInputs.qc1}`);
      if (entry.qcInputs.qc2) lines.push(`- **QC2 (Choice Frame):** ${entry.qcInputs.qc2}`);
      if (entry.qcInputs.qc3) lines.push(`- **QC3 (Influences):** ${entry.qcInputs.qc3}`);
      if (entry.qcInputs.qc4) lines.push(`- **QC4 (Forced Pick):** ${entry.qcInputs.qc4}`);
      lines.push('');
    }
    
    // QC Results
    if (entry.qcOutputs) {
      lines.push('## QC Results');
      if (entry.qcOutputs.distilled_choice) {
        lines.push(`- **Distilled Choice:** ${entry.qcOutputs.distilled_choice}`);
      }
      if (entry.qcOutputs.what_influenced_it) {
        lines.push(`- **What Influenced It:** ${entry.qcOutputs.what_influenced_it}`);
      }
      if (entry.qcOutputs.instinctual_pull) {
        lines.push(`- **Instinctual Pull:** ${entry.qcOutputs.instinctual_pull}`);
      }
      if (entry.qcOutputs.what_this_says_about_this_moment) {
        lines.push(`- **What This Says About This Moment:** ${entry.qcOutputs.what_this_says_about_this_moment}`);
      }
      if (entry.qcOutputs.reframe_want) {
        lines.push(`- **Reframe (Want):** ${entry.qcOutputs.reframe_want}`);
      }
      if (entry.qcOutputs.reframe_need) {
        lines.push(`- **Reframe (Need):** ${entry.qcOutputs.reframe_need}`);
      }
      lines.push('');
    }
    
    // Signals
    if (entry.qcSignals && entry.qcSignals.length > 0) {
      lines.push('## Signals');
      entry.qcSignals.forEach(signal => lines.push(`- ${signal}`));
      lines.push('');
    }
    
    // Tension
    if (entry.qcTension) {
      lines.push(`## Tension\n\n${entry.qcTension}`);
      lines.push('');
    }
  } else if (entry.mode === 'DM') {
    // WHY Chain
    if (entry.whyChain && entry.whyChain.length > 0) {
      lines.push('## WHY Chain');
      entry.whyChain.forEach((why, i) => {
        lines.push(`${i + 1}. ${why}`);
      });
      lines.push('');
    }
    
    // Patterns (DM4)
    if (entry.dm4Patterns && entry.dm4Patterns.length > 0) {
      lines.push('## Patterns (DM4)');
      entry.dm4Patterns.forEach(pattern => {
        // Handle both string and object patterns
        if (typeof pattern === 'string') {
          lines.push(`- ${pattern}`);
        } else if (pattern && pattern.label) {
          lines.push(`- ${pattern.label}${pattern.strength ? ` (${pattern.strength})` : ''}`);
        } else {
          lines.push(`- ${JSON.stringify(pattern)}`);
        }
      });
      lines.push('');
    }
    
    // Insight (DM5)
    if (entry.dm5InsightText) {
      lines.push('## Insight (DM5)');
      lines.push('');
      lines.push(entry.dm5InsightText);
      lines.push('');
    }
    
    // Clarity Snapshot (DM6)
    if (entry.claritySnapshotText) {
      lines.push('## Clarity Snapshot (DM6)');
      lines.push('');
      lines.push('```');
      lines.push(entry.claritySnapshotText);
      lines.push('```');
      lines.push('');
    }
  }
  
  // Fail-soft indicator
  lines.push(`**Fail-soft:** ${entry.failSoft ? 'true' : 'false'}`);
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Export a log entry as JSON
 */
export function exportLogEntryJson(entry) {
  if (!entry || !validateLogEntry(entry)) {
    return JSON.stringify({ error: 'Invalid entry' }, null, 2);
  }
  
  return JSON.stringify(entry, null, 2);
}

