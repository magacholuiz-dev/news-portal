/** Converte uma URL de YouTube/Vimeo em uma URL de embed pronta para <iframe>. */
export function getEmbedUrl(
  rawUrl: string,
  startSeconds?: number | null,
): string | null {
  const base = buildEmbedUrl(rawUrl);
  if (!base) return null;
  if (!startSeconds || startSeconds <= 0) return base;
  // YouTube usa `start` (segundos); Vimeo usa o fragmento #t=.
  if (base.includes("vimeo.com")) return `${base}#t=${startSeconds}s`;
  return `${base}&start=${startSeconds}`;
}

function buildEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      const videoId = url.searchParams.get("v");
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
        : null;
    }
    if (url.pathname.startsWith("/embed/")) {
      return `https://www.youtube-nocookie.com${url.pathname}?autoplay=1`;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const videoId = url.pathname.split("/")[2];
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
        : null;
    }
    return null;
  }

  if (host === "youtu.be") {
    const videoId = url.pathname.slice(1);
    return videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`
      : null;
  }

  if (host === "vimeo.com") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId
      ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
      : null;
  }

  if (host === "player.vimeo.com") {
    const separator = url.search ? "&" : "?";
    return `${url.origin}${url.pathname}${url.search}${separator}autoplay=1`;
  }

  return null;
}

/** Miniatura de um vídeo do YouTube (null pra outros provedores). */
export function getVideoThumbnail(rawUrl: string): string | null {
  const embed = buildEmbedUrl(rawUrl);
  const id = embed?.match(/youtube-nocookie\.com\/embed\/([^?&/]+)/)?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
