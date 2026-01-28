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
        <h3 className="fmy-h2 text-xl text-gray-900">
          DM3 · Why Chain <span className="text-xs font-manrope font-light text-gray-500">v60.5c</span>
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-manrope font-extrabold text-[#4d4d4d] hover:text-gray-900 underline-offset-2 hover:underline"
        >
          Reset chain
        </button>
      </div>

      <p className="text-xs text-[#4d4d4d]">
        Start with the decision or situation that's bugging you. Then follow the
        "Why?" trail until you hit something that actually matters to you.
      </p>

      {/* Core question */}
      <div className="space-y-1">
        <label className="text-xs font-manrope font-light text-[#4d4d4d]">
          What&apos;s the decision, pattern, or situation you want to unpack?
        </label>
        <textarea
          value={coreQuestion}
          onChange={(e) => setCoreQuestion(e.target.value)}
          rows={2}
          placeholder="e.g., I'm hesitating to take this new role, even though it looks great on paper."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#442cd8]"
        />
      </div>

      {/* Why chain inputs */}
      <div className="space-y-3">
        {whys.map((why, index) => (
          <div key={index} className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-manrope font-extrabold text-[#4d4d4d]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-manrope font-extrabold text-[#4d4d4d]">
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-manrope font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}

        {/* Add another why */}
        {whys.length < MAX_WHYS && (
          <button
            type="button"
            onClick={handleAddWhy}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-manrope font-extrabold text-[#4d4d4d] hover:border-[#442cd8] hover:text-[#442cd8]"
          >
            + Add another Why
          </button>
        )}
      </div>

      {/* Lightweight summary */}
      <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <p className="text-[11px] font-manrope font-light uppercase tracking-wide text-[#4d4d4d] mb-1">
          Quick snapshot
        </p>
        {coreQuestion.trim() === "" && filledWhys.length === 0 ? (
          <p className="text-xs font-manrope font-light text-[#4d4d4d]">
            As you fill in your Whys, we&apos;ll summarize the deeper theme
            that&apos;s starting to emerge here.
          </p>
        ) : (
          <div className="space-y-1 text-xs font-manrope font-light text-[#4d4d4d]">
            {coreQuestion.trim() && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">Starting from:</span>{" "}
                {coreQuestion}
              </p>
            )}
            {filledWhys.length > 0 && (
              <p>
                <span className="font-manrope font-extrabold text-gray-900">
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
