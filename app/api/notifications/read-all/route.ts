import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

async function getUserIdFromBackendToken(token: string) {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.id ? Number(data.id) : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const authHeader = request.headers.get("authorization")
  const headerToken = authHeader?.replace("Bearer ", "")
  const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
  const token = headerToken || cookieToken

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  let userId: number | null = null

  // Try local token first
  userId = getLocalUserIdFromAccessToken(token)

  // If failed, try backend token
  if (!userId) {
    userId = await getUserIdFromBackendToken(token)
  }

  if (!userId) {
    return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
  }

  // Try backend first if we have a non-local token
  if (!getLocalUserIdFromAccessToken(token)) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/v1/notifications/read-all`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch {
      // Backend error, fall through to local
    }
  }

  // Fallback to local database
  try {
    await prisma.notification.updateMany({
      where: {
        utilisateurId: userId,
        EstLu: false,
      },
      data: { EstLu: true },
    })

    return NextResponse.json({ message: "Toutes les notifications ont été marquées comme lues" })
  } catch (error) {
    console.error("[API] Mark all read error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
