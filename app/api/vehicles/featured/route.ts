import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"
import { prisma } from "@/lib/db/prisma-client"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 6

    const response = await backendApi.getFeaturedVehicles(limit)

    if (response.error) {
      const featured = await prisma.vehicle.findMany({
        where: { StatutVehicule: "Actif" },
        orderBy: [{ EstVedette: "desc" }, { NotesVehicule: "desc" }, { DateCreation: "desc" }],
        take: limit,
        include: {
          categorie: true,
          modele: { include: { marque: true } },
          photos: { take: 1, orderBy: { OrdreAffichage: "asc" } },
        },
      })

      return NextResponse.json(
        featured.map((v) => ({
          id: String(v.id),
          brand: v.modele?.marque?.NomMarque || "",
          model: v.modele?.NomModele || "",
          name: v.TitreAnnonce,
          type: v.categorie?.NomCategorie || "",
          price: Number(v.PrixJournalier),
          city: v.LocalisationVille,
          location: v.AdresseComplete || v.LocalisationVille,
          fuel: v.TypeCarburant,
          transmission: v.TypeTransmission,
          seats: v.NombrePlaces,
          year: v.Annee,
          image: v.photos[0]?.URLPhoto || "/placeholder.jpg",
          featured: v.EstVedette || false,
          verified: v.StatutVerification === "Verifie",
          rating: Math.round(Number(v.NotesVehicule || 0) * 10) / 10,
        })),
      )
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Featured vehicles fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
