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

function mapBookingUiStatus(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("attente") || v.includes("pending")) return "pending" as const
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  if (v.includes("litig") || v.includes("disput")) return "dispute" as const
  if (v.includes("confirm") || v.includes("valid")) return "confirmed" as const
  return "confirmed" as const
}

function isLikelyPaidStatus(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  return v.includes("pay") || v.includes("paid") || v.includes("succ") || v.includes("reuss") || v.includes("valid")
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

    // -- Use Prisma aggregate for totals instead of loading all rows in JS ---
    const [vehicles, recentReservations, monthAgg, vehicleRatingAgg] = await Promise.all([
      prisma.vehicle.findMany({
        where: { proprietaireId: localUserId },
        select: {
          id: true,
          TitreAnnonce: true,
          NotesVehicule: true,
          NombreVues: true,
        },
      }),
      // Only fetch the most recent 10 for the UI list (not all)
      prisma.reservation.findMany({
        where: { proprietaireId: localUserId },
        orderBy: { DateCreationReservation: "desc" },
        take: 10,
        select: {
          id: true,
          NumeroReservation: true,
          DateDebut: true,
          DateFin: true,
          MontantTotal: true,
          StatutReservation: true,
          vehicule: {
            select: {
              id: true,
              TitreAnnonce: true,
            },
          },
          locataire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
          transactions: {
            take: 1,
            orderBy: { DateTransaction: "desc" },
            select: { MontantNet: true, FraisCommission: true, StatutTransaction: true, DateTransaction: true },
          },
        },
      }),
      // Aggregate: count + sum for the current month (avoids loading all rows)
      prisma.reservation.aggregate({
        where: {
          proprietaireId: localUserId,
          DateDebut: { lte: monthEnd },
          DateFin: { gte: monthStart },
        },
        _count: { id: true },
        _sum: { MontantTotal: true },
      }),
      // Aggregate: average rating across owner's vehicles (avoids JS reduce)
      prisma.vehicle.aggregate({
        where: { proprietaireId: localUserId, NotesVehicule: { gt: 0 } },
        _avg: { NotesVehicule: true },
      }),
    ])

    const monthRevenue = Math.round(Number(monthAgg._sum.MontantTotal || 0))
    const monthBookings = monthAgg._count.id

    const monthDays = Math.max(1, Math.round((monthEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)) + 1)
    const vehicleCount = Math.max(1, vehicles.length)

    // Occupancy: still need to iterate the recent bookings that overlap the month
    const monthReservations = recentReservations.filter((r) => r.DateDebut <= monthEnd && r.DateFin >= monthStart)
    const occupiedVehicleDays = monthReservations.reduce((sum, r) => {
      const start = r.DateDebut < monthStart ? monthStart : r.DateDebut
      const end = r.DateFin > monthEnd ? monthEnd : r.DateFin
      const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)
      return sum + days
    }, 0)

    const occupancyRate = Math.round((occupiedVehicleDays / (vehicleCount * monthDays)) * 100)

    const avgRating = Math.round(Number(vehicleRatingAgg._avg.NotesVehicule || 0) * 10) / 10

    const stats = {
      monthRevenue: Math.round(monthRevenue),
      monthBookings,
      occupancyRate: Number.isFinite(occupancyRate) ? occupancyRate : 0,
      avgRating,
    }

    const recentBookings = recentReservations.slice(0, 3).map((r) => {
      const locataireName = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Client"
      const start = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(r.DateDebut)
      const end = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(r.DateFin)

      return {
        id: r.NumeroReservation || String(r.id),
        vehicle: r.vehicule?.TitreAnnonce || "Véhicule",
        client: locataireName,
        clientImage: r.locataire?.PhotoProfil || "/placeholder-user.jpg",
        dates: `${start} - ${end}`,
        amount: `${Number(r.MontantTotal || 0).toLocaleString("fr-FR")} FCFA`,
        status: mapBookingUiStatus(r.StatutReservation),
      }
    })

    const vehiclePerformance = vehicles
      .map((v) => {
        const vReservations = monthReservations.filter((r) => r.vehicule?.id === v.id)
        const bookings = vReservations.length
        const revenue = vReservations.reduce((sum, r) => {
          const tx = r.transactions[0]
          if (!isLikelyPaidStatus(tx?.StatutTransaction)) return sum
          const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Number(r.MontantTotal || 0)
          return sum + net
        }, 0)

        const vOccupiedDays = vReservations.reduce((sum, r) => {
          const start = r.DateDebut < monthStart ? monthStart : r.DateDebut
          const end = r.DateFin > monthEnd ? monthEnd : r.DateFin
          const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)
          return sum + days
        }, 0)

        const occupancy = Math.round((vOccupiedDays / monthDays) * 100)

        return {
          name: v.TitreAnnonce,
          bookings,
          revenue: Math.round(revenue),
          rating: Math.round(Number(v.NotesVehicule || 0) * 10) / 10,
          views: Number(v.NombreVues || 0),
          occupancy: Number.isFinite(occupancy) ? occupancy : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)

    const performanceTips = (() => {
      const tips: Array<{ icon: string; title: string; description: string; color: string; bg: string }> = []

      if (stats.occupancyRate >= 70) {
        tips.push({
          icon: "trending_up",
          title: "Optimisez vos prix",
          description: "Votre taux d'occupation est élevé : vous pouvez tester une légère hausse",
          color: "text-green-500",
          bg: "bg-green-500/10",
        })
      } else {
        tips.push({
          icon: "eye",
          title: "Améliorez votre visibilité",
          description: "Ajoutez des photos récentes et une description détaillée pour augmenter les vues",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        })
      }

      if (stats.avgRating > 0 && stats.avgRating < 4.5) {
        tips.push({
          icon: "star",
          title: "Améliorez l'expérience",
          description: "Un meilleur service augmente vos avis et vos réservations",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        })
      } else {
        tips.push({
          icon: "star",
          title: "Maintenez votre qualité",
          description: "Votre note est bonne : continuez à répondre vite et à entretenir vos véhicules",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        })
      }

      tips.push({
        icon: "clock",
        title: "Répondez rapidement",
        description: "Répondre vite aux demandes augmente le taux de conversion",
        color: "text-primary",
        bg: "bg-primary/10",
      })

      return tips.slice(0, 3)
    })()

    const quickActions = [
      { icon: "plus", label: "Ajouter un véhicule", href: "/dashboard/vehicles/new", color: "bg-primary" },
      { icon: "calendar", label: "Gérer le calendrier", href: "/dashboard/owner/calendar", color: "bg-blue-500" },
      { icon: "users", label: "Voir les clients", href: "/dashboard/owner/clients", color: "bg-green-500" },
      { icon: "dollar_sign", label: "Paiements", href: "/dashboard/owner/payments", color: "bg-amber-500" },
    ]

    return NextResponse.json({ stats, recentBookings, vehiclePerformance, performanceTips, quickActions })
  } catch (error) {
    console.error("[API] Owner overview error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
