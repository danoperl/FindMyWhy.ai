import React, { useState } from "react";
import DeeperMeaningApp_v60_4 from "../deeperMeaning/DeeperMeaningApp-v60_4.jsx";
import LightLift_v60_2j from "../lightLift/LightLift-v60_2j.jsx";

function FindMyWhyAppShell() {
  const [activeMode, setActiveMode] = useState("deep_dive");

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <div className="max-w-2xl mx-auto bg-slate-800/80 rounded-2xl shadow-lg p-8 border border-slate-700">

        {/* Header */}
        <h1 className="text-3xl font-semibold mb-4">
          FindMyWhy.ai
        </h1>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveMode("deep_dive")}
            className={`px-3 py-1 rounded-full text-sm border ${
              activeMode === "deep_dive"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            Deep-Dive Mode
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("light_lift")}
            className={`px-3 py-1 rounded-full text-sm border ${
              activeMode === "light_lift"
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            Light-Lift Mode
          </button>
        </div>

        {/* Content Region */}
        <div>
          {activeMode === "deep_dive" ? (
            <DeeperMeaningApp_v60_4 />
          ) : (
            <LightLift_v60_2j />
          )}
        </div>

      </div>
    </div>
  );
}

export default FindMyWhyAppShell;
