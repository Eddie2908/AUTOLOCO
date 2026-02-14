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

function isOwnerType(typeUtilisateur: string | null | undefined) {
  const v = (typeUtilisateur || "").toLowerCase()
  return v.includes("prop") || v.includes("owner")
}

function monthLabelFr(monthIndex: number) {
  const labels = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]
  return labels[monthIndex] || ""
}

function formatDateFr(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")
}

function relativeFr(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 60) return `Il y a ${Math.max(1, min)} minute${min > 1 ? "s" : ""}`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`
  const days = Math.floor(hours / 24)
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`
}

function mapBookingStatus(statutReservation: string | null | undefined, dates: { start: Date; end: Date }) {
  const v = (statutReservation || "").toLowerCase()
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  const now = new Date()
  if (dates.end.getTime() < now.getTime()) return "completed" as const
  if (v.includes("confirm") || v.includes("accept") || v.includes("valid") || v.includes("appr")) return "confirmed" as const
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

    const user = await prisma.user.findUnique({
      where: { id: localUserId },
      select: { id: true, TypeUtilisateur: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get("year")
    const monthParam = searchParams.get("month")

    const now = new Date()
    const year = yearParam ? Number.parseInt(yearParam, 10) : now.getFullYear()
    const month = monthParam ? Number.parseInt(monthParam, 10) : now.getMonth() // 0-11

    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 1)

    const isOwner = isOwnerType(user.TypeUtilisateur)

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(isOwner ? { proprietaireId: localUserId } : { locataireId: localUserId }),
      },
      include: {
        vehicule: {
          include: {
            modele: { include: { marque: true } },
            photos: { orderBy: [{ EstPhotoPrincipale: "desc" }, { OrdreAffichage: "asc" }, { id: "asc" }] },
          },
        },
        locataire: { select: { Prenom: true, Nom: true, NumeroTelephone: true, PhotoProfil: true } },
        proprietaire: { select: { Prenom: true, Nom: true, NumeroTelephone: true, PhotoProfil: true } },
      },
      orderBy: [{ DateCreationReservation: "desc" }, { id: "desc" }],
      take: 500,
    })

    const mapped = reservations.map((r) => {
      const vehicleBrand = r.vehicule?.modele?.marque?.NomMarque || ""
      const vehicleModel = r.vehicule?.modele?.NomModele || ""
      const vehicleName = `${vehicleBrand} ${vehicleModel}`.trim() || r.vehicule?.TitreAnnonce || "Véhicule"

      const other = isOwner ? r.locataire : r.proprietaire
      const clientName = `${other?.Prenom || ""} ${other?.Nom || ""}`.trim() || "Utilisateur"

      const firstPhoto = r.vehicule?.photos?.[0]?.URLPhoto

      const startDate = new Date(r.DateDebut)
      const endDate = new Date(r.DateFin)
      const created = r.DateCreationReservation ? new Date(r.DateCreationReservation) : now

      const status = mapBookingStatus(r.StatutReservation, { start: startDate, end: endDate })

      return {
        id: r.NumeroReservation || `RES-${r.id}`,
        vehicle: vehicleName,
        vehicleImage: firstPhoto || "/placeholder.jpg",
        client: clientName,
        clientImage: other?.PhotoProfil || "/placeholder-user.jpg",
        clientPhone: other?.NumeroTelephone || "",
        startDate: formatDateFr(startDate),
        endDate: formatDateFr(endDate),
        pickup: r.LieuPriseEnCharge || r.vehicule?.LocalisationVille || "",
        dropoff: r.LieuRestitution || r.vehicule?.LocalisationVille || "",
        amount: Number(r.MontantTotal || 0),
        status,
        createdAt: relativeFr(created),
        startDateIso: startDate.toISOString(),
        endDateIso: endDate.toISOString(),
      }
    })

    const monthBookings = mapped.filter((b) => {
      const s = new Date(b.startDateIso)
      return s >= monthStart && s < monthEnd
    })

    const pendingCount = mapped.filter((b) => b.status === "pending").length
    const confirmedCount = mapped.filter((b) => b.status === "confirmed").length

    const inProgressCount = mapped.filter((b) => {
      const start = new Date(b.startDateIso)
      const end = new Date(b.endDateIso)
      return b.status !== "cancelled" && start <= now && end >= now
    }).length

    const thisMonthCount = monthBookings.length

    // Calendar
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const jsDay = monthStart.getDay() // 0=Sun
    const offset = (jsDay + 6) % 7 // Monday=0

    const highlightedDays = Array.from(
      new Set(
        monthBookings
          .flatMap((b) => {
            const start = new Date(b.startDateIso)
            const end = new Date(b.endDateIso)
            const days: number[] = []
            const cursor = new Date(start)
            cursor.setHours(0, 0, 0, 0)
            const endDay = new Date(end)
            endDay.setHours(0, 0, 0, 0)
            while (cursor <= endDay) {
              if (cursor.getFullYear() === year && cursor.getMonth() === month) {
                days.push(cursor.getDate())
              }
              cursor.setDate(cursor.getDate() + 1)
            }
            return days
          })
          .filter((d) => d >= 1 && d <= daysInMonth),
      ),
    )

    highlightedDays.sort((a, b) => a - b)

    const upcomingBookings = mapped
      .filter((b) => {
        const start = new Date(b.startDateIso)
        return b.status !== "cancelled" && start >= now
      })
      .sort((a, b) => new Date(a.startDateIso).getTime() - new Date(b.startDateIso).getTime())
      .slice(0, 2)

    return NextResponse.json({
      bookings: mapped,
      stats: {
        pending: pendingCount,
        confirmed: confirmedCount,
        inProgress: inProgressCount,
        thisMonth: thisMonthCount,
      },
      calendar: {
        monthLabel: `${monthLabelFr(month)} ${year}`,
        year,
        month,
        calendarDays,
        offset,
        highlightedDays,
        today: now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null,
        upcomingBookings,
      },
    })
  } catch (error) {
    console.error("[API] Dashboard bookings error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
