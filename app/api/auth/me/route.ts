/**
 * Current User API Route
 * =======================
 *
 * Returns the current authenticated user's information.
 * Fetches user from backend using access token from httpOnly cookie.
 */

import { NextResponse } from "next/server"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

export async function GET(req: Request) {
  try {
    // Get token from cookie or header
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const accessToken = headerToken || cookieToken

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Local DB token fallback
    if (accessToken.startsWith("local_")) {
      const parts = accessToken.split("_")
      const userId = Number.parseInt(parts[1] || "", 10)
      if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          Email: true,
          Nom: true,
          Prenom: true,
          TypeUtilisateur: true,
          PhotoProfil: true,
          StatutCompte: true,
          NumeroTelephone: true,
        },
      })

      if (!user) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
      }

      return NextResponse.json({
        id: user.id.toString(),
        email: user.Email,
        nom: user.Nom,
        prenom: user.Prenom,
        type: user.TypeUtilisateur,
        avatar: user.PhotoProfil,
        statut: user.StatutCompte || "Actif",
        telephone: user.NumeroTelephone,
        ville: null,
        is_local_user: true,
      })
    }

    // If we have a valid backend token, try to get fresh data
    if (accessToken && !accessToken.startsWith("demo_") && !accessToken.startsWith("local_")) {
      const backendUser = await getCurrentUserFromBackend(accessToken)

      if (backendUser) {
        return NextResponse.json({
          id: backendUser.id,
          email: backendUser.email,
          nom: backendUser.nom,
          prenom: backendUser.prenom,
          type: backendUser.type,
          avatar: backendUser.avatar,
          statut: backendUser.statut,
          telephone: backendUser.telephone,
          ville: backendUser.ville,
          quartier: backendUser.quartier,
          note_globale: backendUser.note_globale,
          badge: backendUser.badge,
          date_inscription: backendUser.date_inscription,
        })
      }
    }

    // Minimal demo fallback
    if (accessToken.startsWith("demo_")) {
      const role = cookieStore.get("autoloco_user_role")?.value || "locataire"
      return NextResponse.json({
        id: "demo",
        email: "demo@autoloco.cm",
        nom: "Demo",
        prenom: null,
        type: role,
        avatar: null,
        statut: "verifie",
        is_demo_user: true,
      })
    }

    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  } catch (error) {
    console.error("[API] Get me error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
