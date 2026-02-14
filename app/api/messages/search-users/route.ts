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

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const url = new URL(req.url)
    const query = url.searchParams.get("q")?.trim() || ""

    if (query.length < 2) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: localUserId },
        StatutCompte: "Actif",
        OR: [
          { Nom: { contains: query } },
          { Prenom: { contains: query } },
          { Email: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        Nom: true,
        Prenom: true,
        PhotoProfil: true,
        TypeUtilisateur: true,
      },
    })

    const mapped = users.map((u) => ({
      id: u.id,
      name: `${u.Prenom || ""} ${u.Nom || ""}`.trim() || "Utilisateur",
      avatar: u.PhotoProfil || "/placeholder-user.jpg",
      role: u.TypeUtilisateur || "Locataire",
    }))

    return NextResponse.json({ users: mapped })
  } catch (error) {
    console.error("[API] Search users error:", error)
    return NextResponse.json({ users: [] })
  }
}
