import React, { useState } from "react";

export default function DM3WhyChain_v60_5c() {
  const [coreQuestion, setCoreQuestion] = useState("");
  const [whys, setWhys] = useState([""]);
  const MAX_WHYS = 5;

  const handleWhyChange = (index, value) => {
    const next = [...whys];
    next[index] = value;
    setWhys(next);
  };

  const handleAddWhy = () => {
    if (whys.length < MAX_WHYS) {
      setWhys([...whys, ""]);
    }
  };

  const handleReset = () => {
    setCoreQuestion("");
    setWhys([""]);
  };

  const filledWhys = whys.filter((w) => w.trim().length > 0);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-100">
          DM3 · Why Chain <span className="text-xs text-slate-400">v60.5c</span>
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline"
        >
          Reset chain
        </button>
      </div>

      <p className="text-xs text-slate-300">
        Start with the decision or situation that’s bugging you. Then follow the
        “Why?” trail until you hit something that actually matters to you.
      </p>

      {/* Core question */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">
          What&apos;s the decision, pattern, or situation you want to unpack?
        </label>
        <textarea
          value={coreQuestion}
          onChange={(e) => setCoreQuestion(e.target.value)}
          rows={2}
          placeholder="e.g., I'm hesitating to take this new role, even though it looks great on paper."
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
      </div>

      {/* Why chain inputs */}
      <div className="space-y-3">
        {whys.map((why, index) => (
          <div key={index} className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] text-slate-200">
                {index + 1}
              </span>
              {index === 0 ? "First Why" : `Next Why`}
            </label>
            <textarea
              value={why}
              onChange={(e) => handleWhyChange(index, e.target.value)}
              rows={2}
              placeholder={
                index === 0
                  ? "Why does this situation feel sticky or important?"
                  : "Okay, and why does that matter to you?"
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
            />
          </div>
        ))}

        {/* Add another why */}
        {whys.length < MAX_WHYS && (
          <button
            type="button"
            onClick={handleAddWhy}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-emerald-500/70 hover:text-emerald-200"
          >
            + Add another Why
          </button>
        )}
      </div>

      {/* Lightweight summary */}
      <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">
          Quick snapshot
        </p>
        {coreQuestion.trim() === "" && filledWhys.length === 0 ? (
          <p className="text-xs text-slate-500">
            As you fill in your Whys, we&apos;ll summarize the deeper theme
            that&apos;s starting to emerge here.
          </p>
        ) : (
          <div className="space-y-1 text-xs text-slate-200">
            {coreQuestion.trim() && (
              <p>
                <span className="font-semibold text-slate-300">Starting from:</span>{" "}
                {coreQuestion}
              </p>
            )}
            {filledWhys.length > 0 && (
              <p>
                <span className="font-semibold text-slate-300">
                  Emerging deeper Why:
                </span>{" "}
                {filledWhys[filledWhys.length - 1]}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
