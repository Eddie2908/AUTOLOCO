import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export async function POST(req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const response = await backendApi.addFavorite(Number.parseInt(vehicleId), token)

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: response.status || 400 })
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error("[API] Add favorite error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const response = await backendApi.removeFavorite(Number.parseInt(vehicleId), token)

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: response.status || 400 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[API] Remove favorite error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
