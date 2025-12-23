// FMY App Shell – v60.7a-NavFix (Consistent Back + Forward CTAs)

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, HelpCircle, ChevronDown, ChevronUp, CheckCircle, AlertCircle, TrendingUp, RefreshCw, X, BookOpen } from 'lucide-react';
import DeeperMeaningApp_v60_4 from "../deeperMeaning/DeeperMeaningApp-v60_4.jsx";
import HomeScreen from "../home/HomeScreen.jsx";

// =============================================================================
// PATTERN EXTRACTION ENGINE (unchanged)
// =============================================================================

const PATTERN_KEYWORDS = {
  responsibility: { words: ['should', 'must', 'have to', 'need to', 'supposed to', 'obligation', 'duty', 'responsible', 'expected'], id: 'tension_responsibility', label: 'Tension around responsibility', category: 'values', description: 'Your responses reference obligation or duty, suggesting responsibility weighs on this question.' },
  approval: { words: ['others', 'people', 'they', 'approval', 'judgment', 'think of me', 'disappointed', 'let down', 'please'], id: 'seeking_external_validation', label: 'Attention to others\' perceptions', category: 'strategy', description: 'References to how others might react or perceive you appear in your chain.' },
  fear: { words: ['afraid', 'fear', 'worry', 'anxious', 'scared', 'nervous', 'dread', 'panic', 'overwhelm'], id: 'emotional_undertow', label: 'Emotional undertow', category: 'emotion', description: 'Anxiety or fear-related language surfaces in your exploration.' },
  rest: { words: ['tired', 'exhausted', 'rest', 'burnout', 'drained', 'energy', 'overwhelmed', 'too much'], id: 'energy_depletion', label: 'Energy and rest themes', category: 'energy', description: 'Fatigue or the need for rest appears as a recurring thread.' },
  growth: { words: ['grow', 'change', 'better', 'improve', 'learn', 'become', 'evolve', 'progress', 'stuck'], id: 'growth_tension', label: 'Growth and change', category: 'identity', description: 'Themes of personal growth or feeling stuck appear in what you wrote.' },
  boundaries: { words: ['no', 'say no', 'boundary', 'limit', 'protect', 'too much', 'overwhelm', 'space', 'distance'], id: 'boundary_navigation', label: 'Navigating boundaries', category: 'strategy', description: 'Questions about limits or protecting your space surface in your chain.' },
  identity: { words: ['who i am', 'myself', 'identity', 'person', 'kind of', 'type of', 'always been', 'supposed to be'], id: 'identity_questioning', label: 'Identity in question', category: 'identity', description: 'Your exploration touches on questions of who you are or want to be.' },
  control: { words: ['control', 'manage', 'handle', 'cope', 'deal with', 'fix', 'solve', 'figure out'], id: 'control_orientation', label: 'Orientation toward control', category: 'strategy', description: 'A focus on managing or controlling situations appears in your responses.' }
};

function extractPatternsFromSession(session) {
  const whyChain = session.why_chain || [];
  if (whyChain.length === 0) return { patterns: [], confidence: 0.4 };
  const combinedText = whyChain.join(' ').toLowerCase();
  const patternCounts = {};
  const patternEvidence = {};

  Object.entries(PATTERN_KEYWORDS).forEach(([key, config]) => {
    let count = 0;
    const evidence = [];
    config.words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = combinedText.match(regex);
      if (matches) count += matches.length;
    });
    if (count > 0) {
      whyChain.forEach((line) => {
        const lineLower = line.toLowerCase();
        const hasMatch = config.words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lineLower));
        if (hasMatch && evidence.length < 3) evidence.push(line);
      });
      patternCounts[key] = count;
      patternEvidence[key] = evidence;
    }
  });

  const sortedPatterns = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const patterns = sortedPatterns.map(([key, count]) => {
    const config = PATTERN_KEYWORDS[key];
    let strength = 'low';
    if (count >= 3) strength = 'high';
    else if (count >= 2) strength = 'medium';
    return { id: config.id, label: config.label, category: config.category, description: config.description, evidence: patternEvidence[key] || [], strength };
  });

  let confidence = 0.5;
  if (patterns.length >= 2) confidence += 0.1;
  if (patterns.some(p => p.strength === 'high')) confidence += 0.1;
  if (patterns.length >= 3) confidence += 0.1;
  confidence = Math.min(0.9, Math.max(0.4, confidence));
  return { patterns, confidence };
}

function confidenceLabel(confidence) {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

// =============================================================================
// INSIGHT GENERATION ENGINE (unchanged)
// =============================================================================

function generateInsights(session) {
  const whyChain = session.why_chain || [];
  const patterns = session.pattern_signals || [];
  
  if (patterns.length === 0 || whyChain.length === 0) {
    return {
      insight_drafts: [{ id: 'minimal', style: 'minimal', text: 'This question touches on themes that are still taking shape.', pattern_refs: [] }],
      synthesis_core: 'This question touches on themes that are still taking shape.'
    };
  }

  const topPatterns = patterns.filter(p => p.strength === 'high' || p.strength === 'medium').slice(0, 2);
  if (topPatterns.length === 0 && patterns.length > 0) topPatterns.push(patterns[0]);

  const primaryPattern = topPatterns[0];
  const secondaryPattern = topPatterns[1] || null;
  const themePhrase = primaryPattern ? primaryPattern.label.toLowerCase() : 'recurring themes';
  const evidencePhrase = primaryPattern?.evidence?.[0] 
    ? `phrases like "${primaryPattern.evidence[0].slice(0, 40)}${primaryPattern.evidence[0].length > 40 ? '...' : ''}"`
    : 'what was shared';

  const insight_drafts = [];
  insight_drafts.push({ id: 'reflective', style: 'reflective', text: `This question seems to center around ${themePhrase}, especially where ${evidencePhrase} shows up.`, pattern_refs: [primaryPattern?.id].filter(Boolean) });
  
  if (secondaryPattern) {
    insight_drafts.push({ id: 'contrast', style: 'contrast', text: `There's a quiet tension between ${primaryPattern.label.toLowerCase()} and ${secondaryPattern.label.toLowerCase()} in the way this question unfolds.`, pattern_refs: [primaryPattern.id, secondaryPattern.id] });
  } else {
    insight_drafts.push({ id: 'contrast', style: 'contrast', text: `This question holds a tension that may become clearer over time.`, pattern_refs: [primaryPattern?.id].filter(Boolean) });
  }
  
  insight_drafts.push({ id: 'minimal', style: 'minimal', text: `A recurring theme here is ${themePhrase}.`, pattern_refs: [primaryPattern?.id].filter(Boolean) });

  const synthesis_core = insight_drafts.find(d => d.style === 'minimal')?.text || insight_drafts[0]?.text;
  return { insight_drafts, synthesis_core };
}

// =============================================================================
// CLOSURE GENERATION ENGINE (unchanged)
// =============================================================================

function generateClosureRecommendation(session) {
  const synthesisCore = session.synthesis_core || '';
  const patterns = session.pattern_signals || [];
  const whyChainLength = session.why_chain?.length || 0;

  if (!synthesisCore && patterns.length === 0) {
    return 'For now, the main step was simply putting this question into words.';
  }

  let theme = '';
  
  if (synthesisCore) {
    const themeMatch = synthesisCore.match(/theme here is (.+?)\.?$/i);
    if (themeMatch) {
      theme = themeMatch[1].trim();
    } else if (synthesisCore.includes('center around')) {
      const centerMatch = synthesisCore.match(/center around ([^,]+)/i);
      if (centerMatch) theme = centerMatch[1].trim();
    }
  }
  
  if (!theme && patterns.length > 0) {
    theme = patterns[0].label.toLowerCase();
  }

  if (!theme) {
    theme = 'the themes you explored';
  }

  const closureTemplates = [
    `For now, it might be enough just to notice that this question keeps circling around ${theme}.`,
    `This reflection suggests that, in this moment, your question is orbiting around ${theme}.`,
    `You don't have to resolve this here; noticing ${theme} may already be meaningful.`
  ];

  const templateIndex = whyChainLength % closureTemplates.length;
  return closureTemplates[templateIndex];
}

// =============================================================================
// DOMAIN MAPPING (unchanged)
// =============================================================================

const DOMAIN_PILL_CONFIG = [
  { label: 'work', enumValue: 'career' },
  { label: 'relationships', enumValue: 'relationship' },
  { label: 'identity', enumValue: 'identity' },
  { label: 'habit', enumValue: 'habit' },
  { label: 'purpose', enumValue: 'purpose' },
  { label: 'values', enumValue: 'values' },
  { label: 'other', enumValue: 'other' }
];

function enumToLabel(enumValue) {
  const config = DOMAIN_PILL_CONFIG.find(d => d.enumValue === enumValue);
  return config ? config.label : 'other';
}

function labelToEnum(label) {
  const config = DOMAIN_PILL_CONFIG.find(d => d.label === label);
  return config ? config.enumValue : 'other';
}

// =============================================================================
// STAGE NAVIGATION HELPERS (unchanged)
// =============================================================================

const STAGE_ORDER = ['dm0', 'dm1', 'dm2', 'dm3', 'dm4', 'dm5', 'dm6'];

function getPreviousStage(currentStage) {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx <= 0) return null;
  return STAGE_ORDER[idx - 1];
}

// =============================================================================
// LOG HISTORY MODAL (unchanged)
// =============================================================================

function LogHistoryModal({ isOpen, onClose, icLog, dmLog }) {
  if (!isOpen) return null;

  const combinedLog = [
    ...icLog.map(entry => ({ ...entry, mode: 'light_lift' })),
    ...dmLog.map(entry => ({ ...entry, mode: 'deep_dive' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const truncate = (str, len) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fadeIn">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Log History</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {combinedLog.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No entries yet. Complete a flow to see it here.</p>
          ) : (
            <div className="space-y-3">
              {combinedLog.map((entry, idx) => (
                <div key={entry.id || idx} className={`border rounded-lg p-4 ${entry.mode === 'deep_dive' ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.mode === 'deep_dive' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                      {entry.mode === 'deep_dive' ? 'Deeper Meaning' : 'Instant Clarity'}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                  </div>
                  {entry.mode === 'deep_dive' ? (
                    <>
                      <p className="text-sm text-gray-800 font-medium mb-2">"{truncate(entry.surface_question, 60)}"</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span>WHY steps: {entry.why_chain_length}</span>
                        <span>·</span>
                        <span>Patterns: {entry.pattern_count}</span>
                        {entry.primary_pattern && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600">{entry.primary_pattern}</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 font-medium mb-1">"{truncate(entry.question || entry.surface_question, 60)}"</p>
                      {entry.choice && (
                        <p className="text-xs text-gray-600">Choice: {entry.choice}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INSTANT CLARITY CONTENT (unchanged)
// =============================================================================

function InstantClarityContent({ onSaveToLog }) {
  const [stage, setStage] = useState('input');
  const [decision, setDecision] = useState('');
  const [userInput, setUserInput] = useState('');
  const [answers, setAnswers] = useState({ initial: '', q1: '', q2: '', q3: '' });
  const [tags, setTags] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [saved, setSaved] = useState(false);

  const tagColors = { comfort: 'bg-green-100 text-green-800', speed: 'bg-orange-100 text-orange-800', novelty: 'bg-purple-100 text-purple-800', responsibility: 'bg-yellow-100 text-yellow-800' };

  const handleStartFlow = () => { if (!decision.trim()) return; setAnswers({ ...answers, initial: decision }); setStage('q1'); setUserInput(''); };
  const handleAnswer = (key) => {
    if (!userInput.trim()) return;
    const newAnswers = { ...answers, [key]: userInput };
    setAnswers(newAnswers);
    setUserInput('');
    if (key === 'q1') setStage('q2');
    else if (key === 'q2') setStage('q3');
    else if (key === 'q3') {
      const text = `${newAnswers.q1} ${newAnswers.q2} ${newAnswers.q3}`.toLowerCase();
      const detectedTags = [];
      if (text.match(/comfort|tired|relax|easy/)) detectedTags.push('comfort');
      if (text.match(/time|quick|fast|rush/)) detectedTags.push('speed');
      if (text.match(/new|try|curious|different/)) detectedTags.push('novelty');
      if (text.match(/should|need to|have to|must/)) detectedTags.push('responsibility');
      setTags(detectedTags.slice(0, 3));
      setStage('results');
    }
  };
  const handleReset = () => { setStage('input'); setDecision(''); setUserInput(''); setAnswers({ initial: '', q1: '', q2: '', q3: '' }); setTags([]); setSaved(false); };

  const handleSave = () => {
    const entry = {
      id: `ic-${Date.now()}`,
      mode: 'light_lift',
      created_at: new Date().toISOString(),
      question: answers.initial,
      choice: answers.q3,
      influences: answers.q2,
      tags: tags
    };
    onSaveToLog(entry, 'ic');
    setSaved(true);
  };

  if (stage === 'input') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="mb-6"><button onClick={() => setShowTooltip(!showTooltip)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"><HelpCircle size={18} />What is Instant Clarity?</button>{showTooltip && (<div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-sm text-gray-700 animate-fadeIn"><p>Instant Clarity is a quick, playful way to clarify everyday decisions. Answer 3 simple questions, and we'll help you see your own reasoning more clearly. <strong>It's not advice—just clarity.</strong></p></div>)}</div>
        <div className="border-b border-gray-200 my-6" />
        <div className="space-y-5"><h2 className="text-3xl font-bold text-gray-900">What's the small decision you're trying to make?</h2><input type="text" value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="e.g., 'Should I work from home or the café today?'" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 transition-shadow" onKeyPress={(e) => e.key === 'Enter' && handleStartFlow()} /><div className="flex justify-center"><button onClick={handleStartFlow} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"><span>Start Instant Clarity</span><ArrowRight size={18} /></button></div></div>
      </div>
    );
  }

  if (stage === 'q1' || stage === 'q2' || stage === 'q3') {
    const qNum = stage === 'q1' ? 1 : stage === 'q2' ? 2 : 3;
    const progress = qNum === 1 ? '33%' : qNum === 2 ? '66%' : '100%';
    const questions = { q1: "What's the real choice you're deciding between?", q2: "What's influencing this decision right now?", q3: "If you had to choose right now, what would you pick?" };
    const placeholders = { q1: "e.g., 'Stay in vs. go out'", q2: "e.g., 'I'm tired but I also feel like I should be productive'", q3: "e.g., 'Stay in'" };
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
        <div className="mb-6"><div className="flex items-center gap-3 text-sm text-gray-600"><span className="font-semibold">Question {qNum} of 3</span><div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: progress }} /></div></div></div>
        <div className="border-b border-gray-200 my-6" />
        <div className="space-y-5"><h2 className="text-2xl font-bold text-gray-900">{questions[stage]}</h2><p className="text-sm text-gray-600">Your decision: <span className="font-semibold text-gray-900">{answers.initial}</span></p><input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={placeholders[stage]} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900 transition-shadow" onKeyPress={(e) => e.key === 'Enter' && handleAnswer(stage)} /><div className="flex gap-3"><button onClick={() => handleAnswer(stage)} className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-colors">{stage === 'q3' ? 'See Clarity' : 'Continue'}</button><button onClick={handleReset} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"><RotateCcw size={18} /></button></div></div>
      </div>
    );
  }

  if (stage === 'results') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 animate-fadeIn">
        <h2 className="text-4xl font-bold text-gray-900">💡 Here's what we learned</h2>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-5"><p className="text-xs font-semibold text-blue-700 uppercase mb-2">📌 Your Original Question</p><p className="text-base font-medium text-gray-900">{answers.initial}</p></div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 space-y-4"><div><p className="text-xs font-semibold text-green-700 uppercase mb-1">Your Distilled Choice</p><p className="text-lg font-bold text-gray-900">{answers.q3}</p></div><div className="border-t border-green-200 pt-4"><p className="text-xs font-semibold text-green-700 uppercase mb-2">What Influenced It</p><p className="text-gray-800">{answers.q2}</p></div></div>
        {tags.length > 0 && (<div className="bg-indigo-50 border-l-4 border-indigo-600 p-5 rounded-lg"><p className="text-sm font-semibold text-indigo-900 uppercase mb-3">🔍 Patterns Detected</p><div className="flex flex-wrap gap-2">{tags.map((tag) => (<span key={tag} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}>#{tag}</span>))}</div></div>)}
        <div className="flex flex-col items-center gap-3 pt-2">
          {!saved && (
            <button onClick={handleSave} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <BookOpen size={18} />
              <span>Save to log</span>
            </button>
          )}
          {saved && <p className="text-sm text-gray-600">Saved to log.</p>}
          <button onClick={handleReset} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
            <RotateCcw size={18} />
            <span>Start Another Decision</span>
          </button>
        </div>
      </div>
    );
  }
  return null;
}

// =============================================================================
// DEEPER MEANING CONTENT (NavFix: consistent Back + Forward CTAs)
// =============================================================================

const DM_STAGES = [
  { id: 'DM0', key: 'dm0', label: 'Entry' },
  { id: 'DM1', key: 'dm1', label: 'Surface' },
  { id: 'DM2', key: 'dm2', label: 'Anchor' },
  { id: 'DM3', key: 'dm3', label: 'WHY' },
  { id: 'DM4', key: 'dm4', label: 'Pattern' },
  { id: 'DM5', key: 'dm5', label: 'Insight' },
  { id: 'DM6', key: 'dm6', label: 'Close' }
];

const EXAMPLE_PROMPTS = ["Why do I keep saying yes to things I don't want to do?", "Why do I procrastinate on things that matter?", "I feel stuck but can't explain why"];

const DISTRESS_PATTERNS = [/\b(suicid|kill myself|end my life|want to die|self.?harm|hurt myself)\b/i, /\b(crisis|emergency|can't go on|no point|hopeless)\b/i];
const detectDistress = (text) => DISTRESS_PATTERNS.some(pattern => pattern.test(text));

const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
};

function PipelineStrip({ currentStage }) {
  const stageIndex = DM_STAGES.findIndex(s => s.key === currentStage);
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Your Journey</p>
      <div className="flex items-center justify-between overflow-x-auto pb-1 -mx-1 px-1">
        {DM_STAGES.map((stage, idx) => {
          const isComplete = idx < stageIndex;
          const isCurrent = idx === stageIndex;
          const isFuture = idx > stageIndex;
          return (
            <div key={stage.id} className="flex items-center">
              <div className={`flex flex-col items-center min-w-[48px] transition-opacity duration-200 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${
                  isCurrent ? 'bg-indigo-600 text-white shadow-sm' : 
                  isComplete ? 'bg-green-500 text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isComplete ? <CheckCircle size={14} /> : stage.id.replace('DM', '')}
                </span>
                <span className={`text-[10px] mt-1.5 transition-colors duration-200 ${isCurrent ? 'text-indigo-700 font-semibold' : 'text-gray-500'}`}>{stage.label}</span>
              </div>
              {idx < DM_STAGES.length - 1 && <div className={`w-4 h-0.5 mx-0.5 rounded-full transition-colors duration-200 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CATEGORY_COLORS = { identity: 'bg-purple-100 text-purple-700', values: 'bg-blue-100 text-blue-700', emotion: 'bg-pink-100 text-pink-700', strategy: 'bg-amber-100 text-amber-700', energy: 'bg-green-100 text-green-700' };
const STRENGTH_COLORS = { low: 'bg-gray-100 text-gray-600', medium: 'bg-indigo-100 text-indigo-700', high: 'bg-indigo-200 text-indigo-800' };

function DeeperMeaningContent({ onSaveToLog }) {
  const [currentStage, setCurrentStage] = useState('dm0');
  const [dmSession, setDmSession] = useState(null);
  const [textareaValue, setTextareaValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [whyInput, setWhyInput] = useState('');
  const [whyValidationError, setWhyValidationError] = useState('');
  const [similarityWarning, setSimilarityWarning] = useState(false);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [saved, setSaved] = useState(false);
  
  const contentRef = useRef(null);

  const MAX_CHARS = 2000;
  const WHY_MAX_CHARS = 300;
  const MAX_DEPTH = 5;

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStage]);

  useEffect(() => {
    if (currentStage === 'dm1' && dmSession) {
      const currentEnum = dmSession.topic_classification;
      const label = enumToLabel(currentEnum);
      setSelectedDomain(label);
    }
  }, [currentStage, dmSession]);

  const classifyTopic = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/job|work|career|boss|coworker|office|promotion/)) return 'career';
    if (lower.match(/who i am|identity|person i/)) return 'identity';
    if (lower.match(/value|matters to me|believe/)) return 'values';
    if (lower.match(/habit|pattern|keep doing|always do/)) return 'habit';
    if (lower.match(/relationship|partner|friend|family|marriage/)) return 'relationship';
    if (lower.match(/purpose|meaning|why am i/)) return 'purpose';
    return 'other';
  };

  const createSession = (surfaceQuestion) => {
    const now = new Date().toISOString();
    return {
      session_id: `dm-shell-${Date.now()}`,
      version: '60.7a-NavFix',
      stage: 'dm0',
      created_at: now,
      updated_at: now,
      surface_question: surfaceQuestion.trim(),
      topic_classification: classifyTopic(surfaceQuestion),
      why_chain: [],
      recursion_depth: 0,
      chain_state: 'active',
      pattern_signals: [],
      pattern_confidence: 0,
      insight_drafts: [],
      synthesis_core: '',
      closure_recommendation: '',
      safety_flags: { crisis: false, divert_to_ic: false, distress_detected: false }
    };
  };

  const updateSession = (updates) => {
    const updated = { ...dmSession, ...updates, updated_at: new Date().toISOString() };
    setDmSession(updated);
    return updated;
  };

  const handleReset = () => {
    setDmSession(null);
    setCurrentStage('dm0');
    setTextareaValue('');
    setValidationError('');
    setWhyInput('');
    setWhyValidationError('');
    setSimilarityWarning(false);
    setActiveInsightIndex(0);
    setSelectedDomain(null);
    setShowDebug(false);
    setSaved(false);
  };

  const handleBack = () => {
    const prevStage = getPreviousStage(currentStage);
    if (!prevStage) return;
    updateSession({ stage: prevStage });
    setCurrentStage(prevStage);
    if (prevStage === 'dm0' && dmSession) {
      setTextareaValue(dmSession.surface_question || '');
    }
  };

  const handleSaveJourney = () => {
    if (!dmSession) return;
    const entry = {
      id: `dm-${Date.now()}`,
      mode: 'deep_dive',
      created_at: new Date().toISOString(),
      surface_question: dmSession.surface_question,
      topic_classification: dmSession.topic_classification,
      why_chain_length: dmSession.why_chain?.length || 0,
      pattern_count: dmSession.pattern_signals?.length || 0,
      primary_pattern: dmSession.pattern_signals?.[0]?.label || null,
      synthesis_core: dmSession.synthesis_core || null,
      closure_recommendation: dmSession.closure_recommendation || null,
      raw_session: { ...dmSession }
    };
    onSaveToLog(entry, 'dm');
    setSaved(true);
  };

  // Stage handlers
  const handleBegin = () => { 
    if (!textareaValue.trim()) { setValidationError('Please share a question or thought to explore.'); return; } 
    if (dmSession) {
      updateSession({ 
        surface_question: textareaValue.trim(),
        topic_classification: classifyTopic(textareaValue),
        stage: 'dm1'
      });
    } else {
      const session = createSession(textareaValue); 
      const updated = { ...session, stage: 'dm1', updated_at: new Date().toISOString() }; 
      setDmSession(updated);
    }
    setCurrentStage('dm1'); 
  };

  const handleDomainSelect = (label) => {
    setSelectedDomain(label);
    const enumValue = labelToEnum(label);
    updateSession({ topic_classification: enumValue });
  };

  const handleDM1Continue = () => { 
    updateSession({ stage: 'dm2' }); 
    setCurrentStage('dm2'); 
  };

  const handleDM2Continue = () => { 
    updateSession({ stage: 'dm3' }); 
    setCurrentStage('dm3'); 
  };

  // DM3 → DM4 transition (used by both "I'm done" and "Continue to Patterns" when chain is complete)
  const handleDM3ToDM4 = () => {
    const { patterns, confidence } = extractPatternsFromSession(dmSession);
    const newChainState = dmSession.chain_state === 'active' ? 'complete' : dmSession.chain_state;
    updateSession({ 
      chain_state: newChainState, 
      stage: 'dm4', 
      pattern_signals: patterns, 
      pattern_confidence: confidence 
    });
    setCurrentStage('dm4');
  };

  const handleAddWhyStep = () => {
    const trimmed = whyInput.trim();
    if (!trimmed) { setWhyValidationError('Please write something before continuing.'); return; }
    if (detectDistress(trimmed)) { updateSession({ chain_state: 'halted', safety_flags: { ...dmSession.safety_flags, distress_detected: true } }); return; }
    const lastWhy = dmSession.why_chain.length > 0 ? dmSession.why_chain[dmSession.why_chain.length - 1] : null;
    if (lastWhy && calculateSimilarity(trimmed, lastWhy) > 0.85) { setSimilarityWarning(true); }
    const newChain = [...dmSession.why_chain, trimmed];
    const newDepth = dmSession.recursion_depth + 1;
    const newChainState = newDepth >= MAX_DEPTH ? 'capped' : 'active';
    
    if (newDepth >= MAX_DEPTH) {
      const { patterns, confidence } = extractPatternsFromSession({ ...dmSession, why_chain: newChain });
      updateSession({ why_chain: newChain, recursion_depth: newDepth, chain_state: newChainState, stage: 'dm4', pattern_signals: patterns, pattern_confidence: confidence });
      setCurrentStage('dm4');
    } else {
      updateSession({ why_chain: newChain, recursion_depth: newDepth, chain_state: newChainState });
    }
    setWhyInput(''); setWhyValidationError(''); setSimilarityWarning(false);
  };

  const handleWhyComplete = () => {
    handleDM3ToDM4();
  };

  const handleWhyPause = () => { updateSession({ chain_state: 'stalled' }); };
  const handleWhyResume = () => { updateSession({ chain_state: 'active' }); };

  const handleDM4Continue = () => {
    const { patterns, confidence } = extractPatternsFromSession(dmSession);
    const sessionWithPatterns = { ...dmSession, pattern_signals: patterns, pattern_confidence: confidence };
    const { insight_drafts, synthesis_core } = generateInsights(sessionWithPatterns);
    updateSession({ stage: 'dm5', pattern_signals: patterns, pattern_confidence: confidence, insight_drafts, synthesis_core });
    setCurrentStage('dm5');
    setActiveInsightIndex(0);
  };

  const handleDM5Continue = () => { 
    let closureRec = dmSession.closure_recommendation;
    if (!closureRec) {
      closureRec = generateClosureRecommendation(dmSession);
    }
    updateSession({ stage: 'dm6', closure_recommendation: closureRec }); 
    setCurrentStage('dm6'); 
  };

  const cycleInsight = () => {
    const drafts = dmSession?.insight_drafts || [];
    if (drafts.length > 1) setActiveInsightIndex((activeInsightIndex + 1) % drafts.length);
  };

  // ===========================================
  // DM0: Entry (Forward only, no Back)
  // ===========================================
  if (currentStage === 'dm0') {
    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <div className="mb-6">
            <button onClick={() => setShowInfo(!showInfo)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              <HelpCircle size={18} />What is Deeper Meaning Mode?
            </button>
            {showInfo && (
              <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg text-sm text-gray-700 animate-fadeIn">
                <ul className="space-y-2">
                  <li>• Goes beyond quick decisions into deeper patterns.</li>
                  <li>• Uses a structured WHY-Chain to explore meaning safely.</li>
                  <li>• Neutral, non-therapeutic, non-prescriptive.</li>
                  <li>• Honors your pace and autonomy.</li>
                </ul>
              </div>
            )}
          </div>
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-5">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">What's the deeper question on your mind?</h2>
              <p className="text-sm text-gray-600 mt-1">Share something you'd like to explore.</p>
            </div>
            <div className="relative">
              <textarea value={textareaValue} onChange={(e) => { setTextareaValue(e.target.value.slice(0, MAX_CHARS)); if (validationError) setValidationError(''); }} placeholder="e.g., 'Why do I always feel like I'm falling behind?'" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-900 min-h-[120px] resize-y transition-shadow ${validationError ? 'border-red-300' : 'border-gray-300'}`} maxLength={MAX_CHARS} />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">{textareaValue.length}/{MAX_CHARS}</div>
            </div>
            {validationError && <p className="text-xs text-red-500">{validationError}</p>}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Or try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((prompt, idx) => (
                  <button key={idx} onClick={() => { setTextareaValue(prompt); setValidationError(''); }} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs rounded-full border border-indigo-200 transition-colors">{prompt}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-b border-gray-200 my-6" />
          <PipelineStrip currentStage={currentStage} />
          <p className="text-xs text-gray-500 text-center mt-3">3–5 min · Stop anytime</p>
          <div className="border-b border-gray-200 my-6" />
          {/* DM0: Forward CTA only (no Back) */}
          <div className="flex justify-center">
            <button onClick={handleBegin} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <span>{dmSession ? 'Continue' : 'Begin Deeper Meaning'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <button onClick={() => setShowDebug(!showDebug)} className="w-full px-5 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Debug (dev view)</span>
            {showDebug ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showDebug && (
            <div className="p-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">{dmSession ? `Session exists: ${dmSession.session_id}` : 'No session initialized yet.'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================
  // DM1: Surface Mapping (Back + Forward)
  // ===========================================
  if (currentStage === 'dm1' && dmSession) {
    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM1</span>
                <h2 className="text-3xl font-bold text-gray-900">Surface Mapping</h2>
              </div>
              <p className="text-sm text-gray-600">We'll clarify what this question is really about.</p>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <p className="text-xs font-semibold text-indigo-800 uppercase mb-1 tracking-wide">Your Question</p>
              <p className="text-gray-900 italic">"{dmSession.surface_question}"</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">What domain does this seem to live in?</p>
              <p className="text-sm text-gray-500 italic mt-1 mb-2">Choose one.</p>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_PILL_CONFIG.map((domain) => {
                  const isSelected = selectedDomain === domain.label;
                  return (
                    <button key={domain.label} onClick={() => handleDomainSelect(domain.label)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{domain.label}</button>
                  );
                })}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">In this step, we're mapping the surface of your question — not to rush toward answers, but to make sure we're exploring the right territory.</p>
            </div>
            {/* DM1: Back + Forward */}
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleDM1Continue} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>Continue to DM2</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // DM2: Anchor Detection (Back + Forward)
  // ===========================================
  if (currentStage === 'dm2' && dmSession) {
    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM2</span>
                <h2 className="text-3xl font-bold text-gray-900">Anchor Detection</h2>
              </div>
              <p className="text-sm text-gray-600">We're looking for identity, values, and relational anchors.</p>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <p className="text-xs font-semibold text-indigo-800 uppercase mb-1 tracking-wide">Your Question</p>
              <p className="text-gray-900 italic">"{dmSession.surface_question}"</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Types of anchors we look for:</p>
              <div className="grid gap-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4"><p className="text-sm font-semibold text-purple-800">🪞 Identity Anchors</p><p className="text-xs text-purple-700 mt-1">Who you see yourself as, who you want to become</p></div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-sm font-semibold text-amber-800">⚖️ Value Anchors</p><p className="text-xs text-amber-700 mt-1">What matters most to you, principles you live by</p></div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4"><p className="text-sm font-semibold text-pink-800">🤝 Relational Anchors</p><p className="text-xs text-pink-700 mt-1">Key relationships, social roles, commitments</p></div>
              </div>
            </div>
            {/* DM2: Back + Forward */}
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleDM2Continue} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>Continue to DM3</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // DM3: WHY-Chain (Back always visible + Forward CTA based on state)
  // ===========================================
  if (currentStage === 'dm3' && dmSession) {
    const whyChain = dmSession.why_chain || [];
    const currentDepth = dmSession.recursion_depth || 0;
    const chainState = dmSession.chain_state || 'active';
    
    // Determine if chain is in a "completed" state (can proceed directly to DM4)
    const isChainComplete = whyChain.length > 0 && ['complete', 'capped', 'halted'].includes(chainState);
    const isStalled = chainState === 'stalled';
    const isActive = chainState === 'active';

    // Distress detected - special handling
    if (dmSession.safety_flags?.distress_detected) {
      return (
        <div ref={contentRef} className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
            <PipelineStrip currentStage={currentStage} />
            <div className="border-b border-gray-200 my-6" />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-2">Let's pause here.</p>
                  <p className="text-sm text-amber-700 leading-relaxed">It sounds like you might be going through something difficult. This tool isn't designed for crisis support. If you're struggling, please reach out to someone who can help.</p>
                </div>
              </div>
            </div>
            {/* Even in distress state, provide Back navigation */}
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM3</span>
                <h2 className="text-3xl font-bold text-gray-900">WHY-Chain Exploration</h2>
              </div>
              <p className="text-sm text-gray-600">We'll explore a few layers of "why" at your pace. You can stop anytime.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</span>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map((step) => (
                  <div key={step} className={`w-8 h-2 rounded-full transition-colors duration-200 ${step < currentDepth ? 'bg-green-500' : step === currentDepth ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">Step {Math.min(currentDepth + 1, MAX_DEPTH)} of {MAX_DEPTH}</span>
            </div>

            <div className="border-b border-gray-200" />

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wide">Your original question</p>
              <p className="text-sm text-gray-800 italic">"{dmSession.surface_question}"</p>
            </div>

            {whyChain.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your WHY steps so far</p>
                <div className="space-y-2">
                  {whyChain.map((why, idx) => (
                    <div key={idx} className="flex gap-3 items-start animate-fadeIn">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-gray-200" />

            {/* STALLED STATE: Resume or move to DM4 */}
            {isStalled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">Session paused. You can return to continue or move on.</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button onClick={handleWhyResume} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">Resume</button>
                  <button onClick={handleDM3ToDM4} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">Move to DM4</button>
                </div>
              </div>
            )}

            {/* CHAIN COMPLETE STATE: Show direct forward CTA */}
            {isChainComplete && !isStalled && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    WHY-Chain {chainState === 'capped' ? 'reached depth limit' : chainState === 'halted' ? 'paused early' : 'complete'} · {whyChain.length} step{whyChain.length !== 1 ? 's' : ''} captured.
                  </p>
                </div>
                <p className="text-xs text-green-700">You can continue to pattern recognition.</p>
              </div>
            )}

            {/* ACTIVE STATE: Input and action buttons */}
            {isActive && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Next WHY</label>
                  <div className="relative">
                    <textarea value={whyInput} onChange={(e) => { setWhyInput(e.target.value.slice(0, WHY_MAX_CHARS)); if (whyValidationError) setWhyValidationError(''); if (similarityWarning) setSimilarityWarning(false); }} placeholder="Write whatever feels honest. There's no right answer." className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 min-h-[80px] resize-y transition-shadow ${whyValidationError ? 'border-red-300' : 'border-gray-300'}`} maxLength={WHY_MAX_CHARS} />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">{whyInput.length}/{WHY_MAX_CHARS}</div>
                  </div>
                  {whyValidationError && <p className="text-xs text-red-500 mt-1">{whyValidationError}</p>}
                  {similarityWarning && <p className="text-xs text-amber-600 mt-1">This sounds similar to your last step. You can add it anyway or pause here.</p>}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={handleAddWhyStep} className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition-colors">Add this step</button>
                  <button onClick={handleWhyComplete} className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">I'm done for now</button>
                  <button onClick={handleWhyPause} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors">Pause here</button>
                </div>
              </div>
            )}

            {/* DM3: NAVIGATION - Back always visible, Forward when chain complete */}
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              {/* Show explicit forward CTA when chain is complete (not stalled - stalled has its own buttons above) */}
              {isChainComplete && !isStalled && (
                <button onClick={handleDM3ToDM4} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <span>Continue to Patterns (DM4)</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // DM4: Pattern Recognition (Back + Forward)
  // ===========================================
  if (currentStage === 'dm4' && dmSession) {
    const whyChain = dmSession.why_chain || [];
    const patterns = dmSession.pattern_signals || [];
    const confidence = dmSession.pattern_confidence || 0;
    const chainState = dmSession.chain_state || 'complete';

    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM4</span>
                <h2 className="text-3xl font-bold text-gray-900">Pattern Recognition</h2>
              </div>
              <p className="text-sm text-gray-600">Here's a neutral look at some themes in what you wrote.</p>
            </div>

            {chainState === 'complete' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">WHY-Chain Complete · You explored {whyChain.length} step{whyChain.length !== 1 ? 's' : ''}.</p>
              </div>
            )}
            {chainState === 'capped' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                <TrendingUp size={18} className="text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">WHY-Chain Reached the Depth Limit · We'll work with what you shared.</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your WHY-Chain</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {whyChain.map((why, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center">{idx + 1}</span>
                    <p className="text-sm text-gray-700">{why}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b border-gray-200" />

            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pattern Highlights</p>
              {patterns.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">No clear patterns surfaced. That's okay — sometimes a question is still forming.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patterns.map((pattern, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-5 space-y-3 hover:border-gray-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{pattern.label}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[pattern.category] || 'bg-gray-100 text-gray-600'}`}>{pattern.category}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STRENGTH_COLORS[pattern.strength]}`}>{pattern.strength}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{pattern.description}</p>
                      {pattern.evidence.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-gray-500">Evidence from your WHY-Chain:</p>
                          {pattern.evidence.map((line, lineIdx) => (
                            <p key={lineIdx} className="text-xs text-gray-500 italic pl-3 border-l-2 border-gray-200">"{line}"</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">Confidence in these patterns: <span className="font-semibold">{confidenceLabel(confidence)}</span></p>
            </div>

            <div className="border-b border-gray-200" />

            {/* DM4: Back + Forward */}
            <div className="flex justify-center gap-3">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleDM4Continue} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>Continue to Insight (DM5)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================
  // DM5: Insight Synthesis (Back + Forward)
  // ===========================================
  if (currentStage === 'dm5' && dmSession) {
    const insightDrafts = dmSession.insight_drafts || [];
    const synthesisCore = dmSession.synthesis_core || '';
    const activeInsight = insightDrafts[activeInsightIndex] || insightDrafts[0];
    const whyChain = dmSession.why_chain || [];
    const patterns = dmSession.pattern_signals || [];

    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM5</span>
                <h2 className="text-3xl font-bold text-gray-900">Insight</h2>
              </div>
              <p className="text-sm text-gray-600">Here's a neutral look at the themes in your reflection.</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-3 tracking-wide">Based on what you shared</p>
              <p className="text-lg text-gray-900 leading-relaxed font-medium">
                {activeInsight?.text || synthesisCore}
              </p>
              {activeInsight && (
                <p className="text-xs text-indigo-500 mt-3 italic">Style: {activeInsight.style}</p>
              )}
            </div>

            {insightDrafts.length > 1 && (
              <div className="flex justify-center">
                <button onClick={cycleInsight} className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                  <RefreshCw size={16} />
                  See another wording ({activeInsightIndex + 1}/{insightDrafts.length})
                </button>
              </div>
            )}

            <div className="border-b border-gray-200" />

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Exploration So Far</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>WHY steps explored: {whyChain.length}</li>
                <li>Patterns detected: {patterns.length}</li>
                <li>Chain state: {dmSession.chain_state}</li>
              </ul>
            </div>

            <div className="border-b border-gray-200" />

            {/* DM5: Back + Forward */}
            <div className="flex justify-center gap-3">
              <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button onClick={handleDM5Continue} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
                <span>Continue to Closure (DM6)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <button onClick={() => setShowDebug(!showDebug)} className="w-full px-5 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">Debug (dev view)<span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-normal normal-case">insights: {insightDrafts.length}</span></span>
            {showDebug ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showDebug && (
            <div className="p-4 border-t border-gray-100">
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
{JSON.stringify({ stage: dmSession.stage, synthesis_core: synthesisCore, insight_drafts: insightDrafts.map(d => ({ style: d.style, text: d.text.slice(0, 50) + '...' })) }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===========================================
  // DM6: Closure (Back + Reset, no Forward)
  // ===========================================
  if (currentStage === 'dm6' && dmSession) {
    const whyChain = dmSession.why_chain || [];
    const patterns = dmSession.pattern_signals || [];
    const synthesisCore = dmSession.synthesis_core || '';
    const closureRec = dmSession.closure_recommendation || '';

    return (
      <div ref={contentRef} className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 animate-fadeIn">
          <PipelineStrip currentStage={currentStage} />
          <div className="border-b border-gray-200 my-6" />
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">DM6</span>
                <h2 className="text-3xl font-bold text-gray-900">Closure</h2>
              </div>
              <p className="text-sm text-gray-600">A brief reflection on where you've landed for now.</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm font-semibold text-green-800">Exploration Complete</p>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• WHY steps explored: {whyChain.length}</li>
                <li>• Patterns detected: {patterns.length}</li>
                <li>• Insight generated: {synthesisCore ? '✓' : '—'}</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wide">Something you might hold lightly from this reflection:</p>
              <p className="text-base text-gray-800 leading-relaxed">
                {closureRec}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3">
          {!saved ? (
            <button onClick={handleSaveJourney} className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <BookOpen size={18} />
              <span>Save this journey</span>
            </button>
          ) : (
            <p className="text-sm text-gray-600">Saved to log.</p>
          )}
          
          {/* DM6: Back + Reset (no forward) */}
          <div className="flex gap-3">
            <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button onClick={handleReset} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={18} />
              <span>Start a New Question</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <button onClick={() => setShowDebug(!showDebug)} className="w-full px-5 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">Debug (dev view)<span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-normal normal-case">DM6</span></span>
            {showDebug ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showDebug && (
            <div className="p-4 border-t border-gray-100">
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-48">
{JSON.stringify({ 
  stage: dmSession.stage, 
  chain_state: dmSession.chain_state, 
  why_chain_length: whyChain.length, 
  pattern_count: patterns.length, 
  topic_classification: dmSession.topic_classification,
  synthesis_core: synthesisCore,
  closure_recommendation: closureRec
}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// =============================================================================
// MAIN APP SHELL
// =============================================================================

export default function FindMyWhyAppShell() {
  const [activeMode, setActiveMode] = useState('deeper_meaning');
  const [showLogModal, setShowLogModal] = useState(false);
  const [icLog, setIcLog] = useState([]);
  const [dmLog, setDmLog] = useState([]);
  const [hasEntered, setHasEntered] = useState(false);

  const handleSaveToLog = (entry, type) => {
    if (type === 'ic') {
      setIcLog(prev => [entry, ...prev]);
    } else if (type === 'dm') {
      setDmLog(prev => [entry, ...prev]);
    }
  };

  const handleEnterIC = () => {
    // Entry Hatch direct mode entry (can be collapsed back to mode selector later)
    setHasEntered(true);
    setActiveMode('instant_clarity');
  };

  const handleEnterDM = () => {
    // Entry Hatch direct mode entry (can be collapsed back to mode selector later)
    setHasEntered(true);
    setActiveMode('deeper_meaning');
  };

  if (!hasEntered) {
    // Entry Hatch direct mode entry (can be collapsed back to mode selector later)
    return <HomeScreen onEnterIC={handleEnterIC} onEnterDM={handleEnterDM} onQuickClarity={handleEnterIC} onDeeperMeaning={handleEnterDM} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.25s ease-out forwards;
          }
        `}</style>

        <LogHistoryModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          icLog={icLog}
          dmLog={dmLog}
        />

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-3">FindMyWhy.ai</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveMode('instant_clarity')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${activeMode === 'instant_clarity' ? 'bg-indigo-600 text-white shadow-sm' : 'border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'}`}>Instant Clarity</button>
              <button onClick={() => setActiveMode('deeper_meaning')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${activeMode === 'deeper_meaning' ? 'bg-indigo-600 text-white shadow-sm' : 'border border-indigo-300 text-indigo-600 bg-white hover:bg-indigo-50'}`}>Deeper Meaning</button>
            </div>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            📒 View log history
            {(icLog.length + dmLog.length) > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">{icLog.length + dmLog.length}</span>
            )}
          </button>
        </div>
        {activeMode === 'instant_clarity' && <InstantClarityContent onSaveToLog={handleSaveToLog} />}
        {activeMode === 'deeper_meaning' && <DeeperMeaningApp_v60_4 />}
        <div className="text-center text-sm text-gray-600 mt-8 pb-4"><p>FindMyWhy.ai isn't therapy or coaching — it's your brain with super-charged<br className="hidden sm:inline" /> AI clarity, helping you make sense of your own reasoning.</p></div>
      </main>
    </div>
  );
}
