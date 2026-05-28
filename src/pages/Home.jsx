import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative flex-1 bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.004] grayscale mix-blend-screen"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] pointer-events-none opacity-10" />

      <h1 className="text-2xl font-black italic text-amber-500 mb-10 tracking-[0.3em] drop-shadow-[0_0_15px_rgba(245,158,11,0.15)] z-10 font-mono uppercase text-center">
        Hacking Lab | CIDADE ALTA
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl z-10 font-mono">
        
        {/* CARD LOCKPICK */}
        <button 
          onClick={() => navigate('/lockpick')} 
          className="group relative p-5 bg-[#0c0c0c] border border-neutral-800 rounded-xl hover:border-amber-500/40 shadow-2xl backdrop-blur-md transition-all text-left hover:shadow-[0_0_40px_rgba(245,158,11,0.01)] aspect-square flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-900 border border-neutral-800 text-amber-500 px-2 py-0.5 rounded font-black tracking-widest">LOCKPICK</div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 group-hover:text-amber-400 transition-colors uppercase tracking-wider">Lockpick </h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed">Objetivo:<br/><br/> Alinhe os pinos e limpe as trilhas antes que o cronômetro expire.<br/><br/> - Tempo limite: 1 minuto e 30 segundos<br/><br/>- Dificuldade: Alta</p>
          </div>
          <span className="text-[9px] text-neutral-600 group-hover:text-amber-500 font-black tracking-widest uppercase transition-colors">
            Acessar Módulo _
          </span>
        </button>

        {/* CARD CAIXINHA */}
        <button 
          onClick={() => navigate('/caixinha')} 
          className="group relative p-5 bg-[#0c0c0c] border border-neutral-800 rounded-xl hover:border-emerald-400/40 shadow-2xl backdrop-blur-md transition-all text-left hover:shadow-[0_0_40px_rgba(245,158,11,0.01)] aspect-square flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-900 border border-neutral-800 text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest">CAIXINHA</div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 group-hover:text-emerald-400 transition-colors uppercase tracking-wider">Sequência Caixinha</h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed">Objetivo:<br/><br/> Sobrecarregue o circuito digitando sequências de 8 caracteres em 3 fases sem errar.<br/><br/> - Tempo limite: 4 segundos cada etapa<br/><br/>- Dificuldade: Alta</p>
          </div>
          <span className="text-[9px] text-neutral-600 group-hover:text-emerald-400 font-black tracking-widest uppercase transition-colors">
            Acessar Módulo _
          </span>
        </button>

        {/* CARD PORTA MALAS */}
        <button 
          onClick={() => navigate('/portamalas')} 
          className="group relative p-5 bg-[#0c0c0c] border border-neutral-800 rounded-xl hover:border-blue-300/40 shadow-2xl backdrop-blur-md transition-all text-left hover:shadow-[0_0_40px_rgba(245,158,11,0.01)] aspect-square flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-900 border border-neutral-800 text-blue-300 px-2 py-0.5 rounded font-black tracking-widest">PORTA MALAS</div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-wider">Arrombamento Porta Malas</h3>
            <p className="text-neutral-500 text-[11px] leading-relaxed">Objetivo:<br/><br/> Encaixe os pinos de forma aleatória até completar a sequência para abrir o porta malas.<br/><br/> - Tempo limite: 1 minuto<br/><br/> - Dificuldade: Média</p>
          </div>
          <span className="text-[9px] text-neutral-600 group-hover:text-blue-300 font-black tracking-widest uppercase transition-colors">
            Acessar Módulo _
          </span>
        </button>

        {/* CARD: EM BREVE */}
        <div 
          className="relative p-5 bg-[#080808]/60 border border-dashed border-neutral-800 rounded-xl opacity-40 aspect-square flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-950 border border-neutral-900 text-neutral-600 px-2 py-0.5 rounded font-black tracking-widest">BLOQUEADO</div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 text-neutral-500 uppercase tracking-wider">Em Breve...</h3>
            <p className="text-neutral-600 text-[11px] leading-relaxed">Em breve um novo sistema estará disponível para treino, aguarde as próximas atualizações.</p>
          </div>
          <span className="text-[9px] text-neutral-700 font-black tracking-widest uppercase">
            Conexão Indisponível
          </span>
        </div>

      </div>
    </div>
  );
}