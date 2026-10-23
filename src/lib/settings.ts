import { prisma } from "@/lib/prisma";

export const DEFAULT_SITE_TITLE = "Portal Notícia";

/** Título do site (editável em /admin/settings). Nunca quebra a página:
 * se o banco falhar ou a chave não existir, cai no título padrão. */
export async function getSiteTitle(): Promise<string> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "siteTitle" },
    });
    return row?.value.trim() || DEFAULT_SITE_TITLE;
  } catch {
    return DEFAULT_SITE_TITLE;
  }
}
