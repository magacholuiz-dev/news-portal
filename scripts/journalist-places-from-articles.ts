/**
 * Preenche os "lugares" (JournalistPlace) dos jornalistas que vieram de
 * matérias da categoria "Jornalista", usando o ponto do mapa da matéria.
 * Só INSERT (pula quem já tem lugares). Sem --apply apenas simula.
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const apply = process.argv.includes("--apply");
  const articles = await prisma.article.findMany({
    where: { category: "Jornalista", published: true, locationId: { not: null } },
    include: { location: true },
    orderBy: { id: "asc" },
  });
  for (const a of articles) {
    const j = await prisma.journalist.findUnique({
      where: { slug: slugify(a.title) },
      include: { places: true },
    });
    if (!j || j.places.length > 0 || !a.locationId) {
      console.log(`pula   ${a.title}`);
      continue;
    }
    console.log(`${apply ? "grava " : "gravaria"} ${j.name} -> ${a.location?.name}`);
    if (apply) {
      await prisma.journalistPlace.create({
        data: { journalistId: j.id, locationId: a.locationId, label: a.location?.name },
      });
      await prisma.journalist.update({ where: { id: j.id }, data: { conflictsCovered: null } });
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
