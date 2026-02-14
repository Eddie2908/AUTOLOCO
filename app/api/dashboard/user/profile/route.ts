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

async function getUserIdFromBackendToken(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ? Number(data.id) : null
  } catch {
    return null
  }
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

    let userId: number | null = null

    // Essayer d'abord avec un token local
    userId = getLocalUserIdFromAccessToken(token)

    // Si échec, essayer avec un token backend
    if (!userId) {
      userId = await getUserIdFromBackendToken(token)
    }

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        Nom: true,
        Prenom: true,
        Email: true,
        NumeroTelephone: true,
        PhotoProfil: true,
        DateInscription: true,
        EmailVerifie: true,
        TypeUtilisateur: true,
        StatutCompte: true,
        adresses: {
          where: { TypeAdresse: "Principale" },
          take: 1,
          select: { AdresseLigne1: true, AdresseLigne2: true, Ville: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const profile = {
      id: String(user.id),
      firstName: user.Prenom || "",
      lastName: user.Nom || "",
      email: user.Email || "",
      phone: user.NumeroTelephone || "",
      address: user.adresses[0] ? [user.adresses[0].AdresseLigne1, user.adresses[0].AdresseLigne2].filter(Boolean).join(", ") : "",
      city: user.adresses[0]?.Ville || "",
      avatar: user.PhotoProfil || null,
      memberSince: (user.DateInscription || new Date()).toISOString(),
      isEmailVerified: !!user.EmailVerifie,
      userType: user.TypeUtilisateur || "",
      status: user.StatutCompte || "",
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[API] User profile error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    let userId: number | null = null

    // Essayer d'abord avec un token local
    userId = getLocalUserIdFromAccessToken(token)

    // Si échec, essayer avec un token backend
    if (!userId) {
      userId = await getUserIdFromBackendToken(token)
    }

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const body = await req.json()
    const { firstName, lastName, phone, address, city } = body

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        Prenom: typeof firstName === "string" ? firstName : undefined,
        Nom: typeof lastName === "string" ? lastName : undefined,
        NumeroTelephone: typeof phone === "string" ? phone : undefined,
      },
      select: {
        id: true,
        Nom: true,
        Prenom: true,
        Email: true,
        NumeroTelephone: true,
        PhotoProfil: true,
      },
    })

    // If address provided, update/create AdresseUtilisateur
    if (typeof address === "string" || typeof city === "string") {
      const existing = await prisma.adresseUtilisateur.findFirst({
        where: { utilisateurId: userId, TypeAdresse: "Principale" },
      })
      if (existing) {
        await prisma.adresseUtilisateur.update({
          where: { id: existing.id },
          data: {
            ...(typeof address === "string" && { AdresseLigne1: address }),
            ...(typeof city === "string" && { Ville: city }),
          },
        })
      } else {
        await prisma.adresseUtilisateur.create({
          data: {
            utilisateurId: userId,
            TypeAdresse: "Principale",
            AdresseLigne1: typeof address === "string" ? address : "",
            Ville: typeof city === "string" ? city : "",
          },
        })
      }
    }

    const refreshed = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        Nom: true,
        Prenom: true,
        Email: true,
        NumeroTelephone: true,
        PhotoProfil: true,
        adresses: {
          where: { TypeAdresse: "Principale" },
          take: 1,
          select: { AdresseLigne1: true, AdresseLigne2: true, Ville: true },
        },
      },
    })

    return NextResponse.json({
      id: String(updated.id),
      firstName: refreshed?.Prenom || "",
      lastName: refreshed?.Nom || "",
      email: refreshed?.Email || "",
      phone: refreshed?.NumeroTelephone || "",
      address: refreshed?.adresses[0] ? [refreshed.adresses[0].AdresseLigne1, refreshed.adresses[0].AdresseLigne2].filter(Boolean).join(", ") : "",
      city: refreshed?.adresses[0]?.Ville || "",
      avatar: refreshed?.PhotoProfil || null,
    })
  } catch (error) {
    console.error("[API] Update user profile error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
