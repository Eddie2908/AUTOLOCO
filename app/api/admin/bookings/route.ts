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

function mapBookingStatus(statutReservation: string | null | undefined, dates: { start: Date; end: Date }) {
  const v = (statutReservation || "").toLowerCase()
  if (v.includes("litig") || v.includes("disput")) return "dispute" as const
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  if (v.includes("attente") || v.includes("pending")) return "pending" as const
  if (v.includes("confirm") || v.includes("valid")) return "confirmed" as const

  const now = new Date()
  if (dates.start <= now && now <= dates.end) return "in_progress" as const
  if (dates.end < now) return "completed" as const
  return "confirmed" as const
}

function mapPaymentStatus(statutPaiement: string | null | undefined, txStatus: string | null | undefined) {
  const p = (statutPaiement || "").toLowerCase()
  const t = (txStatus || "").toLowerCase()

  if (p.includes("remb") || p.includes("refund") || t.includes("remb") || t.includes("refund")) return "refunded" as const
  if (
    p.includes("pay") ||
    p.includes("paid") ||
    p.includes("succ") ||
    p.includes("reuss") ||
    p.includes("valid") ||
    t.includes("pay") ||
    t.includes("paid") ||
    t.includes("succ") ||
    t.includes("reuss") ||
    t.includes("valid")
  )
    return "paid" as const

  return "pending" as const
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

    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - 7)

    const reservations = await prisma.reservation.findMany({
      orderBy: { DateCreationReservation: "desc" },
      take: 500,
      select: {
        id: true,
        NumeroReservation: true,
        DateDebut: true,
        DateFin: true,
        MontantTotal: true,
        StatutReservation: true,
        StatutPaiement: true,
        DateCreationReservation: true,
        vehicule: {
          select: {
            TitreAnnonce: true,
            LocalisationVille: true,
            photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
          },
        },
        locataire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
        proprietaire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
        transactions: { take: 1, orderBy: { DateTransaction: "desc" }, select: { StatutTransaction: true } },
      },
    })

    const bookings = reservations.map((r) => {
      const renterName = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Locataire"
      const ownerName = `${r.proprietaire?.Prenom || ""} ${r.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
      const status = mapBookingStatus(r.StatutReservation, { start: r.DateDebut, end: r.DateFin })
      const paymentStatus = mapPaymentStatus(r.StatutPaiement, r.transactions[0]?.StatutTransaction)

      return {
        id: r.NumeroReservation || String(r.id),
        vehicleName: r.vehicule?.TitreAnnonce || "Véhicule",
        vehicleImage: r.vehicule?.photos?.[0]?.URLPhoto || "/placeholder.jpg",
        renterName,
        renterAvatar: r.locataire?.PhotoProfil || "/placeholder-user.jpg",
        ownerName,
        ownerAvatar: r.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
        startDate: r.DateDebut.toISOString(),
        endDate: r.DateFin.toISOString(),
        amount: Number(r.MontantTotal || 0),
        status,
        city: r.vehicule?.LocalisationVille || "",
        createdAt: (r.DateCreationReservation || new Date()).toISOString(),
        paymentStatus,
      }
    })

    const today = reservations.filter((r) => r.DateCreationReservation && new Date(r.DateCreationReservation) >= startOfDay).length
    const thisWeek = reservations.filter((r) => r.DateCreationReservation && new Date(r.DateCreationReservation) >= startOfWeek).length
    const disputes = bookings.filter((b) => b.status === "dispute").length
    const cancelled = bookings.filter((b) => b.status === "cancelled").length
    const cancellationRate = bookings.length > 0 ? Math.round((cancelled / bookings.length) * 1000) / 10 : 0

    return NextResponse.json({
      bookings,
      stats: {
        today,
        thisWeek,
        disputes,
        cancellationRate,
      },
    })
  } catch (error) {
    console.error("[API] Admin bookings error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
