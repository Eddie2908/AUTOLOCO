import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

function mapPaymentMethod(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("mtn")) return "mobile_money_mtn" as const
  if (v.includes("orange")) return "mobile_money_orange" as const
  if (v.includes("carte") || v.includes("card") || v.includes("visa") || v.includes("master")) return "carte_bancaire" as const
  return "mobile_money_mtn" as const
}

function mapRenterPaymentStatus(txStatus: string | null | undefined) {
  const v = (txStatus || "").toLowerCase()
  if (v.includes("remb") || v.includes("refund")) return "refunded" as const
  if (v.includes("echec") || v.includes("fail") || v.includes("error")) return "failed" as const
  if (v.includes("pay") || v.includes("paid") || v.includes("succ") || v.includes("reuss") || v.includes("valid")) return "completed" as const
  return "pending" as const
}

function mapOwnerPayoutStatus(txStatus: string | null | undefined) {
  const v = (txStatus || "").toLowerCase()
  if (v.includes("echec") || v.includes("fail") || v.includes("error")) return "failed" as const
  if (v.includes("pay") || v.includes("paid") || v.includes("succ") || v.includes("reuss") || v.includes("valid")) return "completed" as const
  return "pending" as const
}

function formatDateRangeFr(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
  return `${fmt.format(start)} - ${fmt.format(end)}`
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function monthLabelFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date).replace(".", "")
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
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
    const scope = (searchParams.get("scope") || "renter").toLowerCase()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    if (scope === "owner") {
      const reservations = await prisma.reservation.findMany({
        where: { proprietaireId: localUserId },
        orderBy: { DateCreationReservation: "desc" },
        take: 100,
        select: {
          id: true,
          NumeroReservation: true,
          DateDebut: true,
          DateFin: true,
          MontantLocation: true,
          DateCreationReservation: true,
          MethodePaiement: true,
          vehicule: {
            select: {
              id: true,
              TitreAnnonce: true,
              photos: { select: { URLPhoto: true }, take: 1, orderBy: { OrdreAffichage: "asc" } },
            },
          },
          locataire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
          transactions: {
            take: 1,
            orderBy: { DateTransaction: "desc" },
            select: { StatutTransaction: true, DateTransaction: true, FraisCommission: true, MontantNet: true },
          },
        },
      })

      const payments = reservations.map((r) => {
        const locataireNom = `${r.locataire?.Prenom || ""} ${r.locataire?.Nom || ""}`.trim() || "Locataire"
        const tx = r.transactions[0]
        const grossAmount = Number(r.MontantLocation || 0)
        const platformFee = Number(tx?.FraisCommission || 0)
        const netAmount = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, grossAmount - platformFee)
        const status = mapOwnerPayoutStatus(tx?.StatutTransaction)

        return {
          id: `DB-PAY-${r.id}`,
          bookingId: r.NumeroReservation || String(r.id),
          vehicleName: r.vehicule?.TitreAnnonce || "Véhicule",
          vehicleImage: r.vehicule?.photos?.[0]?.URLPhoto || "/placeholder.jpg",
          renterName: locataireNom,
          renterAvatar: r.locataire?.PhotoProfil || "/placeholder-user.jpg",
          dates: formatDateRangeFr(r.DateDebut, r.DateFin),
          grossAmount,
          platformFee,
          netAmount,
          status,
          paymentDate: (tx?.DateTransaction || r.DateCreationReservation || new Date()).toISOString().slice(0, 10),
          payoutDate: status === "completed" ? (tx?.DateTransaction || r.DateCreationReservation || new Date()).toISOString().slice(0, 10) : null,
          paymentMethod: mapPaymentMethod(r.MethodePaiement),
        }
      })

      const totalRevenue = payments.reduce((sum, p) => sum + p.netAmount, 0)
      const monthRevenue = payments
        .filter((p) => new Date(p.paymentDate) >= monthStart)
        .reduce((sum, p) => sum + p.netAmount, 0)
      const pendingPayout = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.netAmount, 0)
      const completedPayout = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.netAmount, 0)

      const nowForChart = new Date()
      const chartStart = new Date(nowForChart.getFullYear(), nowForChart.getMonth() - 5, 1)
      const chartEnd = new Date(nowForChart.getFullYear(), nowForChart.getMonth() + 1, 0, 23, 59, 59, 999)

      const chartReservations = await prisma.reservation.findMany({
        where: {
          proprietaireId: localUserId,
          AND: [{ DateDebut: { lte: chartEnd } }, { DateFin: { gte: chartStart } }],
        },
        take: 5000,
        select: {
          id: true,
          DateCreationReservation: true,
          MontantLocation: true,
          transactions: {
            take: 1,
            orderBy: { DateTransaction: "desc" },
            select: { MontantNet: true, DateTransaction: true, FraisCommission: true },
          },
        },
      })

      const seriesMap = new Map<string, { month: string; revenue: number; bookings: number }>()
      for (let i = 0; i < 6; i++) {
        const d = new Date(nowForChart.getFullYear(), nowForChart.getMonth() - (5 - i), 1)
        seriesMap.set(monthKey(d), { month: monthLabelFr(d), revenue: 0, bookings: 0 })
      }

      for (const r of chartReservations) {
        const basisDate = (r.transactions[0]?.DateTransaction || r.DateCreationReservation || nowForChart) as Date
        if (basisDate < chartStart || basisDate > chartEnd) continue
        const key = monthKey(basisDate)
        const slot = seriesMap.get(key)
        if (!slot) continue

        const gross = Number(r.MontantLocation || 0)
        const tx = r.transactions[0]
        const platformFee = Number(tx?.FraisCommission || 0)
        const net = tx?.MontantNet != null ? Number(tx.MontantNet) : Math.max(0, gross - platformFee)
        slot.revenue += net
        slot.bookings += 1
      }

      const revenueChartData = Array.from(seriesMap.values()).map((x) => ({
        month: x.month,
        revenue: Math.round(x.revenue),
        bookings: x.bookings,
      }))

      const payoutMethod = await prisma.methodePaiementUtilisateur.findFirst({
        where: { utilisateurId: localUserId, Actif: true },
        orderBy: [{ EstMethodePrincipale: "desc" }, { DateAjout: "desc" }],
        select: { TypeMethode: true, Fournisseur: true, DerniersChiffres: true, Alias: true },
      })

      const user = await prisma.user.findUnique({
        where: { id: localUserId },
        select: { NumeroTelephone: true },
      })

      const nextPayout = {
        amount: Math.round(pendingPayout),
        date: addDays(nowForChart, 7).toISOString().slice(0, 10),
        method:
          payoutMethod?.Alias ||
          payoutMethod?.Fournisseur ||
          payoutMethod?.TypeMethode ||
          (payments[0]?.paymentMethod === "mobile_money_orange" ? "Orange Money" : "MTN Mobile Money"),
        accountNumber:
          user?.NumeroTelephone || (payoutMethod?.DerniersChiffres ? `****${payoutMethod.DerniersChiffres}` : ""),
      }

      return NextResponse.json({
        payments,
        stats: {
          totalRevenue: Math.round(totalRevenue),
          monthRevenue: Math.round(monthRevenue),
          pendingPayout: Math.round(pendingPayout),
          completedPayout: Math.round(completedPayout),
        },
        revenueChartData,
        nextPayout,
      })
    }

    const reservations = await prisma.reservation.findMany({
      where: { locataireId: localUserId },
      orderBy: { DateCreationReservation: "desc" },
      take: 100,
      select: {
        id: true,
        NumeroReservation: true,
        DateDebut: true,
        DateFin: true,
        MontantTotal: true,
        DateCreationReservation: true,
        MethodePaiement: true,
        vehicule: {
          select: {
            id: true,
            TitreAnnonce: true,
            photos: { select: { URLPhoto: true }, take: 1, orderBy: { OrdreAffichage: "asc" } },
          },
        },
        proprietaire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
        transactions: {
          take: 1,
          orderBy: { DateTransaction: "desc" },
          select: { StatutTransaction: true, DateTransaction: true },
        },
        factures: {
          take: 1,
          orderBy: { DateEmission: "desc" },
          select: { CheminPDF: true },
        },
      },
    })

    const payments = reservations.map((r) => {
      const proprietaireNom = `${r.proprietaire?.Prenom || ""} ${r.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
      const tx = r.transactions[0]
      const status = mapRenterPaymentStatus(tx?.StatutTransaction)

      return {
        id: `DB-PAY-${r.id}`,
        bookingId: r.NumeroReservation || String(r.id),
        vehicleName: r.vehicule?.TitreAnnonce || "Véhicule",
        vehicleImage: r.vehicule?.photos?.[0]?.URLPhoto || "/placeholder.jpg",
        ownerName: proprietaireNom,
        ownerAvatar: r.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
        dates: formatDateRangeFr(r.DateDebut, r.DateFin),
        amount: Number(r.MontantTotal || 0),
        paymentMethod: mapPaymentMethod(r.MethodePaiement),
        status,
        paymentDate: (tx?.DateTransaction || r.DateCreationReservation || new Date()).toISOString().slice(0, 10),
        invoiceUrl: r.factures?.[0]?.CheminPDF || undefined,
      }
    })

    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0)
    const thisMonth = payments
      .filter((p) => new Date(p.paymentDate) >= monthStart)
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payments,
      stats: {
        totalSpent: Math.round(totalSpent),
        thisMonth: Math.round(thisMonth),
      },
    })
  } catch (error) {
    console.error("[API] Payments fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { identifiant_reservation, methode_paiement } = await req.json()
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const response = await backendApi.createPayment({ identifiant_reservation, methode_paiement }, token)

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: response.status || 400 })
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error("[API] Create payment error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
