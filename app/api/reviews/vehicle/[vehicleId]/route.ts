import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"

export async function GET(req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params

    const response = await backendApi.getVehicleReviews(Number.parseInt(vehicleId))

    if (response.error) {
      return NextResponse.json({ reviews: [], total: 0 })
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Reviews fetch error:", error)
    return NextResponse.json({ reviews: [], total: 0 })
  }
}
