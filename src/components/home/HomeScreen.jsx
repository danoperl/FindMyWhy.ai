import React from 'react';
import fmyLogo from '../../assets/fmy-logo.svg';

export default function HomeScreen({ onQuickClarity, onDeeperMeaning }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img src={fmyLogo} alt="FindMyWhy logo" className="h-16 w-auto" />
        </div>

        {/* CTA Buttons - 2-column side-by-side with equal width */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onQuickClarity}
            className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition-colors w-full"
          >
            Quick Clarity
          </button>
          <button
            onClick={onDeeperMeaning}
            className="px-6 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition-colors w-full"
          >
            Deeper Meaning
          </button>
        </div>
      </div>
    </div>
  );
}
