import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_TITLE = "Portal Notícia";

export type SiteSettings = {
  siteTitle: string;
  heroTrailerUrl: string; // trailer da série (abertura)
  closingQuoteText: string; // máxima antes do fechamento
  closingQuoteAuthor: string;
};

const KEYS: (keyof SiteSettings)[] = [
  "siteTitle",
  "heroTrailerUrl",
  "closingQuoteText",
  "closingQuoteAuthor",
];

/** Configurações editáveis em /admin/settings. Nunca quebra a página: se o
 * banco falhar, cai nos padrões. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const result: SiteSettings = {
    siteTitle: DEFAULT_SITE_TITLE,
    heroTrailerUrl: "",
    closingQuoteText: "",
    closingQuoteAuthor: "",
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
