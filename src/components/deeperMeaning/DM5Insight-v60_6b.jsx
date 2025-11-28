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
      <h3 className="text-sm font-semibold tracking-tight text-slate-100">
        DM5 · Insight{" "}
        <span className="text-xs text-slate-400">v60.6b</span>
      </h3>

      <p className="text-xs text-slate-300">
        Based on the Why Chain and the patterns you noticed, what deeper meaning
        or theme is emerging for you?
      </p>

      {/* Insight text area */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          What’s the deeper realization or truth here?
        </label>
        <textarea
          value={insight}
          onChange={(e) => setInsight(e.target.value)}
          rows={3}
          placeholder="E.g., I'm afraid of losing stability, and this decision threatens a story I've told myself about responsibility."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Optional guiding reflection */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          If you were to look underneath that insight — what does it point to?
        </label>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={2}
          placeholder="This might really be about..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Smart suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setReflection(s)}
            className="px-3 py-1 rounded-full text-xs border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/70 hover:text-emerald-200 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Preview summary */}
      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">
          Insight Snapshot
        </p>

        {insight.trim() === "" && reflection.trim() === "" ? (
          <p className="text-xs text-slate-500">
            Your insight will appear here once you start writing.
          </p>
        ) : (
          <div className="space-y-1 text-xs text-slate-200">
            {insight.trim() && (
              <p>
                <span className="font-semibold text-slate-300">Core Insight:</span>{" "}
                {insight}
              </p>
            )}
            {reflection.trim() && (
              <p>
                <span className="font-semibold text-slate-300">Deeper layer:</span>{" "}
                {reflection}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
