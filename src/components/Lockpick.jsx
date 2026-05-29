import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- MATEMÁTICA DO CÍRCULO ---
const getCoords = (angle, radius, center = 200) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
};

// --- MOTOR PROCEDURAL AJUSTADO ---
const generatePuzzle = () => {
  const numRings = 3; 
  const possibleAngles = Array.from({ length: 24 }, (_, i) => i * 15); 
  
  let generatedRings = [];
  let validTools = [];

  for (let r = 0; r < numRings; r++) {
    let toolsForThisRing = 2; 
    const roll = Math.random();

    if (r === 0) {
      if (roll < 0.90) {
        toolsForThisRing = 1; 
      } else if (roll < 0.97) {
        toolsForThisRing = 2; 
      } else {
        toolsForThisRing = 3; 
      }
    } else {
      if (roll < 0.05) toolsForThisRing = 1; 
      else if (roll < 0.60) toolsForThisRing = 2;
      else toolsForThisRing = 3;
    }

    let ringHoles = new Set();

    for (let t = 0; t < toolsForThisRing; t++) {
       const maxPinsAllowed = 7 - ringHoles.size; 
       if (maxPinsAllowed < 2) break;

       const pinsCount = Math.random() > 0.7 ? 3 : 2; 
       const finalPins = Math.min(pinsCount, maxPinsAllowed);
       
       let toolPins = [];
       for(let p = 0; p < finalPins; p++) {
          let safeAngles = possibleAngles.filter(angle => {
             for (let h of ringHoles) {
                const d = Math.abs(angle - h);
                if (Math.min(d, 360 - d) < 30) return false; 
             }
             return true;
          });

          if (safeAngles.length === 0) break;
          const selectedAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
          toolPins.push(selectedAngle);
          ringHoles.add(selectedAngle);
       }
       
       if (toolPins.length > 0) {
          const randomOffset = possibleAngles[Math.floor(Math.random() * possibleAngles.length)];
          const shiftedPins = toolPins.map(pin => (pin + randomOffset) % 360);
          validTools.push({ pins: shiftedPins, used: false });
       }
    }

    while (ringHoles.size < (toolsForThisRing * 2)) {
       let safeAngles = possibleAngles.filter(angle => {
          for (let h of ringHoles) {
             const d = Math.abs(angle - h);
             if (Math.min(d, 360 - d) < 30) return false;
          }
          return true;
       });
       if (safeAngles.length === 0) break;
       const fallbackAngle = safeAngles[Math.floor(Math.random() * safeAngles.length)];
       ringHoles.add(fallbackAngle);
    }

    generatedRings.push(Array.from(ringHoles));
  }

  if (validTools.length > 12) validTools = validTools.slice(0, 12);
  const minToolsRequired = Math.max(6, validTools.length); 
  const totalToolsCount = Math.floor(Math.random() * (12 - minToolsRequired + 1)) + minToolsRequired;

  let decoysCount = totalToolsCount - validTools.length;
  let decoyTools = [];
  for(let d = 0; d < decoysCount; d++) {
     const pinsCount = Math.random() > 0.7 ? 3 : 2;
     let toolPins = [];
     let availableAngles = [...possibleAngles];
     for(let p = 0; p < pinsCount; p++) {
        const randIdx = Math.floor(Math.random() * availableAngles.length);
        toolPins.push(availableAngles.splice(randIdx, 1)[0]);
     }
     decoyTools.push({ pins: toolPins, used: false });
  }

  let visibleTools = [...validTools, ...decoyTools].sort(() => Math.random() - 0.5);
  
  let gridTools = [];
  for (let i = 0; i < 12; i++) {
     if (i < visibleTools.length) {
        gridTools.push({ ...visibleTools[i], id: i, isEmpty: false });
     } else {
        gridTools.push({ pins: [], used: false, isEmpty: true, id: i });
     }
  }

  return { rings: generatedRings, tools: gridTools };
};

export default function Digipick() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('idle'); 
  const [rings, setRings] = useState([]);
  const [tools, setTools] = useState([]);
  const [activeRingIdx, setActiveRingIdx] = useState(0);
  const [activeToolIdx, setActiveToolIdx] = useState(0);
  const [slottedPins, setSlottedPins] = useState([]); 
  const [timer, setTimer] = useState(90); 
  const [feedback, setFeedback] = useState(null); 
  const [showHint, setShowHint] = useState(true);

  // 🧠 MEMÓRIA DE ROTAÇÃO
  const [toolRotations, setToolRotations] = useState(Array(12).fill(0));

  const intervalRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => { 
    const p = generatePuzzle();
    setRings(p.rings); setTools(p.tools);
    return () => clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const iniciarSistema = () => {
    const p = generatePuzzle();
    setRings(p.rings); setTools(p.tools);
    setActiveRingIdx(0); 
    setSlottedPins([]);
    setToolRotations(Array(12).fill(0)); 
    setTimer(90); setGameState('playing'); setFeedback(null);

    const firstValidIdx = p.tools.findIndex(t => !t.isEmpty);
    setActiveToolIdx(firstValidIdx !== -1 ? firstValidIdx : 0);
  };

  const pararSistema = () => {
    setGameState('idle');
    setActiveRingIdx(0); setActiveToolIdx(0);
    setToolRotations(Array(12).fill(0));
    setSlottedPins([]);
    setTimer(90); setFeedback(null);
  };

  const cycleTool = useCallback((dir, customTools) => {
    const list = customTools || tools;
    let n = activeToolIdx;
    for (let i = 0; i < list.length; i++) {
      n = (n + dir + list.length) % list.length;
      if (!list[n].isEmpty && !list[n].used) { 
        setActiveToolIdx(n); 
        break; 
      }
    }
  }, [activeToolIdx, tools]);

  const slot = useCallback(() => {
    const tool = tools[activeToolIdx];
    if (!tool || tool.used || tool.isEmpty) return;

    const currentRotation = toolRotations[activeToolIdx];
    const rotatedPins = tool.pins.map(p => (p + currentRotation) % 360);
    const isValid = rotatedPins.every(p => rings[activeRingIdx].includes(p) && !slottedPins.includes(p));

    clearTimeout(feedbackTimeoutRef.current);

    if (isValid) {
      setFeedback('correct');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 300);

      const newSlotted = [...slottedPins, ...rotatedPins];
      const newTools = [...tools];
      newTools[activeToolIdx].used = true;
      setTools(newTools);

      if (newSlotted.length === rings[activeRingIdx].length) {
        if (activeRingIdx + 1 === rings.length) { 
          setGameState('won'); 
        } else { 
          setActiveRingIdx(p => p + 1); 
          setSlottedPins([]); 
          cycleTool(1, newTools); 
        }
      } else { 
        setSlottedPins(newSlotted); 
        cycleTool(1, newTools); 
      }
    } else { 
      setFeedback('incorrect');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 300);
    }
  }, [activeToolIdx, activeRingIdx, rings, slottedPins, tools, toolRotations, cycleTool]);

  const handleInput = useCallback((action) => {
    if (gameState !== 'playing') return;
    
    if (action === 'rotate_left') {
      setToolRotations(prev => {
        const next = [...prev];
        next[activeToolIdx] = (next[activeToolIdx] - 15 + 360) % 360;
        return next;
      });
    }
    else if (action === 'rotate_right') {
      setToolRotations(prev => {
        const next = [...prev];
        next[activeToolIdx] = (next[activeToolIdx] + 15) % 360;
        return next;
      });
    }
    else if (action === 'next') cycleTool(1);
    else if (action === 'prev') cycleTool(-1);
    else if (action === 'confirm') slot();
  }, [gameState, activeToolIdx, cycleTool, slot]);

  useEffect(() => {
    const h = (e) => {
      const k = e.key.toLowerCase();
      
      if (gameState === 'idle' || gameState === 'won' || gameState === 'lost') {
        if (k === ' ' || k === 'enter') {
          e.preventDefault();
          iniciarSistema();
        }
        return;
      }

      if (k === 'a') handleInput('rotate_left');
      if (k === 'd') handleInput('rotate_right');
      if (k === 'e') handleInput('next');
      if (k === 'q') handleInput('prev');
      if (k === 'enter' || k === ' ') {
        e.preventDefault();
        handleInput('confirm');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleInput, navigate, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        setTimer(p => { if (p <= 1) { setGameState('lost'); return 0; } return p - 1; });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [gameState]);

  if (rings.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 dark:bg-black p-4 font-sans selection:bg-transparent select-none transition-colors duration-300 animate-page-reveal">
      
      {/* 🔮 CONFIGURAÇÕES DE TRANSIÇÃO ULTRA FLUÍDAS (REMOVIDO O IMPACTO SECO/ELÁSTICO) */}
      <style>{`
        @keyframes pageReveal {
          from { opacity: 0; filter: blur(6px); transform: translateY(10px) scale(0.99); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        }
        .animate-page-reveal { animation: pageReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes blurFadeIn {
          from { opacity: 0; background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0,0,0,0.15); backdrop-filter: blur(8px); }
        }
        @keyframes blurFadeInLight {
          from { opacity: 0; background-color: rgba(255,255,255,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(255,255,255,0.4); backdrop-filter: blur(8px); }
        }
        @keyframes smoothRevealUp {
          from { transform: translateY(8px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeInLight 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .dark .animate-blur-fade { animation: blurFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: smoothRevealUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* WRAPPER DO COFRE */}
      <div className="relative flex items-center justify-center w-full max-w-[500px] mb-12">
        
        {/* COFRE CENTRAL */}
        <div className={`relative w-[420px] h-[420px] flex items-center justify-center rounded-full bg-white dark:bg-[#070707] border transition-all duration-300 ${
          feedback === 'correct' ? 'border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)]' :
          feedback === 'incorrect' ? 'border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.25)]' :
          'border-neutral-200 dark:border-neutral-900 shadow-xl dark:shadow-[0_0_80px_rgba(0,0,0,0.9)]'
        }`}>
          
          {feedback === 'correct' && <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 pointer-events-none animate-pulse" />}
          {feedback === 'incorrect' && <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-500/5 pointer-events-none animate-pulse" />}

          <svg width="400" height="400" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="185" fill="none" strokeWidth="1" className="stroke-cyan-500 dark:stroke-[#3be8ff] opacity-20" />
            <circle cx="200" cy="200" r="175" className="fill-neutral-100 dark:fill-[#030303] transition-colors duration-300" />

            {rings.map((holes, i) => {
              if (i < activeRingIdx) return null;

              const radius = 150 - (i * 34);
              const thicknesses = [11, 7, 4.5];
              const strokeThickness = thicknesses[i] || 4.5;
              const isActive = i === activeRingIdx;

              const remainingHoles = isActive ? holes.filter(h => !slottedPins.includes(h)) : holes;

              return (
                <g key={i}>
                  <circle cx="200" cy="200" r={radius} fill="none" strokeWidth={strokeThickness} className={`transition-all duration-300 ${isActive ? "stroke-neutral-300 dark:stroke-[#1f222e]" : "stroke-neutral-200 dark:stroke-[#0d0f14]"}`} />
                  {remainingHoles.map(holeAngle => {
                    const p1 = getCoords(holeAngle, radius - strokeThickness - 6);
                    const p2 = getCoords(holeAngle, radius + strokeThickness + 6);
                    return <line key={holeAngle} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth={radius * 0.32} strokeLinecap="butt" className="stroke-neutral-100 dark:stroke-[#030303] transition-colors duration-300" />;
                  })}
                </g>
              );
            })}

            {/* PALITINHOS DA CHAVE ATIVA */}
            {gameState === 'playing' && tools[activeToolIdx] && !tools[activeToolIdx].used && !tools[activeToolIdx].isEmpty && (
              <g style={{ transform: `rotate(${toolRotations[activeToolIdx]}deg)`, transformOrigin: '200px 200px' }} className="transition-transform duration-75">
                {tools[activeToolIdx].pins.map(p => {
                  const { x, y } = getCoords(p, 185);
                  return <rect key={p} x={x - 4} y={y - 10} width="8" height="20" rx="2" className="fill-cyan-500 dark:fill-[#3be8ff] drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] dark:drop-shadow-[0_0_8px_rgba(59,232,255,1)]" style={{ transform: `rotate(${p}deg)`, transformOrigin: `${x}px ${y}px` }} />;
                })}
              </g>
            )}

            <rect x="150" y="190" width="100" height="20" rx="10" fill="none" strokeWidth="1" className="stroke-neutral-300 dark:stroke-[#1f222e]" />
            <text x="200" y="203" fontSize="10" fontWeight="900" textAnchor="middle" className="tracking-widest fill-neutral-400 dark:fill-[#1f222e]">LOCKPICK</text>
          </svg>
        </div>
      </div>

      {/* PAINEL DE CONTROLE INFERIOR */}
      <div className="w-[480px] bg-white dark:bg-[#0c0c0c] rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-2xl relative z-[60] overflow-hidden transition-colors duration-300">
        
        {/* MÓDULO SUPERIOR */}
        <div className="p-6 relative">
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-baseline gap-2">
               <h2 className="text-neutral-800 dark:text-neutral-400 font-black text-lg tracking-widest uppercase font-mono">LOCKPICK</h2>
            </div>
            <div className="flex gap-2">
              <div className="bg-neutral-100 dark:bg-[#141414] px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-neutral-700 dark:text-neutral-400 text-xs font-bold transition-colors">{Math.floor(timer / 60)}:{ (timer % 60).toString().padStart(2, '0') }</div>
              <div className="bg-neutral-100 dark:bg-[#141414] px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 font-mono text-neutral-700 dark:text-neutral-400 text-xs font-bold transition-colors">{gameState === 'playing' ? activeRingIdx + 1 : 0}</div>
            </div>
          </div>

          {/* GRID DE SLOTS */}
          <div className="grid grid-cols-6 gap-x-[11px] gap-y-3.5 mb-2 w-full max-w-[360px] mx-auto">
            {tools.map((t, i) => {
              const isActive = i === activeToolIdx && gameState === 'playing';
              const isUsed = t.used;

              return (
                <div 
                  key={t.id} 
                  className={`relative w-[44px] h-[44px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-out ${
                    t.isEmpty || isUsed 
                      ? 'border-transparent bg-neutral-100/40 dark:bg-neutral-900/40 opacity-100' 
                      : isActive 
                        ? 'border-cyan-500 dark:border-[#3be8ff] bg-cyan-50 dark:bg-[#121212] scale-105 shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:shadow-[0_0_15px_rgba(59,232,255,0.2)]' 
                        : 'border-neutral-200 dark:border-neutral-800 bg-transparent'
                  }`}
                >
                  {isActive && !isUsed && !t.isEmpty && <div className="absolute w-2.5 h-2.5 bg-neutral-300 dark:bg-[#1f222e] rounded-full z-10 animate-ping" />}
                  
                  <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
                    <circle cx="22" cy="22" r="16" fill="none" strokeWidth="1" className="opacity-40 stroke-neutral-300 dark:stroke-[#1f222e]" />
                    
                    {!isUsed && !t.isEmpty && isActive && (
                      <g style={{ transform: `rotate(${toolRotations[i]}deg)`, transformOrigin: '22px 22px' }} className="transition-transform duration-75">
                        {t.pins.map(p => {
                          const { x: x1, y: y1 } = getCoords(p, 12, 22); 
                          const { x: x2, y: y2 } = getCoords(p, 18, 22); 
                          return <line key={p} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" strokeLinecap="round" className="stroke-cyan-500 dark:stroke-[#3be8ff] drop-shadow-[0_0_3px_rgba(6,182,212,0.6)] dark:drop-shadow-[0_0_3px_rgba(59,232,255,0.8)]" />;
                        })}
                      </g>
                    )}
                  </svg>
                </div>
              );
            })}
          </div>

          {/* OVERLAY DE STATUS SUAVIZADO */}
          {(gameState === 'won' || gameState === 'lost') && (
            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-md z-50 flex items-center justify-center animate-blur-fade p-4">
              {gameState === 'lost' && (
                <div className="text-red-600 dark:text-red-500 text-xs font-mono font-black uppercase tracking-widest border border-red-500/30 dark:border-red-500/20 bg-red-50/90 dark:bg-red-950/40 p-4 rounded-xl w-full max-w-[430px] whitespace-nowrap flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.4)] dark:drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  CHAVES ESGOTADAS | SISTEMA BLOQUEADO
                </div>
              )}
              {gameState === 'won' && (
                <div className="text-emerald-600 dark:text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest border border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/40 p-4 rounded-xl w-full max-w-[430px] whitespace-nowrap flex items-center justify-center gap-3 shadow-2xl animate-elastic-pop">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)] dark:drop-shadow-[0_0_6px_rgba(163,239,82,0.8)]">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
                  </svg>
                  SUCESSO | CRIPTOGRAFIA QUEBRADA
                </div>
              )}
            </div>
          )}

        </div>

        {/* RODAPÉ INTEGRAL */}
        <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-900 p-6 pt-5 w-full relative transition-colors gap-6 bg-neutral-50/20 dark:bg-neutral-900/10">
          <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-600 tracking-widest uppercase flex flex-wrap gap-x-5 gap-y-1 items-center flex-1 min-w-0">
            {(gameState === 'won' || gameState === 'lost') ? (
              <span>APERTE ESPAÇO OU ENTER PARA INICIAR...</span>
            ) : gameState === 'playing' ? (
              <>
                <div className="flex items-center gap-1.5"><span className="text-neutral-800 dark:text-neutral-400 font-black">AD</span> Rotacionar</div>
                <div className="flex items-center gap-1.5"><span className="text-neutral-800 dark:text-neutral-400 font-black">QE</span> Mudar Escolha</div>
                <div className="flex items-center gap-1.5"><span className="text-neutral-800 dark:text-neutral-400 font-black">Enter</span> Encaixar</div>
              </>
            ) : (
              <span className="text-neutral-500 font-bold">APERTE ESPAÇO OU ENTER PARA INICIAR...</span>
            )}
          </div>
          
          <div className="flex-shrink-0">
            {gameState === 'playing' ? (
              <button 
                onClick={pararSistema} 
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 hover:scale-[1.02] active:scale-[0.97] text-white border border-transparent dark:border-red-400 font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 ease-out whitespace-nowrap"
              >
                Finalizar Sistema
              </button>
            ) : gameState === 'won' || gameState === 'lost' ? (
              <button 
                onClick={pararSistema} 
                className="px-6 py-2.5 bg-neutral-200 text-black hover:bg-neutral-300 dark:bg-neutral-200 dark:hover:bg-white hover:scale-[1.02] active:scale-[0.97] dark:text-black border border-transparent font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 ease-out whitespace-nowrap"
              >
                Voltar ao Menu
              </button>
            ) : (
              <button 
                onClick={iniciarSistema} 
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 dark:bg-[#3be8ff] dark:hover:bg-[#66f0ff] hover:scale-[1.02] active:scale-[0.97] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)] dark:shadow-[0_0_25px_rgba(59,232,255,0.35)] transition-all duration-300 ease-out whitespace-nowrap"
              >
                Iniciar Sistema
              </button>
            )}
          </div>
        </div>

      </div>

      {/* PAINEL DE ASSISTÊNCIA E INSTRUÇÃO */}
      <div className="fixed bottom-6 right-6 z-40 font-mono transition-all duration-500 ease-out">
        {showHint ? (
          <div className="w-64 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 animate-elastic-pop transition-colors">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-900 pb-2">
              <div className="flex items-center gap-1.5 text-cyan-600 dark:text-[#3be8ff] text-[11px] font-black uppercase tracking-wider">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
                Guia da Lockpick
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
                src="dica_lockpick.gif" 
                alt="Tutorial do Lockpick" 
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
                [ dica_lockpick.gif ]
              </div>
            </div>

            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed tracking-wide">
              Selecione uma chave no grid inferior e use <span className="text-neutral-900 dark:text-neutral-200 font-bold">AD</span> para girá-la até alinhar os dentes com as frestas vazias do anel ativo. Alterne entre as opções usando <span className="text-neutral-900 dark:text-neutral-200 font-bold">QE</span> e aperte <span className="text-amber-600 dark:text-amber-500 font-bold">Enter</span> para encaixar. Planeje bem, pois chaves falsas estão misturadas!
            </p>
          </div>
        ) : (
          <button 
            onClick={() => setShowHint(true)} 
            className="bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 text-cyan-600 dark:text-[#3be8ff] hover:text-cyan-500 dark:hover:text-[#66f0ff] hover:border-cyan-300 dark:hover:border-[#3be8ff]/40 hover:scale-[1.04] active:scale-[0.96] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xl flex items-center gap-1.5 transition-all duration-300 ease-out"
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