// =============================================================================
// FindMyWhy.ai — v61.0 Slice B (Fully Functional Prototype)
// Deeper Meaning Flow with Clarity Artifact
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, HelpCircle, CheckCircle, AlertCircle, Clipboard, Check, BookOpen } from 'lucide-react';
import HomeScreen from "../home/HomeScreen.jsx";

// =============================================================================
// FLOW CONFIG (Slice A)
// =============================================================================

const steps = {
  0: { idNumber: 0, keyString: 'dm0', label: 'Entry',   order: 0 },
  1: { idNumber: 1, keyString: 'dm1', label: 'Surface', order: 1 },
  2: { idNumber: 2, keyString: 'dm2', label: 'Anchor',  order: 2 },
  3: { idNumber: 3, keyString: 'dm3', label: 'WHY',     order: 3 },
  4: { idNumber: 4, keyString: 'dm4', label: 'Pattern', order: 4 },
  5: { idNumber: 5, keyString: 'dm5', label: 'Insight', order: 5 },
  6: { idNumber: 6, keyString: 'dm6', label: 'Close',   order: 6 },
};

const transitions = {
  0: { prev: null, next: 1 },
  1: { prev: 0,    next: 2 },
  2: { prev: 1,    next: 3 },
  3: { prev: 2,    next: 4 },
  4: { prev: 3,    next: 5 },
  5: { prev: 4,    next: 6 },
  6: { prev: 5,    next: null },
};

const getNextStep = (step) => transitions[step]?.next ?? null;
const getPrevStep = (step) => transitions[step]?.prev ?? null;
const getAllStepsOrdered = () => Object.values(steps).sort((a, b) => a.order - b.order);

// =============================================================================
// THEME
// =============================================================================

const fmyTheme = {
  card: {
    base: 'rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]',
    padding: 'p-6 md:p-8',
  },
  typography: {
    heading: 'text-2xl font-semibold text-slate-900',
    subheading: 'text-xl font-bold text-slate-900',
    caption: 'text-sm text-slate-600',
    label: 'text-xs font-semibold text-slate-500 uppercase tracking-wide',
  },
};

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function FmyCard({ children, className = '', animate = true }) {
  const baseClasses = [
    fmyTheme.card.base,
    fmyTheme.card.padding,
    animate ? 'animate-fadeIn' : '',
    className,
  ].filter(Boolean).join(' ');
  return <div className={baseClasses}>{children}</div>;
}

function FmyCardDivider() {
  return <div className="border-b border-slate-200 my-6" />;
}

function PipelineStrip({ currentStep }) {
  const allSteps = getAllStepsOrdered();
  return (
    <div className="space-y-3">
      <p className={fmyTheme.typography.label}>Your Journey</p>
      <div className="flex items-center justify-between overflow-x-auto pb-1 -mx-1 px-1">
        {allSteps.map((step) => {
          const isComplete = step.order < currentStep;
          const isCurrent = step.order === currentStep;
          const isFuture = step.order > currentStep;
          return (
            <div key={step.idNumber} className="flex items-center">
              <div className={`flex flex-col items-center min-w-[48px] transition-opacity duration-200 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                  isCurrent ? 'bg-indigo-600 text-white shadow-sm' : 
                  isComplete ? 'bg-green-500 text-white' : 
                  'bg-slate-200 text-slate-500'
                }`}>
                  {isComplete ? <CheckCircle size={14} /> : step.idNumber}
                </span>
                <span className={`text-[10px] mt-1.5 transition-colors duration-200 ${isCurrent ? 'text-indigo-700 font-semibold' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
              {step.order < allSteps.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 rounded-full transition-colors duration-200 ${isComplete ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// PATTERN EXTRACTION (simplified)
// =============================================================================

const PATTERN_KEYWORDS = {
  responsibility: { words: ['should', 'must', 'have to', 'need to', 'responsible', 'expected'], label: 'Tension around responsibility', category: 'values' },
  approval: { words: ['others', 'people', 'approval', 'judgment', 'disappointed', 'please'], label: 'Attention to others\' perceptions', category: 'strategy' },
  fear: { words: ['afraid', 'fear', 'worry', 'anxious', 'scared'], label: 'Emotional undertow', category: 'emotion' },
  growth: { words: ['grow', 'change', 'better', 'improve', 'stuck'], label: 'Growth and change', category: 'identity' },
  control: { words: ['control', 'manage', 'handle', 'fix', 'solve'], label: 'Orientation toward control', category: 'strategy' },
};

function extractPatterns(whyChain) {
  if (whyChain.length === 0) return [];
  const text = whyChain.map(w => w.whyText).join(' ').toLowerCase();
  const patterns = [];
  
  Object.entries(PATTERN_KEYWORDS).forEach(([key, config]) => {
    const count = config.words.filter(word => text.includes(word)).length;
    if (count > 0) {
      patterns.push({
        id: key,
        label: config.label,
        category: config.category,
        strength: count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low',
      });
    }
  });
  
  return patterns.slice(0, 3);
}

function generateInsight(patterns) {
  if (patterns.length === 0) return 'This question touches on themes that are still taking shape.';
  const primary = patterns[0];
  return `A recurring theme here is ${primary.label.toLowerCase()}.`;
}

// =============================================================================
// CLARITY ARTIFACT (Slice B)
// =============================================================================

function deriveClarityArtifact(whyChain, patterns, insights, surfaceQuestion) {
  return {
    surfaceQuestion: surfaceQuestion || null,
    whyChain: whyChain.map(w => w.whyText),
    patterns,
    insights,
    createdAt: new Date().toISOString(),
  };
}

function formatArtifactForClipboard(artifact) {
  const lines = ['Clarity Snapshot — FindMyWhy.ai', `Generated: ${new Date(artifact.createdAt).toLocaleDateString()}`, ''];
  
  if (artifact.surfaceQuestion) {
    lines.push('Question:', `"${artifact.surfaceQuestion}"`, '');
  }
  
  if (artifact.whyChain.length > 0) {
    lines.push('WHY Chain:');
    artifact.whyChain.forEach((why, i) => lines.push(`${i + 1}. ${why}`));
    lines.push('');
  }
  
  if (artifact.patterns.length > 0) {
    lines.push('Patterns:');
    artifact.patterns.forEach(p => lines.push(`• ${p.label} (${p.strength})`));
  }
  
  return lines.join('\n');
}

function ClarityArtifactPanel({ artifact }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatArtifactForClipboard(artifact);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Clipboard size={18} className="text-slate-600" />
        <h3 className="font-semibold text-slate-900">Clarity Snapshot</h3>
      </div>
      
      {artifact.surfaceQuestion && (
        <div>
          <p className={fmyTheme.typography.label}>Question</p>
          <p className="text-sm text-slate-800 mt-1 italic">"{artifact.surfaceQuestion}"</p>
        </div>
      )}
      
      {artifact.whyChain.length > 0 && (
        <div>
          <p className={fmyTheme.typography.label}>Your WHY Chain</p>
          <ol className="mt-2 space-y-1.5">
            {artifact.whyChain.map((why, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-slate-400 font-mono">{i + 1}.</span>
                <span>{why}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {artifact.patterns.length > 0 && (
        <div>
          <p className={fmyTheme.typography.label}>Patterns Surfaced</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {artifact.patterns.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-700">
                {p.label}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  p.strength === 'high' ? 'bg-indigo-100 text-indigo-700' :
                  p.strength === 'medium' ? 'bg-slate-100 text-slate-600' :
                  'bg-slate-50 text-slate-500'
                }`}>{p.strength}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={handleCopy}
        className={`w-full mt-2 px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
          copied 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
        }`}
      >
        {copied ? <Check size={16} /> : <Clipboard size={16} />}
        {copied ? 'Copied!' : 'Copy snapshot'}
      </button>
    </div>
  );
}

// =============================================================================
// DOMAIN CONFIG
// =============================================================================

const DOMAINS = ['work', 'relationships', 'identity', 'habit', 'purpose', 'values', 'other'];
const EXAMPLE_PROMPTS = [
  "Why do I keep saying yes to things I don't want to do?",
  "Why do I procrastinate on things that matter?",
  "I feel stuck but can't explain why"
];

// =============================================================================
// MAIN APP
// =============================================================================

export default function FindMyWhyApp() {
  const [screen, setScreen] = useState("HOME"); // HOME | DM | IC
  const [currentStep, setCurrentStep] = useState(0);
  const [surfaceQuestion, setSurfaceQuestion] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [whyChain, setWhyChain] = useState([]);
  const [whyInput, setWhyInput] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [insight, setInsight] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  
  // DM3 editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // IC state
  const [icStage, setIcStage] = useState('input');
  const [icDecision, setIcDecision] = useState('');
  const [icUserInput, setIcUserInput] = useState('');
  const [icAnswers, setIcAnswers] = useState({ initial: '', q1: '', q2: '', q3: '' });
  const [icTags, setIcTags] = useState([]);
  const [icShowTooltip, setIcShowTooltip] = useState(false);
  const [icSaved, setIcSaved] = useState(false);
  
  const contentRef = useRef(null);
  const MAX_DEPTH = 5;

  const resetDM = () => {
    setCurrentStep(0);
    setSurfaceQuestion("");
    setSelectedDomain(null);
    setWhyChain([]);
    setWhyInput("");
    setPatterns([]);
    setInsight("");
  };

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  const handleBack = () => {
    const prev = getPrevStep(currentStep);
    if (prev !== null) setCurrentStep(prev);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSurfaceQuestion('');
    setSelectedDomain(null);
    setWhyChain([]);
    setWhyInput('');
    setPatterns([]);
    setInsight('');
  };

  const handleBegin = () => {
    if (!surfaceQuestion.trim()) return;
    setCurrentStep(1);
  };

  const handleDM1Continue = () => setCurrentStep(2);
  const handleDM2Continue = () => setCurrentStep(3);

  const handleAddWhy = () => {
    if (!whyInput.trim()) return;
    const newChain = [...whyChain, { id: `why-${Date.now()}`, whyText: whyInput.trim() }];
    setWhyChain(newChain);
    setWhyInput('');
    
    if (newChain.length >= MAX_DEPTH) {
      const p = extractPatterns(newChain);
      setPatterns(p);
      setInsight(generateInsight(p));
      setCurrentStep(4);
    }
  };

  const handleWhyComplete = () => {
    const p = extractPatterns(whyChain);
    setPatterns(p);
    setInsight(generateInsight(p));
    setCurrentStep(4);
  };

  const startEditWhy = (index) => {
    setEditingIndex(index);
    setEditingText(whyChain[index]?.whyText ?? '');
  };

  const cancelEditWhy = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const saveEditWhy = () => {
    if (editingIndex === null) return;
    const nextText = editingText.trim();
    setWhyChain(prev => prev.map((w, i) => 
      i === editingIndex ? { ...w, whyText: nextText } : w
    ));
    setEditingIndex(null);
    setEditingText('');
  };

  const handleDM4Continue = () => setCurrentStep(5);
  const handleDM5Continue = () => setCurrentStep(6);

  // IC handlers
  const icTagColors = { comfort: 'bg-green-100 text-green-800', speed: 'bg-orange-100 text-orange-800', novelty: 'bg-purple-100 text-purple-800', responsibility: 'bg-yellow-100 text-yellow-800' };

  const icHandleStartFlow = () => {
    if (!icDecision.trim()) return;
    setIcAnswers({ ...icAnswers, initial: icDecision });
    setIcStage('q1');
    setIcUserInput('');
  };

  const icHandleAnswer = (key) => {
    if (!icUserInput.trim()) return;
    const newAnswers = { ...icAnswers, [key]: icUserInput };
    setIcAnswers(newAnswers);
    setIcUserInput('');
    if (key === 'q1') setIcStage('q2');
    else if (key === 'q2') setIcStage('q3');
    else if (key === 'q3') {
      const text = `${newAnswers.q1} ${newAnswers.q2} ${newAnswers.q3}`.toLowerCase();
      const detectedTags = [];
      if (text.match(/comfort|tired|relax|easy/)) detectedTags.push('comfort');
      if (text.match(/time|quick|fast|rush/)) detectedTags.push('speed');
      if (text.match(/new|try|curious|different/)) detectedTags.push('novelty');
      if (text.match(/should|need to|have to|must/)) detectedTags.push('responsibility');
      setIcTags(detectedTags.slice(0, 3));
      setIcStage('results');
    }
  };

  const icHandleReset = () => {
    setIcStage('input');
    setIcDecision('');
    setIcUserInput('');
    setIcAnswers({ initial: '', q1: '', q2: '', q3: '' });
    setIcTags([]);
    setIcSaved(false);
  };

  const handleIcToDm = () => {
    // IC → DM bridge: surface data handoff only. Must not alter DM state ownership, recomputation rules, or exit discipline.
    resetDM();
    setSurfaceQuestion(icAnswers.initial || '');
    setScreen("DM");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HOME - Entry Hatch
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "HOME") {
    return (
      <HomeScreen
        onQuickClarity={() => setScreen("IC")}
        onDeeperMeaning={() => {
          resetDM();
          setScreen("DM");
        }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // IC - Instant Clarity (3-question flow)
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "IC") {
    // IC Input stage
    if (icStage === 'input') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
          `}</style>
          <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative pt-12">
            <button
              onClick={() => setScreen("HOME")}
              className="absolute top-0 right-0 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Back to Home
            </button>
            <FmyCard>
              <div className="mb-6">
                <button onClick={() => setIcShowTooltip(!icShowTooltip)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors">
                  <HelpCircle size={18} />What is Instant Clarity?
                </button>
                {icShowTooltip && (
                  <div className="mt-3 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg text-sm text-slate-700 animate-fadeIn">
                    <p>Instant Clarity is a quick, playful way to clarify everyday decisions. Answer 3 simple questions, and we'll help you see your own reasoning more clearly. <strong>It's not advice—just clarity.</strong></p>
                  </div>
                )}
              </div>
              <FmyCardDivider />
              <div className="space-y-5">
                <div>
                  <h2 className={fmyTheme.typography.heading}>What's the small decision you're trying to make?</h2>
                  <p className={`${fmyTheme.typography.caption} mt-1 max-w-xl`}>Share something you'd like quick clarity on.</p>
                </div>
                <input type="text" value={icDecision} onChange={(e) => setIcDecision(e.target.value)} placeholder="e.g., 'Should I work from home or the café today?'" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 transition-shadow" onKeyPress={(e) => e.key === 'Enter' && icHandleStartFlow()} />
                <div className="flex justify-center">
                  <button onClick={icHandleStartFlow} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
                    <span>Start Instant Clarity</span><ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </FmyCard>
          </div>
        </div>
      );
    }

    // IC Questions (q1, q2, q3)
    if (icStage === 'q1' || icStage === 'q2' || icStage === 'q3') {
      const qNum = icStage === 'q1' ? 1 : icStage === 'q2' ? 2 : 3;
      const progress = qNum === 1 ? '33%' : qNum === 2 ? '66%' : '100%';
      const questions = { q1: "What's the real choice you're deciding between?", q2: "What's influencing this decision right now?", q3: "If you had to choose right now, what would you pick?" };
      const placeholders = { q1: "e.g., 'Stay in vs. go out'", q2: "e.g., 'I'm tired but I also feel like I should be productive'", q3: "e.g., 'Stay in'" };
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
          `}</style>
          <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative pt-12">
            <button
              onClick={() => setScreen("HOME")}
              className="absolute top-0 right-0 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Back to Home
            </button>
            <FmyCard>
              <div className="mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="font-semibold">Question {qNum} of 3</span>
                  <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: progress }} />
                  </div>
                </div>
              </div>
              <FmyCardDivider />
              <div className="space-y-5">
                <h2 className={fmyTheme.typography.subheading}>{questions[icStage]}</h2>
                <p className="text-sm text-slate-600">Your decision: <span className="font-semibold text-slate-900">{icAnswers.initial}</span></p>
                <input type="text" value={icUserInput} onChange={(e) => setIcUserInput(e.target.value)} placeholder={placeholders[icStage]} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 transition-shadow" onKeyPress={(e) => e.key === 'Enter' && icHandleAnswer(icStage)} />
                <div className="flex gap-3">
                  <button onClick={() => icHandleAnswer(icStage)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                    {icStage === 'q3' ? 'See Clarity' : 'Continue'}
                  </button>
                  <button onClick={icHandleReset} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"><RotateCcw size={18} /></button>
                </div>
              </div>
            </FmyCard>
          </div>
        </div>
      );
    }

    // IC Results stage
    if (icStage === 'results') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
          `}</style>
          <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative pt-12">
            <button
              onClick={() => setScreen("HOME")}
              className="absolute top-0 right-0 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Back to Home
            </button>
            <FmyCard className="space-y-6">
              <h2 className={fmyTheme.typography.heading}>💡 Here's what we learned</h2>
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
                <p className={`${fmyTheme.typography.label} text-indigo-700 mb-2`}>📌 Your Original Question</p>
                <p className="text-base font-medium text-slate-900">{icAnswers.initial}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 space-y-4">
                <div>
                  <p className={`${fmyTheme.typography.label} text-green-700 mb-1`}>Your Distilled Choice</p>
                  <p className="text-lg font-bold text-slate-900">{icAnswers.q3}</p>
                </div>
                <div className="border-t border-green-200 pt-4">
                  <p className={`${fmyTheme.typography.label} text-green-700 mb-2`}>What Influenced It</p>
                  <p className="text-slate-800">{icAnswers.q2}</p>
                </div>
              </div>
              {icTags.length > 0 && (
                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-900 uppercase mb-3">🔍 Patterns Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {icTags.map((tag) => (
                      <span key={tag} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${icTagColors[tag] || 'bg-slate-100 text-slate-800'}`}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center gap-3 pt-2">
                {icSaved && <p className="text-sm text-slate-600">Saved to log.</p>}
                <button onClick={icHandleReset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <RotateCcw size={18} /><span>Start Another Decision</span>
                </button>
              </div>
            </FmyCard>
          </div>
        </div>
      );
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM - Deeper Meaning Flow
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "DM") {
    // ─────────────────────────────────────────────────────────────────────────────
    // DM0 - Entry
    // ─────────────────────────────────────────────────────────────────────────────
    if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
        `}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative">
          <button
            onClick={() => setScreen("HOME")}
            className="absolute top-0 right-0 text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Back to Home
          </button>
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-slate-900">FindMyWhy.ai</h1>
            <p className="text-sm text-slate-500 mt-1">v61.0 Slice B</p>
          </div>
          
          <FmyCard>
            <div className="mb-6">
              <button onClick={() => setShowInfo(!showInfo)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                <HelpCircle size={18} />What is Deeper Meaning Mode?
              </button>
              {showInfo && (
                <div className="mt-3 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg text-sm text-slate-700 animate-fadeIn">
                  <ul className="space-y-1">
                    <li>• Explores deeper patterns in your thinking</li>
                    <li>• Uses a structured WHY-Chain</li>
                    <li>• Neutral, non-therapeutic</li>
                    <li>• Exit anytime — early exit is success</li>
                  </ul>
                </div>
              )}
            </div>
            <FmyCardDivider />
            
            <div className="space-y-5">
              <div>
                <h2 className={fmyTheme.typography.heading}>What's the deeper question on your mind?</h2>
                <p className={`${fmyTheme.typography.caption} mt-1`}>Share something you'd like to explore.</p>
              </div>
              
              <div className="relative">
                <textarea
                  value={surfaceQuestion}
                  onChange={(e) => setSurfaceQuestion(e.target.value.slice(0, 500))}
                  placeholder="e.g., 'Why do I always feel like I'm falling behind?'"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 min-h-[100px] resize-y"
                  maxLength={500}
                />
                <span className="absolute bottom-3 right-3 text-xs text-slate-400">{surfaceQuestion.length}/500</span>
              </div>
              
              <div className="space-y-2">
                <p className={fmyTheme.typography.label}>Or try one:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((prompt, i) => (
                    <button key={i} onClick={() => setSurfaceQuestion(prompt)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded-full border border-indigo-200">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <FmyCardDivider />
            <PipelineStrip currentStep={currentStep} />
            <p className="text-xs text-slate-500 text-center mt-3">3–5 min · Stop anytime</p>
            <FmyCardDivider />
            
            <div className="flex justify-center">
              <button onClick={handleBegin} disabled={!surfaceQuestion.trim()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors">
                Begin Deeper Meaning <ArrowRight size={18} />
              </button>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM1 - Surface Mapping
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM1</span>
                  <h2 className={fmyTheme.typography.subheading}>Surface Mapping</h2>
                </div>
                <p className={fmyTheme.typography.caption}>We'll clarify what this question is really about.</p>
              </div>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <p className={`${fmyTheme.typography.label} text-indigo-800 mb-1`}>Your Question</p>
                <p className="text-slate-900 italic">"{surfaceQuestion}"</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">What domain does this live in?</p>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map((domain) => (
                    <button key={domain} onClick={() => setSelectedDomain(domain)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedDomain === domain ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleDM1Continue} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM2 - Anchor Detection
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM2</span>
                  <h2 className={fmyTheme.typography.subheading}>Anchor Detection</h2>
                </div>
                <p className={fmyTheme.typography.caption}>Looking for identity, values, and relational anchors.</p>
              </div>
              
              <div className="grid gap-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-800">🪞 Identity Anchors</p>
                  <p className="text-xs text-purple-700 mt-1">Who you see yourself as</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800">⚖️ Value Anchors</p>
                  <p className="text-xs text-amber-700 mt-1">What matters most to you</p>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-pink-800">🤝 Relational Anchors</p>
                  <p className="text-xs text-pink-700 mt-1">Key relationships and roles</p>
                </div>
              </div>
              
              <div className="flex justify-center pt-2">
                <button onClick={handleDM2Continue} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM3 - WHY Chain
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM3</span>
                  <h2 className={fmyTheme.typography.subheading}>WHY-Chain Exploration</h2>
                </div>
                <p className={fmyTheme.typography.caption}>Explore layers of "why" at your pace.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={fmyTheme.typography.label}>Progress</span>
                <div className="flex gap-1.5">
                  {[0,1,2,3,4].map((i) => (
                    <div key={i} className={`w-8 h-2 rounded-full ${i < whyChain.length ? 'bg-green-500' : i === whyChain.length ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{Math.min(whyChain.length + 1, MAX_DEPTH)} of {MAX_DEPTH}</span>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className={`${fmyTheme.typography.label} mb-1`}>Original question</p>
                <p className="text-sm text-slate-800 italic">"{surfaceQuestion}"</p>
              </div>
              
              {whyChain.length > 0 && (
                <div className="space-y-2">
                  <p className={fmyTheme.typography.label}>Your WHY steps</p>
                  {whyChain.map((why, i) => (
                    <div key={why.id} className="flex gap-3 items-start animate-fadeIn">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      {editingIndex === i ? (
                        <div className="flex-1 space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value.slice(0, 300))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 text-sm min-h-[60px] resize-y"
                            maxLength={300}
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEditWhy} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg">
                              Save
                            </button>
                            <button onClick={cancelEditWhy} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-start justify-between gap-3">
                          <p className="text-sm text-slate-700">{why.whyText}</p>
                          <button onClick={() => startEditWhy(i)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded flex-shrink-0">
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {whyChain.length < MAX_DEPTH && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 block">Next WHY</label>
                  <textarea
                    value={whyInput}
                    onChange={(e) => setWhyInput(e.target.value.slice(0, 300))}
                    placeholder="Write whatever feels honest..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 min-h-[80px] resize-y"
                    maxLength={300}
                  />
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-2">
                {whyChain.length < MAX_DEPTH && (
                  <button onClick={handleAddWhy} disabled={!whyInput.trim()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-lg">
                    Add this step
                  </button>
                )}
                {whyChain.length > 0 && (
                  <button 
                    onClick={handleWhyComplete} 
                    disabled={editingIndex !== null}
                    className={`px-5 py-2.5 font-medium rounded-lg ${
                      editingIndex !== null 
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                        : 'bg-slate-600 hover:bg-slate-700 text-white'
                    }`}
                  >
                    I'm done
                  </button>
                )}
              </div>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM4 - Pattern Recognition
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM4</span>
                  <h2 className={fmyTheme.typography.subheading}>Pattern Recognition</h2>
                </div>
                <p className={fmyTheme.typography.caption}>Themes surfaced from your WHY-Chain.</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm text-green-800">WHY-Chain complete · {whyChain.length} steps captured</p>
              </div>
              
              {patterns.length > 0 ? (
                <div className="space-y-3">
                  {patterns.map((p) => (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{p.label}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.strength === 'high' ? 'bg-indigo-200 text-indigo-800' :
                          p.strength === 'medium' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{p.strength}</span>
                      </div>
                      <span className="text-xs text-slate-500">{p.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-slate-600">No strong patterns detected. That's okay.</p>
                </div>
              )}
              
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={() => setCurrentStep(3)} className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg">
                  Refine WHYs
                </button>
                <button onClick={handleDM4Continue} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM5 - Insight
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM5</span>
                  <h2 className={fmyTheme.typography.subheading}>Insight</h2>
                </div>
                <p className={fmyTheme.typography.caption}>A neutral look at the themes.</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6">
                <p className={`${fmyTheme.typography.label} text-indigo-600 mb-3`}>Based on what you shared</p>
                <p className="text-lg text-slate-900 leading-relaxed font-medium">{insight}</p>
              </div>
              
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handleDM5Continue} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-2">
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </FmyCard>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DM6 - Close (with Clarity Artifact - Slice B)
  // ─────────────────────────────────────────────────────────────────────────────
  if (currentStep === 6) {
    const clarityArtifact = deriveClarityArtifact(whyChain, patterns, [{ text: insight }], surfaceQuestion);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative">
          <button
            onClick={() => setScreen("HOME")}
            className="absolute top-0 right-0 text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Back to Home
          </button>
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM6</span>
                  <h2 className={fmyTheme.typography.subheading}>Close</h2>
                </div>
                <p className={fmyTheme.typography.caption}>A brief reflection on where you've landed.</p>
              </div>
              
              {/* Exploration Complete */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-sm font-semibold text-green-800">Exploration Complete</p>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• WHY steps explored: {whyChain.length}</li>
                  <li>• Patterns detected: {patterns.length}</li>
                  <li>• Insight generated: ✓</li>
                </ul>
              </div>
              
              {/* Closure Recommendation */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                <p className={`${fmyTheme.typography.label} mb-3`}>Something you might hold lightly:</p>
                <p className="text-base text-slate-800 leading-relaxed">
                  {patterns.length > 0 
                    ? `For now, it might be enough just to notice that this question keeps circling around ${patterns[0].label.toLowerCase()}.`
                    : 'For now, the main step was simply putting this question into words.'}
                </p>
              </div>
              
              {/* SLICE B: Clarity Artifact Panel */}
              <ClarityArtifactPanel artifact={clarityArtifact} />
            </div>
          </FmyCard>
          
          {/* Exit Actions */}
          <div className="flex justify-center">
            <button onClick={handleReset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2">
              <RotateCcw size={18} /> Start New
            </button>
          </div>
          
          <p className="text-center text-xs text-slate-500">
            FindMyWhy.ai · v61.0 Slice B · Exit-support, not engagement
          </p>
        </div>
      </div>
    );
    }
  }

  return null;
}
