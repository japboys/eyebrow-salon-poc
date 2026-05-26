import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const BUNDLE_DB = path.join(process.cwd(), 'Db/prisma/dev.db')
const TMP_DB = '/tmp/poc.db'

function getRuntimeUrl(): string {
  if (process.env.VERCEL) {
    // On Vercel serverless: copy bundled read-only db to /tmp for write access
    if (!fs.existsSync(TMP_DB)) {
      fs.copyFileSync(BUNDLE_DB, TMP_DB)
    }
    return `file:${TMP_DB}`
  }
  return process.env.DATABASE_URL ?? `file:${BUNDLE_DB}`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getRuntimeUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

globalForPrisma.prisma = prisma
