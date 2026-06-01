import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LETTERS = ['A', 'S', 'D', 'Q', 'W', 'E'];

export default function CaixinhaTreino() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle'); 
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  const [stage, setStage] = useState(1); 
  const [showHint, setShowHint] = useState(true);
  
  const [screenShake, setScreenShake] = useState(false);

  const timerRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    setSequence(Array(8).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]));
  }, []);

  useEffect(() => {
    stateRef.current = { gameState, sequence, currentIndex, stage };
  }, [gameState, sequence, currentIndex, stage]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const gerarSequencia = () => {
    return Array(8).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  };

  const iniciarTimerEtapa = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('lost'); 
          return 0;
        }
        return prev - 1;
      });
    }, 53); 
  };

  const iniciarSistemaCompleto = () => {
    setSequence(gerarSequencia());
    setCurrentIndex(0);
    setStage(1); 
    setProgress(100);
    setGameState('playing');
    iniciarTimerEtapa();
  };

  const pararJogo = () => {
    clearInterval(timerRef.current);
    setSequence(gerarSequencia());
    setCurrentIndex(0);
    setProgress(100);
    setStage(1);
    setGameState('idle');
  };

  const handleKeyDown = useCallback((e) => {
    const { gameState: gState, sequence: seq, currentIndex: cIndex, stage: stg } = stateRef.current;

    if ((gState === 'idle' || gState === 'lost' || gState === 'won') && e.key === 'Enter') {
      e.preventDefault();
      iniciarSistemaCompleto();
      return;
    }

    if (gState !== 'playing') return;
    const inputKey = e.key.toUpperCase();
    if (!LETTERS.includes(inputKey)) return;

    if (inputKey === seq[cIndex]) {
      const nextIndex = cIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex === 8) {
        setScreenShake('green');
        setTimeout(() => setScreenShake(false), 160);

        if (stg < 3) {
          const proximaEtapa = stg + 1;
          setStage(proximaEtapa);
          setSequence(gerarSequencia());
          setCurrentIndex(0);
          iniciarTimerEtapa(); 
        } else {
          clearInterval(timerRef.current);
          setGameState('won');
        }
      }
    } else {
      setSequence(gerarSequencia());
      setCurrentIndex(0);
      
      setScreenShake('red');
      setTimeout(() => setScreenShake(false), 160);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const timerColor = gameState === 'idle' ? '#a3ef52' : progress > 60 ? '#a3ef52' : progress > 30 ? '#f58002' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-neutral-50 dark:bg-black p-6 font-sans select-none w-full relative overflow-hidden transition-colors duration-300 animate-page-reveal">
      
      {/* INTERPOLAÇÃO DE ANIMAÇÕES E RESPONSIVIDADE */}
      <style>{`
        @keyframes pageReveal {
          from { opacity: 0; filter: blur(8px); transform: translateY(15px) scale(0.98); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        }
        .animate-page-reveal { animation: pageReveal 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

        @keyframes cyberShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 1px); }
          80% { transform: translate(1px, -1px); }
        }
        .animate-cyber-shake { animation: cyberShake 0.16s linear; }

        @keyframes blurFadeIn {
          from { opacity: 0; background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(8px); }
        }
        @keyframes blurFadeInLight {
          from { opacity: 0; background-color: rgba(255,255,255,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(255,255,255,0.7); backdrop-filter: blur(8px); }
        }
        @keyframes elasticPopUp {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeInLight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .dark .animate-blur-fade { animation: blurFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: elasticPopUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        .responsive-caixinha-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          transform-origin: center center;
          transition: transform 0.3s ease-out;
        }
        @media (max-height: 900px) { .responsive-caixinha-wrapper { transform: scale(0.95); } }
        @media (max-height: 800px) { .responsive-caixinha-wrapper { transform: scale(0.85); } }
        @media (max-height: 700px) { .responsive-caixinha-wrapper { transform: scale(0.75); } }
        @media (max-height: 600px) { .responsive-caixinha-wrapper { transform: scale(0.65); } }
      `}</style>

      <div className="responsive-caixinha-wrapper">
        
        {/* CONTAINER PRINCIPAL */}
        <div className={`w-full max-w-2xl bg-white dark:bg-[#0c0c0c] border rounded-2xl shadow-xl dark:shadow-2xl flex flex-col relative overflow-hidden transition-all duration-150 ${
          screenShake === 'red' ? 'animate-cyber-shake border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
          screenShake === 'green' ? 'animate-cyber-shake border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
          'border-neutral-200 dark:border-neutral-800'
        }`}>
          
          {/* CABEÇALHO */}
          <div className="h-11 bg-neutral-50 dark:bg-[#141414] flex items-center justify-center gap-2 border-b border-neutral-200 dark:border-neutral-800/40 text-neutral-600 dark:text-neutral-400 text-sm font-bold tracking-wide font-mono relative transition-colors">
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-[0_0_8px_rgba(239,68,68,0.3)] dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
            >
              <circle cx="11" cy="13" r="9"></circle>
              <path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.41 2.41 0 0 0-3.4 0l-1.8 1.8"></path>
              <path d="m22 2-1.5 1.5"></path>
            </svg>
            Digite a Sequência Correta
            
            {gameState === 'playing' && (
              <div className="absolute right-4 text-[9px] bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black tracking-widest transition-all">
                ETAPA: {stage} / 3
              </div>
            )}
          </div>

          {/* CORPO DO MINIGAME */}
          <div className="flex flex-col w-full pb-6 pt-6 relative">
            
            {/* CRONÔMETRO COM O RELÓGIO */}
            <div className="flex flex-col items-center gap-2 px-8 mb-4">
              <svg 
                width="15" 
                height="15" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke={timerColor} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="transition-colors duration-200"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <div className="w-full h-3 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800/60 transition-colors">
                <div 
                  className="h-full transition-all duration-75 ease-linear" 
                  style={{ 
                    width: `${progress}%`, 
                    backgroundColor: timerColor,
                    boxShadow: `0 0 14px ${timerColor}` 
                  }} 
                />
              </div>
            </div>

            {/* GRADE DE TECLAS */}
            <div className="px-8 mb-10 mt-8">
              <div className="grid grid-cols-8 gap-3.5">
                {sequence.map((letter, idx) => {
                  const isCompleted = gameState === 'playing' && idx < currentIndex;
                  const isCurrent = gameState === 'playing' && idx === currentIndex;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`h-16 flex items-center justify-center font-black text-2xl rounded-xl font-mono transition-all duration-300 ease-out ${
                        isCompleted 
                          ? 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 opacity-60 dark:opacity-40 scale-95' 
                          : isCurrent 
                            ? 'bg-white text-black ring-4 ring-amber-400 dark:ring-amber-500 -translate-y-6 shadow-[0_15px_25px_rgba(245,158,11,0.15)] dark:shadow-[0_15px_25px_rgba(245,158,11,0.25)] z-10 scale-105' 
                            : 'bg-white dark:bg-white text-black shadow-md dark:shadow-md border border-neutral-200 dark:border-transparent'
                      }`}
                      style={{ opacity: gameState === 'idle' ? 0.35 : 1 }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="text-center text-neutral-500 dark:text-neutral-500 text-[8px] font-black tracking-widest uppercase">
              {gameState === 'playing' ? 'Insira a combinação no teclado' : 'Pressione INICIAR ou ENTER para descriptografar'}
            </div>

            {/* OVERLAY DE STATUS */}
            {(gameState === 'lost' || gameState === 'won') && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-blur-fade">
                
                {gameState === 'lost' && (
                  <div className="text-red-600 dark:text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/30 dark:border-red-500/20 bg-red-50/90 dark:bg-red-950/20 p-4 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-xl animate-elastic-pop">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.4)] dark:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    失敗 SISTEMA FALHOU | NÃO FOI POSSÍVEL ARMAR A BOMBA
                  </div>
                )}
                
                {gameState === 'won' && (
                  <div className="text-emerald-600 dark:text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/20 p-4 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-xl animate-elastic-pop">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)] dark:drop-shadow-[0_0_6px_rgba(163,239,82,0.8)]">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    駭客 SISTEMA HACKEADO | INICIANDO CONTAGEM...
                  </div>
                )}
                
              </div>
            )}

          </div>

          {/* RODAPÉ DE CONTROLES */}
          <div className="flex justify-center border-t border-neutral-200 dark:border-neutral-900/40 p-4 bg-neutral-100 dark:bg-[#101010] z-20 transition-colors">
            {gameState === 'playing' ? (
              <button onClick={pararJogo} className="px-10 py-2.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:scale-[1.02] active:scale-[0.97] text-white border border-transparent dark:border-red-400 font-mono font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 ease-out">
                Abortar
              </button>
            ) : gameState === 'won' || gameState === 'lost' ? (
              <button onClick={pararJogo} className="px-10 py-2.5 bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:hover:bg-white hover:scale-[1.02] active:scale-[0.97] dark:text-black border border-transparent dark:border-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out">
                Voltar ao Menu
              </button>
            ) : (
              <button onClick={iniciarSistemaCompleto} className="px-12 py-2.5 bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.97] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-400/30 dark:shadow-amber-500/30 transition-all duration-300 ease-out">
                Iniciar Sequência
              </button>
            )}
          </div>

        </div>
      </div>

      {/* PAINEL DE ASSISTÊNCIA E INSTRUÇÃO */}
      <div className="fixed bottom-6 right-6 z-[100] font-mono transition-all duration-500 ease-out">
        {showHint ? (
          <div className="w-64 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 animate-elastic-pop transition-colors">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
                Guia do Minigame
              </div>
              <button 
                onClick={() => setShowHint(false)} 
                className="text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-neutral-300 text-xs font-bold transition-colors duration-200 px-1"
              >
                ✕
              </button>
            </div>
            
            <div className="w-full h-32 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-lg overflow-hidden relative flex items-center justify-center transition-colors">
              <img 
                src="dica_caixinha.gif" 
                alt="Tutorial do Caixinha Treino" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-500 gap-1 select-none bg-neutral-100 dark:bg-[#050505]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 dark:text-neutral-800 animate-pulse mb-1">
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
                [ dica_caixinha.gif ]
              </div>
            </div>

            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide">
              Pressione em sequência as letras indicadas no teclado. Conclua as 8 teclas antes que a barra de tempo expire. Serão <span className="text-neutral-900 dark:text-neutral-200 font-bold">3 fases consecutivas!</span>
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setShowHint(true)} 
            className="bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:scale-[1.04] active:scale-[0.96] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 transition-all duration-300 ease-out"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
            </svg>
            Ver Ajuda
          </button>
        )}
      </div>

    </div>
  );
}