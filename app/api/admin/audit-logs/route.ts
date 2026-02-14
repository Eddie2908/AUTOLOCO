/**
 * Admin Audit Logs API
 * ====================
 * 
 * Permet aux administrateurs de consulter les logs d'audit.
 * Accessible uniquement aux admins.
 */



import { NextResponse } from "next/server"
import { auditLogger } from "@/lib/security/audit-log"
import { applyRateLimit } from "@/lib/security/rate-limiter"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    const token = headerToken || cookieToken


    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const currentUser = token.startsWith("demo_") ? null : await getCurrentUserFromBackend(token)
    const userId = currentUser?.id || "demo-user"
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value

    // Vérifier que l'utilisateur est admin
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Rate limiting
    const rateLimitResult = await applyRateLimit(req, "API", userId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers }
      )
    }

    const { searchParams } = new URL(req.url)
    const count = Number.parseInt(searchParams.get("count") || "100")
    const filterUserId = searchParams.get("userId") || undefined
    const action = searchParams.get("action") || undefined

    // Récupérer les logs
    let logs = auditLogger.getRecentLogs(Math.min(count, 1000)) // Max 1000

    // Filtrer si nécessaire
    if (filterUserId || action) {
      logs = auditLogger.filterLogs({
        userId: filterUserId,
        action: action as any,
      })
    }

    const responseObj = NextResponse.json({
      logs,
      total: logs.length,
    })

    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
