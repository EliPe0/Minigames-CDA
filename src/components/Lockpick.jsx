import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// --- MATEMÁTICA DO CÍRCULO ---
const getCoords = (angle, radius, center = 200) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
};

// --- MOTOR PROCEDURAL ---
const generatePuzzle = () => {
  const numRings = 3; 
  const possibleAngles = Array.from({ length: 24 }, (_, i) => i * 15); 
  
  let generatedRings = [];
  let validTools = [];
  let requiredToolsCount = 0;

  for (let r = 0; r < numRings; r++) {
    let toolsForThisRing = 2; 
    const roll = Math.random();

    // CALIBRAÇÃO DO PRIMEIRO CÍRCULO:
    if (r === 0) {
      if (roll < 0.90) {
        toolsForThisRing = 1; // 90% de chance de precisar de apenas 1 chave
      } else if (roll < 0.97) {
        toolsForThisRing = 2; // 7% de chance de precisar de 2 chaves
      } else {
        toolsForThisRing = 3; // 3% de chance de precisar de 3 chaves
      }
    } else {
      if (roll < 0.05) toolsForThisRing = 1; 
      else if (roll < 0.60) toolsForThisRing = 2;
      else toolsForThisRing = 3;
    }

    requiredToolsCount += toolsForThisRing;
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
          validTools.push({ pins: toolPins, used: false });
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

  let totalToolsCount = 12; 
  if (validTools.length > 12) validTools = validTools.slice(0, 12);

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

  let allTools = [...validTools, ...decoyTools].sort(() => Math.random() - 0.5);
  
  let gridTools = [];
  for (let i = 0; i < 12; i++) {
     gridTools.push({ ...allTools[i], id: i, isEmpty: false });
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
  const [rotation, setRotation] = useState(0);
  const [slottedPins, setSlottedPins] = useState([]); 
  const [timer, setTimer] = useState(90); 
  const [feedback, setFeedback] = useState(null); 

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
    setRotation(0); setSlottedPins([]);
    setTimer(90); setGameState('playing'); setFeedback(null);

    const firstValidIdx = p.tools.findIndex(t => !t.isEmpty);
    setActiveToolIdx(firstValidIdx !== -1 ? firstValidIdx : 0);
  };

  const pararSistema = () => {
    setGameState('idle');
    setActiveRingIdx(0); setActiveToolIdx(0);
    setRotation(0); setSlottedPins([]);
    setTimer(90); setFeedback(null);
  };

  const cycleTool = useCallback((dir, customTools) => {
    const list = customTools || tools;
    let n = activeToolIdx;
    for (let i = 0; i < list.length; i++) {
      n = (n + dir + list.length) % list.length;
      if (!list[n].isEmpty && !list[n].used) { 
        setActiveToolIdx(n); 
        setRotation(0); 
        break; 
      }
    }
  }, [activeToolIdx, tools]);

  const handleInput = useCallback((action) => {
    if (gameState !== 'playing') return;
    if (action === 'rotate_left') setRotation(p => (p - 15 + 360) % 360);
    else if (action === 'rotate_right') setRotation(p => (p + 15) % 360);
    else if (action === 'next') cycleTool(1);
    else if (action === 'prev') cycleTool(-1);
    else if (action === 'confirm') slot();
  }, [gameState, activeToolIdx, rotation, tools, slottedPins, cycleTool]);

  const slot = () => {
    const tool = tools[activeToolIdx];
    if (!tool || tool.used || tool.isEmpty) return;

    const rotatedPins = tool.pins.map(p => (p + rotation) % 360);
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
          setRotation(0); 
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
  };

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

  const DrawRing = ({ radius, gaps, isActive, strokeWidth }) => {
    if (!gaps || gaps.length === 0) return null;
    const sorted = [...gaps].sort((a, b) => a - b);
    
    return sorted.map((g, i) => {
      const start = (g + 15) % 360; 
      const nextGap = sorted[(i + 1) % sorted.length];
      const end = (nextGap - 15 + 360) % 360;
      const { x: sx, y: sy } = getCoords(start, radius);
      const { x: ex, y: ey } = getCoords(end, radius);
      
      return <path key={i} d={`M ${sx} ${sy} A ${radius} ${radius} 0 ${ (end - start + 360) % 360 > 180 ? 1 : 0 } 1 ${ex} ${ey}`} fill="none" stroke={isActive ? "#1f222e" : "#0d0f14"} strokeWidth={strokeWidth} strokeLinecap="round" />;
    });
  };

  if (rings.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans selection:bg-transparent">
      
      {/* 1. COFRE CENTRAL */}
      <div className={`relative w-[420px] h-[420px] mb-12 flex items-center justify-center rounded-full bg-[#070707] border transition-all duration-150 ${
        feedback === 'correct' ? 'border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)]' :
        feedback === 'incorrect' ? 'border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.25)]' :
        'border-neutral-900 shadow-[0_0_80px_rgba(0,0,0,0.9)]'
      }`}>
        
        {/* Camada interna de flash ambiental */}
        {feedback === 'correct' && <div className="absolute inset-0 rounded-full bg-emerald-500/5 pointer-events-none animate-pulse" />}
        {feedback === 'incorrect' && <div className="absolute inset-0 rounded-full bg-red-500/5 pointer-events-none animate-pulse" />}

        <svg width="400" height="400" viewBox="0 0 400 400">
          
          <circle cx="200" cy="200" r="185" fill="none" stroke="#3be8ff" strokeWidth="1" className="opacity-20" />
          <circle cx="200" cy="200" r="175" fill="#030303" />

          {rings.map((holes, i) => {
            if (i < activeRingIdx) return null;

            const radius = 150 - (i * 34);
            const thicknesses = [11, 7, 4.5];
            const strokeThickness = thicknesses[i] || 4.5;
            const isActive = i === activeRingIdx;

            const remainingHoles = isActive ? holes.filter(h => !slottedPins.includes(h)) : holes;

            return (
              <g key={i}>
                <circle cx="200" cy="200" r={radius} fill="none" stroke={isActive ? "#1f222e" : "#0d0f14"} strokeWidth={strokeThickness} />
                
                {remainingHoles.map(holeAngle => {
                  const p1 = getCoords(holeAngle, radius - strokeThickness - 6);
                  const p2 = getCoords(holeAngle, radius + strokeThickness + 6);
                  return <line key={holeAngle} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#030303" strokeWidth={radius * 0.32} strokeLinecap="butt" />;
                })}
              </g>
            );
          })}

          {/* PALITINHOS DA CHAVE ATIVA */}
          {gameState === 'playing' && tools[activeToolIdx] && !tools[activeToolIdx].used && !tools[activeToolIdx].isEmpty && (
            <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '200px 200px' }} className="transition-transform duration-75">
              {tools[activeToolIdx].pins.map(p => {
                const { x, y } = getCoords(p, 185);
                return <rect key={p} x={x - 4} y={y - 10} width="8" height="20" rx="2" fill="#3be8ff" className="drop-shadow-[0_0_8px_rgba(59,232,255,1)]" style={{ transform: `rotate(${p}deg)`, transformOrigin: `${x}px ${y}px` }} />;
              })}
            </g>
          )}

          <rect x="150" y="190" width="100" height="20" rx="10" fill="none" stroke="#1f222e" strokeWidth="1" />
          <text x="200" y="203" fill="#1f222e" fontSize="10" fontWeight="900" textAnchor="middle" className="tracking-widest">LOCKPICK</text>
        </svg>
      </div>

      {/* 2. PAINEL DE CONTROLE INFERIOR */}
      <div className="w-[480px] bg-[#0c0c0c] p-6 rounded-xl border border-neutral-800 shadow-2xl relative overflow-hidden">
        
        {/* INTERFACE DE SUCESSO */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-[#0c0c0c]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6">
            <div className="border border-[#2ecc71]/30 bg-[#2ecc71]/5 p-6 rounded-xl text-center w-full max-w-sm shadow-[0_0_30px_rgba(46,204,113,0.1)]">
              <h3 className="text-[#2ecc71] font-black tracking-[0.25em] text-xl mb-2 uppercase drop-shadow-[0_0_10px_rgba(46,204,113,0.6)]">SISTEMA VIOLADO</h3>
              <p className="text-neutral-400 text-xs font-medium mb-5">Criptografia quebrada.</p>
              <button onClick={pararSistema} className="w-full py-2 bg-[#141414] border border-neutral-800 text-gray-300 hover:text-white rounded text-xs font-bold uppercase tracking-widest transition-colors">Voltar ao Menu</button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-baseline gap-2">
             <h2 className="text-neutral-400 font-black text-lg tracking-widest uppercase font-mono">LOCKPICK</h2>
          </div>
          <div className="flex gap-2">
            <div className="bg-[#141414] px-3 py-1.5 rounded border border-neutral-800 font-mono text-neutral-400 text-xs font-bold">{Math.floor(timer / 60)}:{ (timer % 60).toString().padStart(2, '0') }</div>
            <div className="bg-[#141414] px-3 py-1.5 rounded border border-neutral-800 font-mono text-neutral-400 text-xs font-bold">{gameState === 'playing' ? activeRingIdx + 1 : 0}</div>
          </div>
        </div>

        {/* GRID DE SLOTS */}
        <div className="grid grid-cols-6 gap-x-[11px] gap-y-3.5 mb-8 w-full max-w-[360px] mx-auto">
          {tools.map((t, i) => {
            const isActive = i === activeToolIdx && gameState === 'playing';
            const isUsed = t.used;

            return (
              <div key={t.id} className={`relative w-[44px] h-[44px] rounded-full border-2 flex items-center justify-center transition-all ${isUsed ? 'opacity-0 pointer-events-none' : isActive ? 'border-[#3be8ff] bg-[#121212]' : 'border-neutral-800 bg-transparent'}`}>
                {isActive && !isUsed && <div className="absolute w-2.5 h-2.5 bg-[#1f222e] rounded-full z-10" />}
                
                <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#1f222e" strokeWidth="1" className="opacity-40" />
                  
                  {!isUsed && isActive && (
                    <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '22px 22px' }} className="transition-transform duration-75">
                      {t.pins.map(p => {
                        const { x: x1, y: y1 } = getCoords(p, 12, 22); 
                        const { x: x2, y: y2 } = getCoords(p, 18, 22); 
                        return <line key={p} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3be8ff" strokeWidth="2.5" strokeLinecap="round" className="drop-shadow-[0_0_3px_rgba(59,232,255,0.8)]" />;
                      })}
                    </g>
                  )}
                </svg>
              </div>
            );
          })}
        </div>

        {/* RODAPÉ */}
        <div className="flex justify-between items-center border-t border-neutral-900 pt-5 w-full gap-6">
          <div className="text-[10px] font-bold text-neutral-600 tracking-widest uppercase flex flex-wrap gap-x-4 gap-y-1 items-center flex-1 min-w-0">
            {gameState === 'playing' ? (
              <>
                <div><span className="text-neutral-400 font-black mr-1">[A/D]</span> ROTACIONAR</div>
                <div><span className="text-neutral-400 font-black mr-1">[Q/E]</span> PRÓXIMA ESCOLHA</div>
                <div><span className="text-neutral-400 font-black mr-1">[ENTER]</span> ENCAIXAR</div>
              </>
            ) : (
              <span className="text-neutral-500 font-bold">Aperte ESPAÇO ou ENTER para iniciar...</span>
            )}
          </div>
          
          <div className="flex-shrink-0">
            {gameState === 'idle' ? (
              <button 
                onClick={iniciarSistema} 
                className="px-5 py-2.5 bg-[#2589a6]/20 border border-[#2589a6]/50 text-[#3be8ff] hover:bg-[#2589a6]/40 rounded text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(59,232,255,0.15)] animate-pulse"
              >
                Iniciar Sistema
              </button>
            ) : (
              <button 
                onClick={pararSistema} 
                className="px-5 py-2.5 bg-[#b83131]/20 border border-[#b83131]/50 text-[#ff4d4d] hover:bg-[#b83131]/40 rounded text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-[0_0_15px_rgba(184,49,49,0.35)] animate-pulse"
              >
                Finalizar Sistema
              </button>
            )}
          </div>
        </div>

        {/* INTERFACE DE DERROTA */}
        {gameState === 'lost' && (
          <div className="mt-4 text-center">
            <span className="text-xs font-black tracking-widest uppercase text-red-500">SISTEMA BLOQUEADO</span>
            <button onClick={pararSistema} className="block mx-auto mt-2 text-[10px] text-neutral-500 underline uppercase font-bold hover:text-white">Voltar ao Menu</button>
          </div>
        )}

      </div>
    </div>
  );
}