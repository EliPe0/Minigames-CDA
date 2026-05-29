import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TOTAL_PINS = 8;
const MAX_LEVEL = 3; 
const CHANCE_PENALIDADE = 0.35;
const TEMPO_TOTAL_MS = 60000;
const COOLDOWN_INPUT_MS = 300;

const gerarPinosIniciais = () => {
  return Array(TOTAL_PINS).fill(0).map(() => Math.floor(Math.random() * 3));
};

export default function PortaMalas() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle'); 
  const [pinsProgress, setPinsProgress] = useState(Array(TOTAL_PINS).fill(0)); 
  const [timerProgress, setTimerProgress] = useState(100); 
  const [isClicking, setIsClicking] = useState(false); 
  const [showHint, setShowHint] = useState(true); 
  const [screenShake, setScreenShake] = useState(false); 

  const cursorRef = useRef(null);
  const timerDOMRef = useRef(null); 
  const clockRef = useRef(null); 
  const cursorPosRef = useRef(0);
  const directionRef = useRef(1); 
  const startTimeRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const animationRef = useRef(null); 
  const stateRef = useRef({});

  const cooldownRef = useRef(false);
  const cooldownTimeoutRef = useRef(null);

  useEffect(() => {
    stateRef.current = { gameState, pinsProgress };
  }, [gameState, pinsProgress]);

  useEffect(() => {
    return () => {
      clearTimeout(clickTimeoutRef.current);
      clearTimeout(cooldownTimeoutRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const iniciarSistema = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    clearTimeout(cooldownTimeoutRef.current);
    
    cooldownRef.current = false;
    setPinsProgress(gerarPinosIniciais()); 
    cursorPosRef.current = 0;
    directionRef.current = 1;
    startTimeRef.current = performance.now();
    setTimerProgress(100);
    
    if (timerDOMRef.current) {
      timerDOMRef.current.style.width = '100%';
      timerDOMRef.current.style.backgroundColor = '#a3ef52'; 
      timerDOMRef.current.style.boxShadow = '0 0 14px #a3ef52'; 
    }
    if (clockRef.current) clockRef.current.style.stroke = '#a3ef52';
    if (cursorRef.current) cursorRef.current.style.left = '0%';
    
    setGameState('playing');
  };

  const pararSistema = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    clearTimeout(cooldownTimeoutRef.current);
    cooldownRef.current = false;
    setPinsProgress(Array(TOTAL_PINS).fill(0)); 
    setTimerProgress(100);
    if (timerDOMRef.current) {
      timerDOMRef.current.style.width = '100%';
      timerDOMRef.current.style.backgroundColor = '#a3ef52';
      timerDOMRef.current.style.boxShadow = '0 0 14px #a3ef52';
    }
    if (clockRef.current) clockRef.current.style.stroke = '#a3ef52';
    setGameState('idle');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const gameLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      const cursorSpeed = 0.065; 
      let proximoCursor = cursorPosRef.current + (cursorSpeed * deltaTime * directionRef.current);
      
      if (proximoCursor >= 100) {
        proximoCursor = 100;
        directionRef.current = -1;
      } else if (proximoCursor <= 0) {
        proximoCursor = 0;
        directionRef.current = 1;
      }
      
      cursorPosRef.current = proximoCursor;
      
      if (cursorRef.current) {
        cursorRef.current.style.left = `${proximoCursor}%`;
      }

      const tempoDecorrido = time - startTimeRef.current;
      const tempoRestante = Math.max(0, TEMPO_TOTAL_MS - tempoDecorrido);
      const progressoTimer = (tempoRestante / TEMPO_TOTAL_MS) * 100;

      setTimerProgress(progressoTimer);

      if (timerDOMRef.current) {
        timerDOMRef.current.style.width = `${progressoTimer}%`;
        
        if (progressoTimer > 60) {
          timerDOMRef.current.style.backgroundColor = '#a3ef52';
          timerDOMRef.current.style.boxShadow = '0 0 14px #a3ef52';
          if (clockRef.current) clockRef.current.style.stroke = '#a3ef52';
        } else if (progressoTimer > 30) {
          timerDOMRef.current.style.backgroundColor = '#f58002';
          timerDOMRef.current.style.boxShadow = '0 0 14px #f58002';
          if (clockRef.current) clockRef.current.style.stroke = '#f58002';
        } else {
          timerDOMRef.current.style.backgroundColor = '#ef4444';
          timerDOMRef.current.style.boxShadow = '0 0 14px #ef4444';
          if (clockRef.current) clockRef.current.style.stroke = '#ef4444';
        }
      }

      if (tempoRestante <= 0) {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setGameState('lost');
        return; 
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame((time) => {
      lastTime = time;
      gameLoop(time);
    });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const handleKeyDown = useCallback((e) => {
    const { gameState: gState, pinsProgress: currentPins } = stateRef.current;
    
    if (gState === 'idle' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      iniciarSistema();
      return;
    }

    if (gState !== 'playing') return;

    if (e.key === ' ') {
      e.preventDefault();

      if (cooldownRef.current) return;

      cooldownRef.current = true;
      cooldownTimeoutRef.current = setTimeout(() => {
        cooldownRef.current = false;
      }, COOLDOWN_INPUT_MS);

      setIsClicking(true);
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => setIsClicking(false), 120);

      const cPos = cursorPosRef.current; 
      const sliceWidth = 100 / TOTAL_PINS;
      
      const hoveredIdx = Math.min(Math.floor(cPos / sliceWidth), TOTAL_PINS - 1);
      
      const hitboxStart = (hoveredIdx * sliceWidth) + (sliceWidth * 0.10);
      const hitboxEnd = (hoveredIdx * sliceWidth) + (sliceWidth * 0.90);

      const acertou = cPos >= hitboxStart && cPos <= hitboxEnd;
      const novosPinos = [...currentPins];

      if (acertou) {
        if (novosPinos[hoveredIdx] < MAX_LEVEL) {
          novosPinos[hoveredIdx] += 1;
          setPinsProgress(novosPinos);

          if (novosPinos.every(p => p === MAX_LEVEL)) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setGameState('won');
          }
        }
      } else {
        if (novosPinos[hoveredIdx] > 0 && Math.random() < CHANCE_PENALIDADE) {
          novosPinos[hoveredIdx] -= 1;
          setPinsProgress(novosPinos);

          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 180);
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getPinTranslateY = (level) => {
    if (level === 0) return 'translate-y-[65px]';
    if (level === 1) return 'translate-y-[43px]';
    if (level === 2) return 'translate-y-[21px]';
    return 'translate-y-[0px]'; 
  };

  const currentStaticColor = gameState === 'idle' ? '#a3ef52' : timerProgress > 60 ? '#a3ef52' : timerProgress > 30 ? '#f58002' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-black p-6 font-sans select-none w-full relative overflow-hidden">
      
      {/* INTERPOLAÇÃO */}
      <style>{`
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
        @keyframes elasticPopUp {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: elasticPopUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* CARD CENTRAL DO GAME */}
      <div className={`w-full max-w-[540px] bg-[#0c0c0c] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-neutral-800 transition-transform ${
        screenShake ? 'animate-cyber-shake border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''
      }`}>
        
        {/* HEADER */}
        <div className="h-11 bg-[#141414] flex items-center justify-center gap-2 border-b border-neutral-800/40 text-neutral-400 text-sm font-bold tracking-wide font-mono">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f58002" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Destrave o Porta Malas
        </div>

        {/* INTERFACE DO SISTEMA */}
        <div className="flex flex-col w-full pb-6 pt-4 relative">
          
          {/* SEÇÃO DO CRONÔMETRO */}
          <div className="flex flex-col items-center gap-2 px-8 mb-6">
            <svg 
              ref={clockRef}
              width="15" 
              height="15" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={currentStaticColor} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="transition-colors duration-200"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-800/60">
              <div 
                ref={timerDOMRef}
                className="h-full transition-all duration-300 ease-out"
                style={{ width: `${timerProgress}%`, backgroundColor: currentStaticColor, boxShadow: `0 0 14px ${currentStaticColor}` }} 
              />
            </div>
          </div>

          {/* ÁREA DOS PINOS */}
          <div className="relative h-[160px] w-full px-8 flex mb-4">
            {pinsProgress.map((level, idx) => {
              const isMax = level === MAX_LEVEL;
              return (
                <div key={idx} className="flex-1 flex justify-center relative h-full">
                  <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.02]" />
                  <div 
                    className={`absolute top-0 w-[30px] h-[130px] transition-transform duration-500 ease-in-out z-10 ${getPinTranslateY(level)}`}
                    style={{ opacity: isMax ? 0.9 : 1 }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 26 95" className="overflow-visible block drop-shadow-[0_4px_10px_rgba(245,128,2,0.15)]">
                      <polygon 
                        points="3,3 23,3 23,75 13,88 3,75" 
                        fill="#f58002" 
                        stroke="#f58002" 
                        strokeWidth="4" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WRENCH E TIMELINE */}
          <div className="px-8 relative w-full mb-2 mt-2">
            <div className="relative w-full h-[64px]">
              <div className="absolute top-0 w-full h-[36px] bg-[#050505] rounded-lg border border-neutral-900" />
              
              <div className="absolute bottom-0 w-full h-[24px] flex items-center">
                <div className="absolute inset-x-2 h-[2px] bg-neutral-800" />
                <div className="relative w-full h-full flex items-center">
                  {pinsProgress.map((level, i) => (
                    <div key={i} className="flex-1 flex justify-center relative z-10">
                      { level === MAX_LEVEL ? (
                        <div className="w-[4px] h-[16px] bg-[#ef4444] rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.5)] opacity-60 transition-all duration-300" /> 
                      ) : (
                        <div 
                          className="w-[50%] h-[6px] bg-[#3b82f6] rounded-sm transition-all duration-300"
                          style={{ 
                            backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)',
                            boxShadow: '0 0 8px rgba(59,130,246,0.6)'
                          }} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={cursorRef}
                className="absolute top-0 bottom-0 w-0 z-30 pointer-events-none"
                style={{ left: gameState === 'playing' ? undefined : '0%' }}
              >
                <div 
                  className={`absolute right-[1px] top-[12px] flex items-end origin-left transition-all duration-75 ease-out ${
                    isClicking ? '-rotate-[3deg] -translate-y-[4px]' : 'rotate-0 translate-y-0'
                  }`}
                >
                  <svg width="506" height="10" viewBox="0 0 506 10" fill="#8a8c9e" className="overflow-visible block">
                    <path d="M0 6 H500 V0 H504 V6 H506 V10 H0 Z" />
                  </svg>
                </div>
                <div className="absolute right-[1px] top-[42px] w-[3px] h-[20px] bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full" />
              </div>

            </div>
          </div>
          
          <div className="text-center text-neutral-500 text-[8px] font-black tracking-widest mt-4 uppercase">
            {gameState === 'playing' ? 'Aperte espaço no momento certo' : 'Pressione INICIAR ou ESPAÇO para destravar o porta malas'}
          </div>
          
          {/* OVERLAY */}
          {gameState !== 'playing' && gameState !== 'idle' && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-blur-fade">
              
              {gameState === 'lost' && (
                <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-950/20 p-4 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-xl animate-elastic-pop">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Falha no arrombamento
                </div>
              )}
              
              {gameState === 'won' && (
                <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-950/20 p-4 rounded-xl w-[80%] flex items-center justify-center gap-2 shadow-xl animate-elastic-pop">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(163,239,82,0.8)]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                  Porta malas destrancado
                </div>
              )}
              
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="flex justify-center border-t border-neutral-900/40 p-4 bg-[#101010]">
          {gameState === 'playing' ? (
            <button onClick={pararSistema} className="px-10 py-2.5 bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-[0.97] text-white border border-red-400 font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 ease-out">
              Abortar
            </button>
          ) : gameState === 'won' || gameState === 'lost' ? (
            <button onClick={pararSistema} className="px-10 py-2.5 bg-neutral-200 hover:bg-white hover:scale-[1.02] active:scale-[0.97] text-black border border-white font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out">
              Voltar ao Menu
            </button>
          ) : (
            <button onClick={iniciarSistema} className="px-12 py-2.5 bg-[#f58002] hover:bg-[#ff9e24] hover:scale-[1.02] active:scale-[0.97] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(245,128,2,0.35)] transition-all duration-300 ease-out">
              Iniciar Sistema
            </button>
          )}
        </div>

      </div>

      {/* PAINEL DE ASSISTÊNCIA */}
      <div className="fixed bottom-6 right-6 z-40 font-mono transition-all duration-500 ease-out">
        {showHint ? (
          <div className="w-64 bg-[#0c0c0c] border border-neutral-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 animate-elastic-pop">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
              <div className="flex items-center gap-1.5 text-blue-400 text-[11px] font-black uppercase tracking-wider">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
                Guia do Minigame
              </div>
              <button 
                onClick={() => setShowHint(false)} 
                className="text-neutral-500 hover:text-neutral-300 text-xs font-bold transition-colors duration-200 px-1"
              >
                ✕
              </button>
            </div>
            
            <div className="w-full h-32 bg-neutral-950 border border-neutral-900 rounded-lg overflow-hidden relative flex items-center justify-center">
              <img 
                src="dica_portamalas.gif" 
                alt="Tutorial do Porta Malas" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-500 gap-1 select-none bg-[#050505]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-800 animate-pulse mb-1">
                  <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
                [ dica_portamalas.gif ]
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 leading-relaxed tracking-wide">
              Espere a barra branca da <span className="text-neutral-200 font-bold">chave</span> se alinhar perfeitamente em cima do bloco azul do trilho. Aperte <span className="text-amber-500 font-bold">ESPAÇO</span> para fixar o pino. Cuidado com o tempo de recarga após o clique!
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setShowHint(true)} 
            className="bg-[#0c0c0c] border border-neutral-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 hover:scale-[1.04] active:scale-[0.96] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 transition-all duration-300 ease-out"
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