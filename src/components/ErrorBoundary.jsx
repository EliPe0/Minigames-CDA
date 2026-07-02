import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[SISTEMA] Falha capturada pelo Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-[#050505] p-6 text-white font-mono select-none z-[9999] relative animate-page-reveal">
          <div className="flex flex-col items-center gap-4 text-center max-w-md bg-[#0c0c0c] border border-red-900/40 p-10 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.15)]">
            <div className="text-red-500 font-black text-4xl mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">ERRO CRÍTICO</div>
            <div className="h-[1px] w-12 bg-red-900/50 mx-auto" />
            
            <p className="text-neutral-400 text-[11px] leading-relaxed mt-2 uppercase tracking-widest">
              Ocorreu uma falha fatal no módulo. O sistema foi interrompido para evitar corrupção de dados.
            </p>
            
            <div className="bg-red-950/30 border border-red-900/30 p-3 rounded-lg mt-2 w-full overflow-x-auto text-left max-h-[100px] overflow-y-auto">
              <code className="text-red-400 text-[9px] whitespace-pre-wrap">
                {this.state.error?.toString() || "Unknown Error"}
              </code>
            </div>
            
            <button 
              onClick={() => window.location.href = '/home'} 
              className="cursor-pointer mt-4 px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 hover:border-red-500/60 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              Reiniciar Sistema
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}