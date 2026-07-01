import React, { useState, useEffect, useCallback, useRef } from 'react';
import { registerAttempt } from '../services/rankingService';
import { supabase } from '../services/supabase';

const LETTERS = ['A', 'S', 'D', 'Q', 'W', 'E'];

export default function CaixinhaTreino() {
  const [gameState, setGameState] = useState('idle'); 
  const [sequence, setSequence] = useState(Array(8).fill(''));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  const [stage, setStage] = useState(1); 
  const [showHint, setShowHint] = useState(false); 
  const [screenShake, setScreenShake] = useState(false);
  
  const [streak, setStreak] = useState(0); 

  const timerRef = useRef(null);
  const stateRef = useRef({});
  const shakeTimeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  const progressRef = useRef(100);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    setSequence(Array(8).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]));
  }, []);

  useEffect(() => {
    async function fetchInitialStreak() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const playerName = user.user_metadata?.username || user.user_metadata?.name;
        const { data } = await supabase
          .from('rankings')
          .select('max_streak')
          .eq('name', playerName)
          .eq('minigame', 'caixinha')
          .maybeSingle();
          
        if (data && data.max_streak) {
          setStreak(data.max_streak);
        }
      }
    }
    fetchInitialStreak();
  }, []);

  useEffect(() => {
    stateRef.current = { gameState, sequence, currentIndex, stage, streak };
  }, [gameState, sequence, currentIndex, stage, streak]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const gerarSequencia = () => Array(8).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]);

  const iniciarTimerEtapa = () => {
    clearInterval(timerRef.current);
    setProgress(100);
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          registerAttempt('caixinha', false, 0, null);
          setStreak(0);
          setGameState('lost'); 
          return 0;
        }
        return prev - 1;
      });
    }, 40); 
  };

  const iniciarSistemaCompleto = () => {
    setSequence(gerarSequencia());
    setCurrentIndex(0);
    setStage(1); 
    setProgress(100);
    setGameState('playing');
    startTimeRef.current = performance.now();
    iniciarTimerEtapa();
  };

  const pararJogo = () => {
    if (gameState === 'playing') {
      registerAttempt('caixinha', false, 0, null);
      setStreak(0);
    }
    clearInterval(timerRef.current);
    setSequence(gerarSequencia());
    setCurrentIndex(0);
    setProgress(100);
    setStage(1);
    setGameState('idle');
  };

  const handleKeyDown = useCallback((e) => {
    const { gameState: gState, sequence: seq, currentIndex: cIndex, stage: stg, streak: currentStr } = stateRef.current;

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
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = setTimeout(() => setScreenShake(false), 160);

        if (stg < 3) {
          setStage(stg + 1);
          setSequence(gerarSequencia());
          setCurrentIndex(0);
          iniciarTimerEtapa(); 
        } else {
          clearInterval(timerRef.current);
          const tempoGastoTotal = (performance.now() - startTimeRef.current) / 1000;
          const nextStreak = currentStr + 1;
          
          setStreak(nextStreak);
          registerAttempt('caixinha', true, nextStreak, tempoGastoTotal);
          setGameState('won');
        }
      }
    } else {
      setSequence(gerarSequencia());
      setCurrentIndex(0);
      setScreenShake('red');
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = setTimeout(() => setScreenShake(false), 160);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const timerColor = gameState === 'idle' ? '#a3ef52' : progress > 60 ? '#a3ef52' : progress > 30 ? '#f58002' : '#ef4444';
  
  const timerDisplay = gameState === 'idle' ? '4.00' : ((Math.max(0, progress) / 100) * 4).toFixed(2);

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-[#050505] p-6 font-sans select-none w-full relative overflow-hidden text-white animate-page-reveal">
      
      {!showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="cursor-pointer absolute top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 hover:text-emerald-500 hover:border-emerald-500/40 transition-all font-mono text-[12px] font-bold uppercase tracking-wider"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Ver Guia
        </button>
      )}

      <div className={`transition-all duration-300 responsive-wrapper ${showHint ? 'pr-[340px]' : ''}`}>
        
        <div className={`w-full max-w-2xl bg-[#0c0c0c] border rounded-2xl shadow-2xl flex flex-col relative overflow-hidden transition-all duration-150 ${
          screenShake === 'red' ? 'animate-cyber-shake border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' :
          screenShake === 'green' ? 'animate-cyber-shake border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
          'border-neutral-800'
        }`}>
          
          <div className="h-11 bg-[#141414] flex items-center justify-center px-6 border-b border-neutral-800/40 text-neutral-400 text-xs font-mono font-black uppercase tracking-wider transition-colors">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#07a883" strokeWidth="2.5" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                <circle cx="11" cy="13" r="9"></circle>
                <path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.41 2.41 0 0 0-3.4 0l-1.8 1.8"></path>
                <path d="m22 2-1.5 1.5"></path>
              </svg>
              Digite a Sequência Correta
            </div>
            
            {gameState === 'playing' && (
              <div className="absolute right-4 text-[9px] bg-amber-950/40 border border-amber-900/30 text-amber-400 px-2 py-0.5 rounded font-black tracking-widest transition-all">
                ETAPA: {stage} / 3
              </div>
            )}
          </div>

          <div className="flex flex-col w-full pb-6 pt-6 relative">
            
            <div className="flex flex-col items-center gap-2 px-8 mb-6">
              <div className="flex justify-between w-full text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest px-0.5">
                <span className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2.5" className="transition-colors duration-200">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Tempo Restante
                </span>
                <span style={{ color: timerColor }} className="font-bold text-xs transition-colors duration-200">{timerDisplay}s</span>
              </div>
              <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-800/60">
                <div className="h-full transition-all duration-75 ease-linear" style={{ width: `${progress}%`, backgroundColor: timerColor }} />
              </div>
            </div>

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
                          ? 'bg-neutral-900 text-neutral-600 border border-neutral-800/40 opacity-40 scale-95' 
                          : isCurrent 
                            ? 'bg-white text-black ring-4 ring-amber-500 -translate-y-4 shadow-[0_15px_25px_rgba(245,158,11,0.25)] z-10 scale-105' 
                            : 'bg-white text-black shadow-md border border-neutral-800'
                      }`}
                      style={{ opacity: gameState === 'idle' ? 0.35 : 1 }}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            </div>

            {(gameState === 'lost' || gameState === 'won') && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 animate-blur-fade bg-black/20 backdrop-blur-sm pointer-events-none">
                {gameState === 'lost' && (
                  <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-950/40 p-5 rounded-xl w-[80%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    失敗 SISTEMA FALHOU | NÃO FOI POSSÍVEL ARMAR A BOMBA
                  </div>
                )}
                {gameState === 'won' && (
                  <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl w-[80%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    駭客 SISTEMA HACKEADO | INICIANDO CONTAGEM...
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="flex items-center justify-between border-t border-neutral-900 p-5 w-full relative transition-colors gap-6 bg-neutral-900/10 z-20">
            <div className="flex flex-wrap gap-x-3 gap-y-2 items-center flex-1 text-[10px] font-bold tracking-wider uppercase text-neutral-500 font-mono">
              {gameState === 'playing' ? (
                <div className="flex items-center gap-1">
                  {LETTERS.map(L => (
                    <kbd key={L} className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">{L}</kbd>
                  ))}
                  <span className="text-neutral-500 ml-1">Digitar Combinação</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd>
                  <span className="text-neutral-500">Iniciar Sequência</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {gameState === 'playing' ? (
                <button onClick={pararJogo} className="px-6 py-2.5 cursor-pointer bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Abortar Sequência
                </button>
              ) : gameState === 'won' || gameState === 'lost' ? (
                <button onClick={pararJogo} className="px-6 py-2.5 cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Voltar ao Menu
                </button>
              ) : (
                <button onClick={iniciarSistemaCompleto} className="px-8 py-2.5 cursor-pointer bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95">
                  Iniciar Sequência
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full w-[340px] bg-[#0c0c0c] border-l border-neutral-800 z-50 flex flex-col font-mono shadow-2xl transition-transform duration-300 ease-in-out ${showHint ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-14 bg-[#141414] border-b border-neutral-800/60 flex items-center justify-between px-5 text-emerald-500 text-[11px] font-black uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#50c878" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Painel de Dica: Caixinha
          </div>
          <button onClick={() => setShowHint(false)} className="cursor-pointer text-neutral-500 hover:text-white transition-colors p-2 text-sm font-bold">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1">
          <div className="w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative shadow-inner shrink-0">
            <img src="/dica_caixinha.gif" alt="Tutorial Caixinha" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-600 select-none bg-[#050505]">[ dica_caixinha.gif ]</div>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed text-neutral-400">
            <div className="text-white font-black uppercase tracking-wider text-xs border-b border-neutral-900 pb-1.5">Como funciona:</div>
            <p className="text-justify">
              O  circuito integrado exige a digitação exata das chaves sequenciais que surgem na sua tela antes que o cronômetro chegue ao fim.
            </p>
            <p className="text-justify">
              Mantenha os dedos posicionados sobre os blocos de comando <span className="text-white font-bold">A, S, D, Q, W, E</span>. A janela de tempo é extremamente curta (4 seconds por etapa).
            </p>
            <p className="text-justify">
              Para vencer, você precisará fechar <span className="text-white font-bold">3 fases consecutivas</span> de 8 caracteres sem errar nenhuma letra. Qualquer falha resgata uma nova combinação e reseta o progresso do estágio atual.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}