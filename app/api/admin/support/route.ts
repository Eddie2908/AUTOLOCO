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

function mapTicketStatus(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("resol") || v.includes("résol") || v.includes("close") || v.includes("ferm")) return "resolved" as const
  if (v.includes("cours") || v.includes("progress") || v.includes("trait")) return "in_progress" as const
  return "open" as const
}

function mapTicketPriority(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("urgent") || v.includes("crit")) return "urgent" as const
  if (v.includes("haut") || v.includes("high")) return "high" as const
  if (v.includes("moy") || v.includes("medium")) return "medium" as const
  return "low" as const
}

function mapTicketCategory(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("pai") || v.includes("payment")) return "payment" as const
  if (v.includes("assur") || v.includes("insurance")) return "insurance" as const
  if (v.includes("compte") || v.includes("account")) return "account" as const
  if (v.includes("lit") || v.includes("disput")) return "dispute" as const
  if (v.includes("tech") || v.includes("bug")) return "technical" as const
  return "other" as const
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

    const ticketsRaw = await prisma.reclamation.findMany({
      orderBy: { DateCreation: "desc" },
      take: 200,
      select: {
        id: true,
        NumeroReclamation: true,
        SujetReclamation: true,
        DescriptionReclamation: true,
        CategorieReclamation: true,
        TypeReclamation: true,
        PrioriteReclamation: true,
        StatutReclamation: true,
        DateCreation: true,
        reclamant: { select: { Prenom: true, Nom: true, PhotoProfil: true } },
      },
    })

    const tickets = ticketsRaw.map((t) => {
      const user = `${t.reclamant?.Prenom || ""} ${t.reclamant?.Nom || ""}`.trim() || "Utilisateur"
      const status = mapTicketStatus(t.StatutReclamation)
      const priority = mapTicketPriority(t.PrioriteReclamation)
      const category = mapTicketCategory(t.CategorieReclamation || t.TypeReclamation)

      return {
        id: t.NumeroReclamation || `REC-${t.id}`,
        user,
        userAvatar: t.reclamant?.PhotoProfil || "/placeholder-user.jpg",
        subject: t.SujetReclamation,
        category,
        priority,
        status,
        lastMessage: (t.DescriptionReclamation || "").slice(0, 180),
        date: (t.DateCreation || new Date()).toISOString(),
        unread: false,
      }
    })

    const opened = tickets.filter((t) => t.status === "open").length
    const inProgress = tickets.filter((t) => t.status === "in_progress").length

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const resolvedToday = ticketsRaw.filter((t) => {
      const status = mapTicketStatus(t.StatutReclamation)
      const date = t.DateCreation ? new Date(t.DateCreation) : null
      return status === "resolved" && date && date >= todayStart
    }).length

    const urgent = tickets.filter((t) => t.priority === "urgent").length

    return NextResponse.json({
      tickets,
      stats: {
        opened,
        inProgress,
        resolvedToday,
        urgent,
      },
    })
  } catch (error) {
    console.error("[API] Admin support error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
