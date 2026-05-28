import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TOTAL_PINS = 8;
const MAX_LEVEL = 3; 
const CHANCE_PENALIDADE = 0.35; // 35% de chance de perder um nível ao errar
const TEMPO_TOTAL_MS = 60000; // 60 Segundos exatos

const gerarPinosIniciais = () => {
  return Array(TOTAL_PINS).fill(0).map(() => Math.floor(Math.random() * 3));
};

export default function PortaMalas() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle'); 
  const [pinsProgress, setPinsProgress] = useState(Array(TOTAL_PINS).fill(0)); 
  const [timerProgress, setTimerProgress] = useState(100); 
  const [isClicking, setIsClicking] = useState(false); 

  // Referências para o motor de animação do cursor e do timer (Lag-Zero)
  const cursorRef = useRef(null);
  const timerDOMRef = useRef(null); 
  const cursorPosRef = useRef(0);
  const directionRef = useRef(1); 
  const startTimeRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const animationRef = useRef(null); 
  const stateRef = useRef({});

  useEffect(() => {
    stateRef.current = { gameState, pinsProgress };
  }, [gameState, pinsProgress]);

  const iniciarSistema = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setPinsProgress(gerarPinosIniciais()); 
    cursorPosRef.current = 0;
    directionRef.current = 1;
    startTimeRef.current = performance.now();
    setTimerProgress(100);
    setGameState('playing');
  };

  const pararSistema = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setPinsProgress(Array(TOTAL_PINS).fill(0)); // Reseta os pinos para o visual estático
    setGameState('idle');
  };

  // 🚀 MOTOR GRÁFICO (SÓ ATIVA QUANDO PLAYING)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const gameLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // 1. CURSOR
      const cursorSpeed = 0.040; 
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

      // 2. TIMER (60s exatos)
      const tempoDecorrido = time - startTimeRef.current;
      const tempoRestante = Math.max(0, TEMPO_TOTAL_MS - tempoDecorrido);
      const progressoTimer = (tempoRestante / TEMPO_TOTAL_MS) * 100;

      setTimerProgress(progressoTimer);

      if (timerDOMRef.current) {
        timerDOMRef.current.style.width = `${progressoTimer}%`;
        if (progressoTimer > 60) {
          timerDOMRef.current.style.backgroundColor = '#a3ef52';
        } else if (progressoTimer > 30) {
          timerDOMRef.current.style.backgroundColor = '#f58002';
        } else {
          timerDOMRef.current.style.backgroundColor = '#ef4444';
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
    
    // ATALHO: Permite iniciar o minigame apertando Enter ou Espaço quando estiver em idle
    if (gState === 'idle' && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      iniciarSistema();
      return;
    }

    if (gState !== 'playing') return;

    if (e.key === ' ') {
      e.preventDefault();

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

  const timerColor = gameState === 'idle' ? '#a3ef52' : timerProgress > 60 ? '#a3ef52' : timerProgress > 30 ? '#f58002' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-black p-6 font-sans select-none w-full relative overflow-hidden">
      <div className="w-full max-w-[480px] bg-[#0c0c0c] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-neutral-800">
        
        {/* HEADER */}
        <div className="h-11 bg-[#141414] flex items-center justify-center gap-2 border-b border-neutral-800/40 text-neutral-400 text-sm font-bold tracking-wide font-mono">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f58002" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Destrave o Porta Malas
        </div>

        {/* COMPONENTE INTERFECE GLOBAL - SEMPRE VISÍVEL */}
        <div className="flex flex-col w-full pb-6 pt-4 relative">
          
          {/* TIMER PROGRESS */}
          <div className="flex flex-col items-center gap-2 px-8 mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-300">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-800">
              <div 
                ref={timerDOMRef}
                className="h-full shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                style={{ width: `${timerProgress}%`, backgroundColor: timerColor }} 
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
                    className={`absolute top-0 w-[26px] h-[95px] transition-transform duration-300 ease-in-out z-10 ${getPinTranslateY(level)}`}
                    style={{ opacity: isMax ? 0.9 : 1 }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 26 95" className="overflow-visible drop-shadow-[0_4px_10px_rgba(245,128,2,0.15)]">
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

          {/* SEÇÃO DA WRENCH E TIMELINE */}
          <div className="px-6 relative w-full mb-2 mt-2">
            <div className="relative w-full h-[64px]">
              <div className="absolute top-0 w-full h-[36px] bg-[#050505] rounded-lg border border-neutral-900" />
              
              <div className="absolute bottom-0 w-full h-[24px] flex items-center">
                <div className="absolute inset-x-2 h-[2px] bg-neutral-800" />
                <div className="relative w-full h-full flex items-center">
                  {pinsProgress.map((level, i) => (
                    <div key={i} className="flex-1 flex justify-center relative z-10 -translate-y-[1px]">
                      { level === MAX_LEVEL ? (
                        <div className="w-[12px] h-[3px] bg-[#ef4444] rounded-sm shadow-[0_0_4px_rgba(239,68,68,0.5)]" /> 
                      ) : (
                        <div 
                          className="w-[50%] h-[6px] bg-[#3b82f6] rounded-sm"
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
                  className={`absolute right-[1px] top-[14px] flex items-end origin-left transition-all duration-75 ease-out ${
                    isClicking ? '-rotate-[3deg] -translate-y-[4px]' : 'rotate-0 translate-y-0'
                  }`}
                >
                  <div className="w-[500px] h-[4px] bg-[#8a8c9e]" />
                  <div className="w-[6px] h-[10px] bg-[#8a8c9e]" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 60%, 60% 60%, 60% 0%, 0% 0%)' }} />
                </div>
                <div className="absolute right-[1px] top-[40px] w-[3px] h-[20px] bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full" />
              </div>

            </div>
          </div>
          
          <div className="text-center text-neutral-500 text-[8px] font-black tracking-widest mt-4 uppercase">
            {gameState === 'playing' ? 'Aperte espaço no momento certo' : 'Pressione INICIAR ou ESPAÇO para abrir o porta malas'}
          </div>
          
          {gameState !== 'playing' && gameState !== 'idle' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-50 animate-in fade-in duration-200">
              {gameState === 'lost' && <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest animate-pulse border border-red-500/20 bg-red-950/20 p-4 rounded-xl w-[80%] text-center shadow-lg">🚨 Falha ao abrir o Porta Malas</div>}
              {gameState === 'won' && <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest animate-pulse border border-emerald-500/20 bg-emerald-950/20 p-4 rounded-xl w-[80%] text-center shadow-lg">🔓 Porta Malas aberto</div>}
            </div>
          )}
        </div>

        {/* MENUS GERAIS DE BOTÃO */}
        <div className="flex justify-center border-t border-neutral-900/40 p-4 bg-[#101010]">
          {gameState === 'playing' ? (
            <button onClick={pararSistema} className="px-10 py-2.5 bg-[#b83131]/20 hover:bg-[#b83131]/30 border border-[#b83131]/40 text-[#ff4d4d] font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">Abortar</button>
          ) : (
            <button onClick={iniciarSistema} className="px-12 py-2.5 bg-f88f2c bg-[#f58002] hover:bg-[#ff9e24] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/10">Iniciar Sistema</button>
          )}
        </div>

      </div>
    </div>
  );
}