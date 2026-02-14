import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

export async function GET() {
  try {
    const [categories, brands, models, cityRows] = await Promise.all([
      prisma.categorieVehicule.findMany({
        orderBy: { NomCategorie: "asc" },
        select: { id: true, NomCategorie: true },
        take: 200,
      }),
      prisma.marqueVehicule.findMany({
        orderBy: { NomMarque: "asc" },
        select: { id: true, NomMarque: true },
        take: 300,
      }),
      prisma.modeleVehicule.findMany({
        orderBy: { NomModele: "asc" },
        select: { id: true, NomModele: true, marqueId: true },
        take: 2000,
      }),
      prisma.vehicle.findMany({
        select: { LocalisationVille: true },
        where: { LocalisationVille: { not: "" } },
        take: 2000,
      }),
    ])

    const citiesFromDb = Array.from(
      new Set(
        cityRows
          .map((r) => (r.LocalisationVille || "").trim())
          .filter((x) => x.length > 0)
          .map((x) => x.toLowerCase()),
      ),
    )

    const fallbackCities = [
      "yaounde",
      "douala",
      "bafoussam",
      "bamenda",
      "garoua",
      "maroua",
      "kribi",
      "limbe",
      "buea",
      "ngaoundere",
    ]

    const fuelTypes = [
      { value: "essence", label: "Essence" },
      { value: "diesel", label: "Diesel" },
      { value: "hybrid", label: "Hybride" },
      { value: "electric", label: "Electrique" },
    ]

    const transmissions = [
      { value: "manuelle", label: "Manuelle" },
      { value: "automatique", label: "Automatique" },
    ]

    const features = [
      "Climatisation",
      "GPS",
      "Bluetooth",
      "Camera de recul",
      "Sieges cuir",
      "Toit ouvrant",
      "Regulateur de vitesse",
      "Aide au stationnement",
      "Apple CarPlay",
      "Android Auto",
      "USB",
      "4x4",
    ]

    return NextResponse.json({
      categories: categories.map((c) => ({ id: String(c.id), name: c.NomCategorie })),
      brands: brands.map((b) => ({ id: String(b.id), name: b.NomMarque })),
      models: models.map((m) => ({ id: String(m.id), name: m.NomModele, brandId: String(m.marqueId) })),
      cities: (citiesFromDb.length > 0 ? citiesFromDb : fallbackCities).sort((a, b) => a.localeCompare(b)),
      fuelTypes,
      transmissions,
      features,
    })
  } catch (error) {
    console.error("[API] Vehicles meta error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
