import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

function buildFeaturesList(v: Record<string, unknown>): string[] {
  const features: string[] = []
  if (v.Climatisation) features.push("Climatisation")
  if (v.GPS) features.push("GPS")
  if (v.Bluetooth) features.push("Bluetooth")
  if (v.CameraRecul) features.push("Caméra de recul")
  if (v.SiegesEnCuir) features.push("Sièges en cuir")
  if (v.ToitOuvrant) features.push("Toit ouvrant")
  if (v.RegulateursVitesse) features.push("Régulateur de vitesse")
  if (v.AirbagsMultiples) features.push("Airbags multiples")
  return features
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const numericId = Number.parseInt(id, 10)

    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ error: "Vehicule non trouve" }, { status: 404 })
    }

    const dbVehicle = await prisma.vehicle.findUnique({
      where: { id: numericId },
      include: {
        photos: { orderBy: { OrdreAffichage: "asc" } },
        categorie: true,
        modele: { include: { marque: true } },
        proprietaire: {
          select: {
            id: true,
            Nom: true,
            Prenom: true,
            PhotoProfil: true,
            NotesUtilisateur: true,
            EmailVerifie: true,
          },
        },
      },
    })

    if (!dbVehicle) {
      return NextResponse.json({ error: "Vehicule non trouve" }, { status: 404 })
    }

    const ownerName =
      `${dbVehicle.proprietaire?.Prenom || ""} ${dbVehicle.proprietaire?.Nom || ""}`.trim() || "Proprietaire"

    const vehicle = {
      id: String(dbVehicle.id),
      name: dbVehicle.TitreAnnonce,
      type: dbVehicle.categorie?.NomCategorie || "",
      image: dbVehicle.photos[0]?.URLPhoto || "/placeholder.jpg",
      images: dbVehicle.photos.map((p) => p.URLPhoto),
      price: Number(dbVehicle.PrixJournalier),
      deposit: Number(dbVehicle.CautionRequise || 0),
      location: dbVehicle.AdresseComplete || dbVehicle.LocalisationVille,
      city: dbVehicle.LocalisationVille,
      fuel: dbVehicle.TypeCarburant,
      transmission: dbVehicle.TypeTransmission,
      seats: dbVehicle.NombrePlaces,
      year: dbVehicle.Annee,
      mileage: dbVehicle.Kilometrage || 0,
      rating: Math.round(Number(dbVehicle.NotesVehicule || 0) * 10) / 10,
      reviews: dbVehicle.NombreReservations || 0,
      description: dbVehicle.DescriptionVehicule || "",
      features: buildFeaturesList(dbVehicle as unknown as Record<string, unknown>),
      featured: dbVehicle.EstVedette || false,
      verified: dbVehicle.StatutVerification === "Verifie",
      instantBooking: false,
      owner: {
        name: ownerName,
        avatar: dbVehicle.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
        rating: Math.round(Number(dbVehicle.proprietaire?.NotesUtilisateur || 0) * 10) / 10,
        verified: dbVehicle.proprietaire?.EmailVerifie || false,
        responseTime: "< 1h",
      },
    }

    const responseObj = NextResponse.json(vehicle)
    // Cache individual vehicle pages for 1 min, serve stale for 5 min
    responseObj.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300")
    return responseObj
  } catch (error) {
    console.error("[API] Vehicle fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
