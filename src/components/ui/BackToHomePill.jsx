// =============================================================================
// BackToHomePill - Reusable pill-style navigation button
// =============================================================================

import React from 'react';

export default function BackToHomePill({ onClick, className = '', label = 'Back to Home' }) {
  const baseClasses = 'inline-flex items-center rounded-full bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm hover:bg-white hover:text-slate-700 transition cursor-pointer';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <button
      type="button"
      onClick={onClick}
      className={combinedClasses}
    >
      {label}
    </button>
  );
}
