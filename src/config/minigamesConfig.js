export const MINIGAMES = {
  lockpick: {
    id: 'lockpick',
    title: "Lockpick",
    path: "/lockpick",
    gif: "/dica_lockpick.gif",
    fallbackIcon: "🔐",
    
    // Paleta de Cores
    colorClass: "text-cyan-400",
    bgAccent: "bg-cyan-500/10",
    borderAccent: "border-cyan-500/30",
    btnClass: "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/60 hover:from-cyan-500 hover:to-cyan-400 focus:ring-cyan-500/50",
    
    // Textos
    objective: "Alinhe os pinos e limpe as trilhas antes que o cronômetro expire.\n\n- Tempo limite: 1 minuto e 30 segundos\n\n- Dificuldade: Muito Alta"
  },
  caixinha: {
    id: 'caixinha',
    title: "Caixinha",
    path: "/caixinha",
    gif: "/dica_caixinha.gif",
    fallbackIcon: "🟩",
    
    colorClass: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    borderAccent: "border-emerald-500/30",
    btnClass: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/60 hover:from-emerald-500 hover:to-emerald-400 focus:ring-emerald-500/50",
    
    objective: "Invadir o circuito digitando sequências de 8 caracteres sem errar.\n\n- Tempo limite: 4 segundos cada etapa\n\n- Dificuldade: Alta"
  },
  portamalas: {
    id: 'portamalas',
    title: "Porta Malas",
    path: "/portamalas",
    gif: "/dica_portamalas.gif",
    fallbackIcon: "🚘",
    
    colorClass: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/30",
    btnClass: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/60 hover:from-blue-500 hover:to-blue-400 focus:ring-blue-500/50",
    
    objective: "Encaixe os pinos até completar a sequência para abrir o porta malas.\n\n- Tempo limite: 1 minuto\n\n- Dificuldade: Média"
  },
  hacking: {
    id: 'hacking',
    title: "Hacking",
    path: "/hacking",
    gif: "/dica_hacking.gif",
    fallbackIcon: "💻",
    
    colorClass: "text-purple-400",
    bgAccent: "bg-purple-500/10",
    borderAccent: "border-purple-500/30",
    btnClass: "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/60 hover:from-purple-500 hover:to-purple-400 focus:ring-purple-500/50",
    
    objective: "Encontre os caracteres corretos na sopa de códigos.\n\n- Tempo limite: 15 segundos\n\n- Dificuldade: Muito Alta"
  }
};

export const MINIGAMES_LIST = Object.values(MINIGAMES);