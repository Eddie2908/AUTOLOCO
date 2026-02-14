import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

// -- In-memory cache for admin dashboard metrics (TTL = 2 min) ---------------
const CACHE_TTL_MS = 2 * 60 * 1000
let metricsCache: { data: unknown; timestamp: number } | null = null

function getCachedMetrics() {
  if (metricsCache && Date.now() - metricsCache.timestamp < CACHE_TTL_MS) {
    return metricsCache.data
  }
  return null
}

function setCachedMetrics(data: unknown) {
  metricsCache = { data, timestamp: Date.now() }
}
// ---------------------------------------------------------------------------

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

function isAdminType(typeUtilisateur: string | null | undefined) {
  return (typeUtilisateur || "").toLowerCase().includes("admin")
}

function timeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `Il y a ${diffD}j`
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

    const admin = await prisma.user.findUnique({
      where: { id: localUserId },
      select: { id: true, TypeUtilisateur: true },
    })

    if (!admin || !isAdminType(admin.TypeUtilisateur)) {
      return NextResponse.json({ error: "Acces non autorise" }, { status: 403 })
    }

    // Return cached metrics if still fresh (avoids 10 parallel DB queries)
    const cached = getCachedMetrics()
    if (cached) {
      return NextResponse.json(cached)
    }

    // Recent activities: latest users, reservations, vehicles
    const [recentUsers, recentReservations, recentVehicles, pendingVehicles, totalActiveVehicles, totalVehicles, totalVerifiedUsers, totalUsers, avgRating, totalReviews] = await Promise.all([
      prisma.user.findMany({
        orderBy: { DateInscription: "desc" },
        take: 2,
        select: { Prenom: true, Nom: true, DateInscription: true, TypeUtilisateur: true },
      }),
      prisma.reservation.findMany({
        orderBy: { DateCreationReservation: "desc" },
        take: 2,
        select: {
          MontantTotal: true,
          DateCreationReservation: true,
          StatutReservation: true,
          locataire: { select: { Prenom: true, Nom: true } },
        },
      }),
      prisma.vehicle.findMany({
        orderBy: { DateCreation: "desc" },
        take: 2,
        select: {
          TitreAnnonce: true,
          DateCreation: true,
          StatutVerification: true,
          proprietaire: { select: { Prenom: true, Nom: true } },
        },
      }),
      // Moderation queue: pending vehicles
      prisma.vehicle.findMany({
        where: { StatutVerification: "EnAttente" },
        orderBy: { DateCreation: "desc" },
        take: 5,
        select: {
          id: true,
          TitreAnnonce: true,
          DateCreation: true,
          proprietaire: { select: { Prenom: true, Nom: true } },
        },
      }),
      // Metrics
      prisma.vehicle.count({ where: { StatutVehicule: "Actif" } }),
      prisma.vehicle.count(),
      prisma.user.count({ where: { EmailVerifie: true } }),
      prisma.user.count(),
      prisma.vehicle.aggregate({
        _avg: { NotesVehicule: true },
        where: { NotesVehicule: { gt: 0 } },
      }),
      prisma.avis.count({ where: { StatutAvis: "Publie" } }),
    ])

    // Build recent activities
    const activities: any[] = []

    for (const u of recentUsers) {
      activities.push({
        id: `user-${u.Prenom}-${u.DateInscription?.getTime()}`,
        type: "new_user",
        user: `${u.Prenom || ""} ${u.Nom || ""}`.trim() || "Utilisateur",
        action: "Nouvelle inscription",
        status: "pending",
        time: timeAgo(u.DateInscription || new Date()),
        date: u.DateInscription || new Date(),
      })
    }

    for (const r of recentReservations) {
      const amount = Number(r.MontantTotal || 0)
      const userName = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Client"
      const isSuccess = (r.StatutReservation || "").toLowerCase().includes("confirm")
      activities.push({
        id: `res-${userName}-${r.DateCreationReservation?.getTime()}`,
        type: "payment",
        user: userName,
        action: `Réservation ${amount > 0 ? amount.toLocaleString("fr-FR") + " FCFA" : ""}`,
        status: isSuccess ? "success" : "pending",
        time: timeAgo(r.DateCreationReservation || new Date()),
        date: r.DateCreationReservation || new Date(),
      })
    }

    for (const v of recentVehicles) {
      const ownerName = `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
      activities.push({
        id: `veh-${ownerName}-${v.DateCreation?.getTime()}`,
        type: "vehicle",
        user: ownerName,
        action: `Nouveau véhicule: ${v.TitreAnnonce}`,
        status: v.StatutVerification === "EnAttente" ? "review" : "success",
        time: timeAgo(v.DateCreation || new Date()),
        date: v.DateCreation || new Date(),
      })
    }

    // Sort by date desc and take top 4
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const recentActivities = activities.slice(0, 4).map(({ date, ...rest }) => rest)

    // Build moderation queue
    const moderationQueue = pendingVehicles.map((v) => ({
      id: `VEH-${String(v.id).padStart(3, "0")}`,
      type: "vehicle" as const,
      title: v.TitreAnnonce,
      owner: `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Propriétaire",
      reason: "Vérification documents",
      priority: "medium" as const,
    }))

    // Build top metrics
    const activeVehiclesPct = totalVehicles > 0 ? Math.round((totalActiveVehicles / totalVehicles) * 100) : 0
    const verifiedUsersPct = totalUsers > 0 ? Math.round((totalVerifiedUsers / totalUsers) * 100) : 0
    const avgRatingValue = Math.round(Number(avgRating._avg.NotesVehicule || 0) * 10) / 10
    const satisfactionPct = avgRatingValue > 0 ? Math.round((avgRatingValue / 5) * 100) : 0

    const topMetrics = [
      {
        label: "Véhicules actifs",
        value: totalActiveVehicles.toLocaleString("fr-FR"),
        total: `${totalVehicles.toLocaleString("fr-FR")} total`,
        percentage: activeVehiclesPct,
      },
      {
        label: "Utilisateurs vérifiés",
        value: totalVerifiedUsers.toLocaleString("fr-FR"),
        total: `${totalUsers.toLocaleString("fr-FR")} total`,
        percentage: verifiedUsersPct,
      },
      {
        label: "Taux de satisfaction",
        value: avgRatingValue > 0 ? `${avgRatingValue}/5` : "N/A",
        total: `${totalReviews.toLocaleString("fr-FR")} avis`,
        percentage: satisfactionPct,
      },
    ]

    const result = { recentActivities, moderationQueue, topMetrics }
    setCachedMetrics(result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Admin dashboard error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
