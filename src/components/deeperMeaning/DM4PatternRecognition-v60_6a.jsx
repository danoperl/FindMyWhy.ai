import React, { useState } from "react";

export default function DM4PatternRecognition_v60_6a() {
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState("");

  const FACETS = [
    "Avoidance",
    "Uncertainty",
    "Overthinking",
    "People-pleasing",
    "Control",
    "Fear of regret",
    "Lack of clarity",
    "Misalignment",
    "Identity tension",
    "Missing information",
  ];

  const toggleFacet = (facet) => {
    setSelected((prev) =>
      prev.includes(facet)
        ? prev.filter((f) => f !== facet)
        : [...prev, facet]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-sm font-semibold tracking-tight text-slate-100">
        DM4 · Pattern Recognition{" "}
        <span className="text-xs text-slate-400">v60.6a</span>
      </h3>

      <p className="text-xs text-slate-300">
        Based on your Why Chain so far, which themes or emotional patterns feel
        like they’re showing up here?
      </p>

      {/* Pattern chips */}
      <div className="flex flex-wrap gap-2">
        {FACETS.map((facet) => (
          <button
            key={facet}
            type="button"
            onClick={() => toggleFacet(facet)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              selected.includes(facet)
                ? "bg-emerald-600/80 text-white border-emerald-600"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
          >
            {facet}
          </button>
        ))}
      </div>

      {/* Notes box */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          What’s the pattern you’re noticing?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Summarize the emerging theme in your own words..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Summary card */}
      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">
          Snapshot
        </p>

        {selected.length === 0 && notes.trim().length === 0 ? (
          <p className="text-xs text-slate-500">
            Select a few patterns or write a brief summary to see the snapshot
            appear here.
          </p>
        ) : (
          <div className="space-y-1 text-xs text-slate-200">
            {selected.length > 0 && (
              <p>
                <span className="font-semibold text-slate-300">
                  Patterns flagged:
                </span>{" "}
                {selected.join(", ")}
              </p>
            )}
            {notes.trim().length > 0 && (
              <p>
                <span className="font-semibold text-slate-300">Theme:</span>{" "}
                {notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
