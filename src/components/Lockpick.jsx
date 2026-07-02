import React, { useState, useEffect, useCallback, useRef } from 'react';
import { registerAttempt } from '../services/rankingService';
import HintPanel from './HintPanel';
import GameOverOverlay from './GameOverOverlay';

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

  for (let r = 0; r < numRings; r++) {
    let toolsForThisRing = 2; 
    const roll = Math.random();
    if (r === 0) { if (roll < 0.90) toolsForThisRing = 1; else if (roll < 0.97) toolsForThisRing = 2; else toolsForThisRing = 3; } 
    else { if (roll < 0.05) toolsForThisRing = 1; else if (roll < 0.60) toolsForThisRing = 2; else toolsForThisRing = 3; }
    let ringHoles = new Set();
    for (let t = 0; t < toolsForThisRing; t++) {
       const maxPinsAllowed = 7 - ringHoles.size; 
       if (maxPinsAllowed < 2) break;
       const pinsCount = Math.random() > 0.7 ? 3 : 2; 
       const finalPins = Math.min(pinsCount, maxPinsAllowed);
       let toolPins = [];
       for(let p = 0; p < finalPins; p++) {
          let safeAngles = possibleAngles.filter(angle => {
             for (let h of ringHoles) { const d = Math.abs(angle - h); if (Math.min(d, 360 - d) < 30) return false; }
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
          for (let h of ringHoles) { const d = Math.abs(angle - h); if (Math.min(d, 360 - d) < 30) return false; }
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
     if (i < visibleTools.length) gridTools.push({ ...visibleTools[i], id: i, isEmpty: false });
     else gridTools.push({ pins: [], used: false, isEmpty: true, id: i });
  }
  return { rings: generatedRings, tools: gridTools };
};

export default function Digipick() {
  const [gameState, setGameState] = useState('idle'); 
  const [rings, setRings] = useState([]);
  const [tools, setTools] = useState([]);
  const [activeRingIdx, setActiveRingIdx] = useState(0);
  const [activeToolIdx, setActiveToolIdx] = useState(0);
  const [slottedPins, setSlottedPins] = useState([]); 
  const [timer, setTimer] = useState(90); 
  const [feedback, setFeedback] = useState(null); 
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
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
    setActiveRingIdx(0); setSlottedPins([]); setToolRotations(Array(12).fill(0)); 
    setTimer(90); setGameState('playing'); setFeedback(null);
    const firstValidIdx = p.tools.findIndex(t => !t.isEmpty);
    setActiveToolIdx(firstValidIdx !== -1 ? firstValidIdx : 0);
  };

  const pararSistema = () => {
    if (gameState === 'playing') {
      registerAttempt('lockpick', false, 0, null);
      setStreak(0);
    }
    setGameState('idle'); setActiveRingIdx(0); setActiveToolIdx(0);
    setToolRotations(Array(12).fill(0)); setSlottedPins([]); setTimer(90); setFeedback(null);
  };

  const cycleTool = useCallback((dir, customTools) => {
    const list = customTools || tools;
    let n = activeToolIdx;
    for (let i = 0; i < list.length; i++) {
      n = (n + dir + list.length) % list.length;
      if (!list[n].isEmpty && !list[n].used) { setActiveToolIdx(n); break; }
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
      const newTools = tools.map((t, idx) => idx === activeToolIdx ? { ...t, used: true } : t);
      setTools(newTools);

      if (newSlotted.length === rings[activeRingIdx].length) {
        if (activeRingIdx + 1 === rings.length) { 
          const tempoDecorrido = 90 - timer;
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          registerAttempt('lockpick', true, nextStreak, tempoDecorrido);
          setGameState('won'); 
        } else { 
          setActiveRingIdx(p => p + 1); setSlottedPins([]); cycleTool(1, newTools); 
        }
      } else { setSlottedPins(newSlotted); cycleTool(1, newTools); }
    } else { 
      setFeedback('incorrect');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 300);
    }
  }, [activeToolIdx, activeRingIdx, rings, slottedPins, tools, toolRotations, timer, cycleTool, streak]);

  const handleInput = useCallback((action) => {
    if (gameState !== 'playing') return;
    if (action === 'rotate_left') setToolRotations(prev => { const next = [...prev]; next[activeToolIdx] = (next[activeToolIdx] - 15 + 360) % 360; return next; });
    else if (action === 'rotate_right') setToolRotations(prev => { const next = [...prev]; next[activeToolIdx] = (next[activeToolIdx] + 15) % 360; return next; });
    else if (action === 'next') cycleTool(1);
    else if (action === 'prev') cycleTool(-1);
    else if (action === 'confirm') slot();
  }, [gameState, activeToolIdx, cycleTool, slot]);

  useEffect(() => {
    const h = (e) => {
      const k = e.key.toLowerCase();
      if (gameState === 'idle' || gameState === 'won' || gameState === 'lost') {
        if (k === 'enter') { e.preventDefault(); iniciarSistema(); }
        return;
      }
      if (k === 'a') handleInput('rotate_left');
      if (k === 'd') handleInput('rotate_right');
      if (k === 'e') handleInput('next');
      if (k === 'q') handleInput('prev');
      if (k === 'enter') { e.preventDefault(); handleInput('confirm'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [handleInput, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      intervalRef.current = setInterval(() => {
        setTimer(p => { 
          if (p <= 1) { registerAttempt('lockpick', false, 0, null); setStreak(0); setGameState('lost'); return 0; } 
          return p - 1; 
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [gameState]);

  if (rings.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 font-sans selection:bg-transparent select-none animate-page-reveal overflow-hidden text-white">
      
      {!showHint && (
        <button onClick={() => setShowHint(true)} className="cursor-pointer absolute top-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 hover:text-[#3be8ff] hover:border-[#3be8ff]/40 transition-all font-mono text-[12px] font-bold uppercase tracking-wider">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          Ver Guia
        </button>
      )}

      <div className={`transition-all duration-300 responsive-wrapper ${showHint ? 'pr-[340px]' : ''}`}>
        <div className="relative flex items-center justify-center w-full max-w-[500px] mb-12">
          <div className={`relative w-[420px] h-[420px] flex items-center justify-center rounded-full bg-[#070707] border transition-all duration-300 ${feedback === 'correct' ? 'border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.25)]' : feedback === 'incorrect' ? 'border-red-500/40 shadow-[0_0_60px_rgba(239,68,68,0.25)]' : 'border-neutral-900 shadow-xl'}`}>
            {feedback === 'correct' && <div className="absolute inset-0 rounded-full bg-emerald-500/5 pointer-events-none animate-pulse" />}
            {feedback === 'incorrect' && <div className="absolute inset-0 rounded-full bg-red-500/5 pointer-events-none animate-pulse" />}
            <svg width="400" height="400" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="185" fill="none" strokeWidth="1" className="stroke-[#3be8ff] opacity-20" />
              <circle cx="200" cy="200" r="175" className="fill-[#030303]" />
              {rings.map((holes, i) => {
                if (i < activeRingIdx) return null;
                const radius = 150 - (i * 34); const thicknesses = [11, 7, 4.5]; const strokeThickness = thicknesses[i] || 4.5; const isActive = i === activeRingIdx;
                const remainingHoles = isActive ? holes.filter(h => !slottedPins.includes(h)) : holes;
                return (
                  <g key={i}>
                    <circle cx="200" cy="200" r={radius} fill="none" strokeWidth={strokeThickness} className={`transition-all duration-300 ${isActive ? "stroke-[#1f222e]" : "stroke-[#0d0f14]"}`} />
                    {remainingHoles.map(holeAngle => {
                      const p1 = getCoords(holeAngle, radius - strokeThickness - 6); const p2 = getCoords(holeAngle, radius + strokeThickness + 6);
                      return <line key={holeAngle} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth={radius * 0.32} strokeLinecap="butt" className="stroke-[#030303]" />;
                    })}
                  </g>
                );
              })}
              {gameState === 'playing' && tools[activeToolIdx] && !tools[activeToolIdx].used && !tools[activeToolIdx].isEmpty && (
                <g style={{ transform: `rotate(${toolRotations[activeToolIdx]}deg)`, transformOrigin: '200px 200px' }} className="transition-transform duration-75">
                  {tools[activeToolIdx].pins.map(p => {
                    const { x, y } = getCoords(p, 185);
                    return <rect key={p} x={x - 4} y={y - 10} width="8" height="20" rx="2" className="fill-[#3be8ff] drop-shadow-[0_0_8px_rgba(59,232,255,1)]" style={{ transform: `rotate(${p}deg)`, transformOrigin: `${x}px ${y}px` }} />;
                  })}
                </g>
              )}
              <rect x="150" y="190" width="100" height="20" rx="10" fill="none" strokeWidth="1" className="stroke-[#1f222e]" />
              <text x="200" y="203" fontSize="10" fontWeight="900" textAnchor="middle" className="tracking-widest fill-[#1f222e]">LOCKPICK</text>
            </svg>
          </div>
        </div>

        <div className="w-[480px] bg-[#0c0c0c] rounded-xl border border-neutral-800 shadow-2xl overflow-hidden font-mono">
          <div className="p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-baseline gap-2"><h2 className="text-neutral-400 font-black text-lg tracking-widest uppercase">LOCKPICK</h2></div>
              <div className="flex gap-2">
                <div className="bg-[#141414] px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 text-xs font-bold transition-colors">{Math.floor(timer / 60)}:{ (timer % 60).toString().padStart(2, '0') }</div>
                <div className="bg-[#141414] px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 text-xs font-bold transition-colors">{gameState === 'playing' ? activeRingIdx + 1 : 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-x-[11px] gap-y-3.5 mb-2 w-full max-w-[360px] mx-auto">
              {tools.map((t, i) => {
                const isActive = i === activeToolIdx && gameState === 'playing'; const isUsed = t.used;
                return (
                  <div key={t.id} className={`relative w-[44px] h-[44px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ease-out ${t.isEmpty || isUsed ? 'border-transparent bg-neutral-900/40 opacity-100' : isActive ? 'border-[#3be8ff] bg-[#121212] shadow-[0_0_15px_rgba(59,232,255,0.2)]' : 'border-neutral-800 bg-transparent'}`}>
                    {isActive && !isUsed && !t.isEmpty && <div className="absolute w-2.5 h-2.5 bg-[#1f222e] rounded-full z-10 animate-ping" />}
                    <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full">
                      <circle cx="22" cy="22" r="16" fill="none" strokeWidth="1" className="opacity-40 stroke-[#1f222e]" />
                      {!isUsed && !t.isEmpty && isActive && (
                        <g style={{ transform: `rotate(${toolRotations[i]}deg)`, transformOrigin: '22px 22px' }} className="transition-transform duration-75">
                          {t.pins.map(p => {
                            const { x: x1, y: y1 } = getCoords(p, 12, 22); const { x: x2, y: y2 } = getCoords(p, 18, 22); 
                            return <line key={p} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" strokeLinecap="round" className="stroke-[#3be8ff] drop-shadow-[0_0_3px_rgba(59,232,255,0.8)]" />;
                          })}
                        </g>
                      )}
                    </svg>
                  </div>
                );
              })}
            </div>

            <GameOverOverlay gameState={gameState} lostText="CHAVES ESGOTADAS | SISTEMA BLOQUEADO" wonText="CRIPTOGRAFIA QUEBRADA | SUCESSO" />
          </div>

          <div className="flex items-center justify-between border-t border-neutral-900 p-6 pt-5 w-full relative transition-colors gap-6 bg-neutral-900/10">
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center flex-1 text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              {gameState === 'playing' ? (
                <>
                  <div className="flex items-center gap-1.5"><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">A</kbd><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">D</kbd><span className="text-neutral-500">Girar</span></div>
                  <div className="flex items-center gap-1.5"><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">Q</kbd><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-[9px] font-black font-mono">E</kbd><span className="text-neutral-500">Mudar Chave</span></div>
                  <div className="flex items-center gap-1.5"><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd><span className="text-neutral-500">Encaixar</span></div>
                </>
              ) : (
                <div className="flex items-center gap-1.5"><kbd className="bg-[#141414] border border-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[9px] font-black font-mono">ENTER</kbd><span className="text-neutral-500">Iniciar Sistema</span></div>
              )}
            </div>
            <div className="flex-shrink-0">
              {gameState === 'playing' ? <button onClick={pararSistema} className="px-5 py-2.5 cursor-pointer bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap">Finalizar Sistema</button> : gameState === 'won' || gameState === 'lost' ? <button onClick={pararSistema} className="px-6 py-2.5 cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap">Voltar ao Menu</button> : <button onClick={iniciarSistema} className="px-5 py-2.5 cursor-pointer bg-[#3be8ff] hover:bg-[#2ad8ef] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap">Iniciar Sistema</button>}
            </div>
          </div>
        </div>
      </div>

      <HintPanel 
        isOpen={showHint} 
        onClose={() => setShowHint(false)} 
        title="Lockpick" 
        gifSrc="/dica_lockpick.gif" 
        accentColor="#3be8ff"
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
      >
        <p className="text-justify animate-elastic-pop">O destravamento do cofre consiste em alinhar perfeitamente os pinos metálicos da sua chave ativa com as frestas e cavidades vazias presentes no anel do circuito.</p>
        <p className="text-justify animate-elastic-pop">Selecione uma chave disponível no menu de slots inferior. Use <span className="text-white font-bold">A e D</span> para girar os dentes da ferramenta e <span className="text-white font-bold">Q e E</span> para alternar rapidamente entre outras opções de chaves para análise estrutural.</p>
        <p className="text-justify animate-elastic-pop">Quando todos os dentes coincirem perfeitamente com os espaços vazios do anel ativo atual, pressione <span className="text-[#3be8ff] font-bold">ENTER</span> para encaixar. Preste muita atenção, pois chaves falsas com dentes idênticos foram inseridas para confundir a invasão!</p>
      </HintPanel>

    </div>
  );
}