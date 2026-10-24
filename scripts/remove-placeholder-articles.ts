/**
 * Remove as matérias de EXEMPLO que o seed antigo gerou (texto "Reportagem
 * de exemplo — conteúdo placeholder"). Só considera matérias em RASCUNHO e
 * mostra a lista antes de apagar, pedindo confirmação. Os territórios
 * (pontos, cobertura, acesso, risco) NÃO são tocados — só as matérias.
 *
 * Uso: npx tsx scripts/remove-placeholder-articles.ts
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const candidates = await prisma.article.findMany({
    where: {
      published: false,
      contentHtml: { contains: "Reportagem de exemplo — conteúdo placeholder" },
    },
    select: { id: true, title: true, location: { select: { name: true } } },
    orderBy: { id: "asc" },
  });

  if (candidates.length === 0) {
    console.log("Nenhuma matéria de exemplo (em rascunho) encontrada.");
    return;
  }

  console.log(`Matérias de exemplo em rascunho (${candidates.length}):`);
  for (const a of candidates) {
    console.log(`  #${a.id}  ${a.title}  [${a.location?.name ?? "sem ponto"}]`);
  }
  console.log("\nOs territórios/pontos NÃO serão apagados, só essas matérias.");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question("Apagar essas matérias? (digite sim): ")).trim();
  rl.close();
  if (answer.toLowerCase() !== "sim") {
    console.log("Cancelado. Nada foi apagado.");
    return;
  }

  const result = await prisma.article.deleteMany({
    where: { id: { in: candidates.map((a) => a.id) } },
  });
  console.log(`Apagadas ${result.count} matérias.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
