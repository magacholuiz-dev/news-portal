const TYPES = ["episode", "track", "show", "playlist", "album"];

/** Converte um link do Spotify (open.spotify.com/episode/…) na URL de embed
 * do player. Retorna null se não for um link válido do Spotify. */
export function getSpotifyEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.hostname !== "open.spotify.com") return null;
  // /intl-pt/episode/ID ou /embed/episode/ID também aparecem em links copiados
  const parts = url.pathname.split("/").filter(Boolean);
  const i = parts.findIndex((p) => TYPES.includes(p));
  const id = i >= 0 ? parts[i + 1] : null;
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
  return `https://open.spotify.com/embed/${parts[i]}/${id}?utm_source=generator&theme=0`;
}
