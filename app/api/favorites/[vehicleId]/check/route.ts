import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export async function GET(req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ is_favorite: false })
    }

    const response = await backendApi.checkFavorite(Number.parseInt(vehicleId), token)

    if (response.error) {
      return NextResponse.json({ is_favorite: false })
    }

    return NextResponse.json(response.data || { is_favorite: false })
  } catch (error) {
    console.error("[API] Check favorite error:", error)
    return NextResponse.json({ is_favorite: false })
  }
}
