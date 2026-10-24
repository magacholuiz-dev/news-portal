import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// Usa o driver `pg` diretamente (adapter) em vez do binário nativo do
// query engine — necessário porque o binário Rust não roda de forma
// confiável no runtime serverless da Vercel.
//
// Conexões: o Prisma Postgres limita conexões por usuário. Na Vercel a
// instância é SUSPENSA entre requisições, então o timer de "fechar conexão
// ociosa" do pool nunca rodava e as conexões ficavam presas (45+ ociosas,
// as mais velhas com 10 min) até estourar o limite — a home passava a
// responder 500 ("too many connections"). `attachDatabasePool` fecha as
// conexões ociosas antes da suspensão; max baixo limita o resto.
const pool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });

if (!globalForPrisma.pgPool) {
  attachDatabasePool(pool);
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

// Em dev (HMR) reaproveita; em produção o módulo é avaliado uma vez por
// instância, mas guardar no global também evita pool duplicado se o
// bundler avaliar este módulo mais de uma vez.
globalForPrisma.pgPool = pool;
globalForPrisma.prisma = prisma;
