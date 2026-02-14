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

function mapPriority(value: string | null | undefined) {
  const v = (value || "").toLowerCase()
  if (v.includes("urgent") || v.includes("crit")) return "urgent" as const
  if (v.includes("haut") || v.includes("high")) return "high" as const
  if (v.includes("moy") || v.includes("medium")) return "medium" as const
  return "low" as const
}

function toFrDateTime(date: Date) {
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
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
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Pending vehicles: StatutVerification en attente
    const pendingVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { StatutVerification: { contains: "Attente" } },
          { StatutVerification: { contains: "EnAttente" } },
          { StatutVerification: { contains: "Pending" } },
        ],
      },
      orderBy: { DateCreation: "desc" },
      take: 20,
      select: {
        id: true,
        TitreAnnonce: true,
        StatutVerification: true,
        DateCreation: true,
        proprietaire: { select: { Prenom: true, Nom: true, PhotoProfil: true } },
      },
    })

    // Pending user verifications: documents en attente
    const pendingDocs = await prisma.documentUtilisateur.findMany({
      where: {
        OR: [
          { StatutVerification: { contains: "Attente" } },
          { StatutVerification: { contains: "EnAttente" } },
          { StatutVerification: { contains: "Pending" } },
        ],
      },
      orderBy: { DateTeleversement: "desc" },
      take: 20,
      select: {
        id: true,
        TypeDocument: true,
        DateTeleversement: true,
        utilisateur: { select: { id: true, Prenom: true, Nom: true, PhotoProfil: true } },
      },
    })

    // Open complaints as reports
    const openComplaints = await prisma.reclamation.findMany({
      where: {
        OR: [{ StatutReclamation: { contains: "Ouvert" } }, { StatutReclamation: { contains: "Ouverte" } }],
      },
      orderBy: { DateCreation: "desc" },
      take: 20,
      select: {
        id: true,
        NumeroReclamation: true,
        SujetReclamation: true,
        TypeReclamation: true,
        CategorieReclamation: true,
        PrioriteReclamation: true,
        DateCreation: true,
        reclamant: { select: { Prenom: true, Nom: true, PhotoProfil: true } },
      },
    })

    const moderationQueue = [
      ...pendingVehicles.map((v) => {
        const owner = `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
        return {
          id: `VEH-${v.id}`,
          type: "vehicle" as const,
          title: v.TitreAnnonce || "Véhicule",
          description: "Nouveau véhicule nécessitant vérification",
          owner,
          ownerAvatar: v.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
          date: toFrDateTime(v.DateCreation || now),
          priority: "medium" as const,
          reason: "Vérification documents",
          status: "pending" as const,
        }
      }),
      ...pendingDocs.map((d) => {
        const u = d.utilisateur
        const owner = `${u?.Prenom || ""} ${u?.Nom || ""}`.trim() || "Utilisateur"
        return {
          id: `USR-${u?.id || d.id}`,
          type: "user" as const,
          title: `Compte - ${owner}`,
          description: `Document en attente: ${d.TypeDocument}`,
          owner,
          ownerAvatar: u?.PhotoProfil || "/placeholder-user.jpg",
          date: toFrDateTime(d.DateTeleversement || now),
          priority: "medium" as const,
          reason: "Vérification documents",
          status: "pending" as const,
        }
      }),
      ...openComplaints.map((r) => {
        const owner = `${r.reclamant?.Prenom || ""} ${r.reclamant?.Nom || ""}`.trim() || "Utilisateur"
        const priority = mapPriority(r.PrioriteReclamation)
        return {
          id: r.NumeroReclamation || `REP-${r.id}`,
          type: "report" as const,
          title: r.SujetReclamation,
          description: r.CategorieReclamation || r.TypeReclamation,
          owner,
          ownerAvatar: r.reclamant?.PhotoProfil || "/placeholder-user.jpg",
          date: toFrDateTime((r.DateCreation as Date) || now),
          priority,
          reason: r.TypeReclamation,
          status: "pending" as const,
        }
      }),
    ].slice(0, 30)

    // Recent decisions (best-effort): recently modified vehicles/users (not pending) and closed complaints.
    const recentVehicles = await prisma.vehicle.findMany({
      where: {
        NOT: {
          OR: [
            { StatutVerification: { contains: "Attente" } },
            { StatutVerification: { contains: "EnAttente" } },
            { StatutVerification: { contains: "Pending" } },
          ],
        },
      },
      orderBy: { DateDerniereModification: "desc" },
      take: 10,
      select: { id: true, TitreAnnonce: true, StatutVerification: true, DateDerniereModification: true },
    })

    const closedComplaints = await prisma.reclamation.findMany({
      where: {
        OR: [{ StatutReclamation: { contains: "Ferm" } }, { StatutReclamation: { contains: "Rés" } }, { StatutReclamation: { contains: "Res" } }],
      },
      orderBy: [{ DateFermeture: "desc" }, { DateResolution: "desc" }, { DateCreation: "desc" }],
      take: 10,
      select: {
        id: true,
        NumeroReclamation: true,
        SujetReclamation: true,
        StatutReclamation: true,
        DateFermeture: true,
        DateResolution: true,
      },
    })

    const recentDecisions = [
      ...recentVehicles.map((v) => {
        const decision = (v.StatutVerification || "").toLowerCase().includes("rej") ? ("rejected" as const) : ("approved" as const)
        const date = v.DateDerniereModification ? new Date(v.DateDerniereModification) : now
        return {
          id: `VEH-${v.id}`,
          title: v.TitreAnnonce || "Véhicule",
          decision,
          moderator: "Admin",
          date: toFrDateTime(date),
          reason: v.StatutVerification || "Décision",
        }
      }),
      ...closedComplaints.map((c) => {
        const decision = (c.StatutReclamation || "").toLowerCase().includes("rej") ? ("rejected" as const) : ("approved" as const)
        const date = (c.DateFermeture || c.DateResolution || now) as Date
        return {
          id: c.NumeroReclamation || `REP-${c.id}`,
          title: c.SujetReclamation,
          decision,
          moderator: "Admin",
          date: toFrDateTime(new Date(date)),
          reason: c.StatutReclamation || "Décision",
        }
      }),
    ].slice(0, 10)

    const stats = {
      pending: moderationQueue.length,
      approvedToday: recentDecisions.filter((d) => d.decision === "approved" && new Date(d.date) >= todayStart).length,
      rejectedToday: recentDecisions.filter((d) => d.decision === "rejected" && new Date(d.date) >= todayStart).length,
      urgent: moderationQueue.filter((i) => i.priority === "urgent").length,
    }

    return NextResponse.json({ stats, moderationQueue, recentDecisions })
  } catch (error) {
    console.error("[API] Admin moderation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
