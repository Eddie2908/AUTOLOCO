import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"

export async function GET() {
  try {
    const backendHealth = await backendApi.healthCheck()

    return NextResponse.json({
      frontend: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
      backend: backendHealth.data || {
        status: "unavailable",
        error: backendHealth.error?.message,
      },
    })
  } catch (error) {
    return NextResponse.json({
      frontend: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
      backend: {
        status: "unavailable",
        error: "Connection failed",
      },
    })
  }
}
