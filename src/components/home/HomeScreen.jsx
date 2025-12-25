import React, { useState } from 'react';
import fmyLogo from '../../assets/fmy-logo-v2.svg';

/*
 Entry Hatch pattern markers:
 - fmy-entry-welcome
 - fmy-entry-prompt

 These classes are semantic identifiers only.
 Visual styling is handled via Tailwind utilities.
*/

export default function HomeScreen({ onEnterIC, onEnterDM, onQuickClarity, onDeeperMeaning }) {
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');

  // Support both prop name sets
  const enterIC = onEnterIC || onQuickClarity;
  const enterDM = onEnterDM || onDeeperMeaning;

  const handlePasscodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPasscode(val);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 flex flex-col items-center justify-between">
      <div className="max-w-md w-full space-y-6 flex-1 flex flex-col justify-center">
        {/* Logo + Header */}
        <div className="flex flex-col items-center space-y-3">
          <img src={fmyLogo} alt="FindMyWhy logo" className="h-16 w-auto" />
          <h1 className="fmy-brand-logotype text-4xl font-bold text-slate-900">FindMyWhy?</h1>
        </div>

        {/* What's on your mind? Panel */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-lg p-8 text-center space-y-2">
          <p className="fmy-entry-welcome font-manrope text-lg font-normal italic text-blue-600">
            "This is where we begin"&nbsp;&nbsp;&nbsp;
          </p>
          <p className="fmy-entry-prompt font-manrope text-3xl font-medium text-slate-900 tracking-tight">
            What's on your mind? <span className="text-4xl">🤔</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] p-6 space-y-5">
          
          {/* Mission Brief */}
          <div>
            <p className="text-lg font-bold text-slate-700 leading-relaxed">
              FindMyWhy is a thinking tool.
            </p>
            <p className="text-base text-slate-700 leading-relaxed mt-2">
              It helps you work through one specific question by asking a small number of high-leverage prompts — then it ends.
            </p>
          </div>

          {/* Flight Parameters */}
          <ul className="text-base text-slate-600 space-y-1">
            <li>• Not therapy</li>
            <li>• Not journaling</li>
            <li>• No right answers</li>
            <li>• You stay in control</li>
            <li>• Typical session: 2–5 minutes</li>
          </ul>

          {/* Divider */}
          <div className="border-b border-slate-200" />

          {/* Control Prompt */}
          <p className="text-sm font-medium text-slate-800">
            Bring one question or situation you want to get clearer on.
          </p>

          {/* Trust Line */}
          <p className="text-xs text-slate-500">
            Your responses aren’t shared, and you can leave the session at any time.
          </p>

          {/* Divider */}
          <div className="border-b border-slate-200" />

          {/* Name Field */}
          <div>
            <label htmlFor="name-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Name (optional)
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
            />
          </div>

          {/* Passcode Field */}
          <div>
            <label htmlFor="passcode-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              4-digit pass code (optional)
            </label>
            <input
              id="passcode-input"
              type="text"
              inputMode="numeric"
              value={passcode}
              onChange={handlePasscodeChange}
              placeholder=""
              maxLength={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900 tracking-widest"
            />
          </div>

          {/* Divider */}
          <div className="border-b border-slate-200" />

          {/* Entry Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                // Entry Hatch direct mode entry (can be collapsed back to mode selector later)
                enterIC?.();
              }}
              className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition-colors w-full"
            >
              Quick Clarity
            </button>
            <button
              onClick={() => {
                // Entry Hatch direct mode entry (can be collapsed back to mode selector later)
                enterDM?.();
              }}
              className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition-colors w-full"
            >
              Deeper Meaning
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full px-4 pb-4 -mt-4">
        <p className="text-sm text-slate-500 text-center">
          <span className="font-semibold">FindMyWhy®</span> isn't Therapy or Coaching — it's your brain with super-charged AI Clarity that can help you to make sense of your own thoughts.
        </p>
      </div>
    </div>
  );
}
