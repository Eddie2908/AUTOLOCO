import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"

function getLocalUserIdFromAccessToken(accessToken: string) {
  if (!accessToken.startsWith("local_")) return null
  const parts = accessToken.split("_")
  const userId = Number.parseInt(parts[1] || "", 10)
  return Number.isFinite(userId) ? userId : null
}

function isAdminType(typeUtilisateur: string | null | undefined) {
  return (typeUtilisateur || "").toLowerCase().includes("admin")
}

function mapVehicleTypeFromCategorie(label: string | null | undefined) {
  const v = (label || "").toLowerCase()
  if (v.includes("berline")) return "berline" as const
  if (v.includes("suv")) return "suv" as const
  if (v.includes("luxe")) return "luxe" as const
  if (v.includes("util")) return "utilitaire" as const
  if (v.includes("moto")) return "moto" as const
  if (v.includes("4x4") || v.includes("tout")) return "4x4" as const
  return "suv" as const
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = req.headers.get("Authorization")
    const headerToken = authHeader?.replace("Bearer ", "")
    const cookieToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value
    const token = headerToken || cookieToken

    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const localUserId = getLocalUserIdFromAccessToken(token)
    if (!localUserId) {
      return NextResponse.json({ error: "Session locale requise" }, { status: 400 })
    }

    const admin = await prisma.user.findUnique({
      where: { id: localUserId },
      select: { id: true, TypeUtilisateur: true },
    })

    if (!admin || !isAdminType(admin.TypeUtilisateur)) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { DateCreation: "desc" },
      take: 500,
      select: {
        id: true,
        TitreAnnonce: true,
        Annee: true,
        PrixJournalier: true,
        LocalisationVille: true,
        StatutVehicule: true,
        NotesVehicule: true,
        NombreReservations: true,
        categorie: { select: { NomCategorie: true } },
        modele: { select: { NomModele: true, marque: { select: { NomMarque: true } } } },
        proprietaire: { select: { Nom: true, Prenom: true, PhotoProfil: true } },
        photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
      },
    })

    const mapped = vehicles.map((v) => {
      const ownerName = `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
      const available = (v.StatutVehicule || "").toLowerCase().includes("act")

      return {
        id: String(v.id),
        name: v.TitreAnnonce,
        brand: v.modele?.marque?.NomMarque || "",
        model: v.modele?.NomModele || "",
        year: v.Annee,
        type: mapVehicleTypeFromCategorie(v.categorie?.NomCategorie),
        price: Number(v.PrixJournalier || 0),
        image: v.photos?.[0]?.URLPhoto || "/placeholder.jpg",
        images: [v.photos?.[0]?.URLPhoto || "/placeholder.jpg"],
        rating: Number(v.NotesVehicule || 0),
        reviews: Number(v.NombreReservations || 0),
        city: v.LocalisationVille,
        available,
        owner: {
          name: ownerName,
          avatar: v.proprietaire?.PhotoProfil || "/placeholder-user.jpg",
          rating: 0,
          responseTime: "",
          memberSince: "",
          verified: true,
        },
      }
    })

    const total = mapped.length
    const active = mapped.filter((x) => x.available).length

    return NextResponse.json({
      vehicles: mapped,
      stats: {
        total,
        active,
        pending: 0,
        suspended: total - active,
      },
    })
  } catch (error) {
    console.error("[API] Admin vehicles error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
