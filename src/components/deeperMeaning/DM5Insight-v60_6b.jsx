import React, { useState } from "react";

export default function DM5Insight_v60_6b() {
  const [insight, setInsight] = useState("");
  const [reflection, setReflection] = useState("");

  const SUGGESTIONS = [
    "It sounds like you're protecting something important to you.",
    "It seems like this decision touches a deeper value or fear.",
    "Something about this situation feels misaligned with who you want to be.",
    "There may be a hidden expectation you're carrying.",
    "This feels connected to a story you’ve been telling yourself for a long time.",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="fmy-h2 text-xl text-gray-900">
        DM5 · Insight{" "}
        <span className="text-xs font-manrope font-light text-gray-500">v60.6b</span>
      </h3>

      <p className="text-xs font-manrope font-light text-[#4d4d4d]">
        Based on the Why Chain and the patterns you noticed, what deeper meaning
        or theme is emerging for you?
      </p>

      {/* Insight text area */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          What's the deeper realization or truth here?
        </label>
        <textarea
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          rows={3}
          placeholder="E.g., I'm afraid of losing stability, and this decision threatens a story I've told myself about responsibility."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Optional guiding reflection */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          If you were to look underneath that insight — what does it point to?
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={2}
          placeholder="This might really be about..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Smart suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setReflection(s)}
            className="px-3 py-1 rounded-full text-xs font-manrope font-extrabold border border-gray-300 bg-white text-[#4d4d4d] hover:border-[#442cd8] hover:text-[#442cd8] transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Preview summary */}
      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[11px] font-manrope font-light uppercase tracking-wide text-[#4d4d4d] mb-1">
          Insight Snapshot
        </p>

        {insight.trim() === "" && reflection.trim() === "" ? (
          <p className="text-xs font-manrope font-light text-[#4d4d4d]">
            Your insight will appear here once you start writing.
          </p>
        ) : (
          <div className="space-y-1 text-xs font-manrope font-light text-[#4d4d4d]">
            {insight.trim() && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Core Insight:</span>{" "}
                {insight}
              </p>
            )}
            {reflection.trim() && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Deeper layer:</span>{" "}
                {reflection}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
