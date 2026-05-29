import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function Home() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="relative flex-1 bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none transition-colors duration-300 animate-page-reveal">
      
      {/* ANIMAÇÕES */}
      <style>{`
        @keyframes pageReveal {
          from { opacity: 0; filter: blur(8px); transform: translateY(15px) scale(0.98); }
          to { opacity: 1; filter: blur(0px); transform: translateY(0) scale(1); }
        }
        .animate-page-reveal { animation: pageReveal 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

        @keyframes blurFadeIn {
          from { opacity: 0; background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(12px); }
        }
        @keyframes elasticPopUp {
          from { transform: scale(0.94) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-blur-fade { animation: blurFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-elastic-pop { animation: elasticPopUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.03] dark:opacity-[0.004] grayscale mix-blend-screen"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] dark:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20 dark:opacity-10" />

      {/* BOTÃO SOBRE */}
      <button
        onClick={() => setShowAbout(true)}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-300 font-mono text-[11px] sm:text-xs font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-[0.97]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Sobre o Projeto
      </button>

      {/* TÍTULO PRINCIPAL */}
      <h1 className="text-2xl font-black italic text-amber-500 mb-10 tracking-[0.3em] drop-shadow-[0_0_18px_rgba(245,158,11,0.25)] z-10 font-mono uppercase text-center">
        Hacking Lab | CIDADE ALTA
      </h1>

      {/* GRID DE MÓDULOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl z-10 font-mono">
        
        {/* CARD LOCKPICK) */}
        <button 
          onClick={() => navigate('/lockpick')} 
          className="group relative p-5 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between aspect-square text-left transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:border-cyan-400 dark:hover:border-cyan-500/50 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(245,158,11,0.08)]"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-cyan-600 dark:text-cyan-500 px-2 py-0.5 rounded font-black tracking-widest group-hover:bg-cyan-100 dark:group-hover:bg-cyan-950/30 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/30 transition-all duration-300">
            LOCKPICK
          </div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 text-neutral-800 dark:text-neutral-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
              Lockpick
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500 text-[11px] leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-400 transition-colors">
              Objetivo:<br/><br/> Alinhe os pinos e limpe as trilhas antes que o cronômetro expire.<br/><br/> - Tempo limite: 1 minuto e 30 segundos<br/><br/>- Dificuldade: Muito Alta
            </p>
          </div>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-500 font-black tracking-widest uppercase transition-colors flex items-center gap-1">
            Acessar Módulo <span className="animate-pulse">_</span>
          </span>
        </button>

        {/* CARD CAIXINHA */}
        <button 
          onClick={() => navigate('/caixinha')} 
          className="group relative p-5 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between aspect-square text-left transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:border-emerald-400 dark:hover:border-emerald-400/50 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(52,211,153,0.08)]"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-black tracking-widest group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/30 transition-all duration-300">
            CAIXINHA
          </div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
              Caixinha
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500 text-[11px] leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-400 transition-colors">
              Objetivo:<br/><br/> Sobrecarregue o circuito digitando sequências de 8 caracteres em 3 fases sem errar.<br/><br/> - Tempo limite: 4 segundos cada etapa<br/><br/>- Dificuldade: Alta
            </p>
          </div>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-black tracking-widest uppercase transition-colors flex items-center gap-1">
            Acessar Módulo <span className="animate-pulse">_</span>
          </span>
        </button>

        {/* CARD PORTA MALAS */}
        <button 
          onClick={() => navigate('/portamalas')} 
          className="group relative p-5 bg-white dark:bg-[#0c0c0c] border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col justify-between aspect-square text-left transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] hover:border-blue-400 dark:hover:border-blue-400/50 shadow-md dark:shadow-none hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(59,130,246,0.08)]"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-blue-500 dark:text-blue-300 px-2 py-0.5 rounded font-black tracking-widest group-hover:bg-blue-100 dark:group-hover:bg-blue-950/30 group-hover:border-blue-300 dark:group-hover:border-blue-500/30 transition-all duration-300">
            PORTA MALAS
          </div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-wider">
              Porta Malas
            </h3>
            <p className="text-neutral-500 dark:text-neutral-500 text-[11px] leading-relaxed group-hover:text-neutral-700 dark:group-hover:text-neutral-400 transition-colors">
              Objetivo:<br/><br/> Encaixe os pinos de forma aleatória até completar a sequência para abrir o porta malas.<br/><br/> - Tempo limite: 1 minuto<br/><br/> - Dificuldade: Média
            </p>
          </div>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-black tracking-widest uppercase transition-colors flex items-center gap-1">
            Acessar Módulo <span className="animate-pulse">_</span>
          </span>
        </button>

        {/* CARD: EM BREVE */}
        <div 
          className="relative p-5 bg-neutral-200/50 dark:bg-[#080808]/60 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl opacity-60 dark:opacity-30 aspect-square flex flex-col justify-between"
        >
          <div className="absolute top-4 right-4 text-[8px] bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-900 text-neutral-500 dark:text-neutral-600 px-2 py-0.5 rounded font-black tracking-widest">
            BLOQUEADO
          </div>
          <div className="pt-4">
            <h3 className="text-sm font-black mb-3 text-neutral-500 dark:text-neutral-500 uppercase tracking-wider">
              Em Breve...
            </h3>
            <p className="text-neutral-500 dark:text-neutral-600 text-[11px] leading-relaxed">
              Em breve um novo sistema estará disponível para treino, aguarde as próximas atualizações.
            </p>
          </div>
          <span className="text-[9px] text-neutral-400 dark:text-neutral-700 font-black tracking-widest uppercase">
            Conexão Indisponível
          </span>
        </div>

      </div>

      {/* OVERLAY  */}
      {showAbout && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-blur-fade">
          
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowAbout(false)} />

          {/* CARD DO MODAL */}
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
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-widest uppercase border-b border-neutral-200 dark:border-neutral-900 pb-4 mb-1">
                Hacking Lab | Cidade Alta <br/>
                <span className="text-neutral-500 text-sm">Leia com atenção</span>
              </h2>
              
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-[13px] leading-relaxed tracking-wide text-justify">
                Este sistema foi desenvolvido com fins de estudo e, para aprimoramento dos sistemas utilizados no servidor Cidade Alta, dentro do FiveM. Trata-se de um projeto totalmente independente, sem qualquer vínculo, parceria ou associação com os desenvolvedores, administradores ou responsáveis pelo servidor.<br/><br/>
                Esse projeto foi criado por um jogador entusiasta e estudante de Desenvolvimento de Sistemas, com o objetivo de aprendizado e prática dos usuários.<br/><br/>
                Em caso de dúvidas, sugestões ou problemas, entre em contato por meio do repositório do projeto no GitHub. Caso tenha interesse em conhecer o servidor <span className="text-amber-600 dark:text-amber-500">Cidade Alta</span>, utilize o link disponibilizado abaixo.
              </p>
              
              <div className="bg-neutral-50 dark:bg-[#050505] border border-neutral-200 dark:border-neutral-900 p-4 sm:p-5 rounded-xl flex flex-col gap-4 mt-2">
                
                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
                  <span className="text-neutral-500">Desenvolvedor:</span>
                  <span className="text-purple-600 dark:text-purple-400">EliPe0</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase border-t border-neutral-200 dark:border-neutral-900/60 pt-4">
                  <span className="text-neutral-500">Link do Projeto:</span>
                  <a 
                    href="https://github.com/EliPe0/Minigames-CDA" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline dark:hover:drop-shadow-[0_0_6px_rgba(96,165,250,0.4)] transition-all duration-200"
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
                    className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-300 hover:underline dark:hover:drop-shadow-[0_0_6px_rgba(255,193,7,0.4)] transition-all duration-200"
                  >
                    cidadealta.gg
                  </a>
                </div>

              </div>
            </div>
            
            <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-900/60 bg-neutral-100 dark:bg-[#101010] flex justify-end shrink-0">
              <button 
                onClick={() => setShowAbout(false)}
                className="px-8 py-3 bg-black hover:bg-neutral-800 text-white dark:bg-neutral-200 dark:hover:bg-white active:scale-[0.97] dark:text-black font-mono font-black text-[11px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
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