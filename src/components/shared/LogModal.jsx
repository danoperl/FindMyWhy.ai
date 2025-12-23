// =============================================================================
// LogModal — v64.3 Logbook UI
// FindMyWhy.ai — Local Reflection Logbook
// =============================================================================

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Clipboard, Trash2 } from 'lucide-react';
import { getLogEntries, updateLogEntry, deleteLogEntry, exportLogEntryMarkdown, exportLogEntryJson } from '../../lib/logbook.js';

export default function LogModal({ isOpen, onClose, onAskAgain, onExitToHome }) {
  const [entries, setEntries] = useState([]);
  const [modeFilter, setModeFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState(null);
  const [editingTagsFor, setEditingTagsFor] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [showSnapshots, setShowSnapshots] = useState({}); // entryId -> boolean
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [copiedType, setCopiedType] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset filters and load entries when modal opens
  useEffect(() => {
    if (isOpen) {
      setModeFilter("All");
      setTagFilter(null);
      setEditingTagsFor(null);
      setTagInput("");
      setShowSnapshots({});
      setSelectedEntryId(null);
      setCopiedType(null);
      setShowDeleteConfirm(false);
      setEntries(getLogEntries());
    }
  }, [isOpen]);

  // Filter entries by mode and tag
  const filteredEntries = entries.filter(entry => {
    // Handle missing mode field - default to "QC"
    const effectiveMode = entry.mode || "QC";
    const modeMatch = modeFilter === "All" || effectiveMode === modeFilter;
    
    // Tag filter: exact match only
    const tagMatch = !tagFilter || (entry.tags && Array.isArray(entry.tags) && entry.tags.includes(tagFilter));
    
    return modeMatch && tagMatch;
  });

  // Compute tag frequency counts
  const allTags = {};
  entries.forEach(entry => {
    if (entry.tags && Array.isArray(entry.tags)) {
      entry.tags.forEach(tag => {
        const trimmed = tag?.toString().trim();
        if (trimmed) {
          allTags[trimmed] = (allTags[trimmed] || 0) + 1;
        }
      });
    }
  });
  const sortedTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]);

  // Count entries by mode
  const qcCount = entries.filter(e => !e.mode || e.mode === "QC").length;
  const dmCount = entries.filter(e => e.mode === "DM").length;

  // Add tag to entry
  const addTag = (entryId) => {
    const trimmed = tagInput.trim();
    if (!trimmed || trimmed.length > 50) {
      setTagInput("");
      return;
    }

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    const currentTags = Array.isArray(entry.tags) ? [...entry.tags] : [];
    // Don't add duplicate tags
    if (currentTags.includes(trimmed)) {
      setTagInput("");
      setEditingTagsFor(null);
      return;
    }

    const updatedTags = [...currentTags, trimmed];
    if (updateLogEntry(entryId, { tags: updatedTags })) {
      setEntries(getLogEntries());
      setTagInput("");
      setEditingTagsFor(null);
    }
  };

  // Remove tag from entry
  const removeTag = (entryId, tagToRemove) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry || !Array.isArray(entry.tags)) return;

    const updatedTags = entry.tags.filter(t => t !== tagToRemove);
    if (updateLogEntry(entryId, { tags: updatedTags })) {
      setEntries(getLogEntries());
    }
  };

  // Format timestamp - handle malformed dates gracefully
  const formatTimestamp = (ts, includeTime = false) => {
    if (!ts) return "Unknown date";
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return "Unknown date";
      if (includeTime) {
        return date.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return "Unknown date";
    }
  };

  // Handle "Ask again" - route to appropriate flow
  const handleAskAgain = (entry) => {
    if (!onAskAgain) return;
    const mode = entry.mode || "QC";
    const question = entry.question || entry.title || "";
    onAskAgain(mode, question);
    onClose();
  };

  // Get display tags (deduplicate for display only, preserve storage)
  const getDisplayTags = (tags) => {
    if (!Array.isArray(tags)) return [];
    const seen = new Set();
    return tags.filter(t => {
      const str = t?.toString().trim();
      if (!str || seen.has(str)) return false;
      seen.add(str);
      return true;
    });
  };

  // Get snapshot text (de-emphasized)
  const getSnapshot = (entry) => {
    // Try various snapshot fields
    if (entry.snapshot) return entry.snapshot;
    if (entry.qcOutputs?.what_this_says_about_this_moment) return entry.qcOutputs.what_this_says_about_this_moment;
    if (entry.dm5InsightText) return entry.dm5InsightText;
    if (entry.claritySnapshotText) return entry.claritySnapshotText;
    return null;
  };

  // Get selected entry for Replay view
  const selectedEntry = entries.find(e => e.id === selectedEntryId) || null;

  // Handle copy to clipboard
  const handleCopy = async (entry, type) => {
    const text = type === 'markdown' ? exportLogEntryMarkdown(entry) : exportLogEntryJson(entry);
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Handle delete entry
  const handleDelete = (entryId) => {
    if (deleteLogEntry(entryId)) {
      setEntries(getLogEntries());
      setShowDeleteConfirm(false);
      setSelectedEntryId(null); // return to list
    }
  };

  // Helper to safely render values (strings, objects, arrays)
  const renderValue = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.map((item, i) => (
      <div key={i} className="mb-1">{renderValue(item)}</div>
    ));
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  };

  if (!isOpen) return null;

  // Handle close - route to home if handler provided, otherwise use onClose
  const handleClose = () => {
    if (onExitToHome) {
      onExitToHome();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-3xl font-semibold text-slate-900">📘 Logbook</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* LIST VIEW (v64.3 - unchanged) */}
        {!selectedEntryId && (
          <>
            {/* Filters */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                {["All", "QC", "DM"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setModeFilter(mode)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                      modeFilter === mode
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
                {tagFilter && (
                  <button
                    onClick={() => setTagFilter(null)}
                    className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 bg-white rounded-full hover:bg-slate-50 transition-all duration-200"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  {entries.length === 0 ? "No saved entries" : "No matches"}
                </div>
              ) : (
                <>
                  <div className="text-sm text-slate-500 mb-4">
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                  </div>
                  <div className="space-y-4">
                    {filteredEntries.map(entry => {
                      const effectiveMode = entry.mode || "QC";
                      const question = entry.question || entry.title || "";
                      const snapshot = getSnapshot(entry);
                      const displayTags = getDisplayTags(entry.tags);
                      const showSnapshot = showSnapshots[entry.id] || false;

                      return (
                        <div
                          key={entry.id}
                          className="border border-slate-200 rounded-lg p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                          onClick={(e) => {
                            // Don't trigger if clicking on interactive elements
                            if (e.target.closest('button') || e.target.closest('input')) return;
                            setSelectedEntryId(entry.id);
                            setShowDeleteConfirm(false);
                            setCopiedType(null);
                          }}
                        >
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 uppercase font-medium">
                                {effectiveMode}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatTimestamp(entry.createdAt || entry.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAskAgain(entry);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              Ask again
                            </button>
                          </div>

                          {/* Question */}
                          <div className="mb-3">
                            <p className="text-sm font-medium text-slate-900 break-words">
                              {question}
                            </p>
                          </div>

                          {/* Snapshot (de-emphasized, collapsible) */}
                          {snapshot && (
                            <div className="mb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSnapshots(prev => ({ ...prev, [entry.id]: !showSnapshot }));
                                }}
                                className="text-xs text-slate-500 hover:text-slate-700 mb-1"
                              >
                                {showSnapshot ? "Hide output" : "Show output"}
                              </button>
                              {showSnapshot && (
                                <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {snapshot}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 items-center">
                            {displayTags.map((tag, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
                              >
                                <span>{tag}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTag(entry.id, tag);
                                  }}
                                  className="text-slate-400 hover:text-slate-600 leading-none"
                                  aria-label="Remove tag"
                                >
                                  ×
                                </button>
                              </div>
                            ))}

                            {editingTagsFor === entry.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={tagInput}
                                  onChange={e => setTagInput(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addTag(entry.id);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingTagsFor(null);
                                      setTagInput("");
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  maxLength={50}
                                  autoFocus
                                  className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-24"
                                  placeholder="Tag name"
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addTag(entry.id);
                                  }}
                                  className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTagsFor(null);
                                    setTagInput("");
                                  }}
                                  className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTagsFor(entry.id);
                                  setTagInput("");
                                }}
                                className="px-2 py-1 text-xs text-slate-500 border border-slate-300 rounded hover:bg-white"
                              >
                                + Tag
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pattern Summary (visually secondary, counts only) */}
            {sortedTags.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-600 mb-2">Tag frequency</div>
                <div className="text-xs text-slate-500 mb-3">
                  QC · {qcCount} | DM · {dmCount}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sortedTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        tagFilter === tag
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {tag} · {count}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* REPLAY VIEW (v64.4 - DM6-style detail) */}
        {selectedEntryId && selectedEntry && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Entry content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
              {/* Back link */}
              <div>
                <button
                  onClick={() => {
                    setSelectedEntryId(null);
                    setShowDeleteConfirm(false);
                    setCopiedType(null);
                  }}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to list
                </button>
              </div>

              {/* Meta row: mode pill + date + fail-soft pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedEntry.mode === 'DM' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {selectedEntry.mode || 'QC'}
                </span>
                <span className="text-xs text-slate-500">
                  {formatTimestamp(selectedEntry.createdAt || selectedEntry.timestamp, true)}
                </span>
                {selectedEntry.failSoft && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    Fail-soft
                  </span>
                )}
              </div>

              {/* Title line */}
              {(selectedEntry.question || selectedEntry.title) && (
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900 break-words mb-2">
                    {selectedEntry.question || selectedEntry.title}
                  </h2>
                  {selectedEntry.question && selectedEntry.title && selectedEntry.question !== selectedEntry.title && (
                    <p className="text-sm text-slate-600 italic">
                      {selectedEntry.question}
                    </p>
                  )}
                </div>
              )}

              {/* DOMAINS */}
              {selectedEntry.domains && Array.isArray(selectedEntry.domains) && selectedEntry.domains.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">DOMAINS</h3>
                  <div className="text-sm text-slate-700">
                    {selectedEntry.domains.map((domain, idx) => (
                      <span key={idx}>
                        {idx > 0 && ', '}
                        {typeof domain === 'string' && domain.includes(':') ? domain.split(':')[1] : domain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* WHY Chain (DM3) */}
              {selectedEntry.whyChain && Array.isArray(selectedEntry.whyChain) && selectedEntry.whyChain.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">WHY CHAIN</h3>
                  <div className="space-y-2">
                    {selectedEntry.whyChain.map((why, idx) => (
                      <div key={idx} className="text-sm text-slate-700 leading-relaxed">
                        {idx + 1}. {renderValue(why)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns (DM4) */}
              {selectedEntry.dm4Patterns && Array.isArray(selectedEntry.dm4Patterns) && selectedEntry.dm4Patterns.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">PATTERNS (DM4)</h3>
                  <div className="space-y-1">
                    {selectedEntry.dm4Patterns.map((pattern, idx) => (
                      <div key={idx} className="text-sm text-slate-700">
                        • {renderValue(pattern)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insight (DM5) */}
              {selectedEntry.dm5InsightText && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">INSIGHT (DM5)</h3>
                  <div className="bg-indigo-50 rounded-lg p-3 text-sm text-slate-800 whitespace-pre-wrap">
                    {renderValue(selectedEntry.dm5InsightText)}
                  </div>
                </div>
              )}

              {/* Clarity Snapshot (DM6) */}
              {selectedEntry.claritySnapshotText && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">CLARITY SNAPSHOT (DM6)</h3>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {renderValue(selectedEntry.claritySnapshotText)}
                  </div>
                </div>
              )}

              {/* QC-specific fields */}
              {selectedEntry.mode === 'QC' && (
                <>
                  {selectedEntry.qcInputs && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">QC INPUTS</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        {selectedEntry.qcInputs.qc1 && <div>QC1: {renderValue(selectedEntry.qcInputs.qc1)}</div>}
                        {selectedEntry.qcInputs.qc2 && <div>QC2: {renderValue(selectedEntry.qcInputs.qc2)}</div>}
                        {selectedEntry.qcInputs.qc3 && <div>QC3: {renderValue(selectedEntry.qcInputs.qc3)}</div>}
                        {selectedEntry.qcInputs.qc4 && <div>QC4: {renderValue(selectedEntry.qcInputs.qc4)}</div>}
                      </div>
                    </div>
                  )}
                  {selectedEntry.qcOutputs && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2">QC OUTPUTS</h3>
                      <div className="space-y-1 text-sm text-slate-700">
                        {Object.entries(selectedEntry.qcOutputs).map(([key, value]) => (
                          value && (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {renderValue(value)}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions block */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => handleCopy(selectedEntry, 'markdown')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <Clipboard size={16} />
                    {copiedType === 'markdown' ? 'Copied!' : 'Copy as text'}
                  </button>
                  <button
                    onClick={() => handleCopy(selectedEntry, 'json')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <Clipboard size={16} />
                    {copiedType === 'json' ? 'Copied!' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Delete Entry
                  </button>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 mb-3">Are you sure you want to delete this entry? This cannot be undone.</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleDelete(selectedEntry.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
