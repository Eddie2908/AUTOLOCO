import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

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

    const response = await backendApi.getFavorites(token)

    if (response.error) {
      // Return empty array if backend unavailable
      return NextResponse.json([])
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Favorites fetch error:", error)
    return NextResponse.json([])
  }
}
