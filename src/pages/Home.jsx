import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { supabase } from '../services/supabase'; 

export default function Home() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [stats, setStats] = useState({ operators: 0, attempts: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.from('rankings').select('name, total_attempts');
        if (!error && data) {
          const uniqueOperators = new Set(data.map(item => item.name)).size;
          const totalAttempts = data.reduce((sum, current) => sum + (current.total_attempts || 0), 0);
          
          setStats({ operators: uniqueOperators, attempts: totalAttempts });
        }
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      }
    }
    fetchStats();
  }, []);

  const modules = [
    {
      title: "Lockpick",
      path: "/lockpick",
      gif: "/dica_lockpick.gif",
      fallbackIcon: "🔐",
      textColor: "text-cyan-400",
      btnClass: "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 hover:from-cyan-500 hover:to-cyan-400 transform hover:-translate-y-0.5 focus:ring-cyan-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Alinhe os pinos e limpe as trilhas antes que o cronômetro expire.<br/><br/> - Tempo limite: 1 minuto e 30 segundos<br/><br/>- Dificuldade: Muito Alta
        </>
      )
    },
    {
      title: "Caixinha",
      path: "/caixinha",
      gif: "/dica_caixinha.gif",
      fallbackIcon: "🟩",
      textColor: "text-emerald-400",
      btnClass: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/60 hover:from-emerald-500 hover:to-emerald-400 transform hover:-translate-y-0.5 focus:ring-emerald-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Invadá o circuito digitando sequências de 8 caracteres sem errar.<br/><br/> - Tempo limite: 4 segundos cada etapa<br/><br/>- Dificuldade: Alta
        </>
      )
    },
    {
      title: "Porta Malas",
      path: "/portamalas",
      gif: "/dica_portamalas.gif",
      fallbackIcon: "🚘",
      textColor: "text-blue-400",
      btnClass: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 focus:ring-blue-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Encaixe os pinos até completar a sequência para abrir o porta malas.<br/><br/> - Tempo limite: 1 minuto<br/><br/> - Dificuldade: Média
        </>
      )
    },
    {
      title: "Hacking",
      path: "/hacking",
      gif: "/dica_hacking.gif",
      fallbackIcon: "💻",
      textColor: "text-purple-400",
      btnClass: "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:from-purple-500 hover:to-purple-400 transform hover:-translate-y-0.5 focus:ring-purple-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Encontre os caracteres corretos na sopa de códigos.<br/><br/> - Tempo limite: 15 segundos<br/><br/> - Dificuldade: Muito Alta
        </>
      )
    }
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % modules.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + modules.length) % modules.length);

  const activeModule = modules[currentIndex];

  return (
    <div className="relative flex flex-col h-full w-full bg-[#050505] text-white overflow-y-auto overflow-x-hidden font-mono select-none">
      
      {/* BACKGROUND EFFECTS */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.015] grayscale mix-blend-screen fixed"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')` }}
      />

      {/* HEADER */}
      <header className="w-full h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800/60 flex items-center justify-end px-6 sm:px-10 z-20 shrink-0 sticky top-0">
        <button
          onClick={() => setShowAbout(true)}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-all duration-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span className="hidden sm:inline leading-none mt-[1px]">Sobre o Projeto</span>
          <span className="inline sm:hidden leading-none mt-[1px]">Info</span>
        </button>
      </header>

      {/* DASHBOARD */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto z-10 animate-page-reveal">
        
        {/* WIDGETS */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          <div className="bg-[#0c0c0c] border border-neutral-800/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Contas Registradas</div>
              <div className="text-xl font-bold text-neutral-200 mt-0.5">{stats.operators}</div>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-amber-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Testes Realizados</div>
              <div className="text-xl font-bold text-neutral-200 mt-0.5">{stats.attempts}</div>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-neutral-700 transition-colors">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Sistemas Ativos</div>
              <div className="text-xl font-bold text-neutral-200 mt-0.5">{modules.length}</div>
            </div>
          </div>

        </div>

        {/* TÍTULO DA SEÇÃO */}
        <div className="w-full flex items-center justify-between mb-4 border-b border-neutral-900 pb-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Selecione um Módulo
          </h2>
          <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
            Módulo {currentIndex + 1} de {modules.length}
          </div>
        </div>

        {/* CARROSSEL TÁTICO */}
        <div className="relative w-full flex items-center justify-center gap-4 sm:gap-6">
          
          <button 
            onClick={prevSlide}
            className="cursor-pointer hidden sm:flex p-4 bg-[#0c0c0c] border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white hover:border-neutral-600 active:scale-95 transition-all shadow-xl shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div key={currentIndex} className="w-full max-w-xl bg-[#0c0c0c] border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-page-reveal">
            
            {/* TELA DE PREVIEW */}
            <div className="w-full h-48 sm:h-56 bg-neutral-950 relative overflow-hidden border-b border-neutral-800 transition-colors p-2">
              <div className="w-full h-full rounded-2xl overflow-hidden relative">
                <img 
                  src={activeModule.gif} 
                  alt={`Preview ${activeModule.title}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.nextSibling.style.display = 'flex'; 
                  }}
                />
                <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#050505] text-neutral-700 gap-1.5 transition-colors">
                  <span className="text-3xl opacity-60">{activeModule.fallbackIcon}</span>
                  <span className="text-[10px] font-black tracking-widest uppercase">[ {activeModule.gif.substring(1)} ]</span>
                </div>
              </div>
            </div>

            {/* CARD INFERIOR */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div className="mb-8">
                <h3 className={`text-lg font-black uppercase tracking-wider mb-4 transition-colors ${activeModule.textColor}`}>
                  {activeModule.title}
                </h3>
                <div className="text-neutral-400 text-xs sm:text-[13px] leading-relaxed text-left font-sans">
                  {activeModule.objective}
                </div>
              </div>

              <button 
                onClick={() => navigate(activeModule.path)}
                className={`cursor-pointer w-full py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] font-mono ${activeModule.btnClass}`}
              >
                Iniciar Módulo
              </button>
            </div>
          </div>

          <button 
            onClick={nextSlide}
            className="cursor-pointer hidden sm:flex p-4 bg-[#0c0c0c] border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white hover:border-neutral-600 active:scale-95 transition-all shadow-xl shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

        </div>

        {/* CONTROLES */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-8 max-w-xl gap-6">
          <div className="flex sm:hidden gap-4">
            <button onClick={prevSlide} className="cursor-pointer px-6 py-3 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button onClick={nextSlide} className="cursor-pointer px-6 py-3 bg-[#0c0c0c] border border-neutral-800 rounded-xl text-neutral-400 active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
          
          <div className="flex justify-center gap-2 w-full sm:w-auto">
            {modules.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`cursor-pointer h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 sm:w-3 bg-neutral-800 hover:bg-neutral-700'}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* OVERLAY INFORMATIVO */}
      {showAbout && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-blur-fade">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={() => setShowAbout(false)} />

          <div className="max-w-xl w-[95%] max-h-[90vh] bg-[#0c0c0c] border border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden animate-elastic-pop flex flex-col font-mono cursor-default">
            
            <div className="h-14 bg-[#141414] flex items-center justify-between px-6 border-b border-neutral-800/60 shrink-0">
              <div className="flex items-center gap-2 text-amber-500 text-sm font-black tracking-widest uppercase">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
                </svg>
                Info do Sistema
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="cursor-pointer text-neutral-500 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-black text-red-500 tracking-widest uppercase border-b border-neutral-900 pb-4 mb-1">
                Leia com atenção
              </h2>
              
              <p className="text-neutral-400 text-xs sm:text-[13px] leading-relaxed tracking-wide text-justify font-sans">
                Este sistema foi desenvolvido para auxiliar os usuários com testes dos sistemas presentes no servidor Cidade Alta dentro do FiveM. O projeto é totalmente independente e não possui qualquer vínculo com os desenvolvedores, administradores ou responsáveis pelo servidor.<br/><br/>
                Criado por um jogador da comunidade e estudante de Desenvolvimento de Sistemas, o projeto surgiu da necessidade de ter um ambiente dedicado para treinar e aperfeiçoar o uso dos sistemas presentes no servidor.<br/><br/>
                Em caso de dúvidas, sugestões ou problemas, entre em contato por meio do repositório do projeto no GitHub. Caso tenha interesse em conhecer o servidor <span className="text-purple-400 font-bold">Cidade Alta</span>, utilize link disponibilizado abaixo.
              </p>
              
              <div className="bg-[#050505] border border-neutral-800 p-4 sm:p-5 rounded-xl flex flex-col gap-4 mt-2 shadow-inner">
                
                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
                  <span className="text-neutral-500">Desenvolvedor:</span>
                  <a 
                    href="https://discord.com/users/432954675734511626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="cursor-pointer text-purple-400 hover:text-purple-300 hover:underline transition-all duration-200"
                  >
                    EliPe0
                  </a>
                </div>

                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase border-t border-neutral-900/60 pt-4">
                  <span className="text-neutral-500">Link do Projeto:</span>
                  <a 
                    href="https://github.com/EliPe0/Minigames-CDA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="cursor-pointer text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200"
                  >
                    Acessar GitHub
                  </a>
                </div>

                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase border-t border-neutral-900/60 pt-4">
                  <span className="text-neutral-500">Site do Servidor:</span>
                  <a 
                    href="https://cidadealta.gg/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="cursor-pointer text-amber-500 hover:text-amber-300 hover:underline transition-all duration-200"
                  >
                    cidadealta.gg
                  </a>
                </div>

              </div>
            </div>
            
            <div className="p-4 sm:p-5 border-t border-neutral-900/60 bg-[#101010] flex justify-end shrink-0">
              <button 
                onClick={() => setShowAbout(false)}
                className="cursor-pointer px-8 py-3 bg-neutral-200 hover:bg-white active:scale-[0.97] text-black font-mono font-black text-[11px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                Retornar ao Dashboard
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}