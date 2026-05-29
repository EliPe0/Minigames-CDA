import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Lockpick from './components/Lockpick';
import CaixinhaTreino from './components/CaixinhaTreino';
import PortaMalas from './components/PortaMalas';
import Sidebar from './components/Sidebar';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('cda-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cda-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default function App() {
  useEffect(() => {
    document.title = "Minigames | CDA";
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col md:flex-row min-h-screen w-full h-full bg-neutral-100 text-neutral-900 dark:bg-black dark:text-white transition-colors duration-300">
          <Sidebar />
          <main className="flex-1 flex flex-col justify-center min-w-0 bg-neutral-50 dark:bg-[#050505] transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/lockpick" element={<Lockpick />} />
              <Route path="/caixinha" element={<CaixinhaTreino />} />
              <Route path="/portamalas" element={<PortaMalas />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}