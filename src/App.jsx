import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importação dos seus componentes e páginas
import Sidebar from './components/Sidebar';
import Home from './pages/Home'; // Supondo que você tenha uma página inicial
import Ranking from './pages/Ranking';
import Lockpick from './components/Lockpick';
import Caixinha from './components/Caixinha';
import PortaMalas from './components/PortaMalas';
import Hacking from './components/Hacking';

export default function App() {
  return (
    <Router>
      {/* 📱 TELA DE BLOQUEIO MOBILE (Só aparece em telas menores que 768px) */}
      <div className="flex md:hidden flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 font-mono select-none text-center relative overflow-hidden z-[999]">
        
        {/* Efeito de grade no fundo */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

        <div className="w-full max-w-sm bg-[#0c0c0c] border border-red-900/40 p-8 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)] relative flex flex-col items-center gap-6 animate-page-reveal">
          
          {/* Barra de Alerta Superior */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-900 via-red-500 to-red-900 opacity-80" />

          {/* Ícone de Terminal Bloqueado (Animado) */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="w-20 h-20 bg-[#141414] border border-red-500/30 rounded-full flex items-center justify-center text-red-500 relative z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="3" y1="3" x2="21" y2="17" className="stroke-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]" />
              </svg>
            </div>
          </div>

          {/* Textos Táticos */}
          <div className="flex flex-col gap-3">
            <h2 className="text-red-500 font-black text-xl tracking-widest uppercase">
              Acesso Restrito
            </h2>
            
            <div className="h-[1px] w-12 bg-red-900/50 mx-auto" />
            
            <p className="text-neutral-400 text-xs leading-relaxed mt-2">
              Os módulos de invasão requerem um terminal com resolução estendida para operar corretamente.
            </p>
            
            <div className="mt-4 bg-red-950/30 border border-red-900/30 px-4 py-3 rounded-xl">
              <p className="text-neutral-300 text-[10px] uppercase tracking-wider font-bold">
                Por favor, conecte-se através de um PC ou Notebook.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 💻 APLICAÇÃO DESKTOP (Só aparece em telas maiores que 768px) */}
      <div className="hidden md:flex h-screen w-full bg-[#050505] overflow-hidden">
        
        {/* Menu Lateral */}
        <Sidebar />

        {/* Área Principal onde as rotas são renderizadas */}
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/lockpick" element={<Lockpick />} />
            <Route path="/caixinha" element={<Caixinha />} />
            <Route path="/portamalas" element={<PortaMalas />} />
            <Route path="/hacking" element={<Hacking />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}