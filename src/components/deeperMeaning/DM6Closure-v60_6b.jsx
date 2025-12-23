import React, { useState } from "react";

export default function DM6Closure_v60_6b() {
  const [statement, setStatement] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [confidence, setConfidence] = useState(60);

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-xl font-semibold tracking-tight text-slate-100">
        DM6 · Closure{" "}
        <span className="text-xs text-slate-400">v60.6b</span>
      </h3>

      <p className="text-xs text-slate-300">
        Let’s give this session a landing place. No big life vow — just a
        grounded statement about what this insight means for you right now.
      </p>

      {/* Closure statement */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          If you had to put it in one sentence, what are you taking away from this?
        </label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={2}
          placeholder="E.g., I realize I’ve been choosing safety over growth, and I want to experiment with small, reversible risks."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Small next step */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          What&apos;s one small step you&apos;re willing to take in the next few days?
        </label>
        <input
          type="text"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="E.g., Block 30 minutes to list out 3 low-risk experiments."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Confidence slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>How confident do you feel about this next step?</span>
          <span className="text-slate-400">{confidence}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-[11px] text-slate-400">
          There&apos;s no right answer here — this just helps you notice your own
          signal. Low confidence doesn&apos;t mean &quot;don&apos;t do it&quot; — it might mean
          you want a smaller, safer version of the step.
        </p>
      </div>

      {/* Final snapshot */}
      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">
          Closure Snapshot
        </p>

        {statement.trim() === "" && nextStep.trim() === "" ? (
          <p className="text-xs text-slate-500">
            Your closure summary will appear here once you write a takeaway or a
            small next step.
          </p>
        ) : (
          <div className="space-y-1 text-xs text-slate-200">
            {statement.trim() && (
              <p>
                <span className="font-semibold text-slate-300">Takeaway:</span>{" "}
                {statement}
              </p>
            )}
            {nextStep.trim() && (
              <p>
                <span className="font-semibold text-slate-300">Next step:</span>{" "}
                {nextStep}
              </p>
            )}
            <p className="text-slate-300">
              <span className="font-semibold">Confidence check:</span>{" "}
              {confidence}% sure this is a good next move for you right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
