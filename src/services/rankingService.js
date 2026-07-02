import { supabase } from './supabase';

export async function registerAttempt(minigame, isWin, currentStreak = 0, timeSpent = null) {
  if (import.meta.env.VITE_SUPABASE_URL?.includes('placeholder-url')) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('[OAUTH] Gravação abortada: Operador não autenticado via Discord.');
    return false;
  }

  const identityData = user.identities?.[0]?.identity_data || {};

  const playerName = user.user_metadata?.custom_claims?.global_name || identityData.custom_claims?.global_name || user.user_metadata?.full_name || user.user_metadata?.name;
  const playerAvatar = user.user_metadata?.avatar_url || null; 

  const providerId = user.user_metadata?.provider_id || identityData.sub || user.id;
  
  const bannerHash = user.user_metadata?.banner || identityData.banner || user.user_metadata?.custom_claims?.banner || identityData.custom_claims?.banner;
  let playerBanner = null;
  if (providerId && bannerHash) {
    const isGif = bannerHash.startsWith('a_');
    playerBanner = `https://cdn.discordapp.com/banners/${providerId}/${bannerHash}.${isGif ? 'gif' : 'png'}?size=512`;
  }

  const { error } = await supabase.rpc('register_minigame_attempt', {
    p_minigame: minigame,
    p_provider_id: providerId,
    p_name: playerName,
    p_avatar_url: playerAvatar,
    p_banner_url: playerBanner,
    p_is_win: isWin,
    p_streak: currentStreak,
    p_time_spent: timeSpent !== null ? parseFloat(timeSpent) : null
  });

  if (error) {
    console.error('[DB] Falha crítica de Uplink ao salvar recorde:', error.message);
  } else {
    console.log(`[DB] Pacote de dados gravado e auditado com sucesso. (${minigame})`);
  }
}