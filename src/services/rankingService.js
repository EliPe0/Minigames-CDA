import { supabase } from './supabase';

export async function registerAttempt(minigame, isWin, currentStreak = 0, timeSpent = null) {
  if (supabase.supabaseUrl.includes('placeholder-url')) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('[OAUTH] Gravação abortada: Operador não autenticado via Discord.');
    return false;
  }

  const playerName = user.user_metadata?.username || user.user_metadata?.name;
  const playerAvatar = user.user_metadata?.avatar_url || null; 

  const { data: existing } = await supabase
    .from('rankings')
    .select('*')
    .eq('name', playerName)
    .eq('minigame', minigame)
    .maybeSingle();

  const total_attempts = (existing?.total_attempts || 0) + 1;
  const total_hits = (existing?.total_hits || 0) + (isWin ? 1 : 0);
  const max_streak = Math.max(existing?.max_streak || 0, currentStreak);
  
  let best_time = existing?.best_time || 999.99;
  if (isWin && timeSpent !== null) {
    best_time = Math.min(best_time, parseFloat(timeSpent));
  }

  await supabase
    .from('rankings')
    .upsert({
      name: playerName,
      minigame: minigame,
      avatar_url: playerAvatar,
      max_streak,
      best_time,
      total_attempts,
      total_hits
    }, { onConflict: 'name,minigame' });
}