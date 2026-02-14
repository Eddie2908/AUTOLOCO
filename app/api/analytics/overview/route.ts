import { type NextRequest, NextResponse } from "next/server"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const start_date = searchParams.get("start_date")
  const end_date = searchParams.get("end_date")

  const token = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  try {
    const url = new URL(`${BACKEND_API_URL}/api/v1/analytics/overview`)
    if (start_date) url.searchParams.set("start_date", start_date)
    if (end_date) url.searchParams.set("end_date", end_date)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des analytics")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
