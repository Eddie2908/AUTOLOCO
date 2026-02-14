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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const skip = searchParams.get("skip") || "0"
  const limit = searchParams.get("limit") || "20"
  const unread_only = searchParams.get("unread_only") || "false"
  const category = searchParams.get("category")

  const cookieStore = await cookies()
  const authHeader = request.headers.get("authorization")
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

  // Try backend first if we have a non-local token
  if (!getLocalUserIdFromAccessToken(token)) {
    try {
      const url = new URL(`${BACKEND_API_URL}/api/v1/notifications`)
      url.searchParams.set("skip", skip)
      url.searchParams.set("limit", limit)
      url.searchParams.set("unread_only", unread_only)
      if (category) url.searchParams.set("category", category)

      const response = await fetch(url.toString(), {
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
    const where: any = { utilisateurId: userId }
    if (unread_only === "true") where.EstLu = false
    if (category) where.TypeNotification = category

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { DateCreation: "desc" },
      skip: Number.parseInt(skip),
      take: Number.parseInt(limit),
      select: {
        id: true,
        TitreNotification: true,
        MessageNotification: true,
        TypeNotification: true,
        DateCreation: true,
        EstLu: true,
        LienNotification: true,
      },
    })

    const mappedNotifications = notifications.map((n) => ({
      id: n.id,
      title: n.TitreNotification || "",
      content: n.MessageNotification || "",
      type: n.TypeNotification || "info",
      category: n.TypeNotification || "general",
      is_read: !!n.EstLu,
      created_at: n.DateCreation?.toISOString() || "",
      action_url: n.LienNotification,
    }))

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        utilisateurId: userId,
        EstLu: false,
      },
    })

    return NextResponse.json({
      notifications: mappedNotifications,
      unread_count: unreadCount,
      total: mappedNotifications.length,
      page: 1,
      page_size: Number.parseInt(limit),
    })
  } catch (error) {
    console.error("[API] Notifications error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
