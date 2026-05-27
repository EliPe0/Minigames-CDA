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
  
  const timerRef = useRef(null);
  const keyPressSound = useRef(new Audio('/sound/key_press_sound.mp3'));
  const wrongSound = useRef(new Audio('/sound/wrong_sound.mp3'));

  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { gameState, sequence, currentIndex, stage };
  }, [gameState, sequence, currentIndex, stage]);

  useEffect(() => {
    keyPressSound.current.volume = 0.40;
    wrongSound.current.volume = 0.70;
    
    keyPressSound.current.load();
    wrongSound.current.load();

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
          wrongSound.current.currentTime = 0;
          wrongSound.current.play().catch(() => {});
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
    setGameState('playing');
    iniciarTimerEtapa();
  };

  const pararJogo = () => {
    clearInterval(timerRef.current);
    setGameState('idle');
    setSequence([]);
    setCurrentIndex(0);
    setProgress(100);
    setStage(1);
  };

  const handleKeyDown = useCallback((e) => {
    const { gameState: gState, sequence: seq, currentIndex: cIndex, stage: stg } = stateRef.current;

    if (gState !== 'playing') return;
    const inputKey = e.key.toUpperCase();
    if (!LETTERS.includes(inputKey)) return;

    if (inputKey === seq[cIndex]) {
      keyPressSound.current.currentTime = 0;
      keyPressSound.current.play().catch(() => {});

      const nextIndex = cIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex === 8) {
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
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
      setSequence(gerarSequencia());
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-black p-6 font-sans select-none w-full">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
        
        {gameState === 'playing' && (
          <div className="absolute top-4 right-5 text-[10px] bg-amber-950/50 border border-amber-900/30 text-amber-400 px-2.5 py-0.5 rounded font-black tracking-widest font-mono">
            ETAPA: {stage} / 3
          </div>
        )}

        <div className="text-center pb-3 border-b border-neutral-900 text-neutral-500 font-bold text-sm tracking-wider uppercase font-mono">
          💣 Digite a sequência correta do código
        </div>

        {gameState === 'playing' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-150">
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-75 ease-linear" style={{ width: `${progress}%`, backgroundColor: progress > 60 ? '#a3ef52' : progress > 30 ? '#F58002' : '#FF3E24' }} />
            </div>

            <div className="grid grid-cols-8 gap-3.5">
              {sequence.map((letter, idx) => {
                const isCompleted = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div 
                    key={idx} 
                    className={`h-16 flex items-center justify-center font-black text-2xl rounded-xl font-mono transition-all ${
                      isCompleted 
                        ? 'bg-neutral-800 text-neutral-600 opacity-40' 
                        : isCurrent 
                          ? 'bg-white text-black ring-4 ring-amber-500 -translate-y-1 shadow-[0_10px_20px_rgba(245,158,11,0.15)]' 
                          : 'bg-white text-black shadow-md'
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'idle' && <div className="text-center py-12 text-neutral-600 font-mono text-xs uppercase tracking-widest animate-pulse">Aguardando inicialização...</div>}
        {gameState === 'lost' && <div className="text-center py-8 text-[#FF3E24] font-mono font-black text-md tracking-widest uppercase animate-bounce">🔴 CÓDIGO INCORRETO | CIRCUITO RESETADO</div>}
        {gameState === 'won' && <div className="text-center py-8 text-[#a3ef52] font-mono font-black text-xl tracking-[0.2em] uppercase animate-pulse">🟢 SISTEMA INVADIDO</div>}

        <div className="flex justify-center border-t border-neutral-900 pt-5">
          {gameState === 'playing' ? (
            <button onClick={pararJogo} className="px-10 py-3.5 bg-[#b83131] hover:bg-[#972424] text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">Abortar</button>
          ) : (
            <button onClick={iniciarSistemaCompleto} className="px-12 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/10">Iniciar Sistema</button>
          )}
        </div>
      </div>
    </div>
  );
}