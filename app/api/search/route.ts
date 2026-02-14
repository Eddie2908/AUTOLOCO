import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")
    const city = searchParams.get("city") || undefined
    const type = searchParams.get("type") || undefined

    if (!q || q.length < 2) {
      return NextResponse.json([])
    }

    const where: Record<string, unknown> = {
      StatutVehicule: "Actif",
      OR: [
        { TitreAnnonce: { contains: q, mode: "insensitive" } },
        { DescriptionVehicule: { contains: q, mode: "insensitive" } },
        { LocalisationVille: { contains: q, mode: "insensitive" } },
        { modele: { NomModele: { contains: q, mode: "insensitive" } } },
        { modele: { marque: { NomMarque: { contains: q, mode: "insensitive" } } } },
      ],
    }

    if (city && city !== "all") where.LocalisationVille = city
    if (type && type !== "all") where.categorie = { NomCategorie: type }

    const results = await prisma.vehicle.findMany({
      where,
      orderBy: [{ NotesVehicule: "desc" }, { DateCreation: "desc" }],
      take: 20,
      include: {
        categorie: true,
        modele: { include: { marque: true } },
        photos: { take: 1, orderBy: { OrdreAffichage: "asc" } },
      },
    })

    const responseObj = NextResponse.json(
      results.map((v) => ({
        id: String(v.id),
        name: v.TitreAnnonce,
        brand: v.modele?.marque?.NomMarque || "",
        model: v.modele?.NomModele || "",
        city: v.LocalisationVille,
        type: v.categorie?.NomCategorie || "",
        image: v.photos[0]?.URLPhoto || "/placeholder.jpg",
      })),
    )

    // Cache search results briefly
    responseObj.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60")
    return responseObj
  } catch (error) {
    console.error("[API] Search error:", error)
    return NextResponse.json([])
  }
}
