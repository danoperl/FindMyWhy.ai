import React, { useState } from "react";

export default function DM6Closure_v60_6b() {
  const [statement, setStatement] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [confidence, setConfidence] = useState(60);

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="fmy-h2 text-xl text-gray-900">
        DM6 · Closure{" "}
        <span className="text-xs font-manrope font-light text-gray-500">v60.6b</span>
      </h3>

      <p className="text-xs font-manrope font-light text-[#4d4d4d]">
        Let's give this session a landing place. No big life vow — just a
        grounded statement about what this insight means for you right now.
      </p>

      {/* Closure statement */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          If you had to put it in one sentence, what are you taking away from this?
        </label>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={2}
          placeholder="E.g., I realize I've been choosing safety over growth, and I want to experiment with small, reversible risks."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Small next step */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          What&apos;s one small step you&apos;re willing to take in the next few days?
        </label>
        <input
          type="text"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="E.g., Block 30 minutes to list out 3 low-risk experiments."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Confidence slider */}
      <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-manrope font-light text-[#4d4d4d]">
            <span>How confident do you feel about this next step?</span>
            <span className="font-manrope font-extrabold text-gray-900">{confidence}%</span>
          </div>
        <input
          type="range"
          min={0}
          max={100}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-[11px] font-manrope font-light text-[#4d4d4d]">
          There&apos;s no right answer here — this just helps you notice your own
          signal. Low confidence doesn&apos;t mean &quot;don&apos;t do it&quot; — it might mean
          you want a smaller, safer version of the step.
        </p>
      </div>

      {/* Final snapshot */}
      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[11px] font-manrope font-light uppercase tracking-wide text-[#4d4d4d] mb-1">
          Closure Snapshot
        </p>

        {statement.trim() === "" && nextStep.trim() === "" ? (
          <p className="text-xs font-manrope font-light text-[#4d4d4d]">
            Your closure summary will appear here once you write a takeaway or a
            small next step.
          </p>
        ) : (
          <div className="space-y-1 text-xs font-manrope font-light text-[#4d4d4d]">
            {statement.trim() && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Takeaway:</span>{" "}
                {statement}
              </p>
            )}
            {nextStep.trim() && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Next step:</span>{" "}
                {nextStep}
              </p>
            )}
            <p className="text-[#4d4d4d]">
              <span className="font-manrope font-extrabold text-gray-900">Confidence check:</span>{" "}
              {confidence}% sure this is a good next move for you right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
