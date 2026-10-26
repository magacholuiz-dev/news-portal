/**
 * Remove a Oceania (Papua-Nova Guiné) do banco: os pontos do mapa dela e
 * tudo que depende deles (matérias ligadas ao ponto, falas, fotos em campo
 * e os vínculos de jornalistas ficam por cascata/SetNull do schema).
 * Mostra a lista e pede confirmação antes de apagar. Sem --apply ou sim,
 * nada é apagado.
 *
 * Uso: npx tsx scripts/remove-oceania.ts
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { continent: "Oceania" },
        { name: { contains: "Papua", mode: "insensitive" } },
        { name: { contains: "Moresby", mode: "insensitive" } },
      ],
    },
    include: {
      articles: { select: { id: true, title: true, published: true } },
      quotes: { select: { id: true, kind: true } },
      fieldPhotos: { select: { id: true } },
      journalistPlaces: { select: { journalistId: true } },
    },
    orderBy: { id: "asc" },
  });

  if (locations.length === 0) {
    console.log("Nenhum ponto da Oceania/Papua-Nova Guiné encontrado. Nada a fazer.");
    return;
  }

  for (const l of locations) {
    console.log(`\nPonto #${l.id} — ${l.name} (continente: ${l.continent ?? "—"})`);
    for (const a of l.articles)
      console.log(`  matéria #${a.id} "${a.title}" ${a.published ? "(publicada)" : "(rascunho)"} -> será APAGADA`);
    console.log(`  falas: ${l.quotes.length} | fotos em campo: ${l.fieldPhotos.length} | jornalistas com este lugar: ${l.journalistPlaces.length}`);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("\nApagar esses pontos e o que depende deles? (digite sim): ")).trim();
  rl.close();
  if (answer.toLowerCase() !== "sim") {
    console.log("Cancelado. Nada foi apagado.");
    return;
  }

  const ids = locations.map((l) => l.id);
  // Matérias ligadas ao ponto saem junto (Article.locationId é SetNull).
  // Falas e fotos em campo do ponto também; JournalistPlace cai por cascata.
  await prisma.$transaction([
    prisma.article.deleteMany({ where: { locationId: { in: ids } } }),
    prisma.quote.deleteMany({ where: { locationId: { in: ids } } }),
    prisma.fieldPhoto.deleteMany({ where: { locationId: { in: ids } } }),
    prisma.location.deleteMany({ where: { id: { in: ids } } }),
  ]);
  console.log(`Apagados ${ids.length} ponto(s) e o conteúdo ligado a eles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
