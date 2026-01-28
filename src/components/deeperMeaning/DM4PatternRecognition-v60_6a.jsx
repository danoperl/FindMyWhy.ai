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
      <h3 className="fmy-h2 text-xl text-gray-900">
        DM4 · Pattern Recognition{" "}
        <span className="text-xs font-manrope font-light text-gray-500">v60.6a</span>
      </h3>

      <p className="text-xs font-manrope font-light text-[#4d4d4d]">
        Based on your Why Chain so far, which themes or emotional patterns feel
        like they're showing up here?
      </p>

      {/* Pattern chips */}
      <div className="flex flex-wrap gap-2">
        {FACETS.map((facet) => (
          <button
            key={facet}
            type="button"
            onClick={() => toggleFacet(facet)}
            className={`px-3 py-1 rounded-full text-xs font-manrope font-extrabold border transition-colors ${
              selected.includes(facet)
                ? "bg-[#442cd8] text-white border-[#442cd8]"
                : "bg-white text-[#4d4d4d] border-gray-300 hover:border-[#442cd8]"
            }`}
          >
            {facet}
          </button>
        ))}
      </div>

      {/* Notes box */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          What's the pattern you're noticing?
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Summarize the emerging theme in your own words..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Summary card */}
      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[11px] font-manrope font-light uppercase tracking-wide text-[#4d4d4d] mb-1">
          Snapshot
        </p>

        {selected.length === 0 && notes.trim().length === 0 ? (
          <p className="text-xs font-manrope font-light text-[#4d4d4d]">
            Select a few patterns or write a brief summary to see the snapshot
            appear here.
          </p>
        ) : (
          <div className="space-y-1 text-xs font-manrope font-light text-[#4d4d4d]">
            {selected.length > 0 && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">
                  Patterns flagged:
                </span>{" "}
                {selected.join(", ")}
              </p>
            )}
            {notes.trim().length > 0 && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Theme:</span>{" "}
                {notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
