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
  const stateRef = useRef({});

  // Gera uma sequência de preview real assim que o componente monta
  useEffect(() => {
    setSequence(Array(8).fill().map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]));
  }, []);

  useEffect(() => {
    stateRef.current = { gameState, sequence, currentIndex, stage };
  }, [gameState, sequence, currentIndex, stage]);

  useEffect(() => {
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
    setProgress(100);
    setGameState('playing');
    iniciarTimerEtapa();
  };

  const pararJogo = () => {
    clearInterval(timerRef.current);
    setSequence(gerarSequencia()); // Gera um novo preview estático de parada
    setCurrentIndex(0);
    setProgress(100);
    setStage(1);
    setGameState('idle');
  };

  const handleKeyDown = useCallback((e) => {
    const { gameState: gState, sequence: seq, currentIndex: cIndex, stage: stg } = stateRef.current;

    // Atalho: Inicia o jogo apertando Enter quando estiver em idle, perdido ou ganho
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
      setSequence(gerarSequencia());
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lógica de cores dinâmica para os elementos sincronizados
  const timerColor = gameState === 'idle' ? '#a3ef52' : progress > 60 ? '#a3ef52' : progress > 30 ? '#f58002' : '#ef4444';

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-black p-6 font-sans select-none w-full relative overflow-hidden">
      
      {/* CONTAINER PRINCIPAL */}
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* CABEÇALHO COM A BOMBA */}
        <div className="h-11 bg-[#141414] flex items-center justify-center gap-2 border-b border-neutral-800/40 text-neutral-400 text-sm font-bold tracking-wide font-mono relative">
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#ef4444" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] "
          >
            <circle cx="11" cy="13" r="9"></circle>
            <path d="m19.5 9.5 1.8-1.8a2.4 2.4 0 0 0 0-3.4l-1.6-1.6a2.41 2.41 0 0 0-3.4 0l-1.8 1.8"></path>
            <path d="m22 2-1.5 1.5"></path>
          </svg>
          Digite a Sequência Correta
          
          {gameState === 'playing' && (
            <div className="absolute right-4 text-[9px] bg-amber-950/40 border border-amber-900/30 text-amber-400 px-2 py-0.5 rounded font-black tracking-widest">
              ETAPA: {stage} / 3
            </div>
          )}
        </div>

        {/* CORPO DO MINIGAME */}
        <div className="flex flex-col w-full pb-6 pt-6 relative">
          
          {/* CRONÔMETRO COM O RELOGIO */}
          <div className="flex flex-col items-center gap-2 px-8 mb-4">
            <svg 
              width="15" 
              height="15" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={timerColor} 
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
                className="h-full transition-all duration-75 ease-linear" 
                style={{ 
                  width: `${progress}%`, 
                  backgroundColor: timerColor,
                  boxShadow: `0 0 14px ${timerColor}` 
                }} 
              />
            </div>
          </div>

          {/* GRADE DE TECLAS COM ESPAÇAMENTO SEGURO */}
          <div className="px-8 mb-14 mt-6">
            <div className="grid grid-cols-8 gap-3.5">
              {sequence.map((letter, idx) => {
                const isCompleted = gameState === 'playing' && idx < currentIndex;
                const isCurrent = gameState === 'playing' && idx === currentIndex;
                
                return (
                  <div 
                    key={idx} 
                    className={`h-16 flex items-center justify-center font-black text-2xl rounded-xl font-mono transition-all ${
                      isCompleted 
                        ? 'bg-neutral-800 text-neutral-600 opacity-40' 
                        : isCurrent 
                          ? 'bg-white text-black ring-4 ring-amber-500 -translate-y-7 shadow-[0_15px_25px_rgba(245,158,11,0.25)] z-10' 
                          : 'bg-white text-black shadow-md'
                    }`}
                    style={{ opacity: gameState === 'idle' ? 0.35 : 1 }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center text-neutral-500 text-[8px] font-black tracking-widest uppercase">
            {gameState === 'playing' ? 'Insira a combinação no teclado' : 'Pressione INICIAR ou ENTER para descriptografar'}
          </div>

          {/* OVERLAY DE STATUS TRANSPARENTE */}
          {(gameState === 'lost' || gameState === 'won') && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-50 animate-in fade-in duration-200">
              {gameState === 'lost' && (
                <div className="text-red-500 text-xs font-mono font-black uppercase tracking-widest animate-pulse border border-red-500/20 bg-red-950/20 p-4 rounded-xl w-[80%] text-center shadow-lg">
                  🚨 CÓDIGO INCORRETO | CIRCUITO RESETADO
                </div>
              )}
              {gameState === 'won' && (
                <div className="text-[#a3ef52] text-xs font-mono font-black uppercase tracking-widest animate-pulse border border-emerald-500/20 bg-emerald-950/20 p-4 rounded-xl w-[80%] text-center shadow-lg">
                  🔓 BYPASS CONCLUÍDO / SISTEMA HACKEADO
                </div>
              )}
            </div>
          )}

        </div>

        {/* RODAPÉ DE BOTÕES */}
        <div className="flex justify-center border-t border-neutral-900/40 p-4 bg-[#101010] z-20">
          {gameState === 'playing' ? (
            <button onClick={pararJogo} className="px-10 py-2.5 bg-[#b83131]/20 hover:bg-[#b83131]/30 border border-[#b83131]/40 text-[#ff4d4d] font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">Abortar</button>
          ) : (
            <button onClick={iniciarSistemaCompleto} className="px-12 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/10">Iniciar Sequência</button>
          )}
        </div>

      </div>
    </div>
  );
}