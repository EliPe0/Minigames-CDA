import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative flex-1 bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.004] grayscale mix-blend-screen"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')` 
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] pointer-events-none opacity-10" />

      <h1 className="text-2xl font-black italic text-amber-500 mb-12 tracking-[0.3em] drop-shadow-[0_0_15px_rgba(245,158,11,0.15)] z-10 font-mono uppercase">
        Central de Minigames
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl z-10 font-mono">
        
        {/* CARD LOCKPICK */}
        <button 
          onClick={() => navigate('/lockpick')} 
          className="group relative p-8 bg-[#0c0c0c] border border-neutral-800 rounded-xl hover:border-amber-500/40 shadow-2xl backdrop-blur-md transition-all text-left hover:shadow-[0_0_40px_rgba(245,158,11,0.01)]"
        >
          <h3 className="text-md font-black mb-3 group-hover:text-amber-400 transition-colors uppercase tracking-wider">
            Lockpick
          </h3>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Objetivo: Alinhe os pinos e limpe as trilhas antes que o cronômetro expire.
          </p>
        </button>

        {/* CARD CAIXINHA */}
        <button 
          onClick={() => navigate('/caixinha')} 
          className="group relative p-8 bg-[#0c0c0c] border border-neutral-800 rounded-xl hover:border-amber-500/40 shadow-2xl backdrop-blur-md transition-all text-left hover:shadow-[0_0_40px_rgba(245,158,11,0.01)]"
        >
          <h3 className="text-md font-black mb-3 group-hover:text-amber-400 transition-colors uppercase tracking-wider">
            Sequência de Caixinha
          </h3>
          <p className="text-neutral-500 text-xs leading-relaxed">
            Objetivo: Sobrecarregue o circuito digitando sequências rápidas de 8 caracteres.
          </p>
        </button>

      </div>
    </div>
  );
}