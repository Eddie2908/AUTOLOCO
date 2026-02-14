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

function mapUserType(typeUtilisateur: string | null | undefined) {
  const v = (typeUtilisateur || "").toLowerCase()
  if (v.includes("admin")) return "admin" as const
  if (v.includes("prop")) return "proprietaire" as const
  return "locataire" as const
}

function mapUserStatus(statutCompte: string | null | undefined, emailVerifie: boolean | null | undefined) {
  const v = (statutCompte || "").toLowerCase()
  if (v.includes("susp")) return "suspendu" as const
  if (!emailVerifie || v.includes("attente") || v.includes("pending")) return "en_attente" as const
  return "verifie" as const
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
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const users = await prisma.user.findMany({
      orderBy: { DateInscription: "desc" },
      take: 1000,
      select: {
        id: true,
        Nom: true,
        Prenom: true,
        Email: true,
        NumeroTelephone: true,
        PhotoProfil: true,
        TypeUtilisateur: true,
        StatutCompte: true,
        EmailVerifie: true,
        DateInscription: true,
      },
    })

    const adminUsers = users.map((u) => {
      const type = mapUserType(u.TypeUtilisateur)
      const statut = mapUserStatus(u.StatutCompte, u.EmailVerifie)

      return {
        id: String(u.id),
        type,
        email: u.Email,
        nom: u.Nom,
        prenom: u.Prenom,
        telephone: u.NumeroTelephone || "",
        ville: "",
        quartier: "",
        avatar: u.PhotoProfil || "/placeholder-user.jpg",
        dateInscription: (u.DateInscription || new Date()).toISOString(),
        statut,
        badge: null,
        noteGlobale: null,
        totalTransactions: 0,
        lastActivity: (u.DateInscription || new Date()).toISOString(),
        flags: 0,
      }
    })

    const total = users.length
    const newThisWeek = users.filter((u) => u.DateInscription && new Date(u.DateInscription) >= weekAgo).length
    const locataires = adminUsers.filter((u) => u.type === "locataire").length
    const proprietaires = adminUsers.filter((u) => u.type === "proprietaire").length

    return NextResponse.json({
      users: adminUsers,
      stats: {
        total,
        newThisWeek,
        locataires,
        proprietaires,
      },
    })
  } catch (error) {
    console.error("[API] Admin users error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
