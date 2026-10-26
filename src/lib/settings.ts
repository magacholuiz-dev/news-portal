import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_TITLE = "Portal Notícia";
// Cores de fundo da abertura: seção 1 (primeira frase) e seção 2 (segunda).
export const DEFAULT_HERO_COLOR_1 = "#2b2b2b"; // preto (identidade visual)
export const DEFAULT_HERO_COLOR_2 = "#eb6a4b"; // laranja (identidade visual)
export const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export type SiteSettings = {
  siteTitle: string;
  heroTrailerUrl: string; // trailer da série (abertura)
  closingQuoteText: string; // máxima antes do fechamento
  closingQuoteAuthor: string;
  heroColor1: string;
  heroColor2: string;
  faviconUrl: string; // ícone da aba do navegador (vazio = ícone padrão)
};

const KEYS: (keyof SiteSettings)[] = [
  "siteTitle",
  "heroTrailerUrl",
  "closingQuoteText",
  "closingQuoteAuthor",
  "heroColor1",
  "heroColor2",
  "faviconUrl",
];

/** Configurações editáveis em /admin/settings. Nunca quebra a página: se o
 * banco falhar, cai nos padrões. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const result: SiteSettings = {
    siteTitle: DEFAULT_SITE_TITLE,
    heroTrailerUrl: "",
    closingQuoteText: "",
    closingQuoteAuthor: "",
    heroColor1: DEFAULT_HERO_COLOR_1,
    heroColor2: DEFAULT_HERO_COLOR_2,
    faviconUrl: "",
  };
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: KEYS } },
    });
    for (const row of rows) {
      const key = row.key as keyof SiteSettings;
      const value = row.value.trim();
      if (value) result[key] = value;
    }
  } catch {
    // mantém os padrões
  }
  return result;
}

export async function getSiteTitle(): Promise<string> {
  return (await getSiteSettings()).siteTitle;
}

export const SETTING_KEYS = KEYS;
