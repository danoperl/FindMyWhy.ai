// =============================================================================
// 15 Silly Questions Screen - v66.x
// =============================================================================

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { BackToHomePill } from '../ui';

const FIFTEEN_QUESTIONS = [
  { id: 1, question: "What for?", teaser: "When you're trying to understand what it's really about." },
  { id: 2, question: "How come?", teaser: "When something sounds random and you want to know why." },
  { id: 3, question: "Why not?", teaser: "When you're hesitating and need permission." },
  { id: 4, question: "What if?", teaser: "When you want to explore consequences without committing." },
  { id: 5, question: "Which way?", teaser: "When you're choosing between paths that don't quite align." },
  { id: 6, question: "Says who?", teaser: "When a rule or judgment deserves some pushback." },
  { id: 7, question: "What then?", teaser: "When you're thinking one step past the obvious." },
  { id: 8, question: "Who knew?", teaser: "When the lightbulb over your head starts to glow." },
  { id: 9, question: "How so?", teaser: "When you're not convinced by the explanation you're given." },
  { id: 10, question: "What now?", teaser: "When the planning is done and you need the next step." },
  { id: 11, question: "Where to?", teaser: "When direction matters more than speed." },
  { id: 12, question: "What's this?", teaser: "When someone, or something, unexpected shows up." },
  { id: 13, question: "What gives?", teaser: "When the situation doesn't match your expectations." },
  { id: 14, question: "Then what?", teaser: "When you're trying to figure out what comes next." },
  { id: 15, question: "Why bother?", teaser: "When your efforts feel flat and motivation is thin." },
];

export default function FifteenSillyQuestions({ onSelectQuestion, onBackToHome }) {
  const [showInfo, setShowInfo] = useState(false);

  const handleQuestionClick = (questionText) => {
    // Only pass the question text, never the teaser
    onSelectQuestion(questionText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
      <div className="max-w-2xl mx-auto space-y-6 relative pt-12">
        {/* Header with Back to Home */}
        <div className="absolute top-4 right-4 z-50">
          <BackToHomePill onClick={onBackToHome || (() => {})} />
        </div>

        {/* App Title + BETA | 2025 */}
        <div className="text-center mb-6">
          <h1 className="fmy-brand-logotype text-5xl font-bold text-slate-900 tracking-tight mb-2">FindMyWhy?</h1>
          <div className="flex items-center justify-center gap-2 text-base text-slate-500">
            <span>BETA</span>
            <span>|</span>
            <span>2025</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-6 md:p-8 animate-fadeIn">
          {/* Collapsible Info Toggle */}
          <div className="mb-6">
            <button onClick={() => setShowInfo(!showInfo)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
              <HelpCircle size={18} />What are Silly Questions?
            </button>
            {showInfo && (
              <div className="mt-3 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-lg text-sm text-slate-700 animate-fadeIn">
                <ul className="space-y-1">
                  <li>• 15 playful starter questions designed to unlock clarity</li>
                  <li>• Each question auto-fills a Quick Clarity session</li>
                  <li>• Light on the surface, revealing underneath</li>
                  <li>• Choose one for a clarity quick-start</li>
                </ul>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">15 Silly Questions <span className="text-xl italic">(More Useful Than They Look!)</span></h2>

          <div className="border-b border-slate-200 my-6" />

          {/* Matrix List */}
          <div className="space-y-4">
            {FIFTEEN_QUESTIONS.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 animate-fadeIn">
                {/* Neutral Number Badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                  {item.id}
                </div>

                {/* Purple Pill - shrink-to-fit */}
                <button
                  onClick={() => handleQuestionClick(item.question)}
                  className="inline-flex text-left px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors w-fit"
                >
                  {item.question}
                </button>

                {/* Teaser - same line */}
                <p className="text-base italic text-slate-500 whitespace-nowrap">
                  {item.teaser}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

