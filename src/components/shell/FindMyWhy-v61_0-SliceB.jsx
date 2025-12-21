// =============================================================================
// FindMyWhy.ai — v61.0 Slice B (Fully Functional Prototype)
// Deeper Meaning Flow with Clarity Artifact
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, HelpCircle, CheckCircle, AlertCircle, Clipboard, Check, BookOpen } from 'lucide-react';
import HomeScreen from "../home/HomeScreen.jsx";
import { BackToHomePill } from "../ui";

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
// QC PATTERN TAGS EXTRACTION (v64.1 - Deterministic)
// =============================================================================

/**
 * Deterministic tag extraction from QC inputs/outputs
 * Returns 2-3 tags (max 4) based on keyword presence in QC data
 * Enforces minimum of 2 tags when SIGNALS section renders
 */
function extractQcPatternTags(qc2_choice_frame, qc3_influences, qc4_forced_pick, qc5Results) {
  // Build text blob from available inputs/outputs
  const textParts = [
    qc2_choice_frame || '',
    qc3_influences || '',
    qc4_forced_pick || '',
    qc5Results?.instinctual_pull || '',
    qc5Results?.what_influenced_it || '',
  ];
  const textBlob = textParts.join(' ').toLowerCase();

  // Tag keyword mappings (specific tags rank higher)
  const tagMappings = [
    // High priority (specific, situational)
    { keywords: ['comfort', 'comfortable', 'cozy', 'relax', 'rest', 'tired', 'exhausted'], tag: 'comfort' },
    { keywords: ['uncertainty', 'uncertain', 'unsure', 'doubt', 'confused', 'confusion'], tag: 'uncertainty' },
    { keywords: ['energy', 'energetic', 'motivated', 'motivation', 'drive'], tag: 'energy' },
    { keywords: ['money', 'financial', 'cost', 'expensive', 'afford', 'budget', 'spend'], tag: 'money' },
    { keywords: ['time', 'timing', 'quick', 'fast', 'rush', 'hurry', 'deadline', 'schedule'], tag: 'timing' },
    { keywords: ['social', 'people', 'others', 'friends', 'family', 'alone', 'lonely'], tag: 'social' },
    { keywords: ['avoidance', 'avoid', 'escape', 'procrastinate', 'delay', 'postpone'], tag: 'avoidance' },
    { keywords: ['novelty', 'new', 'different', 'try', 'experiment', 'curious', 'curiosity'], tag: 'novelty' },
    { keywords: ['security', 'safe', 'secure', 'stable', 'stability', 'risk', 'risky'], tag: 'security' },
    { keywords: ['connection', 'connect', 'relationship', 'bond', 'close', 'intimacy'], tag: 'connection' },
    { keywords: ['effort', 'work', 'hard', 'difficult', 'challenge', 'struggle', 'easy', 'simple'], tag: 'effort' },
    { keywords: ['convenience', 'convenient', 'easy', 'simple', 'quick', 'fast'], tag: 'convenience' },
    // Lower priority (generic - demoted to avoid appearing alone)
    { keywords: ['should', 'must', 'have to', 'need to', 'expected'], tag: 'responsibility' },
    { keywords: ['fear', 'afraid', 'worry', 'anxious', 'scared'], tag: 'fear' },
    // Ultra-generic (lowest priority - only appear with other tags)
    { keywords: ['want', 'desire', 'wish', 'hope'], tag: 'desire' },
  ];

  // Fallback pool for backfilling when only one tag detected (ordered by preference)
  const FALLBACK_TAGS = ['effort', 'comfort', 'convenience', 'uncertainty'];

  // Detect tags by keyword presence
  const tagScores = {};

  tagMappings.forEach((mapping, index) => {
    const { keywords, tag } = mapping;
    const matches = keywords.filter(keyword => textBlob.includes(keyword)).length;
    if (matches > 0) {
      // Score: number of keyword matches + priority boost (earlier tags = higher priority)
      // Ultra-generic tags (desire) get strong negative boost to demote them below situational tags
      let priorityBoost = 0;
      if (index < 12) {
        priorityBoost = 1; // High priority situational tags
      } else if (tag === 'desire') {
        priorityBoost = -3; // Strong demotion: ensures #desire ranks below situational tags even with same match count
      }
      tagScores[tag] = (tagScores[tag] || 0) + matches + priorityBoost;
    }
  });

  // Sort by score (descending) and deduplicate
  const sortedTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  // Minimum enforcement: if zero tags, omit SIGNALS entirely
  if (sortedTags.length === 0) {
    return [];
  }

  // If only one tag detected, backfill with one from fallback pool
  if (sortedTags.length === 1) {
    const existingTag = sortedTags[0];
    // Find first fallback tag that's not already present
    const fallbackTag = FALLBACK_TAGS.find(tag => tag !== existingTag);
    if (fallbackTag) {
      return [existingTag, fallbackTag];
    }
    // If all fallbacks are the same as existing, return as-is (shouldn't happen, but safe)
    return sortedTags;
  }

  // If 2+ tags, return up to 4 (preferred 2-3, hard max 4)
  return sortedTags.slice(0, 4);
}

// =============================================================================
// QC TENSION DETECTION (v64.1 - Deterministic)
// =============================================================================

/**
 * Detects mismatch/contradiction between forced pick and distilled choice/framing
 * Returns tension description if mismatch detected, null otherwise
 */
function detectQcTension(qc2_choice_frame, qc4_forced_pick, qc5Results) {
  // Conservative detection: only show when fairly sure
  if (!qc4_forced_pick || !qc2_choice_frame) return null;

  const forcedPickLower = qc4_forced_pick.toLowerCase().trim();
  const choiceFrameLower = qc2_choice_frame.toLowerCase().trim();

  // Check if instinctual_pull contains tension indicators
  const instinctualPull = qc5Results?.instinctual_pull || '';
  const hasTensionPhrasing = instinctualPull.match(/\b(vs|versus|between|torn|conflicted|split|divided)\b/i);

  // Check if distilled_choice does NOT include forced pick
  const distilledChoice = qc5Results?.distilled_choice || '';
  const distilledChoiceLower = distilledChoice.toLowerCase();
  
  // Extract key words from forced pick (first 2-3 words)
  const forcedPickWords = forcedPickLower.split(/\s+/).slice(0, 3).filter(w => w.length > 2);
  const forcedPickInDistilled = forcedPickWords.some(word => distilledChoiceLower.includes(word));

  // Check if choice frame implies two options but forced pick not reflected
  const frameHasOptions = choiceFrameLower.match(/\b(or|vs|versus|between|either)\b/i);
  const frameWords = choiceFrameLower.split(/\s+/).slice(0, 5).filter(w => w.length > 2);
  const forcedPickInFrame = forcedPickWords.some(word => frameWords.some(fw => fw.includes(word) || word.includes(fw)));

  // Trigger conditions (conservative - need clear signal)
  if (hasTensionPhrasing && !forcedPickInDistilled) {
    // Tension phrasing exists and forced pick not in distilled choice
    const shortFrame = qc2_choice_frame.split(/\s+/).slice(0, 4).join(' ');
    return {
      detected: true,
      description: `Your forced pick leans toward "${qc4_forced_pick}", while your framing highlights ${shortFrame}.`
    };
  }

  if (frameHasOptions && !forcedPickInFrame && !forcedPickInDistilled) {
    // Frame has options but forced pick doesn't align with frame or distilled
    const shortFrame = qc2_choice_frame.split(/\s+/).slice(0, 4).join(' ');
    return {
      detected: true,
      description: `Your forced pick leans toward "${qc4_forced_pick}", while your framing highlights ${shortFrame}.`
    };
  }

  return null;
}

// =============================================================================
// DM4 → DM5 PAYLOAD GENERATION
// =============================================================================

function buildDM4Payload(whyChain, patterns, surfaceQuestion, domainsSelected, otherSpecify) {
  // Extract evidence from whyChain for each pattern
  const whyTexts = whyChain.map(w => w.whyText);
  const whyTextLower = whyTexts.join(' ').toLowerCase();
  
  // Build pattern data with evidence
  const patternData = patterns.map(p => {
    const evidence = [];
    const patternWords = PATTERN_KEYWORDS[p.id]?.words || [];
    whyTexts.forEach((text, idx) => {
      const textLower = text.toLowerCase();
      if (patternWords.some(word => textLower.includes(word))) {
        evidence.push({ step: idx + 1, text: text });
      }
    });
    
    return {
      id: p.id,
      label: p.label,
      category: p.category,
      strength: p.strength,
      evidence: evidence.slice(0, 3) // Limit evidence
    };
  });
  
  // Identify tensions (simplified: look for contrasting patterns)
  const tensions = [];
  if (patterns.length >= 2) {
    const highStrength = patterns.filter(p => p.strength === 'high');
    if (highStrength.length >= 2) {
      tensions.push({
        between: [highStrength[0].id, highStrength[1].id],
        description: `Tension between ${highStrength[0].label.toLowerCase()} and ${highStrength[1].label.toLowerCase()}`
      });
    }
  }
  
  // Directional signals (simplified: based on pattern categories)
  const directionalSignals = [];
  if (patterns.some(p => p.category === 'values')) {
    directionalSignals.push('values-oriented');
  }
  if (patterns.some(p => p.category === 'identity')) {
    directionalSignals.push('identity-related');
  }
  if (patterns.some(p => p.category === 'emotion')) {
    directionalSignals.push('emotionally-charged');
  }
  
  // Fog indicators (simplified: based on pattern strength distribution)
  const fogIndicators = [];
  const lowStrengthCount = patterns.filter(p => p.strength === 'low').length;
  if (lowStrengthCount > patterns.length / 2) {
    fogIndicators.push('multiple-low-strength-patterns');
  }
  if (patterns.length === 0) {
    fogIndicators.push('no-patterns-detected');
  }
  
  // Build domain array for payload (include "other" with specify text if present)
  const domainArray = domainsSelected.map(d => {
    if (d === 'other' && otherSpecify && otherSpecify.trim()) {
      return `other:${otherSpecify.trim()}`;
    }
    return d;
  });

  const payload = {
    surfaceQuestion: surfaceQuestion || null,
    domains: domainArray.length > 0 ? domainArray : null,
    whyChain: whyTexts,
    themes: patternData.map(p => ({ id: p.id, label: p.label, category: p.category })),
    evidence: patternData.flatMap(p => p.evidence.map(e => ({ patternId: p.id, ...e }))),
    tensions: tensions,
    directionalSignals: directionalSignals,
    fogIndicators: fogIndicators,
    patternStrengths: patternData.map(p => ({ id: p.id, strength: p.strength }))
  };
  
  return JSON.stringify(payload);
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
  const { dm5OutputText, holdLightlyText, patterns } = artifact;
  console.log('formatArtifactForClipboard received:', { holdLightlyText, patterns, hasHoldLightly: !!holdLightlyText, patternsLength: patterns?.length });
  
  // Format date and time: "12/18/2025 at 3:47:22 PM"
  const date = new Date(artifact.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const generatedLine = `Generated: ${dateStr} at ${timeStr}`;
  
  const lines = ['Clarity Snapshot — FindMyWhy.ai', generatedLine, ''];
  
  if (artifact.surfaceQuestion) {
    lines.push('Question:', `"${artifact.surfaceQuestion}"`, '');
  }
  
  if (artifact.whyChain.length > 0) {
    lines.push('WHY Chain:');
    artifact.whyChain.forEach((why, i) => lines.push(`${i + 1}. ${why}`));
    lines.push('');
  }
  
  // Robust insight text selection: prefer dm5OutputText, fallback to artifact insights
  let insightText = null;
  if (dm5OutputText && typeof dm5OutputText === 'string' && dm5OutputText.trim().length > 0) {
    insightText = dm5OutputText.trim();
  } else if (artifact.insights && Array.isArray(artifact.insights) && artifact.insights.length > 0) {
    // Find first non-empty insight text
    for (const insight of artifact.insights) {
      if (insight && insight.text && typeof insight.text === 'string' && insight.text.trim().length > 0) {
        insightText = insight.text.trim();
        break;
      }
    }
  }
  
  // Append Insight section when insight text exists
  if (insightText) {
    lines.push('Insight:', '');
    lines.push(insightText);
    lines.push('');
  }
  
  // SOMETHING YOU MIGHT HOLD LIGHTLY section
  console.log('Checking holdLightlyText:', { holdLightlyText, type: typeof holdLightlyText, trimmed: holdLightlyText?.trim(), length: holdLightlyText?.trim()?.length });
  if (holdLightlyText && typeof holdLightlyText === 'string' && holdLightlyText.trim().length > 0) {
    console.log('Adding SOMETHING YOU MIGHT HOLD LIGHTLY section');
    lines.push('SOMETHING YOU MIGHT HOLD LIGHTLY:');
    lines.push(holdLightlyText.trim());
    lines.push('');
  } else {
    console.log('SKIPPING SOMETHING YOU MIGHT HOLD LIGHTLY section - condition failed');
  }
  
  // PATTERNS SURFACED section (includes all patterns with levels)
  console.log('Checking patterns:', { patterns, isArray: Array.isArray(patterns), length: patterns?.length });
  if (patterns && Array.isArray(patterns) && patterns.length > 0) {
    console.log('Adding PATTERNS SURFACED section');
    lines.push('PATTERNS SURFACED');
    patterns.forEach(p => {
      if (p && p.label && p.strength) {
        // Map strength values: 'high', 'medium', 'low' -> 'high', 'med', 'low'
        const levelDisplay = p.strength === 'medium' ? 'med' : p.strength;
        lines.push(`• ${p.label} — ${levelDisplay}`);
      }
    });
    lines.push('');
  } else {
    console.log('SKIPPING PATTERNS SURFACED section - condition failed');
  }
  
  return lines.join('\n');
}

function ClarityArtifactPanel({ artifact, dm5OutputText, holdLightlyText, patterns }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const artifactWithExtras = {
      ...artifact,
      dm5OutputText,
      holdLightlyText,
      patterns,
    };
    console.log({ holdLightlyText, patterns, artifactHold: artifact.holdLightlyText, artifactPatterns: artifact.patterns, artifactWithExtras });
    const text = formatArtifactForClipboard(artifactWithExtras);
    console.log('Formatted text length:', text.length, 'First 500 chars:', text.substring(0, 500));
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

// =============================================================================
// DOMAIN LABEL FORMATTING
// =============================================================================

function formatDomainLabel(domain) {
  const labelMap = {
    work: 'Work',
    relationships: 'Relationships',
    identity: 'Identity',
    habit: 'Habit',
    purpose: 'Purpose',
    values: 'Values',
    other: 'Other',
  };
  // Handle "other:specify" format by extracting just "other"
  const baseDomain = domain.includes(':') ? domain.split(':')[0] : domain;
  return labelMap[baseDomain] || 'Other';
}

// =============================================================================
// DOMAIN-ANCHOR WEIGHTING MAP (for DM2 anchor detection)
// =============================================================================

// Domain-weighting map: domain -> anchor boost values (only identity/value/relational)
const DOMAIN_ANCHOR_BOOSTS = {
  work: {
    'value': +1,
    'identity': +1,
    'relational': +0,
  },
  relationships: {
    'relational': +2,
    'value': +0,
    'identity': +0,
  },
  identity: {
    'identity': +2,
    'value': +0,
    'relational': +0,
  },
  habit: {
    'identity': +1,
    'value': +1,
    'relational': +0,
  },
  purpose: {
    'identity': +1,
    'value': +1,
    'relational': +0,
  },
  values: {
    'value': +2,
    'identity': +0,
    'relational': +0,
  },
  other: {
    'identity': +0,
    'value': +0,
    'relational': +0,
  },
};

// Optional: keyword-to-anchor boost for "other" specify text (mapped to identity/value/relational only)
const OTHER_SPECIFY_KEYWORD_BOOSTS = {
  health: { 'identity': +1, 'value': +0, 'relational': +0 },
  money: { 'value': +1, 'identity': +0, 'relational': +0 },
  creativity: { 'identity': +1, 'value': +0, 'relational': +0 },
};

/**
 * Get anchor boosts based on selected domains and optional otherSpecify text
 * Returns a map of anchor -> boost value (only for identity/value/relational)
 */
function getAnchorBoostsFromDomains(domainsSelected, otherSpecify = '') {
  const boosts = { identity: 0, value: 0, relational: 0 };
  
  // Apply boosts from each selected domain
  domainsSelected.forEach(domain => {
    const domainBoosts = DOMAIN_ANCHOR_BOOSTS[domain] || {};
    if (domainBoosts.identity) boosts.identity += domainBoosts.identity;
    if (domainBoosts.value) boosts.value += domainBoosts.value;
    if (domainBoosts.relational) boosts.relational += domainBoosts.relational;
  });
  
  // Optional: apply keyword-based boosts from otherSpecify
  if (otherSpecify && otherSpecify.trim()) {
    const otherSpecifyLower = otherSpecify.trim().toLowerCase();
    Object.entries(OTHER_SPECIFY_KEYWORD_BOOSTS).forEach(([keyword, keywordBoosts]) => {
      if (otherSpecifyLower.includes(keyword)) {
        if (keywordBoosts.identity) boosts.identity += keywordBoosts.identity;
        if (keywordBoosts.value) boosts.value += keywordBoosts.value;
        if (keywordBoosts.relational) boosts.relational += keywordBoosts.relational;
      }
    });
  }
  
  return boosts;
}

/**
 * Rules-based anchor detection: scores the three anchor types based on surface question text
 * Returns: 'identity' | 'value' | 'relational'
 */
function detectAnchor(surfaceQuestion, domainsSelected = [], otherSpecify = '') {
  const text = (surfaceQuestion || '').toLowerCase();
  
  // Base scoring from question text (rules-based)
  const baseScores = {
    identity: 0,
    value: 0,
    relational: 0,
  };
  
  // Identity anchor keywords
  const identityKeywords = [
    'who i am', 'who am i', 'identity', 'myself', 'becoming', 'become',
    'person i', 'personality', 'self', 'authentic', 'true self', 'authenticity'
  ];
  identityKeywords.forEach(keyword => {
    if (text.includes(keyword)) baseScores.identity += 2;
  });
  
  // Value anchor keywords
  const valueKeywords = [
    'value', 'values', 'matters', 'matter', 'important', 'believe', 'belief',
    'principle', 'principles', 'morals', 'ethics', 'care about', 'stand for'
  ];
  valueKeywords.forEach(keyword => {
    if (text.includes(keyword)) baseScores.value += 2;
  });
  
  // Relational anchor keywords
  const relationalKeywords = [
    'relationship', 'relationships', 'partner', 'friend', 'friends', 'family',
    'parent', 'child', 'spouse', 'colleague', 'boss', 'people', 'others',
    'social', 'connect', 'connection', 'commitment', 'role', 'roles'
  ];
  relationalKeywords.forEach(keyword => {
    if (text.includes(keyword)) baseScores.relational += 2;
  });
  
  // Get domain boosts
  const boosts = getAnchorBoostsFromDomains(domainsSelected, otherSpecify);
  
  // Apply boosts to base scores
  const finalScores = {
    identity: baseScores.identity + (boosts.identity || 0),
    value: baseScores.value + (boosts.value || 0),
    relational: baseScores.relational + (boosts.relational || 0),
  };
  
  // Deterministic tie-break: identity > value > relational
  // Find the highest score
  const maxScore = Math.max(finalScores.identity, finalScores.value, finalScores.relational);
  
  // Check in priority order (identity > value > relational)
  if (finalScores.identity === maxScore) return 'identity';
  if (finalScores.value === maxScore) return 'value';
  return 'relational';
}
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
  const [domainsSelected, setDomainsSelected] = useState([]); // Array, max length 3
  const [otherSpecify, setOtherSpecify] = useState(''); // String for "other" specification
  const [domainSelectionError, setDomainSelectionError] = useState(''); // For over-selection feedback
  const [whyChain, setWhyChain] = useState([]);
  const [whyInput, setWhyInput] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [insight, setInsight] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  
  // DM5 runtime state
  const [dm4PayloadJson, setDm4PayloadJson] = useState('');
  const [dm5OutputText, setDm5OutputText] = useState('');
  const [dm5Status, setDm5Status] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [dm5Error, setDm5Error] = useState('');
  
  // DM3 editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  // DM4 Refine Loop state
  const [refineUsed, setRefineUsed] = useState(false);
  const [entryContext, setEntryContext] = useState('normal'); // 'normal' | 'refine'
  const [whyCountError, setWhyCountError] = useState('');
  
  // IC state
  const [icStage, setIcStage] = useState('input');
  const [icDecision, setIcDecision] = useState('');
  const [icUserInput, setIcUserInput] = useState('');
  const [icAnswers, setIcAnswers] = useState({ initial: '', q1: '', q2: '', q3: '' });
  const [icTags, setIcTags] = useState([]);
  const [icShowTooltip, setIcShowTooltip] = useState(false);
  const [icSaved, setIcSaved] = useState(false);
  
  // QC-5 state
  const [qc5Status, setQc5Status] = useState('idle'); // 'idle' | 'loading' | 'error'
  const [qc5Results, setQc5Results] = useState(null); // { distilled_choice, what_influenced_it, instinctual_pull, what_this_says_about_this_moment, reframe_want, reframe_need }
  const [qc5Error, setQc5Error] = useState('');
  
  const contentRef = useRef(null);
  const MAX_DEPTH = 5;

  const resetDM = () => {
    setCurrentStep(0);
    setSurfaceQuestion("");
    setDomainsSelected([]);
    setOtherSpecify("");
    setDomainSelectionError("");
    setWhyChain([]);
    setWhyInput("");
    setPatterns([]);
    setInsight("");
    setDm4PayloadJson("");
    setDm5OutputText("");
    setDm5Status('idle');
    setDm5Error("");
    setRefineUsed(false);
    setEntryContext('normal');
    setWhyCountError('');
  };

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep]);

  // DM4: Force clean recompute of patterns from current whyChain when mounting
  useEffect(() => {
    if (currentStep === 4 && whyChain.length >= 2) {
      // Clean and trim WHY chain
      const cleanedChain = whyChain
        .map(w => ({ ...w, whyText: w.whyText.trim() }))
        .filter(w => w.whyText.length > 0);
      
      if (cleanedChain.length >= 2) {
        // Recompute patterns from current whyChain (clean recompute)
        const p = extractPatterns(cleanedChain);
        setPatterns(p);
        setInsight(generateInsight(p));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Auto-dismiss domain selection error after 3 seconds
  useEffect(() => {
    if (domainSelectionError) {
      const timer = setTimeout(() => {
        setDomainSelectionError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [domainSelectionError]);

  // QC-5 API call when results stage is reached
  useEffect(() => {
    if (icStage === 'results' && qc5Status === 'idle' && !qc5Results) {
      // Map IC answers to QC inputs
      const qc1_decision = icAnswers.initial || '';
      const qc2_choice_frame = icAnswers.q1 || '';
      const qc3_influences = icAnswers.q2 || '';
      const qc4_forced_pick = icAnswers.q3 || '';

      // Only call API if all inputs are present
      if (qc1_decision && qc2_choice_frame && qc3_influences && qc4_forced_pick) {
        setQc5Status('loading');
        setQc5Error('');

        fetch('/api/qc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qc1_decision,
            qc2_choice_frame,
            qc3_influences,
            qc4_forced_pick,
          }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            // Validate response has all required keys
            const requiredKeys = [
              'distilled_choice',
              'what_influenced_it',
              'instinctual_pull',
              'what_this_says_about_this_moment',
              'reframe_want',
              'reframe_need'
            ];
            const hasAllKeys = requiredKeys.every(key => key in data && typeof data[key] === 'string');
            
            if (hasAllKeys) {
              setQc5Results(data);
              setQc5Status('idle');
            } else {
              throw new Error('Invalid response format');
            }
          })
          .catch((error) => {
            console.error('QC-5 API error:', error);
            setQc5Error(error.message || 'Failed to generate clarity');
            setQc5Status('error');
          });
      }
    }
  }, [icStage, qc5Status, qc5Results, icAnswers]);

  const handleBack = () => {
    const prev = getPrevStep(currentStep);
    if (prev !== null) setCurrentStep(prev);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSurfaceQuestion('');
    setDomainsSelected([]);
    setOtherSpecify('');
    setDomainSelectionError('');
    setWhyChain([]);
    setWhyInput('');
    setPatterns([]);
    setInsight('');
    setDm4PayloadJson('');
    setDm5OutputText('');
    setDm5Status('idle');
    setDm5Error('');
    setRefineUsed(false);
    setEntryContext('normal');
    setWhyCountError('');
  };

  const handleBegin = () => {
    if (!surfaceQuestion.trim()) return;
    setCurrentStep(1);
  };

  const handleDM1Continue = () => setCurrentStep(2);
  const handleDM2Continue = () => setCurrentStep(3);

  const handleAddWhy = () => {
    if (!whyInput.trim()) return;
    setWhyCountError(''); // Clear error when adding
    const newChain = [...whyChain, { id: `why-${Date.now()}`, whyText: whyInput.trim() }];
    setWhyChain(newChain);
    setWhyInput('');
    
    if (newChain.length >= MAX_DEPTH) {
      // Clear derived state before navigating to ensure clean recompute
      setPatterns([]);
      setInsight('');
      setDm4PayloadJson('');
      setDm5OutputText('');
      setCurrentStep(4);
    }
  };

  const handleWhyComplete = () => {
    setWhyCountError('');
    
    // Defensively trim all WHY strings and drop empty ones
    const cleanedChain = whyChain
      .map(w => ({ ...w, whyText: w.whyText.trim() }))
      .filter(w => w.whyText.length > 0);
    
    // Enforce max of 5 WHYs (defensive check)
    const finalChain = cleanedChain.slice(0, MAX_DEPTH);
    
    // Guardrail: minimum WHY count (≥2) required before proceeding to DM4
    if (finalChain.length < 2) {
      setWhyCountError('Please add at least 2 WHY steps before continuing to patterns.');
      return;
    }
    
    // Update whyChain with cleaned data
    setWhyChain(finalChain);
    
    // FORCE CLEAN RECOMPUTE: Clear all derived state before navigating to DM4
    setPatterns([]);
    setInsight('');
    setDm4PayloadJson('');
    setDm5OutputText('');
    setDm5Status('idle');
    setDm5Error('');
    
    // Reset entryContext after refine pass
    if (entryContext === 'refine') {
      setEntryContext('normal');
    }
    
    // Navigate to DM4 - patterns will be recomputed in useEffect on mount
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

  const handleRefineWhys = () => {
    // Set refine flags and navigate to DM3
    setRefineUsed(true);
    setEntryContext('refine');
    setCurrentStep(3);
  };

  const handleDM4Continue = async () => {
    // Set loading state
    setDm5Status('loading');
    setDm5Error('');
    
    try {
      // Build or use existing DM4 payload
      let payloadJson = dm4PayloadJson;
      if (!payloadJson) {
        payloadJson = buildDM4Payload(whyChain, patterns, surfaceQuestion, domainsSelected, otherSpecify);
        setDm4PayloadJson(payloadJson);
      }
      
      // POST to /api/dm5
      const response = await fetch('/api/dm5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dm4PayloadJson: payloadJson }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMsg = errorData.error || `HTTP ${response.status}`;
        console.error('DM5 fail-soft:', `Status ${response.status}: ${errorMsg}`);
        const fallback = "DM5 insight unavailable right now (API Unavailable).\n\n" +
          "You can still review your WHY Chain + Pattern Results.\n\n" +
          "Try again later after API access is re-enabled.";
        setDm5OutputText(fallback);
        setDm5Status('idle');
        setCurrentStep(5);
        return;
      }
      
      const data = await response.json();
      
      // Robust field selection: prefer dm5OutputText, fallback to common alternatives
      const candidates = [
        data.dm5OutputText,
        data.output_text,
        data.text,
        data.outputText,
        (typeof data.dm5 === 'string' ? data.dm5 : null)
      ];
      
      let candidate = null;
      for (const c of candidates) {
        if (c && typeof c === 'string' && c.trim().length > 0) {
          candidate = c.trim();
          break;
        }
      }
      
      if (!candidate) {
        console.error('DM5 fail-soft:', 'Response missing output text (expected dm5OutputText/output_text/text/outputText/dm5)');
        const fallback = "DM5 insight unavailable right now (API Unavailable).\n\n" +
          "You can still review your WHY Chain + Pattern Results.\n\n" +
          "Try again later after API access is re-enabled.";
        setDm5OutputText(fallback);
        setDm5Status('idle');
        setCurrentStep(5);
        return;
      }
      
      // On success
      setDm5OutputText(candidate);
      setDm5Status('idle');
      setCurrentStep(5);
    } catch (error) {
      // Fail-soft: network errors, JSON parse errors, etc.
      const errorMsg = error.message || 'Unknown error';
      const statusCode = error.status || (error.response?.status) || 'network';
      console.error('DM5 fail-soft:', `${statusCode}: ${errorMsg}`);
      const fallback = "DM5 insight unavailable right now (API Unavailable).\n\n" +
        "You can still review your WHY Chain + Pattern Results.\n\n" +
        "Try again later after API access is re-enabled.";
      setDm5OutputText(fallback);
      setDm5Status('idle');
      setCurrentStep(5);
    }
  };
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
    
    // Clear input first to avoid async race
    const answerText = icUserInput.trim();
    setIcUserInput('');
    
    // Atomic stage handling - perform answer persistence and stage transitions together
    if (key === 'q1') {
      setIcAnswers(prev => ({ ...prev, q1: answerText }));
      setIcStage('q2');
    } else if (key === 'q2') {
      setIcAnswers(prev => ({ ...prev, q2: answerText }));
      setIcStage('q3');
    } else if (key === 'q3') {
      setIcAnswers(prev => ({ ...prev, q3: answerText }));
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
    setQc5Status('idle');
    setQc5Results(null);
    setQc5Error('');
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
            <BackToHomePill onClick={() => setScreen("HOME")} className="absolute top-4 right-4 z-50" />
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
            <BackToHomePill onClick={() => setScreen("HOME")} className="absolute top-4 right-4 z-50" />
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

    // IC Results stage (QC-5)
    if (icStage === 'results') {
      // Determine if we should show QC-5 results or fail-soft echo
      const showQc5Results = qc5Status === 'idle' && qc5Results !== null;
      // Show fail-soft if: error occurred, or we're idle without results (API call failed or never happened)
      const showFailSoft = qc5Status === 'error' || (qc5Status === 'idle' && qc5Results === null);

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
          `}</style>
          <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative pt-12">
            <BackToHomePill onClick={() => setScreen("HOME")} className="absolute top-4 right-4 z-50" />
            <FmyCard className="space-y-6">
              <h2 className={fmyTheme.typography.heading}>💡 Here's what we learned</h2>
              
              {/* Original Question */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-5">
                <p className={`${fmyTheme.typography.label} text-indigo-700 mb-2`}>Your original question</p>
                <p className="text-base font-medium text-slate-900">{icAnswers.initial}</p>
              </div>

              {/* Loading State */}
              {qc5Status === 'loading' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-slate-600">Generating clarity...</p>
                </div>
              )}

              {/* QC-5 Results (Happy Path) */}
              {showQc5Results && (() => {
                // Extract pattern tags and detect tension
                const patternTags = extractQcPatternTags(
                  icAnswers.q1,
                  icAnswers.q2,
                  icAnswers.q3,
                  qc5Results
                );
                const tension = detectQcTension(
                  icAnswers.q1,
                  icAnswers.q3,
                  qc5Results
                );

                return (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 space-y-4">
                      <div>
                        <p className={`${fmyTheme.typography.label} text-green-700 mb-1`}>Your distilled choice</p>
                        <p className="text-lg font-bold text-slate-900">{qc5Results.distilled_choice}</p>
                      </div>
                      <div className="border-t border-green-200 pt-4">
                        <p className={`${fmyTheme.typography.label} text-green-700 mb-2`}>What influenced it</p>
                        <p className="text-slate-800">{qc5Results.what_influenced_it}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 space-y-4">
                      <div>
                        <p className={`${fmyTheme.typography.label} text-purple-700 mb-2`}>The instinctual pull</p>
                        <p className="text-slate-800">{qc5Results.instinctual_pull}</p>
                      </div>
                    </div>

                    {/* Pattern Tags Section (v64.1) */}
                    {patternTags.length > 0 && (
                      <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                        <p className={`${fmyTheme.typography.label} text-slate-600 mb-3`}>SIGNALS</p>
                        <div className="flex flex-wrap gap-2">
                          {patternTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full text-xs font-medium text-slate-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notable Tension Card (v64.1) */}
                    {tension && tension.detected && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-5">
                        <p className={`${fmyTheme.typography.label} text-orange-700 mb-2`}>NOTABLE TENSION</p>
                        <p className="text-sm text-slate-800">{tension.description}</p>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-xl p-6 space-y-4">
                      <div>
                        <p className={`${fmyTheme.typography.label} text-purple-700 mb-2`}>What this says about this moment</p>
                        <p className="text-slate-800">{qc5Results.what_this_says_about_this_moment}</p>
                      </div>
                    </div>

                    {(qc5Results.reframe_want || qc5Results.reframe_need) && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 space-y-4">
                        <p className={`${fmyTheme.typography.label} text-amber-700 mb-3`}>Reframe this choice</p>
                        {qc5Results.reframe_want && (
                          <div>
                            <p className="text-sm font-semibold text-amber-800 mb-1">Want lens</p>
                            <p className="text-slate-800">{qc5Results.reframe_want}</p>
                          </div>
                        )}
                        {qc5Results.reframe_need && (
                          <div className={qc5Results.reframe_want ? 'border-t border-amber-200 pt-4' : ''}>
                            <p className="text-sm font-semibold text-amber-800 mb-1">Need lens</p>
                            <p className="text-slate-800">{qc5Results.reframe_need}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Optional footer nudge */}
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-500 italic">
                        Want to explore why this pattern shows up? Deep-Dive Mode can walk you through it.
                      </p>
                    </div>
                  </>
                );
              })()}

              {/* Fail-Soft Echo (Error State) */}
              {showFailSoft && (() => {
                // Extract pattern tags from raw inputs (no qc5Results available)
                const patternTags = extractQcPatternTags(
                  icAnswers.q1,
                  icAnswers.q2,
                  icAnswers.q3,
                  null
                );
                // Detect tension from raw inputs (compare qc2 frame vs qc4 pick)
                const tension = detectQcTension(
                  icAnswers.q1,
                  icAnswers.q3,
                  null
                );

                return (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 space-y-4">
                      <div>
                        <p className={`${fmyTheme.typography.label} text-green-700 mb-1`}>Your distilled choice</p>
                        <p className="text-lg font-bold text-slate-900">{icAnswers.q3}</p>
                      </div>
                      <div className="border-t border-green-200 pt-4">
                        <p className={`${fmyTheme.typography.label} text-green-700 mb-2`}>What influenced it</p>
                        <p className="text-slate-800">{icAnswers.q2}</p>
                      </div>
                    </div>

                    {/* Pattern Tags Section (v64.1) - Fail-soft mode */}
                    {patternTags.length > 0 && (
                      <div className="bg-white border-2 border-slate-200 rounded-xl p-5">
                        <p className={`${fmyTheme.typography.label} text-slate-600 mb-3`}>SIGNALS</p>
                        <div className="flex flex-wrap gap-2">
                          {patternTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-full text-xs font-medium text-slate-700"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notable Tension Card (v64.1) - Fail-soft mode */}
                    {tension && tension.detected && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-5">
                        <p className={`${fmyTheme.typography.label} text-orange-700 mb-2`}>NOTABLE TENSION</p>
                        <p className="text-sm text-slate-800">{tension.description}</p>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Fail-soft footer message (global footer, separate from SIGNALS/TENSION) */}
              {showFailSoft && (
                <div className="text-center pt-4">
                  <p className="text-xs text-slate-400 italic">Quick insight unavailable right now.</p>
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
          <BackToHomePill onClick={() => setScreen("HOME")} className="absolute top-4 right-4 z-50" />
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
                <h2 className={fmyTheme.typography.heading}>What's really on your mind?</h2>
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
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>What areas of your life does this touch?</h2>
                <p className={fmyTheme.typography.caption}>We'll clarify what this question is really about.</p>
              </div>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <p className={`${fmyTheme.typography.label} text-indigo-800 mb-1`}>Your Question</p>
                <p className="text-slate-900 italic">"{surfaceQuestion}"</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">What domain does this live in?</p>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map((domain) => {
                    const isSelected = domainsSelected.includes(domain);
                    return (
                      <button 
                        key={domain} 
                        onClick={() => {
                          setDomainSelectionError(''); // Clear error on click
                          if (isSelected) {
                            // Toggle OFF: remove from array
                            setDomainsSelected(prev => prev.filter(d => d !== domain));
                            // Clear otherSpecify if "other" is deselected
                            if (domain === 'other') {
                              setOtherSpecify('');
                            }
                          } else {
                            // Toggle ON: check if we can add (max 3)
                            if (domainsSelected.length < 3) {
                              setDomainsSelected(prev => [...prev, domain]);
                            } else {
                              // Over-selection: show error
                              setDomainSelectionError('Choose up to 3 domains');
                            }
                          }
                        }} 
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {domain}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-1">Choose up to 3</p>
                
                {domainSelectionError && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg mt-2">
                    <p className="text-sm text-amber-800">{domainSelectionError}</p>
                  </div>
                )}
                
                {domainsSelected.includes('other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={otherSpecify}
                      onChange={(e) => setOtherSpecify(e.target.value.slice(0, 100))}
                      placeholder="e.g., health, money, creativity"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 text-sm"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-center pt-2">
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
    // Detect winning anchor using rules-based scoring + domain boosts
    const winningAnchor = detectAnchor(surfaceQuestion, domainsSelected, otherSpecify);
    
    // Anchor card configuration
    const anchorCards = [
      {
        key: 'identity',
        emoji: '🪞',
        label: 'Identity Anchors',
        description: 'Who you see yourself as',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        descColor: 'text-purple-700',
        highlightBorder: 'border-purple-500',
        highlightBg: 'bg-purple-100',
      },
      {
        key: 'value',
        emoji: '⚖️',
        label: 'Value Anchors',
        description: 'What matters most to you',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        descColor: 'text-amber-700',
        highlightBorder: 'border-amber-500',
        highlightBg: 'bg-amber-100',
      },
      {
        key: 'relational',
        emoji: '🤝',
        label: 'Relational Anchors',
        description: 'Key relationships and roles',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-800',
        descColor: 'text-pink-700',
        highlightBorder: 'border-pink-500',
        highlightBg: 'bg-pink-100',
      },
    ];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto">
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>What's this really about?</h2>
                <p className={fmyTheme.typography.caption}>Looking for identity, values, and relational anchors.</p>
              </div>
              
              <div className="grid gap-3">
                {anchorCards.map((card) => {
                  const isWinning = card.key === winningAnchor;
                  return (
                    <div
                      key={card.key}
                      className={`${card.bgColor} ${isWinning ? 'border-4' : 'border-2'} ${isWinning ? card.highlightBorder : card.borderColor} rounded-lg p-4 ${isWinning ? card.highlightBg : ''} transition-all`}
                    >
                      <p className={`text-sm font-semibold ${card.textColor}`}>{card.emoji} {card.label}</p>
                      <p className={`text-xs ${card.descColor} mt-1`}>{card.description}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
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
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>Why does this matter?</h2>
                <p className={fmyTheme.typography.caption}>Explore layers of "why" at your pace.</p>
              </div>
              
              {entryContext === 'refine' && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                  <p className="text-sm text-amber-800 font-medium">Refining WHYs — edit, then continue to recompute patterns.</p>
                </div>
              )}
              
              {whyCountError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-sm text-red-800">{whyCountError}</p>
                </div>
              )}
              
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
                  <label className="text-sm font-semibold text-slate-700 block">I believe this is my reason why:</label>
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
                    Add My Why
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
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>What patterns keep showing up with you?</h2>
                {domainsSelected.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1 mb-2">
                    Domains: {domainsSelected.map(formatDomainLabel).join(' · ')}
                  </p>
                )}
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
                {!refineUsed && (
                  <button onClick={handleRefineWhys} className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg">
                    Refine WHYs
                  </button>
                )}
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
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>What this all adds up to…</h2>
                <p className={fmyTheme.typography.caption}>A neutral look at the themes.</p>
              </div>
              
              {dm5Status === 'loading' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-slate-600">Generating...</p>
                </div>
              )}
              
              {dm5Status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle size={18} />
                    <p className="font-semibold">Error</p>
                  </div>
                  <p className="text-sm text-red-700">{dm5Error}</p>
                  <button 
                    onClick={handleDM4Continue}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm"
                  >
                    Try again
                  </button>
                </div>
              )}
              
              {dm5Status === 'idle' && dm5OutputText && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6">
                  <p className={`${fmyTheme.typography.label} text-indigo-600 mb-3`}>Based on what you shared</p>
                  <div className="text-lg text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">{dm5OutputText}</div>
                </div>
              )}
              
              {dm5Status === 'idle' && !dm5OutputText && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-slate-600">No insight generated yet.</p>
                </div>
              )}
              
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={handleBack} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-300 flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleDM5Continue} 
                  disabled={dm5Status === 'loading' || !dm5OutputText}
                  className={`px-6 py-3 font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                    dm5Status === 'loading' || !dm5OutputText
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
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
    
    // Compute holdLightlyText (matches UI rendering logic)
    const holdLightlyText = patterns.length > 0 
      ? `For now, it might be enough just to notice that this question keeps circling around ${patterns[0].label.toLowerCase()}.`
      : 'For now, the main step was simply putting this question into words.';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <style>{`.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div ref={contentRef} className="max-w-2xl mx-auto space-y-6 relative">
          <BackToHomePill onClick={() => setScreen("HOME")} className="absolute top-4 right-4 z-50" />
          <FmyCard>
            <PipelineStrip currentStep={currentStep} />
            <FmyCardDivider />
            
            <div className="space-y-6">
              <div>
                <h2 className={`${fmyTheme.typography.subheading} mb-2`}>Your clarity snapshot</h2>
                <p className={fmyTheme.typography.caption}>Here's what has emerged, with a brief reflection on where you've landed.</p>
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
              
              {/* DM5 Output (verbatim) */}
              {dm5OutputText && (
                <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                  <p className={`${fmyTheme.typography.label} mb-3`}>Insight</p>
                  <div className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap">{dm5OutputText}</div>
                </div>
              )}
              
              {/* Closure Recommendation */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                <p className={`${fmyTheme.typography.label} mb-3`}>Something you might hold lightly:</p>
                <p className="text-base text-slate-800 leading-relaxed">
                  {holdLightlyText}
                </p>
              </div>
              
              {/* SLICE B: Clarity Artifact Panel */}
              <ClarityArtifactPanel artifact={clarityArtifact} dm5OutputText={dm5OutputText} holdLightlyText={holdLightlyText} patterns={patterns} />
            </div>
          </FmyCard>
          
          {/* Exit Actions */}
          <div className="flex justify-center">
            <button onClick={handleReset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2">
              <RotateCcw size={18} /> Start New
            </button>
          </div>
          
          <p className="text-center text-xs text-slate-500">
            FindMyWhy.ai · v63.1 · ©2025 | FMY?, LLC, all rights reserved.
          </p>
        </div>
      </div>
    );
    }
  }

  return null;
}
