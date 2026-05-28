import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lockpick from './components/Lockpick';
import CaixinhaTreino from './components/CaixinhaTreino';
import PortaMalas from './components/PortaMalas';
import Sidebar from './components/Sidebar';

export default function App() {
  useEffect(() => {
    document.title = "Minigames | CDA";
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-black text-white w-full h-full">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center min-w-0 bg-[#050505]">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/lockpick" element={<Lockpick />} />
            <Route path="/caixinha" element={<CaixinhaTreino />} />
            <Route path="/portamalas" element={<PortaMalas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}