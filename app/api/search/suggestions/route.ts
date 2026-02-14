import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { prisma } from "@/lib/db/prisma-client"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    if (!q || q.length < 1) {
      return NextResponse.json([])
    }

    const response = await backendApi.getSearchSuggestions(q)

    if (response.error) {
      const query = q

      const [brandsRows, cityRows] = await Promise.all([
        prisma.marqueVehicule.findMany({
          where: { NomMarque: { contains: query } },
          orderBy: { EstPopulaire: "desc" },
          take: 5,
          select: { NomMarque: true },
        }),
        prisma.vehicle.findMany({
          where: { LocalisationVille: { contains: query } },
          distinct: ["LocalisationVille"],
          take: 5,
          select: { LocalisationVille: true },
        }),
      ])

      const brands = brandsRows
        .map((b) => b.NomMarque)
        .filter((x): x is string => typeof x === "string" && x.length > 0)
        .slice(0, 5)
        .map((b) => ({ text: b, type: "brand", count: 0 }))

      const cities = cityRows
        .map((c) => c.LocalisationVille)
        .filter((x): x is string => typeof x === "string" && x.length > 0)
        .slice(0, 5)
        .map((c) => ({ text: c, type: "city", count: 0 }))

      return NextResponse.json([...brands, ...cities].slice(0, 8))
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Suggestions error:", error)
    return NextResponse.json([])
  }
}
