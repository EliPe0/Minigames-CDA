import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const Icons = {
    House: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Key: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-4 4"/>
      </svg>
    ),
    Bomb: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <circle cx="11" cy="13" r="9"/>
        <path d="M11 4V2"/>
        <path d="M16.5 6.5l1.5-1.5"/>
        <path d="M5.5 6.5l-1.5-1.5"/>
        <path d="M19.5 13h2"/>
        <path d="M2.5 13h2"/>
      </svg>
    )
  };

  return (
    <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#1f1f1f] p-6 flex flex-col justify-between select-none shrink-0 font-mono">
      <div className="flex flex-col gap-10">
        
        <div 
          onClick={() => navigate('/')} 
          className="flex flex-col items-center gap-3 cursor-pointer group"
        >
          <img 
            src="logocda.png" 
            alt="CDA Logo" 
            className="h-16 w-auto object-contain drop-shadow- group-hover:scale-105 transition-transform" 
          />
        </div>

        <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest">
          <button 
            onClick={() => navigate('/')} 
            className={`w-full text-left py-3 px-4 rounded-lg border transition-all flex items-center ${
              location.pathname === '/' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-' 
                : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Icons.House /> Painel Inicial
          </button>
          
          <button 
            onClick={() => navigate('/lockpick')} 
            className={`w-full text-left py-3 px-4 rounded-lg border transition-all flex items-center ${
              location.pathname === '/lockpick' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-' 
                : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Icons.Key /> Lockpick
          </button>
          
          <button 
            onClick={() => navigate('/caixinha')} 
            className={`w-full text-left py-3 px-4 rounded-lg border transition-all flex items-center ${
              location.pathname === '/caixinha' 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-' 
                : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Icons.Bomb /> Caixinha
          </button>
        </div>
      </div>

      <div className="text- text-neutral-600 text-center tracking-wider pt-6 border-t border-neutral-900 mt-6 md:mt-0">
        Developed by{' '}
        <a 
          href="https://github.com/EliPe0" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-amber-500/80 hover:text-amber-400 font-black underline transition-colors"
        >
          github.com/EliPe0
        </a>
      </div>
    </aside>
  );
}