import React from 'react';

export default function HintPanel({ isOpen, onClose, title, gifSrc, icon, accentColor, children }) {
  return (
    <div className={`fixed top-0 right-0 h-full w-[340px] bg-[#0c0c0c] border-l border-neutral-800 z-50 flex flex-col font-mono shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      <div className="h-14 bg-[#141414] border-b border-neutral-800/60 flex items-center justify-between px-5 text-[11px] font-black uppercase tracking-wider shrink-0 transition-colors" style={{ color: accentColor }}>
        <div className="flex items-center gap-1.5">
          {icon}
          Painel de Dica: {title}
        </div>
        <button 
          onClick={onClose}
          className="cursor-pointer text-neutral-500 hover:text-white transition-colors p-2 text-sm font-bold"
        >
          ✕
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1 font-sans">
        <div className="w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative shadow-inner shrink-0 transition-colors">
          <img 
            src={gifSrc} 
            alt={`Tutorial ${title}`} 
            className="w-full h-full object-cover animate-blur-fade"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-600 select-none bg-[#050505]">
            [ {gifSrc.replace('/', '')} ]
          </div>
        </div>

        <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed text-neutral-400 transition-colors">
          <div className="text-white font-black uppercase tracking-wider text-xs border-b border-neutral-900 pb-1.5 transition-colors">
            Como funciona:
          </div>
          {children}
        </div>
      </div>

    </div>
  );
}