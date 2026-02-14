import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { backendApi } from "@/lib/api/backend"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
    const page_size = searchParams.get("page_size") ? Number.parseInt(searchParams.get("page_size")!) : 20

    // Call the backend API directly with the auth token
    const response = await fetch(
      `${BACKEND_URL}/api/v1/vehicles/my-vehicles?page=${page}&page_size=${page_size}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des véhicules" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] My vehicles error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
