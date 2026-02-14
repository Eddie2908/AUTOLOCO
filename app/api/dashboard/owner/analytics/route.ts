import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

// -- In-memory cache per user+period (TTL = 60s) ----------------------------
const CACHE_TTL_MS = 60 * 1000
const analyticsCache = new Map<string, { data: unknown; timestamp: number }>()

function getCached(key: string) {
  const entry = analyticsCache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data
  }
  analyticsCache.delete(key)
  return null
}

function setCache(key: string, data: unknown) {
  // Limit cache size to avoid memory leak
  if (analyticsCache.size > 200) {
    const oldest = analyticsCache.keys().next().value
    if (oldest) analyticsCache.delete(oldest)
  }
  analyticsCache.set(key, { data, timestamp: Date.now() })
}
// ---------------------------------------------------------------------------

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dayLabelFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date).replace(".", "")
}

function monthLabelFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", "")
}

function mapReservationConfirmed(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("annul") || v.includes("cancel")) return false
  if (v.includes("confirm") || v.includes("valid") || v.includes("accep") || v.includes("approved")) return true
  return false
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

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get("period") || "year").toLowerCase() as "week" | "month" | "year"

    // Return cached result if still fresh
    const cacheKey = `${localUserId}:${period}`
    const cached = getCached(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const now = new Date()
    let rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let rangeEnd = endOfDay(now)

    if (period === "week") {
      rangeStart = startOfDay(addDays(now, -6))
      rangeEnd = endOfDay(now)
    } else if (period === "month") {
      rangeStart = startOfDay(addDays(now, -29))
      rangeEnd = endOfDay(now)
    } else {
      rangeStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      rangeEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }

    const [vehicles, reservations, reviews] = await Promise.all([
      prisma.vehicle.findMany({
        where: { proprietaireId: localUserId },
        select: { id: true, TitreAnnonce: true, NombreVues: true },
      }),
      prisma.reservation.findMany({
        where: {
          proprietaireId: localUserId,
          AND: [{ DateDebut: { lte: rangeEnd } }, { DateFin: { gte: rangeStart } }],
        },
        take: 500, // Capped: an owner rarely exceeds 500 bookings in a period
        select: {
          id: true,
          vehiculeId: true,
          DateDebut: true,
          DateFin: true,
          NombreJours: true,
          StatutReservation: true,
          DateCreationReservation: true,
          MontantLocation: true,
          transactions: {
            take: 1,
            orderBy: { DateTransaction: "desc" },
            select: { MontantNet: true, FraisCommission: true, DateTransaction: true },
          },
        },
      }),
      prisma.avis.findMany({
        where: { cibleId: localUserId, StatutAvis: { not: "Supprime" } },
        take: 500, // Capped for performance
        select: { NoteGlobale: true, DateCreation: true },
      }),
    ])

    const vehicleCount = vehicles.length

    // Revenue totals: use Transaction.MontantNet when present, otherwise fallback to MontantLocation - FraisCommission
    const reservationNetAmounts = reservations.map((r) => {
      const tx = r.transactions[0]
      const gross = Number(r.MontantLocation || 0)
      const fee = Number(tx?.FraisCommission || 0)
      const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - fee)
      return { date: (tx?.DateTransaction || r.DateCreationReservation || r.DateDebut) as Date, net }
    })

    const totalRevenue = reservationNetAmounts.reduce((sum, x) => sum + x.net, 0)

    const totalBookings = reservations.length
    const confirmedBookings = reservations.filter((r) => mapReservationConfirmed(r.StatutReservation)).length

    const totalViews = vehicles.reduce((sum, v) => sum + Number(v.NombreVues || 0), 0)

    // Occupancy rate over the selected range
    const daysInRange = Math.max(1, Math.round((rangeEnd.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)) + 1)
    const denom = Math.max(1, vehicleCount) * daysInRange

    const occupiedVehicleDays = reservations.reduce((sum, r) => {
      const start = r.DateDebut < rangeStart ? rangeStart : r.DateDebut
      const end = r.DateFin > rangeEnd ? rangeEnd : r.DateFin
      const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)
      return sum + days
    }, 0)

    const occupancyRate = Math.round((occupiedVehicleDays / denom) * 100)

    // Reviews
    const reviewValues = reviews.map((a) => Number(a.NoteGlobale || 0)).filter((n) => Number.isFinite(n) && n > 0)
    const averageRating = reviewValues.length ? reviewValues.reduce((s, n) => s + n, 0) / reviewValues.length : 0

    // Average duration
    const durations = reservations
      .map((r) => (r.NombreJours != null ? Number(r.NombreJours) : Math.max(1, Math.round((r.DateFin.getTime() - r.DateDebut.getTime()) / (24 * 60 * 60 * 1000)))))
      .filter((n) => Number.isFinite(n) && n > 0)
    const averageDurationDays = durations.length ? durations.reduce((s, n) => s + n, 0) / durations.length : 0

    const durationBuckets = {
      "1_3": 0,
      "4_7": 0,
      "7_plus": 0,
    }

    for (const d of durations) {
      if (d <= 3) durationBuckets["1_3"] += 1
      else if (d <= 7) durationBuckets["4_7"] += 1
      else durationBuckets["7_plus"] += 1
    }

    const durationTotal = durations.length
    const durationDistribution = {
      "1_3": durationTotal ? Math.round((durationBuckets["1_3"] / durationTotal) * 100) : 0,
      "4_7": durationTotal ? Math.round((durationBuckets["4_7"] / durationTotal) * 100) : 0,
      "7_plus": durationTotal ? Math.round((durationBuckets["7_plus"] / durationTotal) * 100) : 0,
    }

    // Revenue series
    const revenueSeries: { label: string; revenue: number; bookings: number }[] = []

    if (period === "year") {
      const buckets = new Map<number, { revenue: number; bookings: number }>()
      for (let m = 0; m < 12; m++) buckets.set(m, { revenue: 0, bookings: 0 })

      for (const r of reservations) {
        const basis = (r.transactions[0]?.DateTransaction || r.DateCreationReservation || r.DateDebut) as Date
        if (basis < rangeStart || basis > rangeEnd) continue
        const month = basis.getMonth()
        const b = buckets.get(month)
        if (!b) continue
        const gross = Number(r.MontantLocation || 0)
        const tx = r.transactions[0]
        const fee = Number(tx?.FraisCommission || 0)
        const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - fee)
        b.revenue += net
        b.bookings += 1
      }

      for (let m = 0; m < 12; m++) {
        const d = new Date(rangeStart.getFullYear(), m, 1)
        const b = buckets.get(m) || { revenue: 0, bookings: 0 }
        revenueSeries.push({ label: monthLabelFr(d), revenue: Math.round(b.revenue), bookings: b.bookings })
      }
    } else {
      // week/month: daily buckets
      const buckets = new Map<string, { revenue: number; bookings: number; label: string }>()
      for (let i = 0; i < daysInRange; i++) {
        const d = startOfDay(addDays(rangeStart, i))
        const key = d.toISOString().slice(0, 10)
        buckets.set(key, { revenue: 0, bookings: 0, label: dayLabelFr(d) })
      }

      for (const x of reservationNetAmounts) {
        const d = startOfDay(x.date)
        if (d < rangeStart || d > rangeEnd) continue
        const key = d.toISOString().slice(0, 10)
        const b = buckets.get(key)
        if (!b) continue
        b.revenue += x.net
        b.bookings += 1
      }

      for (let i = 0; i < daysInRange; i++) {
        const d = startOfDay(addDays(rangeStart, i))
        const key = d.toISOString().slice(0, 10)
        const b = buckets.get(key)
        if (!b) continue
        revenueSeries.push({ label: b.label, revenue: Math.round(b.revenue), bookings: b.bookings })
      }
    }

    // Vehicle performance (aggregate by vehiculeId)
    const perfMap = new Map<number, { bookings: number; revenue: number; occupiedDays: number }>()
    for (const r of reservations) {
      const vehicleId = Number(r.vehiculeId)
      const item = perfMap.get(vehicleId) || { bookings: 0, revenue: 0, occupiedDays: 0 }
      item.bookings += 1

      const tx = r.transactions[0]
      const gross = Number(r.MontantLocation || 0)
      const fee = Number(tx?.FraisCommission || 0)
      const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - fee)
      item.revenue += net

      const start = r.DateDebut < rangeStart ? rangeStart : r.DateDebut
      const end = r.DateFin > rangeEnd ? rangeEnd : r.DateFin
      const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)
      item.occupiedDays += days

      perfMap.set(vehicleId, item)
    }

    const vehiclePerformance = vehicles
      .map((v) => {
        const p = perfMap.get(v.id) || { bookings: 0, revenue: 0, occupiedDays: 0 }
        const occupancy = vehicleCount ? Math.round((p.occupiedDays / daysInRange) * 100) : 0
        return {
          name: v.TitreAnnonce || "Véhicule",
          bookings: p.bookings,
          revenue: Math.round(p.revenue),
          occupancy: Number.isFinite(occupancy) ? Math.max(0, Math.min(100, occupancy)) : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const ratingsDistribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = reviewValues.filter((n) => Math.round(n) === rating).length
      return { rating, count }
    })

    const conversionRate = totalViews > 0 ? Math.round((confirmedBookings / totalViews) * 1000) / 10 : 0

    const result = {
      period,
      range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
      stats: {
        totalRevenue: Math.round(totalRevenue),
        bookings: totalBookings,
        averageRating: Math.round(averageRating * 100) / 100,
        occupancyRate: Number.isFinite(occupancyRate) ? occupancyRate : 0,
      },
      revenueSeries,
      vehiclePerformance,
      additional: {
        conversionRate,
        totalViews,
        requests: totalBookings,
        confirmed: confirmedBookings,
        averageDurationDays: Math.round(averageDurationDays * 10) / 10,
        durationDistribution,
        reviewsCount: reviewValues.length,
        ratingsDistribution,
      },
    }

    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Owner analytics error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
