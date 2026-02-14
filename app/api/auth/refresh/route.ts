import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { refreshBackendToken } from "@/lib/auth/backend-auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(AUTH_CONFIG.REFRESH_TOKEN_KEY)?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (refreshToken.startsWith("demo_")) {
      return NextResponse.json({ success: true, is_demo_user: true })
    }

    const refreshed = await refreshBackendToken(refreshToken)
    if (!refreshed?.access_token) {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 })
    }

    cookieStore.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, refreshed.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Refresh error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
