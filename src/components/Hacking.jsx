import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LETTERS = ['A', 'S', 'D', 'Q', 'W', 'E'];
const CHAR_SETS = {
  numeric: "0123456789",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
  braille: "⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼ \u2022 \u25a0 \u25b2",
  runes: "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ",
  symbols: "☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀"
};

const TEMPO_TOTAL_MS = 15000; 

export default function Hacking() {
  const navigate = useNavigate();

  // --- ESTADOS DE PONTUAÇÃO ---
  const [gameState, setGameState] = useState('idle'); 
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [maxStreak, setMaxStreak] = useState(() => {
    const match = document.cookie.match(/max-streak_hacking=(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const [bestTime, setBestTime] = useState(() => {
    const match = document.cookie.match(/best-time_hacking=([\d.]+)/);
    return match ? parseFloat(match[1]) : 99.999;
  });

  // --- ENGINE TOTALMENTE REATIVA ---
  const [isMirroredActive, setIsMirroredActive] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codesPos, setCodesPos] = useState(0);
  const [currentPos, setCurrentPos] = useState(43);
  const [targetBlock, setTargetBlock] = useState([]); 
  const [isTargetHidden, setIsTargetHidden] = useState(false);

  // --- PROGRESSO DO CRONÔMETRO ---
  const [progress, setProgress] = useState(100);
  const [timerDisplay, setTimerDisplay] = useState('15.00');

  // --- REFS ---
  const correctPosRef = useRef(0);
  const startTimeRef = useRef(null);

  const timerGameInterval = useRef(null);
  const timerHideInterval = useRef(null);
  const timerProgressInterval = useRef(null);

  const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

  const randomSetChar = (setKey) => {
    const str = CHAR_SETS[setKey] || "?";
    return str.charAt(random(0, str.length));
  };

  const getGroupFromPos = (pos, count = 4) => {
    let group = [pos];
    for (let i = 1; i < count; i++) {
      group.push((pos + i) >= 80 ? (pos + i) - 80 : pos + i);
    }
    return group;
  };

  const clearAllTimers = useCallback(() => {
    clearInterval(timerGameInterval.current);
    clearInterval(timerHideInterval.current);
    clearInterval(timerProgressInterval.current);
  }, []);

  const moveCodes = useCallback(() => {
    setCodesPos(prev => (prev + 1) % 80);
  }, []);

  const reset = useCallback((restart = true) => {
    setGameState('idle');
    setIsTargetHidden(false);
    setProgress(100);
    setTimerDisplay('15.00');
    clearAllTimers();
    if (restart) start();
  }, [clearAllTimers]);

  const check = useCallback(() => {
    clearAllTimers();
    
    let current_attempt = (currentPos + codesPos) % 80;

    if (gameState === 'playing' && current_attempt === correctPosRef.current) {
      const tempoDecorrido = (performance.now() - startTimeRef.current) / 1000;
      
      setStreak(prev => {
        const next = prev + 1;
        if (next > maxStreak) {
          setMaxStreak(next);
          document.cookie = "max-streak_hacking=" + next + "; max-age=31536000; path=/";
        }
        return next;
      });

      if (tempoDecorrido < bestTime) {
        setBestTime(parseFloat(tempoDecorrido.toFixed(3)));
        document.cookie = "best-time_hacking=" + tempoDecorrido.toFixed(3) + "; max-age=31536000; path=/";
      }
      setGameState('won');
    } else {
      setStreak(0);
      setGameState('lost');
    }
  }, [gameState, currentPos, codesPos, maxStreak, bestTime, clearAllTimers]);

  const checkRef = useRef(check);
  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  const start = useCallback(() => {
    setCodesPos(0);
    setCurrentPos(43);
    setIsTargetHidden(false);
    setProgress(100);

    const disponiveis = Object.keys(CHAR_SETS);
    const activeSet = disponiveis[random(0, disponiveis.length)];
    
    setIsMirroredActive(Math.random() > 0.6);

    let generatedCodes = [];
    for (let i = 0; i < 80; i++) {
      generatedCodes.push(randomSetChar(activeSet) + randomSetChar(activeSet));
    }
    setCodes(generatedCodes);

    correctPosRef.current = random(0, 80);
    let findIdxs = getGroupFromPos(correctPosRef.current);
    setTargetBlock([
      generatedCodes[findIdxs[0]],
      generatedCodes[findIdxs[1]],
      generatedCodes[findIdxs[2]],
      generatedCodes[findIdxs[3]]
    ]);

    setGameState('playing');
    startTimeRef.current = performance.now();

    timerGameInterval.current = setInterval(moveCodes, 1300);

    timerProgressInterval.current = setInterval(() => {
      const decorrido = performance.now() - startTimeRef.current;
      const restante = Math.max(0, TEMPO_TOTAL_MS - decorrido);
      const pct = (restante / TEMPO_TOTAL_MS) * 100;
      
      setProgress(pct);
      setTimerDisplay((restante / 1000).toFixed(2));

      if (restante <= 0) {
        checkRef.current();
      }
    }, 30);

    if (Math.random() > 0.75) { 
      timerHideInterval.current = setInterval(() => {
        setIsTargetHidden(prev => !prev);
      }, 2000); 
    }
  }, [moveCodes]);

  const handleKeyDown = useCallback((e) => {
    let key_pressed = e.key;
    let valid_keys = ['a', 'w', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft', 'Enter'];

    if ((gameState === 'idle' || gameState === 'won' || gameState === 'lost') && key_pressed === 'Enter') {
      e.preventDefault();
      reset(true);
      return;
    }

    if (gameState === 'playing' && valid_keys.includes(key_pressed)) {
      e.preventDefault();
      if (key_pressed === 'Enter') {
        checkRef.current();
        return;
      }
      setCurrentPos(prev => {
        let next = prev;
        switch (key_pressed) {
          case 'w':
          case 'ArrowUp':
            next -= 10;
            if (next < 0) next += 80;
            break;
          case 's':
          case 'ArrowDown':
            next += 10;
            next %= 80;
            break;
          case 'a':
          case 'ArrowLeft':
            next--;
            if (next < 0) next = 79;
            break;
          case 'd':
          case 'ArrowRight':
            next++;
            next %= 80;
            break;
        }
        return next;
      });
    }
  }, [gameState, reset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const displayCodes = [...codes];
  if (codesPos > 0) {
    const removed = displayCodes.splice(0, codesPos);
    displayCodes.push(...removed);
  }

  const activeSelectionBlock = getGroupFromPos(currentPos);
  const timerBarColor = progress > 60 ? '#a3ef52' : progress > 30 ? '#f58002' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-black p-4 font-sans select-none w-full relative overflow-hidden transition-colors duration-300 animate-page-reveal">
      
      <style>{`
        @keyframes pageReveal {
          from { opacity: 0; filter: blur(5px); transform: translateY(6px); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        .animate-page-reveal { animation: pageReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes blurFadeIn {
          from { opacity: 0; background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0,0,0,0); backdrop-filter: blur(4px); }
        }
        @keyframes smoothRevealUp {
          from { transform: scale(0.98) translateY(4px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: smoothRevealUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .responsive-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          transform-origin: center center;
          transition: transform 0.3s ease-out;
        }
        @media (max-height: 900px) { .responsive-wrapper { transform: scale(0.95); } }
        @media (max-height: 800px) { .responsive-wrapper { transform: scale(0.85); } }
        @media (max-height: 700px) { .responsive-wrapper { transform: scale(0.75); } }
        @media (max-height: 600px) { .responsive-wrapper { transform: scale(0.65); } }

        .mirrored-soup div { transform: scale(-1, -1); }
        
        .crt-matrix::after {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.02) 50%);
          background-size: 100% 3px;
          pointer-events: none;
          z-index: 20;
        }
        .dark .crt-matrix::after {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.08) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02));
          background-size: 100% 3px, 6px 100%;
        }
      `}</style>

      <div className="responsive-wrapper">

        <div className="w-full max-w-[640px] bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl dark:shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300">
          
          {/* CABEÇALHO DO COFRE DE DADOS */}
          <div className="h-11 bg-neutral-50 dark:bg-[#141414] flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800/40 text-neutral-600 dark:text-neutral-400 text-xs font-mono font-black tracking-wider transition-colors">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                <rect x="2" y="4" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="1" y1="20" x2="23" y2="20"></line>
              </svg>
              Encontre a Chave para Hackear o Sistema
            </div>
            
            <div className="flex gap-4 text-[10px] text-neutral-400">
              <div>STREAK: <span className="text-purple-500 font-bold">{streak}</span></div>
              <div>MAX: <span className="text-neutral-500 dark:text-neutral-300 font-bold">{maxStreak}</span></div>
            </div>
          </div>

          <div className="flex flex-col w-full pb-6 pt-5 relative">
            
            {/* SISTEMA DE CRONÔMETRO FLUIDO */}
            <div className="flex flex-col items-center gap-2 px-8 mb-6">
              <div className="flex justify-between w-full text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest px-0.5">
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Tempo Restante
                </span>
                <span style={{ color: timerBarColor }} className="font-bold tracking-normal text-xs">{timerDisplay}s</span>
              </div>
              
              <div className="w-full h-2.5 bg-neutral-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800/60 transition-colors">
                <div 
                  className="h-full transition-all duration-75 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: timerBarColor, boxShadow: `0 0 12px ${timerBarColor}` }} 
                />
              </div>
            </div>

            {/* BLOCO CENTRALIZADO DO ALVO (FIND) */}
            <div className="flex gap-3 items-center justify-center h-20 mb-4 w-full px-8">
              {gameState === 'playing' ? (
                !isTargetHidden ? (
                  targetBlock.map((char, i) => (
                    <div key={i} className="bg-neutral-100/80 dark:bg-purple-950/10 text-neutral-800 dark:text-purple-400 font-mono font-black text-3xl px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-purple-500/30 backdrop-blur-sm shadow-sm min-w-[64px] text-center">{char}</div>
                  ))
                ) : (
                  <span className="text-neutral-400 dark:text-neutral-700 font-mono font-black text-xs tracking-[0.25em] uppercase animate-pulse">[ SINAL INTERROMPIDO ]</span>
                )
              ) : (
                <div className="text-neutral-400 dark:text-neutral-600 font-mono text-[10px] font-black tracking-widest uppercase py-3 transition-all duration-200">
                  {gameState === 'idle' ? 'AGUARDANDO LIBERAÇÃO DO TERMINAL' : 
                   gameState === 'won' ? 'CONEXÃO CONCLUÍDA' : 'SINAL CORROMPIDO'}
                </div>
              )}
            </div>

            {/* MATRIZ IMPRESSA COM TEXTO DE ALTA VISIBILIDADE */}
            <div className="relative px-8 min-h-[220px] flex items-center justify-center crt-matrix">
              
              <div className="absolute top-1 left-7 w-3 h-3 border-t-2 border-l-2 border-neutral-300 dark:border-neutral-800 pointer-events-none" />
              <div className="absolute top-1 right-7 w-3 h-3 border-t-2 border-r-2 border-neutral-300 dark:border-neutral-800 pointer-events-none" />
              <div className="absolute bottom-1 left-7 w-3 h-3 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-800 pointer-events-none" />
              <div className="absolute bottom-1 right-7 w-3 h-3 border-b-2 border-r-2 border-neutral-300 dark:border-neutral-800 pointer-events-none" />

              {gameState === 'playing' || gameState === 'won' || gameState === 'lost' ? (
                <div className={`grid grid-cols-10 gap-x-2 gap-y-3 w-[500px] mx-auto font-mono font-bold text-base ${isMirroredActive ? 'mirrored-soup' : ''}`}>
                  {displayCodes.map((code, idx) => {
                    const isSelected = activeSelectionBlock.includes(idx);
                    
                    let cellColorClass = "text-neutral-600 dark:text-neutral-300 opacity-90";
                    
                    if (gameState === 'playing' && isSelected) {
                      cellColorClass = "text-purple-600 dark:text-purple-400 font-black drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] scale-110 opacity-100 z-10";
                    } else if (gameState === 'won' && isSelected) {
                      cellColorClass = "text-emerald-500 font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] opacity-100";
                    /* 🎯 CORRIGIDO: Alterado codesPosRef.current para o estado codesPos reativo */
                    } else if (gameState === 'lost' && idx === ((correctPosRef.current - codesPos + 80) % 80)) {
                      cellColorClass = "text-emerald-500 font-black drop-shadow-[0_0_8px_rgba(16,185,129,0.6)] opacity-100";
                    }

                    return (
                      <div key={idx} className={`text-center h-6 transition-all duration-150 ${cellColorClass}`}>
                        {code}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center font-mono text-center gap-2 z-30">
                  <div className="text-4xl text-neutral-300 dark:text-neutral-800 animate-pulse">⚡</div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-600 font-black tracking-widest uppercase">RECORD DE VELOCIDADE: {bestTime === 99.999 ? '0.000' : bestTime}s</div>
                </div>
              )}

              {/* OVERLAYS DE STATUS PREMIUM */}
              {(gameState === 'won' || gameState === 'lost') && (
                <div className="absolute inset-0 z-50 bg-white/5 dark:bg-black/10 backdrop-blur-sm flex items-center justify-center p-6 animate-blur-fade">
                  {gameState === 'lost' && (
                    <div className="text-red-600 dark:text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-500/10 dark:bg-red-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl backdrop-blur-md animate-elastic-pop">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.4)] shrink-0">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      CRIPTOGRAFIA BLOQUEADA | FALHA NO BYPASS
                    </div>
                  )}
                  {gameState === 'won' && (
                    <div className="text-emerald-600 dark:text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl backdrop-blur-md animate-elastic-pop">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)] shrink-0">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      SISTEMA HACKEADO | CHAVE DE SINAL LOCALIZADA
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RODAPÉ E CONTROLES DE FLUXO */}
          <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900 p-5 w-full relative transition-colors gap-6 bg-neutral-50/20 dark:bg-neutral-900/10 z-20">
            <div className="text-[9px] font-mono font-bold text-neutral-500 dark:text-neutral-600 tracking-widest uppercase flex flex-wrap gap-x-4 gap-y-1 items-center flex-1 min-w-0">
              {gameState === 'playing' ? (
                <>
                  <div><span className="text-neutral-700 dark:text-neutral-400 font-black mr-1">[WASD]</span> Navegar</div>
                  <div><span className="text-neutral-700 dark:text-neutral-400 font-black mr-1">[ENTER]</span> Confirmar</div>
                </>
              ) : (
                <span>APERTE ENTRAR OU O BOTÃO PARA EXECUTAR...</span>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {gameState === 'playing' ? (
                <button 
                  onClick={() => reset(false)} 
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:scale-[1.02] active:scale-[0.97] text-white border border-transparent dark:border-red-400 font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all duration-300"
                >
                  Abortar
                </button>
              ) : gameState === 'won' || gameState === 'lost' ? (
                <button 
                  onClick={() => reset(false)} 
                  className="px-6 py-2.5 bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:hover:bg-white hover:scale-[1.02] active:scale-[0.97] dark:text-black border border-transparent font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all duration-300"
                >
                  Voltar ao Hub
                </button>
              ) : (
                <button 
                  onClick={() => reset(true)} 
                  className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 dark:bg-purple-600 dark:hover:bg-purple-500 hover:scale-[1.02] active:scale-[0.97] text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 dark:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300"
                >
                  Iniciar Conexão
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* PAINEL DE ASSISTÊNCIA E INSTRUÇÃO CARD */}
      <div className="fixed bottom-6 right-6 z-[100] font-mono transition-all duration-500 ease-out">
        {showHint ? (
          <div className="w-64 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 animate-elastic-pop transition-colors">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-2">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-[11px] font-black uppercase tracking-wider">
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
                src="dica_hacking.gif" 
                alt="Tutorial do Hacking" 
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
                [ dica_hacking.gif ]
              </div>
            </div>

            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide">
              Encontre o bloco de caracteres destacado no topo navegando pela sopa de códigos com <span className="text-neutral-900 dark:text-neutral-200 font-bold">WASD</span>. Aperte <span className="text-purple-600 dark:text-purple-400 font-bold">ENTER</span> exatamente quando sua selection roxa estiver em cima da resposta correta!
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setShowHint(true)} 
            className="bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:scale-[1.04] active:scale-[0.96] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 transition-all duration-300 ease-out"
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