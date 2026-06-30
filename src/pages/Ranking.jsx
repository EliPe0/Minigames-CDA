import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('lockpick');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const minigamesConfig = {
    lockpick: { title: "Lockpick", color: "text-cyan-400", bgAccent: "bg-cyan-500/10", borderAccent: "border-cyan-500/30", orderColumn: "best_time", ascending: true },
    caixinha: { title: "Caixinha", color: "text-amber-500", bgAccent: "bg-amber-500/10", borderAccent: "border-amber-500/30", orderColumn: "max_streak", ascending: false },
    portamalas: { title: "Porta Malas", color: "text-blue-400", bgAccent: "bg-blue-500/10", borderAccent: "border-blue-500/30", orderColumn: "best_time", ascending: true },
    hacking: { title: "Hacking", color: "text-purple-400", bgAccent: "bg-purple-500/10", borderAccent: "border-purple-500/30", orderColumn: "max_streak", ascending: false }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchRankings() {
      setLoading(true);
      const config = minigamesConfig[activeTab];
      
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('minigame', activeTab)
        .order(config.orderColumn, { ascending: config.ascending })
        .limit(10);

      if (!error && data) setList(data);
      setLoading(false);
    }
    fetchRankings();
  }, [activeTab]);

  const handleDiscordLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin + '/ranking',
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const discordName = user?.user_metadata?.username || user?.user_metadata?.name;
  const discordAvatar = user?.user_metadata?.avatar_url;
  const currentConfig = minigamesConfig[activeTab];

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-[#050505] p-6 font-mono select-none w-full relative text-white h-full animate-page-reveal overflow-y-auto">
      
      <div className="responsive-wrapper w-full max-w-2xl">
        
        {/* CARD DE PERFIL */}
        <div className="w-full bg-[#0c0c0c] border border-neutral-800 rounded-2xl p-4 mb-5 flex items-center justify-between shadow-xl">
          {user ? (
            <div className="flex items-center gap-3 animate-page-reveal">
              {discordAvatar ? (
                <img src={discordAvatar} alt="Perfil" className="w-9 h-9 rounded-xl border border-neutral-800 object-cover shadow-md" />
              ) : (
                <div className="w-9 h-9 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-center text-neutral-600 font-bold">?</div>
              )}
              <div>
                <div className="text-[9px] text-neutral-500 uppercase font-black tracking-wider">Sessão Ativa</div>
                <div className="text-sm font-black text-white">{discordName}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <div className="text-[10px] text-neutral-400 font-black uppercase tracking-wider">Leaderboard</div>
              <div className="text-xs text-neutral-500">Vincule sua conta para registrar seu desempenho.</div>
            </div>
          )}

          {user ? (
            <button onClick={handleLogout} className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all">Sair</button>
          ) : (
            <button onClick={handleDiscordLogin} className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16"><path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.569-.406.818a12.212 12.212 0 0 0-3.66 0 8.25 8.25 0 0 0-.412-.818.05.05 0 0 0-.052-.025 13.229 13.227 0 0 0-3.257 1.011.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032a.04.04 0 0 0 .016.028a13.401 13.401 0 0 0 4.057 2.059a.05.05 0 0 0 .053-.017c.308-.41.585-.85.817-1.314a.05.05 0 0 0-.028-.069a8.98 8.98 0 0 1-1.273-.61a.05.05 0 0 1-.005-.085a6.57 6.57 0 0 0 .27-.208a.046.046 0 0 1 .047-.006c2.536 1.157 5.271 1.157 7.775 0a.047.046 0 0 1 .048.006c.084.066.175.136.27.208a.05.05 0 0 1-.006.085a9.304 9.304 0 0 1-1.273.61a.05.05 0 0 0-.022.069c.237.465.513.905.817 1.314a.05.05 0 0 0 .052.017a13.369 13.401 0 0 0 4.057-2.059a.072.072 0 0 0 .016-.028c.456-3.675-.751-6.677-3.119-9.107a.042.042 0 0 0-.022-.019z"/></svg>
              Conectar Discord
            </button>
          )}
        </div>

        {/* CONTÊINER PRINCIPAL */}
        <div className="w-full bg-[#0c0c0c] border border-neutral-800 rounded-2xl flex flex-col shadow-2xl min-h-[482px] relative overflow-hidden">
          <div className={`h-[2px] w-full transition-colors duration-500 ${currentConfig.bgAccent.replace('10', '50')}`} />

          {/* MENU SELETOR */}
          <div className="flex justify-center gap-1.5 bg-[#141414]/60 border-b border-neutral-800/40 text-[11px] font-black uppercase tracking-wider text-center p-2.5">
            {Object.keys(minigamesConfig).map((key) => {
              const cfg = minigamesConfig[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 rounded-xl transition-all duration-300 font-bold ${activeTab === key ? `${cfg.color} ${cfg.bgAccent} ${cfg.borderAccent} border font-black shadow-md` : 'text-neutral-500 hover:text-neutral-300 border border-transparent'}`}
                >
                  {cfg.title}
                </button>
              );
            })}
          </div>

          {/* TABELA TELEMÉTRICA */}
          <div className="p-2 flex-1 flex flex-col justify-start">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-neutral-500 font-black uppercase tracking-widest text-[9px] border-b border-neutral-900/60 bg-black/10">
                  <th className="py-3 px-3 text-center w-14">RANK</th>
                  <th className="py-3 px-3">Jogador</th>
                  <th className="py-3 px-3 text-center w-24">Streak Máx</th>
                  <th className="py-3 px-3 text-right w-32">Tempo Mais Rápido</th>
                  <th className="py-3 px-3 text-right w-28">Precisão</th>
                </tr>
              </thead>
              <tbody className={`transition-all duration-300 ${loading ? 'opacity-40 blur-[1px]' : 'opacity-100 blur-0'}`}>
                {list.length > 0 && !loading ? (
                  list.map((row, idx) => {
                    const position = idx + 1;
                    const posColor = position === 1 ? 'text-amber-400 font-black' : position === 2 ? 'text-neutral-300' : position === 3 ? 'text-amber-600' : 'text-neutral-600';
                    
                    const formatTime = row.best_time === 999.99 ? '--' : `${row.best_time.toFixed(2)}s`;
                    
                    return (
                      <tr key={row.id || idx} className="border-b border-neutral-900/30 hover:bg-white/[0.01] transition-colors">
                        <td className={`py-3.5 px-3 text-center font-black text-xs ${posColor}`}>{position.toString().padStart(2, '0')}</td>
                        <td className="py-3.5 px-3 text-neutral-200 font-bold tracking-wide">{row.name}</td>
                        <td className="py-3.5 px-3 text-center text-neutral-300 font-black">{row.max_streak || 0}</td>
                        <td className={`py-3.5 px-3 text-right font-black ${minigamesConfig[activeTab].color}`}>{formatTime}</td>
                        <td className="py-3.5 px-3 text-right text-neutral-500 font-medium font-mono text-[11px]">
                          <span className="text-neutral-300 font-bold">{row.total_hits}</span>
                          <span className="text-neutral-600"> / {row.total_attempts}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : !loading ? (
                  <tr>
                    <td colSpan="5" className="py-36 text-center text-neutral-600 text-[10px] font-black uppercase tracking-widest px-6 leading-relaxed">
                      Nenhum registro encontrado ainda.<br />
                      <span className="text-neutral-700 font-normal lowercase">Aguardando novos participantes...</span>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {loading && (
              <div className="flex-1 flex items-center justify-center py-32 text-neutral-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Sincronizando partições da tabela...
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}