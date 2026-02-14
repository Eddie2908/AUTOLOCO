import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

// Fallback demo data shown when the database is not connected
const DEMO_VEHICLES = [
  {
    id: "demo-1",
    name: "Toyota Land Cruiser Prado",
    type: "SUV",
    price: 45000,
    rating: 4.8,
    reviews: 24,
    location: "Douala",
    fuel: "Diesel",
    transmission: "Automatique",
    seats: 7,
    image: "/placeholder.jpg",
    owner: { name: "Jean Mbarga", avatar: "/placeholder-user.jpg" },
  },
  {
    id: "demo-2",
    name: "Mercedes Classe C 200",
    type: "Berline",
    price: 35000,
    rating: 4.6,
    reviews: 18,
    location: "Yaounde",
    fuel: "Essence",
    transmission: "Automatique",
    seats: 5,
    image: "/placeholder.jpg",
    owner: { name: "Marie Fotso", avatar: "/placeholder-user.jpg" },
  },
  {
    id: "demo-3",
    name: "Toyota Hilux Double Cabine",
    type: "Pick-up",
    price: 40000,
    rating: 4.7,
    reviews: 15,
    location: "Douala",
    fuel: "Diesel",
    transmission: "Manuelle",
    seats: 5,
    image: "/placeholder.jpg",
    owner: { name: "Paul Ndjock", avatar: "/placeholder-user.jpg" },
  },
  {
    id: "demo-4",
    name: "Hyundai Tucson",
    type: "SUV",
    price: 30000,
    rating: 4.5,
    reviews: 12,
    location: "Yaounde",
    fuel: "Essence",
    transmission: "Automatique",
    seats: 5,
    image: "/placeholder.jpg",
    owner: { name: "Aline Tchoupo", avatar: "/placeholder-user.jpg" },
  },
]

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { StatutVehicule: "Actif" },
      orderBy: [{ EstVedette: "desc" }, { NotesVehicule: "desc" }, { NombreReservations: "desc" }],
      take: 4,
      select: {
        id: true,
        TitreAnnonce: true,
        PrixJournalier: true,
        NotesVehicule: true,
        NombreReservations: true,
        LocalisationVille: true,
        TypeCarburant: true,
        TypeTransmission: true,
        NombrePlaces: true,
        categorie: { select: { NomCategorie: true } },
        photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
        proprietaire: {
          select: { Prenom: true, Nom: true, PhotoProfil: true },
        },
      },
    })

    const featured = vehicles.map((v) => ({
      id: String(v.id),
      name: v.TitreAnnonce,
      type: v.categorie?.NomCategorie || "",
      price: Number(v.PrixJournalier),
      rating: Math.round(Number(v.NotesVehicule || 0) * 10) / 10,
      reviews: v.NombreReservations || 0,
      location: v.LocalisationVille,
      fuel: v.TypeCarburant,
      transmission: v.TypeTransmission,
      seats: v.NombrePlaces,
      image: v.photos[0]?.URLPhoto || "/placeholder.jpg",
      owner: {
        name: `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Proprietaire",
        avatar: v.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
      },
    }))

    const res = NextResponse.json({ vehicles: featured })
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res
  } catch (error) {
    console.warn("[API] Featured vehicles: database unavailable, using demo data")
    const res = NextResponse.json({ vehicles: DEMO_VEHICLES })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return res
  }
}
