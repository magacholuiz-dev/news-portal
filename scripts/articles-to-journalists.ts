/**
 * Cria registros em Jornalistas a partir das matérias com categoria
 * "Jornalista". NÃO destrutivo: só INSERT (pula quem já existe pelo slug) e
 * não mexe nas matérias. Sem --apply apenas mostra o que seria criado.
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

async function main() {
  const apply = process.argv.includes("--apply");
  const articles = await prisma.article.findMany({
    where: { category: "Jornalista", published: true },
    include: { location: true },
    orderBy: { id: "asc" },
  });

  let order = 0;
  for (const a of articles) {
    const slug = slugify(a.title);
    const exists = await prisma.journalist.findUnique({ where: { slug } });
    const data = {
      name: a.title,
      slug,
      role: a.subtitle?.trim() || "Jornalista",
      photoUrl: a.heroImageUrl,
      bio: a.excerpt?.trim() || stripHtml(a.contentHtml) || null,
      conflictsCovered: a.location?.name ?? null,
      displayOrder: order++,
      published: a.published,
    };
    console.log(
      `${exists ? "JÁ EXISTE" : apply ? "CRIANDO " : "criaria  "} #${a.id} ${data.name} | ${data.role} | ${data.conflictsCovered ?? "(sem local)"}`,
    );
    if (!exists && apply) await prisma.journalist.create({ data });
  }
  if (!apply) console.log("\n(simulação — rode com --apply para gravar)");
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
