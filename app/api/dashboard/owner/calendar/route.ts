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
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  if (v.includes("litig") || v.includes("disput")) return "dispute" as const
  if (v.includes("attente") || v.includes("pending")) return "pending" as const
  if (v.includes("confirm") || v.includes("valid")) return "confirmed" as const
  return "confirmed" as const
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

    const url = new URL(req.url)
    const year = Number.parseInt(url.searchParams.get("year") || "", 10)
    const month = Number.parseInt(url.searchParams.get("month") || "", 10) // 0-11 expected

    const now = new Date()
    const y = Number.isFinite(year) ? year : now.getFullYear()
    const m = Number.isFinite(month) ? month : now.getMonth()

    const monthStart = new Date(y, m, 1, 0, 0, 0, 0)
    const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999)

    const [vehicleCount, reservations] = await Promise.all([
      prisma.vehicle.count({ where: { proprietaireId: localUserId } }),
      prisma.reservation.findMany({
        where: {
          proprietaireId: localUserId,
          AND: [{ DateDebut: { lte: monthEnd } }, { DateFin: { gte: monthStart } }],
        },
        orderBy: { DateDebut: "asc" },
        take: 2000,
        select: {
          id: true,
          NumeroReservation: true,
          DateDebut: true,
          DateFin: true,
          LieuPriseEnCharge: true,
          MontantTotal: true,
          StatutReservation: true,
          vehicule: { select: { TitreAnnonce: true } },
          locataire: { select: { id: true, Nom: true, Prenom: true, PhotoProfil: true } },
        },
      }),
    ])

    const bookings = reservations.map((r) => {
      const renter = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Locataire"

      return {
        id: r.NumeroReservation || String(r.id),
        vehicle: r.vehicule?.TitreAnnonce || "Véhicule",
        renter,
        renterAvatar: r.locataire?.PhotoProfil || "/placeholder-user.jpg",
        startDate: r.DateDebut.toISOString().slice(0, 10),
        endDate: r.DateFin.toISOString().slice(0, 10),
        pickup: r.LieuPriseEnCharge || "",
        amount: Number(r.MontantTotal || 0),
        status: mapBookingUiStatus(r.StatutReservation),
      }
    })

    const monthDays = Math.max(1, Math.round((monthEnd.getTime() - monthStart.getTime()) / (24 * 60 * 60 * 1000)) + 1)
    const denom = Math.max(1, vehicleCount) * monthDays

    const occupiedVehicleDays = reservations.reduce((sum, r) => {
      const start = r.DateDebut < monthStart ? monthStart : r.DateDebut
      const end = r.DateFin > monthEnd ? monthEnd : r.DateFin
      const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)
      return sum + days
    }, 0)

    const occupancyRate = Math.round((occupiedVehicleDays / denom) * 100)
    const uniqueClients = new Set(reservations.map((r) => r.locataire?.id).filter((x): x is number => typeof x === "number")).size

    return NextResponse.json({
      month: { year: y, month: m },
      bookings,
      stats: {
        bookingsThisMonth: bookings.length,
        occupancyRate: Number.isFinite(occupancyRate) ? occupancyRate : 0,
        uniqueClients,
      },
    })
  } catch (error) {
    console.error("[API] Owner calendar error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
