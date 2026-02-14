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

function isAdminType(typeUtilisateur: string | null | undefined) {
  return (typeUtilisateur || "").toLowerCase().includes("admin")
}

function monthLabelFr(monthIndex: number) {
  const labels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
  return labels[monthIndex] || ""
}

function startDateFromPeriod(period: string | null) {
  const now = new Date()
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === "year") {
    const d = new Date(now)
    d.setFullYear(now.getFullYear() - 1)
    return d
  }
  if (period === "all") return null
  // default month
  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
}

function isSuccessfulTransaction(statut: string | null | undefined) {
  const s = (statut || "").toLowerCase()
  if (!s) return true
  if (s.includes("annul") || s.includes("echec") || s.includes("éch") || s.includes("fail")) return false
  if (s.includes("attente") || s.includes("pending")) return false
  return true
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
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period")
    const startDate = startDateFromPeriod(period)

    const [txs, reservations, users, vehiclesAgg] = await Promise.all([
      prisma.transaction.findMany({
        where: startDate ? { DateTransaction: { gte: startDate } } : undefined,
        select: {
          Montant: true,
          MontantNet: true,
          StatutTransaction: true,
          DateTransaction: true,
          reservationId: true,
        },
        orderBy: { DateTransaction: "asc" },
        take: 20000,
      }),
      prisma.reservation.findMany({
        where: startDate ? { DateCreationReservation: { gte: startDate } } : undefined,
        select: {
          id: true,
          MontantTotal: true,
          DateCreationReservation: true,
          vehiculeId: true,
          vehicule: {
            select: {
              TitreAnnonce: true,
              LocalisationVille: true,
              modele: { select: { NomModele: true, marque: { select: { NomMarque: true } } } },
            },
          },
        },
        orderBy: { DateCreationReservation: "asc" },
        take: 20000,
      }),
      prisma.user.findMany({
        where: startDate ? { DateInscription: { gte: startDate } } : undefined,
        select: { id: true, DateInscription: true },
        orderBy: { DateInscription: "asc" },
        take: 20000,
      }),
      prisma.vehicle.aggregate({
        _avg: { TauxOccupationActuel: true },
      }),
    ])

    const now = new Date()
    const monthsCount = period === "year" ? 12 : 12

    const monthKeys: { year: number; month: number }[] = []
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(now.getMonth() - i)
      monthKeys.push({ year: d.getFullYear(), month: d.getMonth() })
    }

    const revenueByMonth = new Map<string, number>()
    for (const t of txs) {
      if (!t.DateTransaction) continue
      if (!isSuccessfulTransaction(t.StatutTransaction)) continue
      const d = new Date(t.DateTransaction)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const amount = Number(t.MontantNet ?? t.Montant ?? 0)
      revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + (Number.isFinite(amount) ? amount : 0))
    }

    const bookingsByMonth = new Map<string, number>()
    for (const r of reservations) {
      const dt = r.DateCreationReservation ? new Date(r.DateCreationReservation) : null
      if (!dt) continue
      const key = `${dt.getFullYear()}-${dt.getMonth()}`
      bookingsByMonth.set(key, (bookingsByMonth.get(key) || 0) + 1)
    }

    const usersByMonth = new Map<string, number>()
    for (const u of users) {
      const dt = u.DateInscription ? new Date(u.DateInscription) : null
      if (!dt) continue
      const key = `${dt.getFullYear()}-${dt.getMonth()}`
      usersByMonth.set(key, (usersByMonth.get(key) || 0) + 1)
    }

    const monthlyData = monthKeys.map((m) => {
      const key = `${m.year}-${m.month}`
      return {
        month: monthLabelFr(m.month),
        revenue: revenueByMonth.get(key) || 0,
        bookings: bookingsByMonth.get(key) || 0,
        users: usersByMonth.get(key) || 0,
      }
    })

    const vehicleAgg = new Map<number, { name: string; bookings: number; revenue: number }>()
    const cityAgg = new Map<string, { name: string; bookings: number; revenue: number }>()

    for (const r of reservations) {
      const vehId = r.vehiculeId
      const brand = r.vehicule?.modele?.marque?.NomMarque || ""
      const model = r.vehicule?.modele?.NomModele || ""
      const name = `${brand} ${model}`.trim() || r.vehicule?.TitreAnnonce || `Vehicule #${vehId}`
      const revenue = Number(r.MontantTotal ?? 0)

      const v = vehicleAgg.get(vehId) || { name, bookings: 0, revenue: 0 }
      v.bookings += 1
      v.revenue += Number.isFinite(revenue) ? revenue : 0
      v.name = v.name || name
      vehicleAgg.set(vehId, v)

      const cityName = (r.vehicule?.LocalisationVille || "").trim() || "Non défini"
      const cKey = cityName.toLowerCase()
      const c = cityAgg.get(cKey) || { name: cityName, bookings: 0, revenue: 0 }
      c.bookings += 1
      c.revenue += Number.isFinite(revenue) ? revenue : 0
      c.name = c.name || cityName
      cityAgg.set(cKey, c)
    }

    const topVehicles = Array.from(vehicleAgg.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const topCitiesBase = Array.from(cityAgg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    const topCities = topCitiesBase.map((c) => ({ ...c, growth: 0 }))

    const totalRevenue = monthlyData.reduce((acc, x) => acc + x.revenue, 0)
    const totalBookings = monthlyData.reduce((acc, x) => acc + x.bookings, 0)
    const totalNewUsers = monthlyData.reduce((acc, x) => acc + x.users, 0)

    const avgOcc = Number(vehiclesAgg._avg.TauxOccupationActuel ?? 0)
    const occupancyRate = Number.isFinite(avgOcc) ? avgOcc : 0

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalBookings,
        totalNewUsers,
        occupancyRate,
      },
      monthlyData,
      topVehicles,
      topCities,
    })
  } catch (error) {
    console.error("[API] Admin reports error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
