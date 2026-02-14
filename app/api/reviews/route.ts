import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"

export async function POST(req: Request) {
  try {
    const { identifiant_reservation, note, commentaire } = await req.json()
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const response = await backendApi.createReview({ identifiant_reservation, note, commentaire }, token)

    if (response.error) {
      return NextResponse.json({ error: response.error.message }, { status: response.status || 400 })
    }

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    console.error("[API] Create review error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
