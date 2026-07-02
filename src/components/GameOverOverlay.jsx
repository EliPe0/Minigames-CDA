import React from 'react';

export default function GameOverOverlay({ gameState, lostText, wonText }) {
  if (gameState !== 'won' && gameState !== 'lost') return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-blur-fade bg-black/20 backdrop-blur-sm pointer-events-none">
      
      {gameState === 'lost' && (
        <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {lostText || "FALHA NO SISTEMA"}
        </div>
      )}

      {gameState === 'won' && (
        <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
          {wonText || "SUCESSO | SISTEMA LIBERADO"}
        </div>
      )}

    </div>
  );
}