import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAttempt } from '../services/rankingService';

const CHAR_SETS = {
  numeric: "0123456789",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
  braille: "⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼ \u2022 \u25a0 \u25b2",
  runes: "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ",
  symbols: "☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀"
};

const TEMPO_TOTAL_MS = 15000; 

export default function Hacking() {
  const navigate = useNavigate();

  const [gameState, setGameState] = useState('idle'); 
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false); 

  const [isMirroredActive, setIsMirroredActive] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codesPos, setCodesPos] = useState(0);
  const [currentPos, setCurrentPos] = useState(43);
  const [targetBlock, setTargetBlock] = useState([]); 
  const [isTargetHidden, setIsTargetHidden] = useState(false);

  const [progress, setProgress] = useState(100);
  const [timerDisplay, setTimerDisplay] = useState('15.00');

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
    setGameState(prev => {
      if (prev === 'playing') {
        registerAttempt('hacking', false, 0, null);
        setStreak(0);
      }
      return 'idle';
    });
    setIsTargetHidden(false);
    setProgress(100);
    setTimerDisplay('15.00');
    clearAllTimers();
    if (restart) setTimeout(start, 10); 
  }, [clearAllTimers]);

  const check = useCallback(() => {
    clearAllTimers();
    let current_attempt = (currentPos + codesPos) % 80;

    if (gameState === 'playing' && current_attempt === correctPosRef.current) {
      const tempoDecorrido = (performance.now() - startTimeRef.current) / 1000;
      const nextStreak = streak + 1;
      
      setStreak(nextStreak);
      registerAttempt('hacking', true, nextStreak, tempoDecorrido);
      setGameState('won');
    } else {
      registerAttempt('hacking', false, 0, null);
      setStreak(0);
      setGameState('lost');
    }
  }, [gameState, currentPos, codesPos, streak, clearAllTimers]);

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
    setTargetBlock([generatedCodes[findIdxs[0]], generatedCodes[findIdxs[1]], generatedCodes[findIdxs[2]], generatedCodes[findIdxs[3]]]);

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
          case 'w': case 'ArrowUp': next -= 10; if (next < 0) next += 80; break;
          case 's': case 'ArrowDown': next += 10; break;
          case 'a': case 'ArrowLeft': next--; if (next < 0) next = 79; break;
          case 'd': case 'ArrowRight': next++; break;
        }
        return next % 80;
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-4 font-sans select-none w-full relative overflow-hidden text-white animate-page-reveal">
      
      {!showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="absolute top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 hover:text-purple-400 hover:border-purple-500/40 transition-all font-mono text-[11px] font-bold uppercase tracking-wider"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
          </svg>
          Ver Guia
        </button>
      )}

      <div className={`transition-all duration-300 responsive-wrapper ${showHint ? 'pr-[340px]' : ''}`}>

        <div className="w-full max-w-[640px] bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
          
          <div className="h-11 bg-[#141414] flex items-center justify-center px-6 border-b border-neutral-800/40 text-neutral-400 text-xs font-mono font-black uppercase tracking-wider transition-colors">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
                <rect x="2" y="4" width="20" height="14" rx="2" ry="2"></rect><line x1="1" y1="20" x2="23" y2="20"></line>
              </svg>
              Encontre a Sequência Correta
            </div>
          </div>

          <div className="flex flex-col w-full pb-6 pt-5 relative">
            
            <div className="flex flex-col items-center gap-2 px-8 mb-6">
              <div className="flex justify-between w-full text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest px-0.5">
                <span className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={timerBarColor} strokeWidth="2.5" className="transition-colors duration-200">
                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Tempo Restante
                </span>
                <span style={{ color: timerBarColor }} className="font-bold text-xs transition-colors duration-200">{timerDisplay}s</span>
              </div>
              <div className="w-full h-2.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-neutral-800/60">
                <div className="h-full transition-all duration-75 ease-out" style={{ width: `${progress}%`, backgroundColor: timerBarColor }} />
              </div>
            </div>

            <div className="flex gap-3 items-center justify-center h-20 mb-4 w-full px-8">
              {gameState === 'playing' ? (
                !isTargetHidden ? (
                  targetBlock.map((char, i) => (
                    <div key={i} className="bg-purple-950/20 text-purple-400 font-mono font-black text-3xl px-4 py-1.5 rounded-xl border border-purple-500/30 min-w-[64px] text-center shadow-md animate-page-reveal">{char}</div>
                  ))
                ) : (
                  <span className="text-red-500 border border-red-500/20 bg-red-500/5 px-4 py-1.5 rounded-xl text-xs font-mono font-black tracking-widest uppercase animate-pulse">SINAL INTERROMPIDO</span>
                )
              ) : (
                <div className="text-neutral-500 font-mono text-[10px] font-black tracking-widest uppercase py-3 transition-colors">
                  {gameState === 'idle' ? 'AGUARDANDO LIBERAÇÃO DO TERMINAL' : gameState === 'won' ? 'CRIPTOGRAFIA QUEBRADA' : 'SINAL CORROMPIDO'}
                </div>
              )}
            </div>

            <div className="relative px-8 min-h-[220px] flex items-center justify-center crt-matrix">
              <div className="absolute top-1 left-7 w-3 h-3 border-t-2 border-l-2 border-neutral-800 pointer-events-none" />
              <div className="absolute top-1 right-7 w-3 h-3 border-t-2 border-r-2 border-neutral-800 pointer-events-none" />
              <div className="absolute bottom-1 left-7 w-3 h-3 border-b-2 border-l-2 border-neutral-800 pointer-events-none" />
              <div className="absolute bottom-1 right-7 w-3 h-3 border-b-2 border-r-2 border-neutral-800 pointer-events-none" />

              {gameState === 'playing' || gameState === 'won' || gameState === 'lost' ? (
                <div className={`grid grid-cols-10 gap-x-2 gap-y-3 w-[500px] mx-auto font-mono font-bold text-base ${isMirroredActive ? 'mirrored-soup' : ''}`}>
                  {displayCodes.map((code, idx) => {
                    const isSelected = activeSelectionBlock.includes(idx);
                    let cellColorClass = "text-neutral-400 opacity-80 transition-all";
                    
                    if (gameState === 'playing' && isSelected) {
                      cellColorClass = "text-purple-400 font-black scale-110 opacity-100 z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]";
                    } else if (gameState === 'won' && isSelected) {
                      cellColorClass = "text-emerald-400 font-black opacity-100";
                    } else if (gameState === 'lost' && idx === ((correctPosRef.current - codesPos + 80) % 80)) {
                      cellColorClass = "text-emerald-400 font-black opacity-100"; 
                    }

                    return <div key={idx} className={`text-center h-6 transition-all ${cellColorClass}`}>{code}</div>;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center font-mono text-center gap-3 z-30 transition-colors">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-purple-400">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                </div>
              )}

              {(gameState === 'won' || gameState === 'lost') && (
                <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 animate-blur-fade pointer-events-none">
                  {gameState === 'lost' && (
                    <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/20 bg-red-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      CRÍTICO | TENTATIVA DETECTADA E BLOQUEADA
                    </div>
                  )}
                  {gameState === 'won' && (
                    <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-950/40 p-5 rounded-xl w-[85%] flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop pointer-events-auto">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      SUCESSO | SINAL ENCONTRADO E CONSOLIDADO
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center justify-between border-t border-neutral-900 p-5 w-full relative transition-colors gap-6 bg-neutral-900/10 z-20">
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center flex-1 text-[10px] font-bold tracking-wider uppercase text-neutral-500 font-mono">
              {gameState === 'playing' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">W</kbd>
                    <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">A</kbd>
                    <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">S</kbd>
                    <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">D</kbd>
                    <span className="text-neutral-500">Mover Cursor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd>
                    <span className="text-neutral-500">Validar Sinal</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd>
                  <span className="text-neutral-500">Iniciar Sistema</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              {gameState === 'playing' ? (
                <button 
                  onClick={() => reset(false)} 
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                >
                  Abortar Sistema
                </button>
              ) : gameState === 'won' || gameState === 'lost' ? (
                <button 
                  onClick={() => reset(false)} 
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                >
                  Voltar ao Hub
                </button>
              ) : (
                <button 
                  onClick={() => reset(true)} 
                  className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-purple-500/10"
                >
                  Iniciar Sistema
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      <div className={`fixed top-0 right-0 h-full w-[340px] bg-[#0c0c0c] border-l border-neutral-800 z-50 flex flex-col font-mono shadow-2xl transition-transform duration-300 ease-in-out ${showHint ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="h-14 bg-[#141414] border-b border-neutral-800/60 flex items-center justify-between px-5 text-purple-400 text-[11px] font-black uppercase tracking-wider shrink-0 transition-colors">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
            </svg>
            Banco de Dados: Hacking
          </div>
          <button 
            onClick={() => setShowHint(false)}
            className="text-neutral-500 hover:text-white transition-colors p-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1 font-sans">
          <div className="w-full aspect-video bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative shadow-inner shrink-0 transition-colors">
            <img 
              src="/dica_hacking.gif" 
              alt="Tutorial Hacking" 
              className="w-full h-full object-cover animate-blur-fade"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-2 text-[9px] text-neutral-600 select-none bg-[#050505]">
              [ dica_hacking.gif ]
            </div>
          </div>

          <div className="flex flex-col gap-3 font-mono text-[11px] leading-relaxed text-neutral-400 transition-colors">
            <div className="text-white font-black uppercase tracking-wider text-xs border-b border-neutral-900 pb-1.5 transition-colors">Diretrizes Operacionais:</div>
            <p className="text-justify animate-elastic-pop">
              O terminal exibirá uma sequência fixa de 4 blocos roxos no topo da tela. Seu objetivo consiste em rastrear exatamente esse bloco idêntico camuflado dentro do fluxo em movimento abaixo.
            </p>
            <p className="text-justify animate-elastic-pop">
              Utilize os controles <span className="text-white font-bold">WASD</span> ou as setas direcionais para mover o cursor quadrado. A velocidade de rotação do código exige foco rápido.
            </p>
            <p className="text-justify animate-elastic-pop">
              Assim que o seu quadrado roxo de seleção estiver perfeitamente posicionado cobrindo toda a sequência correta, aperte <span className="text-purple-400 font-bold font-black transition-colors">ENTER</span> imediatamente para consolidar o bypass. Qualquer clique fora da posição corrompe o sinal e reseta o streak.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}