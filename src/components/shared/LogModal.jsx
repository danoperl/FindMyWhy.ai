// =============================================================================
// LogModal — View and Manage Log Entries
// FindMyWhy.ai v64.2
// =============================================================================

import React, { useState, useEffect } from 'react';
import { X, Clipboard, Check, Trash2, ArrowLeft, BookOpen } from 'lucide-react';
import { getLogEntries, deleteLogEntry, exportLogEntryMarkdown, exportLogEntryJson } from '../../lib/logbook.js';

export default function LogModal({ isOpen, onClose }) {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [copiedType, setCopiedType] = useState(null); // 'markdown' | 'json' | null
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load entries when modal opens
  useEffect(() => {
    if (isOpen) {
      setEntries(getLogEntries());
      setSelectedEntry(null);
      setCopiedType(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleCopy = async (entry, type) => {
    try {
      const text = type === 'markdown' 
        ? exportLogEntryMarkdown(entry)
        : exportLogEntryJson(entry);
      
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      console.error('[LogModal] Copy failed:', error);
      // Fallback: show textarea for manual copy
      alert('Copy failed. Please try again or use the export buttons.');
    }
  };

  const handleDelete = (entryId) => {
    if (deleteLogEntry(entryId)) {
      setEntries(getLogEntries());
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry(null);
      }
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncate = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">Logbook</h2>
            <span className="text-sm text-slate-500">({entries.length} entries)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* List View */}
          {!selectedEntry && (
            <div className="flex-1 overflow-y-auto p-6">
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No entries yet.</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Complete a QC or DM session and save it to see it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              entry.mode === 'DM'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {entry.mode}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {entry.title || truncate(entry.question, 50)}
                      </p>
                      {entry.excerpt && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {entry.excerpt}
                        </p>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Detail View */}
          {selectedEntry && (
            <div className="flex-1 overflow-y-auto p-6">
              <button
                onClick={() => setSelectedEntry(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back to list
              </button>

              <div className="space-y-4">
                {/* Header Info */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedEntry.mode === 'DM'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedEntry.mode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(selectedEntry.createdAt)}
                    </span>
                    {selectedEntry.failSoft && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        Fail-soft
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {selectedEntry.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-slate-700 italic">
                    "{selectedEntry.question}"
                  </p>
                </div>

                {/* Tags */}
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Domains */}
                {selectedEntry.domains && selectedEntry.domains.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      Domains
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedEntry.domains.join(', ')}
                    </p>
                  </div>
                )}

                {/* QC Content */}
                {selectedEntry.mode === 'QC' && (
                  <div className="space-y-4">
                    {selectedEntry.qcInputs && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          QC Inputs
                        </p>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                          {selectedEntry.qcInputs.qc1 && (
                            <p>
                              <span className="font-medium">QC1:</span>{' '}
                              {selectedEntry.qcInputs.qc1}
                            </p>
                          )}
                          {selectedEntry.qcInputs.qc2 && (
                            <p>
                              <span className="font-medium">QC2:</span>{' '}
                              {selectedEntry.qcInputs.qc2}
                            </p>
                          )}
                          {selectedEntry.qcInputs.qc3 && (
                            <p>
                              <span className="font-medium">QC3:</span>{' '}
                              {selectedEntry.qcInputs.qc3}
                            </p>
                          )}
                          {selectedEntry.qcInputs.qc4 && (
                            <p>
                              <span className="font-medium">QC4:</span>{' '}
                              {selectedEntry.qcInputs.qc4}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedEntry.qcOutputs && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          QC Results
                        </p>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                          {Object.entries(selectedEntry.qcOutputs).map(([key, value]) => (
                            value && (
                              <p key={key}>
                                <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                {value}
                              </p>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEntry.qcSignals && selectedEntry.qcSignals.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Signals
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntry.qcSignals.map((signal, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                            >
                              #{signal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEntry.qcTension && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Tension
                        </p>
                        <p className="text-sm text-slate-700">{selectedEntry.qcTension}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* DM Content */}
                {selectedEntry.mode === 'DM' && (
                  <div className="space-y-4">
                    {selectedEntry.whyChain && selectedEntry.whyChain.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          WHY Chain
                        </p>
                        <ol className="space-y-1 text-sm text-slate-700">
                          {selectedEntry.whyChain.map((why, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-slate-400">{i + 1}.</span>
                              <span>{why}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {selectedEntry.dm4Patterns && selectedEntry.dm4Patterns.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Patterns (DM4)
                        </p>
                        <div className="space-y-2">
                          {selectedEntry.dm4Patterns.map((pattern, i) => (
                            <div key={i} className="text-sm text-slate-700">
                              {typeof pattern === 'string' ? (
                                <p>• {pattern}</p>
                              ) : pattern && pattern.label ? (
                                <p>
                                  • {pattern.label}
                                  {pattern.strength && (
                                    <span className="text-slate-500 ml-2">
                                      ({pattern.strength})
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p>• {JSON.stringify(pattern)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEntry.dm5InsightText && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Insight (DM5)
                        </p>
                        <div className="bg-indigo-50 rounded-lg p-3 text-sm text-slate-800 whitespace-pre-wrap">
                          {selectedEntry.dm5InsightText}
                        </div>
                      </div>
                    )}

                    {selectedEntry.claritySnapshotText && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Clarity Snapshot (DM6)
                        </p>
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                          {selectedEntry.claritySnapshotText}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selectedEntry, 'markdown')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        copiedType === 'markdown'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {copiedType === 'markdown' ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} />
                          Copy Markdown
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(selectedEntry, 'json')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        copiedType === 'json'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {copiedType === 'json' ? (
                        <>
                          <Check size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} />
                          Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Entry
                  </button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 mb-3">
                      Are you sure you want to delete this entry?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(selectedEntry.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

