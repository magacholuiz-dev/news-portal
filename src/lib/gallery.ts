export type GalleryItemInput = {
  imageUrl: string;
  videoUrl: string | null;
  caption: string | null;
};

/** Normaliza o array de itens de galeria vindo do formulário admin, descartando entradas inválidas (sem imagem). */
export function parseGalleryItems(raw: unknown): GalleryItemInput[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      imageUrl:
        typeof item.imageUrl === "string" ? item.imageUrl.trim() : "",
      videoUrl:
        typeof item.videoUrl === "string" && item.videoUrl.trim()
          ? item.videoUrl.trim()
          : null,
      caption:
        typeof item.caption === "string" && item.caption.trim()
          ? item.caption.trim()
          : null,
    }))
    .filter((item) => item.imageUrl.length > 0);
}
