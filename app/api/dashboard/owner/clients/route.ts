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

function mapClientStatus(input: { totalBookings: number; rating: number }) {
  if (input.totalBookings <= 1) return "new" as const
  if (input.rating >= 4.7) return "excellent" as const
  if (input.rating >= 4.2) return "good" as const
  return "good" as const
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

    const reservations = await prisma.reservation.findMany({
      where: { proprietaireId: localUserId },
      select: {
        id: true,
        DateDebut: true,
        DateCreationReservation: true,
        MontantTotal: true,
        locataire: {
          select: {
            id: true,
            Nom: true,
            Prenom: true,
            Email: true,
            NumeroTelephone: true,
            PhotoProfil: true,
            NotesUtilisateur: true,
            DateInscription: true,
          },
        },
      },
      orderBy: { DateCreationReservation: "desc" },
      take: 2000,
    })

    const byClient = new Map<
      number,
      {
        clientId: number
        name: string
        avatar: string
        email: string
        phone: string
        rating: number
        memberSince: string
        totalBookings: number
        totalSpent: number
        lastBooking: Date
      }
    >()

    for (const r of reservations) {
      const c = r.locataire
      if (!c) continue

      const key = c.id
      const name = `${c.Prenom || ""} ${c.Nom || ""}`.trim() || "Client"
      const amount = Number(r.MontantTotal || 0)
      const when = r.DateDebut || r.DateCreationReservation || new Date()

      const existing = byClient.get(key)
      if (!existing) {
        byClient.set(key, {
          clientId: key,
          name,
          avatar: c.PhotoProfil || "/placeholder-user.jpg",
          email: c.Email,
          phone: c.NumeroTelephone || "",
          rating: Math.round(Number(c.NotesUtilisateur || 0) * 10) / 10,
          memberSince: (c.DateInscription || new Date()).toISOString(),
          totalBookings: 1,
          totalSpent: amount,
          lastBooking: when,
        })
      } else {
        existing.totalBookings += 1
        existing.totalSpent += amount
        if (when > existing.lastBooking) existing.lastBooking = when
      }
    }

    const clients = Array.from(byClient.values())
      .map((c) => {
        const status = mapClientStatus({ totalBookings: c.totalBookings, rating: c.rating })
        return {
          id: `CLT-${c.clientId}`,
          name: c.name,
          avatar: c.avatar,
          email: c.email,
          phone: c.phone,
          totalBookings: c.totalBookings,
          totalSpent: Math.round(c.totalSpent),
          lastBooking: c.lastBooking.toISOString().slice(0, 10),
          rating: c.rating,
          status,
          memberSince: c.memberSince,
        }
      })
      .sort((a, b) => b.totalBookings - a.totalBookings)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const totalClients = clients.length
    const loyalClients = clients.filter((c) => c.totalBookings >= 5).length
    const newThisMonth = clients.filter((c) => new Date(c.memberSince) >= monthStart).length
    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0)

    return NextResponse.json({
      clients,
      stats: {
        totalClients,
        loyalClients,
        newThisMonth,
        totalRevenue,
      },
    })
  } catch (error) {
    console.error("[API] Owner clients error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
