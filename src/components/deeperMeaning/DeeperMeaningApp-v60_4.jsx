import DM3WhyChain_v60_5c from "./DM3WhyChain-v60_5c.jsx";
import DM4PatternRecognition_v60_6a from "./DM4PatternRecognition-v60_6a.jsx";
import DM5Insight_v60_6b from "./DM5Insight-v60_6b.jsx";
import DM6Closure_v60_6b from "./DM6Closure-v60_6b.jsx";

export default function DeeperMeaningApp_v60_4() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Deeper Meaning Mode
        </h2>
        <p className="text-sm text-slate-300">
          A structured, recursive flow to unpack the deeper "why" behind your decision,
          pattern, or nagging question.
        </p>
      </header>

      {/* DM3 – Why Chain */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-md shadow-slate-900/50 space-y-4">
        <DM3WhyChain_v60_5c />
      </section>

      {/* DM4 – Pattern Recognition */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-md shadow-slate-900/50 space-y-4">
        <DM4PatternRecognition_v60_6a />
      </section>

      {/* DM5 – Insight */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-md shadow-slate-900/50 space-y-4">
        <DM5Insight_v60_6b />
      </section>

      {/* DM6 – Closure */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-md shadow-slate-900/50 space-y-4">
        <DM6Closure_v60_6b />
      </section>
    </div>
  );
}
