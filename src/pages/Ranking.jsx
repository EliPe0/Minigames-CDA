import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Ranking() {
  const [activeTab, setActiveTab] = useState('lockpick');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const minigamesConfig = {
    lockpick: { title: "Lockpick", color: "text-cyan-400", bgAccent: "bg-cyan-500/10", borderAccent: "border-cyan-500/30", orderColumn: "best_time", ascending: true },
    caixinha: { title: "Caixinha", color: "text-emerald-400", bgAccent: "bg-emerald-500/10", borderAccent: "border-emerald-500/30", orderColumn: "max_streak", ascending: false },
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
        .gt('total_hits', 0)
        .lt('best_time', 999)
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
  
  const providerId = user?.user_metadata?.provider_id || user?.user_metadata?.sub;
  const bannerHash = user?.user_metadata?.banner || user?.user_metadata?.custom_claims?.banner;
  let discordBanner = null;
  if (providerId && bannerHash) {
    const isGif = bannerHash.startsWith('a_');
    discordBanner = `https://cdn.discordapp.com/banners/${providerId}/${bannerHash}.${isGif ? 'gif' : 'png'}?size=512`;
  }

  const currentConfig = minigamesConfig[activeTab];

  return (
    <div className="flex flex-col items-center justify-center flex-1 bg-[#050505] p-6 font-mono select-none w-full relative text-white h-full animate-page-reveal overflow-y-auto">
      
      <div className="responsive-wrapper w-full max-w-2xl">
        
        {/* CARD DE PERFIL */}
        <div className="w-full bg-[#0c0c0c] border border-neutral-800/80 rounded-3xl mb-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl relative overflow-hidden p-8 gap-6 sm:gap-0">
          
          {/* BANNER DE FUNDO */}
          {user && (discordBanner || discordAvatar) && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img 
                src={discordBanner || discordAvatar} 
                alt="Banner Background" 
                className={`w-full h-full object-cover ${!discordBanner ? 'opacity-[0.15] blur-3xl scale-150' : 'opacity-40'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c] via-[#0c0c0c]/40 to-transparent"></div>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-6 z-10 w-full sm:w-auto animate-page-reveal">
              <div className="relative shrink-0 p-1 rounded-full bg-gradient-to-tr from-white/10 to-transparent border border-white/5 shadow-2xl">
                {discordAvatar ? (
                  <img src={discordAvatar} alt="Perfil" className="w-16 h-16 rounded-full border-2 border-[#0c0c0c] object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-[#0c0c0c] bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-2xl">?</div>
                )}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-[3px] border-[#0c0c0c] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-white font-black text-2xl font-sans tracking-tight leading-tight">{discordName}</div>
                <div className="text-[10px] text-neutral-400 font-bold tracking-[0.2em] uppercase mt-1 opacity-80 drop-shadow-md">
                  Conta Discord Vinculada
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 z-10 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-full bg-neutral-900/50 border border-white/5 flex items-center justify-center text-neutral-600 shrink-0 shadow-inner">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="text-white font-black text-xl font-sans tracking-tight">Visitante</div>
                <div className="text-neutral-500 text-[11px] font-medium font-sans leading-tight mt-1 max-w-[200px]">
                  Autentique-se para sincronizar seus tempos com a rede.
                </div>
              </div>
            </div>
          )}

          <div className="w-full sm:w-auto z-10">
            {user ? (
              <button 
                onClick={handleLogout} 
                className="cursor-pointer w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-neutral-300 hover:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95"
              >
                Sair da Conta
              </button>
            ) : (
              <button 
                onClick={handleDiscordLogin} 
                className="cursor-pointer w-full sm:w-auto px-8 py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-black uppercase tracking-[0.1em] rounded-full transition-all shadow-[0_10px_25px_rgba(88,101,242,0.3)] hover:shadow-[0_15px_30px_rgba(88,101,242,0.4)] active:scale-95 flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.55,67.55,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.3,46,96.19,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
                Vincular Discord
              </button>
            )}
          </div>
        </div>

        {/* CONTAINER DO PLACAR */}
        <div className="w-full bg-[#0c0c0c] border border-neutral-800 rounded-3xl flex flex-col shadow-2xl min-h-[482px] relative overflow-hidden">
          <div className={`h-[2px] w-full transition-colors duration-500 ${currentConfig.bgAccent.replace('10', '50')}`} />

          {/* MENU SELETOR */}
          <div className="flex justify-center gap-1.5 bg-[#141414]/60 border-b border-neutral-800/40 text-[10px] font-black uppercase tracking-widest text-center p-3">
            {Object.keys(minigamesConfig).map((key) => {
              const cfg = minigamesConfig[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`cursor-pointer px-5 py-2 rounded-full transition-all duration-300 ${activeTab === key ? `${cfg.color} ${cfg.bgAccent} border border-white/5 font-black shadow-lg` : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                  {cfg.title}
                </button>
              );
            })}
          </div>

          {/* LISTA DE CARDS DO RANKING */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3 justify-start overflow-y-auto">
            {list.length > 0 && !loading ? (
              list.map((row, idx) => {
                const position = idx + 1;
                const posColor = position === 1 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 
                                 position === 2 ? 'text-neutral-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.6)]' : 
                                 position === 3 ? 'text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]' : 'text-neutral-500';
                
                const formatTime = row.best_time === 999.99 ? '--' : `${row.best_time.toFixed(2)}s`;
                
                const bgImage = row.banner_url || row.avatar_url;
                const isAvatarFallback = !row.banner_url;

                return (
                  <div key={row.id || idx} className="relative w-full bg-[#101010]/90 border border-neutral-800/60 rounded-2xl overflow-hidden flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 shadow-lg group hover:border-neutral-700/80 transition-all hover:scale-[1.01] cursor-pointer">
                    
                    {bgImage && (
                      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <img 
                          src={bgImage} 
                          alt="Banner do Jogador" 
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isAvatarFallback ? 'opacity-[0.08] blur-xl scale-125' : 'opacity-[0.25]'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#101010] via-[#101010]/80 to-transparent"></div>
                      </div>
                    )}

                    {/* CONTEÚDO ESQUERDA */}
                    <div className="relative z-10 flex items-center gap-4 w-full sm:w-auto">
                      <div className={`font-black text-lg sm:text-xl w-8 text-center ${posColor}`}>
                        #{position}
                      </div>
                      
                      <div className="relative shrink-0">
                        {row.avatar_url ? (
                          <img src={row.avatar_url} alt={row.name} className="w-10 h-10 rounded-full border-2 border-[#141414] object-cover shadow-md" />
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 border-[#141414] bg-neutral-900 flex items-center justify-center text-neutral-600 text-xs font-bold shadow-md">?</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <div className="text-neutral-200 font-bold tracking-wide truncate group-hover:text-white transition-colors">{row.name}</div>
                      </div>
                    </div>

                    {/* CONTEÚDO DIREITA */}
                    <div className="relative z-10 flex items-center justify-between sm:justify-end w-full sm:w-auto sm:ml-auto gap-6 sm:gap-10 mt-2 sm:mt-0 pl-12 sm:pl-0">
                      
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase mb-0.5 opacity-80">Streak</span>
                        <span className="text-neutral-300 font-black text-sm">{row.max_streak || 0}</span>
                      </div>

                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase mb-0.5 opacity-80">Tempo</span>
                        <span className={`font-black text-sm drop-shadow-md ${minigamesConfig[activeTab].color}`}>{formatTime}</span>
                      </div>

                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase mb-0.5 opacity-80">Precisão</span>
                        <div className="font-mono text-xs text-neutral-300 font-bold mt-0.5">
                          {row.total_hits} <span className="text-neutral-600 font-normal">/ {row.total_attempts}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : !loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-neutral-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                  Nenhum dado capturado
                </div>
                <div className="text-neutral-700 font-medium text-xs">
                  Aguardando quebra de segurança...
                </div>
              </div>
            ) : null}
          </div>

          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c0c0c]/80 backdrop-blur-sm">
              <div className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                Sincronizando Uplink...
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}