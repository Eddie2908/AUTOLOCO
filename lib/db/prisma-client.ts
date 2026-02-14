/**
 * Configuration Prisma Client Singleton pour SQL Server
 * =====================================================
 *
 * Ce fichier configure une instance unique de Prisma Client
 * pour éviter les connexions multiples en développement (hot reload).
 *
 * Optimisé pour SQL Server avec:
 * - Connection pooling automatique
 * - Logging configurable
 * - Gestion des erreurs
 * - Métriques de performance
 */

import { PrismaClient } from "@prisma/client"

// Types pour la configuration
type LogLevel = "query" | "info" | "warn" | "error"
type LogDefinition = {
  level: LogLevel
  emit: "stdout" | "event"
}

/**
 * Checks whether the DATABASE_URL environment variable is available.
 * When it is missing Prisma cannot initialise, so we guard early to
 * prevent hard crashes and let API routes fall back gracefully.
 */
const isDatabaseConfigured = (): boolean => {
  return Boolean(process.env.DATABASE_URL)
}

// Configuration des logs selon l'environnement
const getLogConfig = (): LogDefinition[] => {
  if (process.env.NODE_ENV === "development") {
    return [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ]
  }
  return [
    { level: "error", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ]
}

// Configuration Prisma Client
const prismaClientSingleton = (): PrismaClient | null => {
  if (!isDatabaseConfigured()) {
    console.warn(
      "[prisma-client] DATABASE_URL is not set. " +
        "Database operations will be unavailable. " +
        "Set the DATABASE_URL environment variable to connect to SQL Server."
    )
    return null
  }

  const client = new PrismaClient({
    log: getLogConfig(),
    errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
  })

  // Logging des requêtes en développement (optionnel)
  if (process.env.NODE_ENV === "development" && process.env.DEBUG_PRISMA === "true") {
    client.$on("query" as never, (e: { query: string; params: string; duration: number }) => {
      console.log("Query:", e.query)
      console.log("Params:", e.params)
      console.log("Duration:", `${e.duration}ms`)
      console.log("---")
    })
  }

  return client
}

// Déclaration globale pour le singleton
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined
} & typeof global

// Instance singleton – may be null when DATABASE_URL is absent
const prismaInstance = globalThis.prismaGlobal ?? prismaClientSingleton()

// Préserver le singleton en développement
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prismaInstance
}

/**
 * Proxy that makes every property access on `prisma` throw a clear,
 * catchable error when the database is not configured, instead of
 * crashing with a PrismaClientInitializationError.
 */
const prisma: PrismaClient =
  prismaInstance ??
  (new Proxy({} as PrismaClient, {
    get(_target, prop) {
      // Allow certain internal property checks to pass without throwing
      if (typeof prop === "symbol" || prop === "then" || prop === "toJSON") {
        return undefined
      }
      throw new Error(
        `[prisma-client] Database is not configured (DATABASE_URL missing). ` +
          `Cannot access prisma.${String(prop)}.`
      )
    },
  }) as unknown as PrismaClient)

export { prisma }
export default prisma
