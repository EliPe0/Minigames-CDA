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
      <svg 
        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
        <circle cx="11" cy="13" r="9"></circle>
        <path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.41 2.41 0 0 0-3.4 0l-1.8 1.8"></path>
        <path d="m22 2-1.5 1.5"></path>
      </svg>
    ),
    Car: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    )
  };

  return (
    <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-[#1f1f1f] p-6 flex flex-col justify-between select-none shrink-0 font-mono">
      <div className="flex flex-col gap-10">
        <div onClick={() => navigate('/home')} className="flex flex-col items-center gap-3 cursor-pointer group">
          <img src="logocda.png" alt="CDA Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform" />
        </div>

        <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => navigate('/home')} className={`w-full text-left py-3 px-4 rounded-lg border transition-all flex items-center ${location.pathname === '/home' ? 'bg-white/10 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'}`}>
            <Icons.House /> Painel Inicial
          </button>
          
          <button onClick={() => navigate('/lockpick')} className={`w-full text-left py-3 px-4 rounded-lg border transition-all flex items-center ${location.pathname === '/lockpick' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'}`}>
            <Icons.Key /> Lockpick
          </button>
          
          <button onClick={() => navigate('/caixinha')} className={`w-full text-left py-3 px-4 rounded-lg border text-emerald-400 transition-all flex items-center ${location.pathname === '/caixinha' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'}`}>
            <Icons.Bomb /> Caixinha
          </button>

          <button onClick={() => navigate('/portamalas')} className={`w-full text-left py-3 px-4 rounded-lg border text-blue-400 transition-all flex items-center ${location.pathname === '/portamalas' ? 'bg-blue-500/10 border-blue-400 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-white hover:bg-neutral-900/50'}`}>
            <Icons.Car /> Porta Malas
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