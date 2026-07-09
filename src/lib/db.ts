import { PrismaClient } from '@prisma/client'

// Fallback explícito si la variable de entorno no se carga
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Vp9DK2ZlBYdF@ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
