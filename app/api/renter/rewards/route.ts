import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

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

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [user, pointsHistory] = await Promise.all([
      prisma.user.findUnique({
        where: { id: localUserId },
        select: { PointsFideliteTotal: true },
      }),
      prisma.pointFidelite.findMany({
        where: { utilisateurId: localUserId },
        orderBy: { DateAcquisition: "desc" },
        take: 50,
        select: { Description: true, PointsAcquis: true, DateAcquisition: true, TypeAcquisition: true },
      }),
    ])

    const userPoints = Number(user?.PointsFideliteTotal || 0)

    const pointsThisMonth = pointsHistory
      .filter((p) => {
        if (!p.DateAcquisition) return false
        const d = new Date(p.DateAcquisition)
        return d >= monthStart && d <= monthEnd
      })
      .reduce((sum, p) => sum + Number(p.PointsAcquis || 0), 0)

    const recentActivity = pointsHistory.map((p) => {
      const date = (p.DateAcquisition ? new Date(p.DateAcquisition) : new Date()).toISOString().slice(0, 10)
      const action = p.Description || p.TypeAcquisition || "Points fidélité"
      return {
        action,
        points: Number(p.PointsAcquis || 0),
        date,
      }
    })

    return NextResponse.json({
      userPoints,
      pointsThisMonth,
      recentActivity,
    })
  } catch (error) {
    console.error("[API] Renter rewards error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
