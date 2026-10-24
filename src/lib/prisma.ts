import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usa o driver `pg` diretamente (adapter) em vez do binário nativo do
// query engine — necessário porque o binário Rust não roda de forma
// confiável no runtime serverless da Vercel.
//
// Pool pequeno por instância: o Prisma Postgres limita as conexões por
// usuário, e cada instância serverless abre até 10 por padrão (o padrão do
// `pg`). Com várias instâncias e deploys isso estourava o limite e a home
// passava a responder 500 ("too many connections"). Poucas conexões por
// instância + fechamento rápido das ociosas evita isso.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 5_000,
  connectionTimeoutMillis: 10_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
