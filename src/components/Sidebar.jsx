import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeContext } from '../App';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useContext(ThemeContext);
  
  const [isRouting, setIsRouting] = useState(false);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    
    setIsRouting(true);
    setTimeout(() => {
      navigate(path);
      setIsRouting(false);
    }, 350); 
  };

  const Icons = {
    House: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 transition-transform duration-300 group-hover:scale-110">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    Key: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 transition-transform duration-300 group-hover:rotate-[15deg]">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-4 4"/>
      </svg>
    ),
    Bomb: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 transition-transform duration-300 group-hover:scale-110">
        <circle cx="11" cy="13" r="9"></circle>
        <path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.41 2.41 0 0 0-3.4 0l-1.8 1.8"></path>
        <path d="m22 2-1.5 1.5"></path>
      </svg>
    ),
    Car: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 transition-transform duration-300 group-hover:translate-x-0.5">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    )
  };

  return (
    <>
      {/* BARRA DE CARREGAMENTO */}
      <style>{`
        @keyframes routeLoad {
          0% { width: 0%; opacity: 1; }
          70% { width: 70%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .animate-route-load { animation: routeLoad 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
      
      {isRouting && (
        <div className="fixed top-0 left-0 h-[2px] bg-blue-500 dark:bg-amber-500 z-[9999] shadow-[0_0_10px_rgba(59,130,246,0.8)] dark:shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-route-load"></div>
      )}

      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-neutral-200 dark:border-[#1f1f1f] p-6 flex flex-col justify-between select-none shrink-0 font-mono transition-colors duration-300">
        
        <div className="flex flex-col gap-10">
          
          {/* LOGO */}
          <div onClick={() => handleNavigate('/home')} className="flex flex-col items-center gap-3 cursor-pointer group">
            <img 
              src="logocda.png" 
              alt="CDA Logo" 
              className="h-16 w-auto object-contain dark:drop-shadow-[0_0_12px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-all duration-300 ease-out" 
            />
          </div>

          <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest">
            
            <button onClick={() => handleNavigate('/home')} className={`w-full text-left py-3 px-4 rounded-lg border flex items-center group transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.97] ${location.pathname === '/home' ? 'bg-neutral-200 border-neutral-300 text-black dark:bg-white/10 dark:border-white/30 dark:text-white dark:shadow-[0_0_15px_rgba(255,255,255,0.08)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/60'}`}>
              <Icons.House /> Painel Inicial
            </button>
            
            <button onClick={() => handleNavigate('/lockpick')} className={`w-full text-left py-3 px-4 rounded-lg border flex items-center group transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.97] ${location.pathname === '/lockpick' ? 'bg-cyan-100 border-cyan-300 text-cyan-700 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400 dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-neutral-900/60'}`}>
              <Icons.Key /> Lockpick
            </button>
            
            <button onClick={() => handleNavigate('/caixinha')} className={`w-full text-left py-3 px-4 rounded-lg border flex items-center group transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.97] ${location.pathname === '/caixinha' ? 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-400/40 dark:text-emerald-400 dark:shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-4０ dark:hover:bg-neutral-9００/6０'}`}>
              <Icons.Bomb /> Caixinha
            </button>

            <button onClick={() => handleNavigate('/portamalas')} className={`w-full text-left py-3 px-4 rounded-lg border flex items-center group transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.97] ${location.pathname === '/portamalas' ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-500/10 dark:border-blue-400/40 dark:text-blue-400 dark:shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-transparent border-transparent text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-neutral-900/60'}`}>
              <Icons.Car /> Porta Malas
            </button>
            
          </div>
        </div>

        {/* SELETOR DE TEMA */}
        <div className="flex flex-col mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-900">
          <div className="flex bg-neutral-100 dark:bg-[#141414] rounded-lg p-1 border border-neutral-200 dark:border-neutral-800/60">
            <button 
              onClick={() => setTheme('light')}
              title="Modo Claro"
              className={`flex-1 flex justify-center py-2 rounded-md transition-all duration-300 ${theme === 'light' ? 'bg-white shadow-sm text-amber-500 border border-neutral-200' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              title="Modo Escuro"
              className={`flex-1 flex justify-center py-2 rounded-md transition-all duration-300 ${theme === 'dark' ? 'bg-white dark:bg-[#222] shadow-sm text-indigo-400 border border-neutral-200 dark:border-neutral-700' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
          </div>
        </div>
        
      </aside>
    </>
  );
}