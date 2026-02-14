/**
 * Utilitaires de Connexion Base de Données
 * =========================================
 *
 * Fonctions pour vérifier, tester et gérer
 * la connexion à SQL Server.
 */

import { prisma } from "./prisma-client"

/**
 * Vérifie si la connexion à la base de données est active
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean
  latency?: number
  version?: string
  error?: string
}> {
  const start = Date.now()

  try {
    // Requête simple pour tester la connexion
    const result = await prisma.$queryRaw<[{ version: string }]>`SELECT @@VERSION as version`
    const latency = Date.now() - start

    return {
      connected: true,
      latency,
      version: result[0]?.version?.split("\n")[0] || "Unknown",
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Récupère les statistiques de la base de données
 */
export async function getDatabaseStats(): Promise<{
  tables: number
  totalRows: number
  databaseSize: string
}> {
  try {
    // Compte le nombre de tables
    const tablesResult = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `

    // Taille de la base de données
    const sizeResult = await prisma.$queryRaw<[{ size: string }]>`
      SELECT 
        CAST(SUM(size * 8.0 / 1024) AS DECIMAL(10,2)) as size
      FROM sys.database_files
    `

    return {
      tables: Number(tablesResult[0]?.count) || 0,
      totalRows: 0, // Calculé séparément si nécessaire
      databaseSize: `${sizeResult[0]?.size || 0} MB`,
    }
  } catch {
    return {
      tables: 0,
      totalRows: 0,
      databaseSize: "N/A",
    }
  }
}

/**
 * Ferme proprement la connexion Prisma
 * À utiliser lors de l'arrêt de l'application
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Exécute une transaction avec retry automatique
 */
export async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Ne pas réessayer pour certaines erreurs
      if (lastError.message.includes("unique constraint")) {
        throw lastError
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
      }
    }
  }

  throw lastError
}
