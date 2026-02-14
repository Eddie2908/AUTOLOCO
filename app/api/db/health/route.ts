/**
 * API Route: Health Check Base de Données
 * ========================================
 *
 * GET /api/db/health
 *
 * Vérifie l'état de la connexion à SQL Server
 * et retourne des métriques de santé.
 */

import { NextResponse } from "next/server"
import { checkDatabaseConnection, getDatabaseStats } from "@/lib/db/connection"

export async function GET() {
  try {
    // Vérifier la connexion
    const connectionStatus = await checkDatabaseConnection()

    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          error: connectionStatus.error,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      )
    }

    // Récupérer les statistiques
    const stats = await getDatabaseStats()

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      version: connectionStatus.version,
      latency: `${connectionStatus.latency}ms`,
      stats: {
        tables: stats.tables,
        size: stats.databaseSize,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "unknown",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
