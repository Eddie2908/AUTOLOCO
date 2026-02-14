import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

export async function GET() {
  try {
    const [totalVehicles, totalUsers, avgRating] = await Promise.all([
      prisma.vehicle.count({ where: { StatutVehicule: "Actif" } }),
      prisma.user.count(),
      prisma.vehicle.aggregate({
        _avg: { NotesVehicule: true },
        where: { StatutVehicule: "Actif", NotesVehicule: { gt: 0 } },
      }),
    ])

    const rating = Math.round((Number(avgRating._avg.NotesVehicule) || 0) * 10) / 10

    const res = NextResponse.json({
      stats: [
        { value: `${totalVehicles}+`, label: "Vehicules" },
        { value: `${totalUsers}+`, label: "Utilisateurs" },
        { value: rating > 0 ? `${rating}` : "4.8", label: "Note moyenne" },
      ],
    })
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res
  } catch (error) {
    console.warn("[API] Public stats: database unavailable, using demo data")
    const res = NextResponse.json({
      stats: [
        { value: "150+", label: "Vehicules" },
        { value: "500+", label: "Utilisateurs" },
        { value: "4.8", label: "Note moyenne" },
      ],
    })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return res
  }
}
