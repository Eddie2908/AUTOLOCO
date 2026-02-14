import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { logoutFromBackend } from "@/lib/auth/backend-auth"

export async function POST() {
  try {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const refreshToken = cookieStore.get(AUTH_CONFIG.REFRESH_TOKEN_KEY)?.value

    if (accessToken && !accessToken.startsWith("demo_") && !accessToken.startsWith("local_")) {
      await logoutFromBackend(accessToken, refreshToken)
    }

    cookieStore.delete(AUTH_CONFIG.ACCESS_TOKEN_KEY)
    cookieStore.delete(AUTH_CONFIG.REFRESH_TOKEN_KEY)
    cookieStore.delete("autoloco_user_role")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Logout error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
