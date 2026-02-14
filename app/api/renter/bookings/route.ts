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

function mapBookingStatus(statutReservation: string | null | undefined, dates: { start: Date; end: Date }) {
  const v = (statutReservation || "").toLowerCase()
  if (v.includes("annul") || v.includes("cancel") || v.includes("refus")) return "completed" as const
  if (v.includes("attente") || v.includes("pending")) return "upcoming" as const
  if (v.includes("confirm") || v.includes("encours") || v === "encours") {
    const now = new Date()
    if (dates.start <= now && now <= dates.end) return "active" as const
    if (dates.start > now) return "upcoming" as const
    return "completed" as const
  }
  if (v.includes("termin")) return "completed" as const

  const now = new Date()
  if (dates.start <= now && now <= dates.end) return "active" as const
  if (dates.start > now) return "upcoming" as const
  return "completed" as const
}

function calcProgress(dates: { start: Date; end: Date }) {
  const start = dates.start.getTime()
  const end = dates.end.getTime()
  const now = Date.now()

  if (now <= start) return 0
  if (now >= end) return 100

  const ratio = (now - start) / Math.max(1, end - start)
  return Math.max(0, Math.min(100, Math.round(ratio * 100)))
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

    // If JWT token (not local_), proxy to FastAPI backend
    if (!localUserId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const backendRes = await fetch(`${apiUrl}/api/v1/bookings?page=1&page_size=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!backendRes.ok) {
        const err = await backendRes.json().catch(() => ({}))
        return NextResponse.json({ error: err.detail || "Erreur backend" }, { status: backendRes.status })
      }

      const data = await backendRes.json()
      const backendBookings: any[] = Array.isArray(data?.bookings) ? data.bookings : []

      const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

      const bookings = backendBookings.map((b: any) => {
        const startDate = new Date(b.date_debut)
        const endDate = new Date(b.date_fin)
        const status = mapBookingStatus(b.statut_reservation, { start: startDate, end: endDate })
        const progress = calcProgress({ start: startDate, end: endDate })

        return {
          id: b.numero_reservation || b.id,
          bookingDbId: b.id,
          vehicleId: b.vehicule_id || "",
          vehicle: b.vehicle_name || "Véhicule",
          vehicleImage: b.vehicle_image || "/placeholder.jpg",
          owner: b.owner_name || "Propriétaire",
          ownerImage: b.owner_image || "/placeholder-user.jpg",
          ownerPhone: b.owner_phone || "",
          startDate: startDate.toISOString().slice(0, 10),
          endDate: endDate.toISOString().slice(0, 10),
          startDateDisplay: fmt.format(startDate),
          endDateDisplay: fmt.format(endDate),
          pickup: b.lieu_prise_en_charge || "",
          dropoff: b.lieu_restitution || "",
          amount: b.montant_total || 0,
          status,
          progress,
          canReview: status === "completed",
        }
      })

      const stats = {
        active: bookings.filter((b: any) => b.status === "active").length,
        upcoming: bookings.filter((b: any) => b.status === "upcoming").length,
        completed: bookings.filter((b: any) => b.status === "completed").length,
        total: bookings.length,
      }

      return NextResponse.json({ bookings, stats })
    }

    // Local token path (Prisma)
    const reservations = await prisma.reservation.findMany({
      where: { locataireId: localUserId },
      orderBy: { DateDebut: "desc" },
      take: 200,
      select: {
        id: true,
        NumeroReservation: true,
        DateDebut: true,
        DateFin: true,
        LieuPriseEnCharge: true,
        LieuRestitution: true,
        MontantTotal: true,
        StatutReservation: true,
        vehicule: {
          select: {
            TitreAnnonce: true,
            photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
          },
        },
        proprietaire: {
          select: {
            Nom: true,
            Prenom: true,
            PhotoProfil: true,
            NumeroTelephone: true,
          },
        },
      },
    })

    const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

    const bookings = reservations.map((r) => {
      const ownerName = `${r.proprietaire?.Prenom || ""} ${r.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
      const status = mapBookingStatus(r.StatutReservation, { start: r.DateDebut, end: r.DateFin })
      const progress = calcProgress({ start: r.DateDebut, end: r.DateFin })

      return {
        id: r.NumeroReservation || String(r.id),
        bookingDbId: String(r.id),
        vehicle: r.vehicule?.TitreAnnonce || "Véhicule",
        vehicleImage: r.vehicule?.photos?.[0]?.URLPhoto || "/placeholder.jpg",
        owner: ownerName,
        ownerImage: r.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
        ownerPhone: r.proprietaire?.NumeroTelephone || "",
        startDate: r.DateDebut.toISOString().slice(0, 10),
        endDate: r.DateFin.toISOString().slice(0, 10),
        startDateDisplay: fmt.format(r.DateDebut),
        endDateDisplay: fmt.format(r.DateFin),
        pickup: r.LieuPriseEnCharge || "",
        dropoff: r.LieuRestitution || "",
        amount: Number(r.MontantTotal || 0),
        status,
        progress,
        canReview: status === "completed",
      }
    })

    const stats = {
      active: bookings.filter((b) => b.status === "active").length,
      upcoming: bookings.filter((b) => b.status === "upcoming").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      total: bookings.length,
    }

    return NextResponse.json({ bookings, stats })
  } catch (error) {
    console.error("[API] Renter bookings error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
