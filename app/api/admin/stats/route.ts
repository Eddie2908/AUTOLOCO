import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

function isLikelyPaidStatus(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  return v.includes("pay") || v.includes("paid") || v.includes("succ") || v.includes("reuss") || v.includes("valid")
}

async function computeAdminStatsFromDb() {
  type TransactionRow = {
    Montant: unknown
    FraisCommission: unknown
    StatutTransaction: string | null
  }

  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [totalUsers, totalVehicles, totalBookings, newUsersWeek, newBookingsWeek, transactions] =
    await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.reservation.count(),
      prisma.user.count({ where: { DateInscription: { gte: weekAgo } } }),
      prisma.reservation.count({ where: { DateCreationReservation: { gte: weekAgo } } }),
      prisma.transaction.findMany({
        select: { Montant: true, FraisCommission: true, StatutTransaction: true },
      }),
    ])

  const typedTransactions = transactions as TransactionRow[]

  const totalRevenue = typedTransactions
    .filter((t: TransactionRow) => isLikelyPaidStatus(t.StatutTransaction))
    .reduce((sum: number, t: TransactionRow) => sum + Number(t.Montant || 0), 0)

  const platformCommission = typedTransactions
    .filter((t: TransactionRow) => isLikelyPaidStatus(t.StatutTransaction))
    .reduce((sum: number, t: TransactionRow) => sum + Number(t.FraisCommission || 0), 0)

  return {
    total_users: totalUsers,
    total_vehicles: totalVehicles,
    total_bookings: totalBookings,
    total_revenue: Math.round(totalRevenue),
    new_users_week: newUsersWeek,
    new_bookings_week: newBookingsWeek,
    platform_commission: Math.round(platformCommission),
  }
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
    if (localUserId) {
      const user = await prisma.user.findUnique({
        where: { id: localUserId },
        select: { id: true, TypeUtilisateur: true },
      })

      if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 })
      }

      const isAdmin = (user.TypeUtilisateur || "").toLowerCase().includes("admin")
      if (!isAdmin) {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
      }

      const stats = await computeAdminStatsFromDb()
      return NextResponse.json(stats)
    }

    const currentUser = token.startsWith("demo_") ? null : await getCurrentUserFromBackend(token)
    const userRole = (currentUser?.type as string) || cookieStore.get("autoloco_user_role")?.value

    if (userRole !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const response = await backendApi.getAdminDashboardStats(token)

    if (response.error) {
      try {
        const stats = await computeAdminStatsFromDb()
        return NextResponse.json(stats)
      } catch (dbError) {
        console.error("[API] Admin stats fallback DB error:", dbError)
        return NextResponse.json(
          { error: "Service indisponible" },
          {
            status: 503,
          },
        )
      }
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Admin stats error:", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
