/**
 * Atualização pontual e NÃO destrutiva: só faz UPDATE de accessCategory/
 * riskLevelRSF nos 14 Locations que já existem no banco (criados pelo
 * seed-territories.ts) — não apaga nem recria nada. Dados vêm da aba
 * gid=3804457 da planilha (Status_Carimbo / Nivel_Risco_RSF).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const UPDATES: { name: string; accessCategory: string; riskLevelRSF: string }[] = [
  { name: "Kiev, Ucrânia", accessCategory: "Visto Concedido", riskLevelRSF: "Muito Alto" },
  { name: "Cidade de Gaza", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Jerusalém, Israel", accessCategory: "Visto Concedido", riskLevelRSF: "Alto" },
  { name: "Teerã, Irã", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Beirute, Líbano", accessCategory: "Zona de Risco", riskLevelRSF: "Alto" },
  { name: "Naypyidaw, Mianmar", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Damasco, Síria", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Saná, Iêmen", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Ramallah, Cisjordânia", accessCategory: "Zona de Risco", riskLevelRSF: "Muito Alto" },
  { name: "Cartum, Sudão", accessCategory: "Entrada Barrada", riskLevelRSF: "Crítico" },
  { name: "Trípoli, Líbia", accessCategory: "Zona de Risco", riskLevelRSF: "Muito Alto" },
  { name: "Havana, Cuba", accessCategory: "Visto Condicionado", riskLevelRSF: "Alto" },
  { name: "Cidade do México, México", accessCategory: "Zona de Risco", riskLevelRSF: "Muito Alto" },
  { name: "Port Moresby, Papua-Nova Guiné", accessCategory: "Entrada Barrada", riskLevelRSF: "Médio / Alto" },
];

async function main() {
  for (const u of UPDATES) {
    const slug = slugify(u.name);
    const result = await prisma.location.updateMany({
      where: { slug },
      data: { accessCategory: u.accessCategory, riskLevelRSF: u.riskLevelRSF },
    });
    console.log(
      result.count > 0
        ? `Atualizado: ${u.name} -> ${u.accessCategory} / ${u.riskLevelRSF}`
        : `AVISO: nenhum Location encontrado pro slug "${slug}" (${u.name})`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
