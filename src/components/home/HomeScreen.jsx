import React from 'react';
import brainIcon from '../../assets/icons/brain.svg';
import signpostIcon from '../../assets/icons/signpost.svg';
import stopwatchIcon from '../../assets/icons/stopwatch.svg';
import fingerIcon from '../../assets/icons/finger.svg';

/*
 Entry Hatch pattern markers:
 - fmy-entry-welcome
 - fmy-entry-prompt

 These classes are semantic identifiers only.
 Visual styling is handled via Tailwind utilities.
*/

export default function HomeScreen({ onEnterIC, onEnterDM, onQuickClarity, onDeeperMeaning, onEnter15SQ }) {
  // Support both prop name sets
  const enterIC = onEnterIC || onQuickClarity;
  const enterDM = onEnterDM || onDeeperMeaning;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top white section with Register/Login and brain icon */}
      <div className="bg-white pt-20 pb-6 relative">
        <div className="max-w-2xl mx-auto px-4">
          {/* Register | Login links */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Register</a>
            <span className="text-orange-300">|</span>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Login</a>
          </div>
          
          {/* Brain icon (overlaps white/beige seam) */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">
            <img
              src={brainIcon}
              alt="Brain"
              className="w-[210px] h-[210px] md:w-[228px] md:h-[228px]"
            />
          </div>
        </div>
      </div>

      {/* Main beige section */}
      <div className="bg-[#FFF2E6] flex-1 flex flex-col items-center pt-20 pb-8">
        <div className="max-w-2xl w-full px-4 space-y-6">
          <div className="space-y-3">
            {/* H1: What's on your mind? */}
            <h1 className="fmy-h1 text-center text-5xl md:text-6xl leading-[1.08] text-[#323332]">
              What's on your mind?
            </h1>

            {/* Signpost icon */}
            <div className="flex justify-center">
              <img src={signpostIcon} alt="Signpost" className="w-24 h-24" />
            </div>
          </div>

          {/* Copy block */}
          <div className="max-w-xl mx-auto space-y-4 text-left">
            <p className="text-[20px] font-semibold text-neutral-800">
              FindMyWhy? was created for clarity.
            </p>
            <p className="text-[18px] leading-7 text-neutral-700">
              FMY? helps you work through one specific question by asking a series of short, easily answered prompts, then responds with a decision.
            </p>
            <ul className="text-[18px] leading-7 text-neutral-700 space-y-1">
              <li>• Not therapy or coaching</li>
              <li>• Not journaling</li>
              <li>• Not preachy or judgmental</li>
            </ul>
          </div>

          {/* Stopwatch icon with rotation and shadow */}
          <div className="flex justify-center relative my-4">
            <div className="relative">
              {/* Subtle shadow ellipse below */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-400/15 rounded-full blur-sm"></div>
              <img 
                src={stopwatchIcon} 
                alt="Stopwatch" 
                className="w-20 h-20 relative transform -rotate-3"
              />
            </div>
          </div>

          {/* H2: Here's where we start! */}
          <h2 className="fmy-h2 text-center text-3xl md:text-4xl text-[#323332]">
            Here's where we start!
          </h2>

          {/* Three-button row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <button
              onClick={() => {
                enterIC?.();
              }}
              className="px-6 py-3 bg-[#442CD8] text-white font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[160px]"
            >
              Quick Clarity
            </button>
            <button
              onClick={() => {
                enterDM?.();
              }}
              className="px-6 py-3 bg-[#442CD8] text-white font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[160px]"
            >
              Deeper Meaning
            </button>
            <button
              onClick={() => {
                onEnter15SQ?.();
              }}
              className="px-6 py-3 bg-[#442CD8] text-white font-semibold rounded-lg transition-colors w-full sm:w-auto min-w-[160px]"
            >
              Silly Questions
            </button>
          </div>
        </div>
      </div>

      {/* Lower white section with finger icon and footer */}
      <div className="bg-white py-8">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Finger icon */}
          <div className="flex justify-center">
            <img src={fingerIcon} alt="Finger" className="w-20 h-20" />
          </div>
          
          {/* Footer text */}
          <p className="text-sm text-gray-700 text-center">
            FindMyWhy?® isn't Therapy or Coaching — it's your brain with super-charged AI Clarity to help you to make sense of your own thinking.
          </p>
        </div>
      </div>
    </div>
  );
}
