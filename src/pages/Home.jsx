import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const modules = [
    {
      title: "Lockpick",
      path: "/lockpick",
      gif: "/dica_lockpick.gif",
      fallbackIcon: "🔐",
      textColor: "text-cyan-500 dark:text-cyan-400",
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
      textColor: "text-emerald-500 dark:text-emerald-400",
      btnClass: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/60 hover:from-emerald-500 hover:to-emerald-400 transform hover:-translate-y-0.5 focus:ring-emerald-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Sobrecarregue o circuito digitando sequências de 8 caracteres em 3 fases sem errar.<br/><br/> - Tempo limite: 4 segundos cada etapa<br/><br/>- Dificuldade: Alta
        </>
      )
    },
    {
      title: "Porta Malas",
      path: "/portamalas",
      gif: "/dica_portamalas.gif",
      fallbackIcon: "🚘",
      textColor: "text-blue-500 dark:text-blue-400",
      btnClass: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:from-blue-500 hover:to-blue-400 transform hover:-translate-y-0.5 focus:ring-blue-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Encaixe os pinos de forma aleatória até completar a sequência para abrir o porta malas.<br/><br/> - Tempo limite: 1 minuto<br/><br/> - Dificuldade: Média
        </>
      )
    },
    {
      title: "Hacking",
      path: "/hacking",
      gif: "/dica_hacking.gif",
      fallbackIcon: "💻",
      textColor: "text-purple-500 dark:text-purple-400",
      btnClass: "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:from-purple-500 hover:to-purple-400 transform hover:-translate-y-0.5 focus:ring-purple-500/50",
      objective: (
        <>
          Objetivo:<br/><br/> Rastreie a cadeia correta de caracteres ocultos dentro da sopa de códigos em movimento.<br/><br/> - Tempo limite: 15 segundos<br/><br/> - Dificuldade: Muito Alta
        </>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % modules.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + modules.length) % modules.length);
  };

  const activeModule = modules[currentIndex];

  return (
    <div className="relative flex-1 bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none transition-colors duration-300 animate-page-reveal">
      
      {/* ANIMAÇÕES E RESPONSIVIDADE */}
      <style>{`
        @keyframes pageReveal {
          from { opacity: 0; filter: blur(4px); transform: translateY(6px); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0); }
        }
        .animate-page-reveal { animation: pageReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes blurFadeIn {
          from { opacity: 0; background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0,0,0,0.4); backdrop-filter: blur(8px); }
        }
        @keyframes smoothRevealUp {
          from { transform: scale(0.97) translateY(5px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: smoothRevealUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

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
        @media (max-height: 700px) { .responsive-wrapper { transform: scale(0.72); } }
        @media (max-height: 600px) { .responsive-wrapper { transform: scale(0.60); } }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.01] dark:opacity-[0.003] grayscale mix-blend-screen"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')` }}
      />

      {/* BOTÃO SOBRE */}
      <button
        onClick={() => setShowAbout(true)}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-200 font-mono text-[11px] font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.97]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Sobre o Projeto
      </button>

      <div className="responsive-wrapper z-10 w-full max-w-xl">
        
        <div className="text-center mb-8 max-w font-mono animate-page-reveal">
          <p className="text-[13px] font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-500 mb-2">
            Sistema de Treinamento
          </p>
          <p className="text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400 font-medium px-4">
            Selecione um dos módulos abaixo para acessar os desafios de cada sistema do servidor Cidade Alta. Cada módulo foi projetado para simular as mecânicas reais presentes no servidor, permitindo que você pratique e aperfeiçoe suas habilidades em um ambiente dedicado.
          </p>
        </div>

        {/* CARROSSEL TÁTICO */}
        <div className="relative w-full flex items-center justify-center gap-4">
          
          {/* BOTÃO VOLTAR */}
          <button 
            onClick={prevSlide}
            className="p-3 bg-white dark:bg-[#090909] border border-neutral-200/60 dark:border-neutral-900 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:scale-105 hover:border-neutral-300 dark:hover:border-neutral-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* CARD CENTRAL */}
          <div key={currentIndex} className="w-full bg-white dark:bg-[#090909] border border-neutral-200/60 dark:border-neutral-900 rounded-2xl overflow-hidden flex flex-col shadow-md animate-page-reveal">
            
            {/* TELA DE PREVIEW */}
            <div className="w-full h-52 bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden border-b border-neutral-200/60 dark:border-neutral-900/40 transition-colors">
              <img 
                src={activeModule.gif} 
                alt={`Preview ${activeModule.title}`} 
                className="w-full h-full object-cover"
                onError={(e) => { 
                  e.target.style.display = 'none'; 
                  e.target.nextSibling.style.display = 'flex'; 
                }}
              />
              <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-neutral-100 dark:bg-[#050505] text-neutral-400 dark:text-neutral-700 gap-1.5 transition-colors">
                <span className="text-3xl opacity-60">{activeModule.fallbackIcon}</span>
                <span className="text-[10px] font-black tracking-widest font-mono uppercase">[ {activeModule.gif.substring(1)} ]</span>
              </div>
            </div>

            {/* CARD DE DETALHES INFERIOR */}
            <div className="p-6 flex flex-col justify-between font-mono">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-base font-black uppercase tracking-wider transition-colors ${activeModule.textColor}`}>
                    {activeModule.title}
                  </h3>
                </div>
                <p className="text-neutral-500 dark:text-neutral-500 text-[11px] leading-relaxed text-left">
                  {activeModule.objective}
                </p>
              </div>

              {/* BOTÃO ACESSAR MÓDULO */}
              <button 
                onClick={() => navigate(activeModule.path)}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] ${activeModule.btnClass}`}
              >
                Acessar Módulo
              </button>
            </div>

          </div>

          {/* BOTÃO AVANÇAR */}
          <button 
            onClick={nextSlide}
            className="p-3 bg-white dark:bg-[#090909] border border-neutral-200/60 dark:border-neutral-900 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:scale-105 hover:border-neutral-300 dark:hover:border-neutral-700 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

        </div>

        {/* INDICADORES DE PAGINAÇÃO */}
        <div className="flex justify-center gap-2 mt-6">
          {modules.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-neutral-300 dark:bg-neutral-800'}`}
            />
          ))}
        </div>

      </div>

      {/* OVERLAY INFORMATIVO MODAL */}
      {showAbout && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-blur-fade">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAbout(false)} />

          <div className="max-w-xl w-[95%] max-h-[90vh] bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl relative overflow-hidden animate-elastic-pop flex flex-col font-mono cursor-default">
            
            <div className="h-14 bg-neutral-50 dark:bg-[#141414] flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-800/60 shrink-0">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm font-black tracking-widest uppercase">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="dark:drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
                </svg>
                Info do Sistema
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 flex flex-col gap-5 overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-500 tracking-widest uppercase border-b border-neutral-200 dark:border-neutral-900 pb-4 mb-1">
                Leia com atenção
              </h2>
              
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-[13px] leading-relaxed tracking-wide text-justify">
                Este sistema foi desenvolvido para auxiliar os usuários com testes dos sistemas presentes no servidor Cidade Alta dentro do FiveM. O projeto é totalmente independente e não possui qualquer vínculo com os desenvolvedores, administradores ou responsáveis pelo servidor.<br/><br/>
                Criado por um jogador da comunidade e estudante de Desenvolvimento de Sistemas, o projeto surgiu da necessidade de ter um ambiente dedicado para treinar e aperfeiçoar o uso dos sistemas presentes no servidor.<br/><br/>
                Em caso de dúvidas, sugestões ou problemas, entre em contato por meio do repositório do projeto no GitHub. Caso tenha interesse em conhecer o servidor <span className="text-purple-600 dark:text-purple-400">Cidade Alta</span>, utilize o link disponibilizado abaixo.
              </p>
              
              <div className="bg-neutral-50 dark:bg-[#050505] border border-neutral-200 dark:border-neutral-900 p-4 sm:p-5 rounded-xl flex flex-col gap-4 mt-2">
                
                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
                  <span className="text-neutral-500">Desenvolvedor:</span>
                  <a 
                    href="https://discord.com/users/432954675734511626" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:underline transition-all duration-200"
                  >
                    EliPe0
                  </a>
                </div>

                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase border-t border-neutral-200 dark:border-neutral-900/60 pt-4">
                  <span className="text-neutral-500">Link do Projeto:</span>
                  <a 
                    href="https://github.com/EliPe0/Minigames-CDA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-all duration-200"
                  >
                    Acessar GitHub
                  </a>
                </div>

                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase border-t border-neutral-200 dark:border-neutral-900/60 pt-4">
                  <span className="text-neutral-500">Site do Servidor:</span>
                  <a 
                    href="https://cidadealta.gg/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-300 hover:underline transition-all duration-200"
                  >
                    cidadealta.gg
                  </a>
                </div>

              </div>
            </div>
            
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-900/60 bg-neutral-100 dark:bg-[#101010] flex justify-end shrink-0">
              <button 
                onClick={() => setShowAbout(false)}
                className="px-8 py-3 bg-black hover:bg-neutral-800 text-white dark:bg-neutral-200 dark:hover:bg-white active:scale-[0.97] dark:text-black font-mono font-black text-[11px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
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