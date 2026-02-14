import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"

const EMPTY_SUMMARY = {
  user: { firstName: "", userType: "" },
  stats: { monthRevenue: 0, activeBookings: 0, vehiclesListed: 0, viewsThisMonth: 0 },
  recentBookings: [],
  topVehicles: [],
}

function mapBookingUiStatus(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  if (v.includes("term") || v.includes("fini") || v.includes("complete")) return "completed" as const
  if (v.includes("confirm") || v.includes("valid") || v.includes("accep")) return "confirmed" as const
  if (v.includes("attente") || v.includes("pending")) return "pending" as const
  return "pending" as const
}

function formatDateRangeFrShort(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
  return `${fmt.format(start)} - ${fmt.format(end)}`
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

    if (token.startsWith("demo_")) {
      return NextResponse.json(EMPTY_SUMMARY)
    }

    const backendUser = await getCurrentUserFromBackend(token)
    if (!backendUser?.id) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 401 })
    }

    const userId = Number.parseInt(String(backendUser.id), 10)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { Prenom: true, TypeUtilisateur: true },
    })

    // Dashboard général: aujourd'hui on l'aligne sur un owner summary (le design actuel pointe vers /owner/*)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const [vehicles, reservations] = await Promise.all([
      prisma.vehicle.findMany({
        where: { proprietaireId: userId },
        select: { id: true, TitreAnnonce: true, NotesVehicule: true, NombreVues: true },
      }),
      prisma.reservation.findMany({
        where: { proprietaireId: userId },
        take: 500,
        orderBy: { DateCreationReservation: "desc" },
        select: {
          id: true,
          NumeroReservation: true,
          DateDebut: true,
          DateFin: true,
          MontantLocation: true,
          DateCreationReservation: true,
          StatutReservation: true,
          vehicule: { select: { id: true, TitreAnnonce: true } },
          locataire: { select: { Prenom: true, Nom: true, PhotoProfil: true } },
          transactions: {
            take: 1,
            orderBy: { DateTransaction: "desc" },
            select: { MontantNet: true, FraisCommission: true, DateTransaction: true },
          },
        },
      }),
    ])

    const vehiclesListed = vehicles.length
    const viewsTotal = vehicles.reduce(
      (sum: number, v: { NombreVues: unknown }) => sum + Number(v.NombreVues || 0),
      0,
    )

    const activeBookings = reservations.filter((r: { StatutReservation: string | null; DateDebut: Date; DateFin: Date }) => {
      const status = mapBookingUiStatus(r.StatutReservation)
      if (status === "cancelled" || status === "completed") return false
      return r.DateDebut <= dayEnd && r.DateFin >= dayStart
    }).length

    const monthRevenue = reservations
      .filter((r: { transactions: { DateTransaction: Date | null }[]; DateCreationReservation: Date | null; DateDebut: Date }) => {
        const basis = (r.transactions[0]?.DateTransaction || r.DateCreationReservation || r.DateDebut) as Date
        return basis >= monthStart
      })
      .reduce((sum: number, r: { transactions: { MontantNet: unknown; FraisCommission: unknown }[]; MontantLocation: unknown }) => {
        const tx = r.transactions[0]
        const gross = Number(r.MontantLocation || 0)
        const fee = Number(tx?.FraisCommission || 0)
        const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - fee)
        return sum + net
      }, 0)

    const recentBookings = reservations.slice(0, 3).map((r: any) => {
      const client = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Client"
      const amount = Number(r.MontantLocation || 0)
      const status = mapBookingUiStatus(r.StatutReservation)

      return {
        id: r.id,
        bookingId: r.NumeroReservation || String(r.id),
        vehicle: r.vehicule?.TitreAnnonce || "Véhicule",
        client,
        clientImage: r.locataire?.PhotoProfil || "/placeholder-user.jpg",
        dates: formatDateRangeFrShort(r.DateDebut, r.DateFin),
        amount,
        status,
      }
    })

    // Top vehicles by revenue (using same month window)
    const perfMap = new Map<number, { name: string; bookings: number; revenue: number; rating: number }>()
    const vehicleById = new Map<number, { name: string; rating: number }>()
    for (const v of vehicles) {
      vehicleById.set(v.id, {
        name: v.TitreAnnonce || "Véhicule",
        rating: v.NotesVehicule != null ? Number(v.NotesVehicule) : 0,
      })
    }

    for (const r of reservations) {
      const basis = (r.transactions[0]?.DateTransaction || r.DateCreationReservation || r.DateDebut) as Date
      if (basis < monthStart) continue

      const vehicleId = r.vehicule?.id
      if (!vehicleId) continue

      const meta = vehicleById.get(vehicleId)
      const item = perfMap.get(vehicleId) || {
        name: meta?.name || r.vehicule?.TitreAnnonce || "Véhicule",
        bookings: 0,
        revenue: 0,
        rating: meta?.rating || 0,
      }

      const tx = r.transactions[0]
      const gross = Number(r.MontantLocation || 0)
      const fee = Number(tx?.FraisCommission || 0)
      const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - fee)

      item.bookings += 1
      item.revenue += net
      perfMap.set(vehicleId, item)
    }

    const topVehicles = Array.from(perfMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map((v) => ({
        name: v.name,
        bookings: v.bookings,
        revenue: Math.round(v.revenue),
        rating: Math.round(v.rating * 10) / 10,
      }))

    return NextResponse.json({
      user: {
        firstName: user?.Prenom || "",
        userType: user?.TypeUtilisateur || "",
      },
      stats: {
        monthRevenue: Math.round(monthRevenue),
        activeBookings,
        vehiclesListed,
        viewsThisMonth: viewsTotal,
      },
      recentBookings,
      topVehicles,
    })
  } catch (error) {
    console.error("[API] Dashboard summary error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
