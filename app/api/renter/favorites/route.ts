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

    // If JWT token (not local_), proxy to FastAPI backend
    if (!localUserId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const backendRes = await fetch(`${apiUrl}/api/v1/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!backendRes.ok) {
        const err = await backendRes.json().catch(() => ({}))
        return NextResponse.json({ error: err.detail || "Erreur backend" }, { status: backendRes.status })
      }

      const data = await backendRes.json()
      const backendVehicles: any[] = Array.isArray(data) ? data : []

      const vehicles = backendVehicles.map((v: any) => ({
        id: String(v.id),
        name: v.name || "Véhicule",
        type: v.type || "",
        price: Number(v.price || 0),
        rating: v.rating || 0,
        reviews: v.reviews || 0,
        image: v.image || "/placeholder.jpg",
        location: v.city || v.location || "",
        owner: v.owner?.name || "Propriétaire",
        available: v.available ?? true,
      }))

      return NextResponse.json({ vehicles })
    }

    const favorites = await prisma.favori.findMany({
      where: { utilisateurId: localUserId },
      orderBy: { id: "desc" },
      take: 500,
      select: {
        id: true,
        vehicule: {
          select: {
            id: true,
            TitreAnnonce: true,
            PrixJournalier: true,
            NotesVehicule: true,
            NombreReservations: true,
            LocalisationVille: true,
            AdresseComplete: true,
            StatutVehicule: true,
            categorie: { select: { NomCategorie: true } },
            proprietaire: { select: { Nom: true, Prenom: true } },
            photos: { take: 1, orderBy: { OrdreAffichage: "asc" }, select: { URLPhoto: true } },
          },
        },
      },
    })

    const vehicles = favorites
      .filter((f) => f.vehicule)
      .map((f) => {
        const v = f.vehicule!
        const ownerName = `${v.proprietaire?.Prenom || ""} ${v.proprietaire?.Nom || ""}`.trim() || "Propriétaire"
        const available = (v.StatutVehicule || "").toLowerCase().includes("act")

        return {
          id: String(v.id),
          name: v.TitreAnnonce,
          type: v.categorie?.NomCategorie || "",
          price: Number(v.PrixJournalier || 0),
          rating: Math.round(Number(v.NotesVehicule || 0) * 10) / 10,
          reviews: Number(v.NombreReservations || 0),
          image: v.photos?.[0]?.URLPhoto || "/placeholder.jpg",
          location: v.AdresseComplete || v.LocalisationVille || "",
          owner: ownerName,
          available,
        }
      })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error("[API] Renter favorites error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
