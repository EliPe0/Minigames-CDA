import React, { useState, useEffect, useCallback, useRef } from 'react';
import { registerAttempt } from '../services/rankingService';

const TOTAL_PINS = 8;
const MAX_LEVEL = 3; 
const CHANCE_PENALIDADE = 0.35;
const TEMPO_TOTAL_MS = 60000;
const COOLDOWN_INPUT_MS = 300;

const gerarPinosIniciais = () => {
  return Array(TOTAL_PINS).fill(0).map(() => Math.floor(Math.random() * 3));
};

export default function PortaMalas() {
  const [gameState, setGameState] = useState('idle'); 
  const [pinsProgress, setPinsProgress] = useState(Array(TOTAL_PINS).fill(0)); 
  const [timerProgress, setTimerProgress] = useState(100); 
  const [timerDisplay, setTimerDisplay] = useState('60.00'); 
  const [isClicking, setIsClicking] = useState(false); 
  const [showHint, setShowHint] = useState(false); 
  const [screenShake, setScreenShake] = useState(false); 
  
  const [streak, setStreak] = useState(0);

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
  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    stateRef.current = { gameState, pinsProgress, streak };
  }, [gameState, pinsProgress, streak]);

  useEffect(() => {
    return () => {
      clearTimeout(clickTimeoutRef.current);
      clearTimeout(cooldownTimeoutRef.current);
      clearTimeout(shakeTimeoutRef.current);
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
    setTimerDisplay('60.00');
    
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
    if (gameState === 'playing') {
      registerAttempt('portamalas', false, 0, null);
      setStreak(0);
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    clearTimeout(cooldownTimeoutRef.current);
    cooldownRef.current = false;
    setPinsProgress(Array(TOTAL_PINS).fill(0)); 
    setTimerProgress(100);
    setTimerDisplay('60.00');
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
      setTimerDisplay((tempoRestante / 1000).toFixed(2));

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
        
        registerAttempt('portamalas', false, 0, null);
        setStreak(0);
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
    const { gameState: gState, pinsProgress: currentPins, streak: currentStr } = stateRef.current;
    
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
            
            const tempoGastoSeg = (performance.now() - startTimeRef.current) / 1000;
            const nextStreak = currentStr + 1;
            
            setStreak(nextStreak);
            registerAttempt('portamalas', true, nextStreak, tempoGastoSeg);
            setGameState('won');
          }
        }
      } else {
        if (novosPinos[hoveredIdx] > 0 && Math.random() < CHANCE_PENALIDADE) {
          novosPinos[hoveredIdx] -= 1;
          setPinsProgress(novosPinos);

          setScreenShake(true);
          clearTimeout(shakeTimeoutRef.current);
          shakeTimeoutRef.current = setTimeout(() => setScreenShake(false), 180);
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
    <div className="flex flex-col items-center justify-center flex-1 bg-[#050505] p-6 font-sans select-none w-full relative overflow-hidden text-white animate-page-reveal">
      
      {!showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="absolute top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 hover:text-orange-400 hover:border-orange-500/40 transition-all font-mono text-[11px] font-bold uppercase tracking-wider"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
            <path d="M9 18h6"/><path d="M10 22h4"/>
          </svg>
          Ver Guia
        </button>
      )}

      <div className={`transition-all duration-300 responsive-wrapper ${showHint ? 'pr-[340px]' : ''}`}>
        
        <div className={`w-full max-w-[540px] bg-[#0c0c0c] border rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border-neutral-800 transition-transform ${
          screenShake ? 'animate-cyber-shake border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : ''
        }`}>
          
          {/* CABEÇALHO */}
          <div className="h-11 bg-[#141414] flex items-center justify-center gap-2 border-b border-neutral-800/40 text-neutral-400 text-sm font-bold tracking-wide font-mono uppercase transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f58002" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Destrave o Porta Malas
          </div>

          <div className="flex flex-col w-full pb-6 pt-4 relative">
            
            {/* CRONÔMETRO */}
            <div className="flex flex-col items-center gap-2 px-8 mb-6">
              <div className="flex justify-between w-full text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest px-0.5">
                <span className="flex items-center gap-1.5">
                  <svg ref={clockRef} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={currentStaticColor} strokeWidth="2.5" className="transition-colors duration-200">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Tempo Restante
                </span>
                <span style={{ color: currentStaticColor }} className="font-bold text-xs transition-colors duration-200">{timerDisplay}s</span>
              </div>
              <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-800/60">
                <div ref={timerDOMRef} className="h-full transition-all duration-300 ease-out" style={{ width: `${timerProgress}%`, backgroundColor: currentStaticColor }} />
              </div>
            </div>

            {/* ÁREA DOS PINOS */}
            <div className="relative h-[160px] w-full px-8 flex mb-4">
              {pinsProgress.map((level, idx) => {
                const isMax = level === MAX_LEVEL;
                return (
                  <div key={idx} className="flex-1 flex justify-center relative h-full">
                    <div className="absolute top-0 bottom-0 w-[1px] bg-white/[0.02] transition-colors" />
                    <div className={`absolute top-0 w-[30px] h-[130px] transition-transform duration-500 ease-in-out z-10 ${getPinTranslateY(level)}`} style={{ opacity: isMax ? 0.9 : 1 }}>
                      <svg width="100%" height="100%" viewBox="0 0 26 95" className="overflow-visible block drop-shadow-[0_4px_10px_rgba(245,128,2,0.25)]">
                        <polygon points="3,3 23,3 23,75 13,88 3,75" className="fill-[#f58002] stroke-[#f58002] transition-colors" strokeWidth="4" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WRENCH E TIMELINE */}
            <div className="px-8 relative w-full mb-2 mt-2">
              <div className="relative w-full h-[64px]">
                <div className="absolute top-0 w-full h-[36px] bg-[#050505] rounded-lg border border-neutral-900 transition-colors" />
                
                <div className="absolute bottom-0 w-full h-[24px] flex items-center">
                  <div className="absolute inset-x-2 h-[2px] bg-neutral-800 transition-colors" />
                  <div className="relative w-full h-full flex items-center">
                    {pinsProgress.map((level, i) => (
                      <div key={i} className="flex-1 flex justify-center relative z-10">
                        <div className="relative flex items-center justify-center w-full h-full">
                          <div className={`absolute w-[50%] h-[6px] bg-[#3b82f6] rounded-sm transition-all duration-300 ease-in-out ${level === MAX_LEVEL ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 4px)', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />
                          <div className={`absolute w-[4px] h-[16px] bg-[#ef4444] rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.5)] transition-all duration-300 ease-in-out ${level === MAX_LEVEL ? 'opacity-60 scale-100' : 'opacity-0 scale-50'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={cursorRef} className="absolute top-0 bottom-0 w-0 z-30 pointer-events-none" style={{ left: gameState === 'playing' ? undefined : '0%' }}>
                  <div className={`absolute right-[1px] top-[12px] flex items-end origin-left transition-all duration-75 ease-out ${isClicking ? '-rotate-[3deg] -translate-y-[4px]' : 'rotate-0 translate-y-0'}`}>
                    <svg width="506" height="10" viewBox="0 0 506 10" className="overflow-visible block fill-[#8a8c9e]">
                      <path d="M0 6 H500 V0 H504 V6 H506 V10 H0 Z" />
                    </svg>
                  </div>
                  <div className="absolute right-[1px] top-[42px] w-[3px] h-[20px] bg-white shadow-[0_0_8px_rgba(255,255,255,1)] rounded-full transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="text-center text-neutral-500 text-[8px] font-black tracking-widest mt-4 uppercase transition-colors h-4">
              {gameState === 'playing' ? 'Aperte espaço no momento certo' : gameState === 'idle' ? 'Pressione INICIAR ou ESPAÇO para destravar o porta malas' : ''}
            </div>
            
            {/* OVERLAY */}
            {(gameState !== 'playing' && gameState !== 'idle') && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-blur-fade bg-black/20 backdrop-blur-sm pointer-events-none">
                {gameState === 'lost' && (
                  <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-950/40 p-5 rounded-xl w-[80%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Falha no arrombamento
                  </div>
                )}
                {gameState === 'won' && (
                  <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl w-[80%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                    </svg>
                    Porta malas destrancado
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RODAPÉ */}
          <div className="flex items-center justify-between border-t border-neutral-900 p-5 w-full relative transition-colors gap-6 bg-neutral-900/10 z-20">
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center flex-1 text-[10px] font-bold tracking-wider uppercase text-neutral-500 font-mono">
              {gameState === 'playing' ? (
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ESPAÇO</kbd>
                  <span className="text-neutral-500">Fixar Pino Ativo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd>
                  <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ESPAÇO</kbd>
                  <span className="text-neutral-500">Iniciar Sistema</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {gameState === 'playing' ? (
                <button onClick={pararSistema} className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Abortar
                </button>
              ) : gameState === 'won' || gameState === 'lost' ? (
                <button onClick={pararSistema} className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Voltar ao Menu
                </button>
              ) : (
                <button onClick={iniciarSistema} className="px-8 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Iniciar Sistema
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full w-[340px] bg-[#0c0c0c] border-l border-neutral-800 z-50 flex flex-col font-mono shadow-2xl transition-transform duration-300 ease-in-out ${showHint ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-14 bg-[#141414] border-b border-neutral-800/60 flex items-center justify-between px-5 text-amber-500 text-[11px] font-black uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
              <path d="M9 18h6"/><path d="M10 22h4"/>
            </svg>
            Banco de Dados: Porta Malas
          </div>
          <button onClick={() => setShowHint(false)} className="text-neutral-500 hover:text-white transition-colors p-2 text-sm font-bold">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
          <div className="w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative shadow-inner shrink-0">
            <img src="/dica_portamalas.gif" alt="Tutorial Porta Malas" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-600 select-none bg-[#050505]">[ dica_portamalas.gif ]</div>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed text-neutral-400">
            <div className="text-white font-black uppercase tracking-wider text-xs border-b border-neutral-900 pb-1.5">Diretrizes Operacionais:</div>
            <p className="text-justify">
              O destrancamento do compartimento de carga baseia-se em fixar todos os 8 pinos sequenciais suspensos no nível máximo de elevação da fechadura.
            </p>
            <p className="text-justify">
              O indicador vertical de pressão (barra branca com a linha de curso) começará a deslizar continuamente de forma horizontal por todo o trilho técnico do sistema.
            </p>
            <p className="text-justify">
              Pressione a tecla <span className="text-white font-bold">ESPAÇO</span> exatamente quando a agulha móvel estiver passando centralizada por cima da zona de encaixe azul do pino correspondente. Se você errar o tempo ou clicar fora da hitbox, existe uma chance de 35% de sofrer uma penalidade e descer um nível do pino atual.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}