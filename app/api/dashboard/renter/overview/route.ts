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

function mapBookingUiStatus(statutReservation: string | null | undefined, dates: { start: Date; end: Date }) {
  const v = (statutReservation || "").toLowerCase()
  if (v.includes("annul") || v.includes("cancel")) return "cancelled" as const
  if (v.includes("attente") || v.includes("pending")) return "pending" as const

  const now = new Date()
  if (dates.start <= now && now <= dates.end) return "confirmed" as const
  if (dates.start > now) return "upcoming" as const
  return "completed" as const
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
      const headers = { Authorization: `Bearer ${token}` }

      const [meRes, bookingsRes, favoritesRes, vehiclesRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/auth/me`, { headers }).catch(() => null),
        fetch(`${apiUrl}/api/v1/bookings?page=1&page_size=10`, { headers }).catch(() => null),
        fetch(`${apiUrl}/api/v1/favorites`, { headers }).catch(() => null),
        fetch(`${apiUrl}/api/v1/search/vehicles?page=1&page_size=6`, { headers: {} }).catch(() => null),
      ])

      const meData = meRes?.ok ? await meRes.json().catch(() => ({})) : {}
      const bookingsData = bookingsRes?.ok ? await bookingsRes.json().catch(() => ({})) : {}
      const favoritesData = favoritesRes?.ok ? await favoritesRes.json().catch(() => []) : []
      const vehiclesData = vehiclesRes?.ok ? await vehiclesRes.json().catch(() => ({})) : {}

      const now = new Date()
      const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      const backendBookings: any[] = Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : []

      const activeBookings = backendBookings
        .filter((b: any) => new Date(b.date_fin) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .sort((a: any, b: any) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime())
        .slice(0, 2)
        .map((b: any) => {
          const startDate = new Date(b.date_debut)
          const endDate = new Date(b.date_fin)
          return {
            id: b.numero_reservation || b.id,
            vehicle: b.vehicle_name || "Véhicule",
            image: b.vehicle_image || "/placeholder.jpg",
            owner: b.owner_name || "Propriétaire",
            dates: `${fmt.format(startDate)} - ${fmt.format(endDate)}`,
            location: b.lieu_prise_en_charge || "",
            amount: `${Number(b.montant_total || 0).toLocaleString("fr-FR")} FCFA`,
            status: mapBookingUiStatus(b.statut_reservation, { start: startDate, end: endDate }),
          }
        })

      const activeCount = backendBookings.filter((b: any) => {
        const s = new Date(b.date_debut)
        const e = new Date(b.date_fin)
        return s <= now && now <= e
      }).length

      const favCount = Array.isArray(favoritesData) ? favoritesData.length : 0
      const vehiclesList = Array.isArray(vehiclesData?.vehicles) ? vehiclesData.vehicles : []

      const recommendations = vehiclesList.slice(0, 6).map((v: any) => ({
        id: String(v.id),
        name: v.name || "Véhicule",
        type: v.type || "",
        price: Number(v.price || 0).toLocaleString("fr-FR"),
        rating: v.rating || 0,
        image: v.image || "/placeholder.jpg",
        location: v.city || v.location || "",
      }))

      const quickStats = {
        activeBookings: activeCount,
        favoris: favCount,
        points: 0,
        unreadMessages: 0,
        firstName: meData?.prenom || meData?.nom || "",
      }

      return NextResponse.json({ quickStats, activeBookings, recommendations, recentActivity: [] })
    }

    const now = new Date()

    const [user, favorisCount, unreadMessagesCount, reservations, recommendations, recentNotifications, recentTransactions] = await Promise.all([
      prisma.user.findUnique({ where: { id: localUserId }, select: { Prenom: true, PointsFideliteTotal: true } }),
      prisma.favori.count({ where: { utilisateurId: localUserId } }),
      prisma.message.count({ where: { destinataireId: localUserId, EstLu: false } }),
      prisma.reservation.findMany({
        where: { locataireId: localUserId },
        orderBy: { DateDebut: "desc" },
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
              AdresseComplete: true,
              LocalisationVille: true,
              photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
            },
          },
          proprietaire: { select: { Nom: true, Prenom: true } },
        },
      }),
      prisma.vehicle.findMany({
        orderBy: [{ NotesVehicule: "desc" }, { DateCreation: "desc" }],
        take: 6,
        select: {
          id: true,
          TitreAnnonce: true,
          PrixJournalier: true,
          NotesVehicule: true,
          LocalisationVille: true,
          categorie: { select: { NomCategorie: true } },
          photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
        },
      }),
      prisma.notification.findMany({
        where: { utilisateurId: localUserId },
        orderBy: { DateCreation: "desc" },
        take: 4,
        select: { id: true, TitreNotification: true, MessageNotification: true, TypeNotification: true, DateCreation: true, EstLue: true },
      }),
      prisma.transaction.findMany({
        where: { utilisateurId: localUserId },
        orderBy: { DateTransaction: "desc" },
        take: 2,
        select: { id: true, Montant: true, StatutTransaction: true, DateTransaction: true },
      }),
    ])

    const activeBookings = reservations
      .filter((r) => r.DateFin >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
      .sort((a, b) => a.DateDebut.getTime() - b.DateDebut.getTime())
      .slice(0, 2)
      .map((r) => {
        const ownerName = `${r.proprietaire?.Prenom || ""} ${r.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
        const dates = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        const start = dates.format(r.DateDebut)
        const end = dates.format(r.DateFin)

        return {
          id: r.NumeroReservation || String(r.id),
          vehicle: r.vehicule?.TitreAnnonce || "Véhicule",
          image: r.vehicule?.photos?.[0]?.URLPhoto || "/placeholder.jpg",
          owner: ownerName,
          dates: `${start} - ${end}`,
          location: r.vehicule?.AdresseComplete || r.vehicule?.LocalisationVille || "",
          amount: `${Number(r.MontantTotal || 0).toLocaleString("fr-FR")} FCFA`,
          status: mapBookingUiStatus(r.StatutReservation, { start: r.DateDebut, end: r.DateFin }),
        }
      })

    const activeReservationsCount = reservations.filter((r) => r.DateDebut <= now && r.DateFin >= now).length

    const quickStats = {
      activeBookings: activeReservationsCount,
      favoris: favorisCount,
      points: Number(user?.PointsFideliteTotal || 0),
      unreadMessages: unreadMessagesCount,
      firstName: user?.Prenom || "",
    }

    const mappedRecommendations = recommendations.map((v) => {
      return {
        id: String(v.id),
        name: v.TitreAnnonce,
        type: v.categorie?.NomCategorie || "",
        price: Number(v.PrixJournalier || 0).toLocaleString("fr-FR"),
        rating: Math.round(Number(v.NotesVehicule || 0) * 10) / 10,
        image: v.photos?.[0]?.URLPhoto || "/placeholder.jpg",
        location: v.LocalisationVille,
      }
    })

    // Build recent activity from notifications and transactions
    function timeAgo(date: Date): string {
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return "À l'instant"
      if (diffMin < 60) return `Il y a ${diffMin} min`
      const diffH = Math.floor(diffMin / 60)
      if (diffH < 24) return `Il y a ${diffH}h`
      const diffD = Math.floor(diffH / 24)
      return `Il y a ${diffD}j`
    }

    const recentActivity: { type: string; text: string; time: string }[] = []

    for (const n of recentNotifications) {
      recentActivity.push({
        type: (n.TypeNotification || "system").toLowerCase(),
        text: n.TitreNotification || n.MessageNotification || "Notification",
        time: timeAgo(n.DateCreation || now),
      })
    }

    for (const t of recentTransactions) {
      const amount = Number(t.Montant || 0)
      const isSuccess = (t.StatutTransaction || "").toLowerCase().includes("succ") || (t.StatutTransaction || "").toLowerCase().includes("pay")
      recentActivity.push({
        type: "payment",
        text: isSuccess ? `Paiement confirmé - ${amount.toLocaleString("fr-FR")} FCFA` : `Paiement en attente - ${amount.toLocaleString("fr-FR")} FCFA`,
        time: timeAgo(t.DateTransaction || now),
      })
    }

    if (unreadMessagesCount > 0) {
      recentActivity.push({
        type: "message",
        text: `Vous avez ${unreadMessagesCount} message${unreadMessagesCount > 1 ? "s" : ""} non lu${unreadMessagesCount > 1 ? "s" : ""}`,
        time: "",
      })
    }

    if (favorisCount > 0) {
      recentActivity.push({
        type: "favori",
        text: `${favorisCount} véhicule${favorisCount > 1 ? "s" : ""} en favoris`,
        time: "",
      })
    }

    const activity = recentActivity.slice(0, 4)

    return NextResponse.json({ quickStats, activeBookings, recommendations: mappedRecommendations, recentActivity: activity })
  } catch (error) {
    console.error("[API] Renter overview error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
