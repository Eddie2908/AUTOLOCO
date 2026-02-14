import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/security/rate-limiter"
import { prisma } from "@/lib/db/prisma-client"

// -- Sort mapping: UI sort keys -> Prisma orderBy --------------------------
function getOrderBy(sort: string | null) {
  switch (sort) {
    case "price_asc":
      return [{ PrixJournalier: "asc" as const }]
    case "price_desc":
      return [{ PrixJournalier: "desc" as const }]
    case "rating":
      return [{ NotesVehicule: "desc" as const }]
    case "newest":
      return [{ DateCreation: "desc" as const }]
    default:
      // Default: featured first, then best rated, then newest
      return [
        { EstVedette: "desc" as const },
        { NotesVehicule: "desc" as const },
        { DateCreation: "desc" as const },
      ]
  }
}

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResult = await applyRateLimit(req, "SEARCH")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { status: 429, headers: rateLimitResult.headers },
      )
    }

    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("page_size") || "20", 10) || 20))
    const city = searchParams.get("city") || undefined
    const type = searchParams.get("type") || undefined
    const fuel = searchParams.get("fuel") || undefined
    const transmission = searchParams.get("transmission") || undefined
    const minPrice = searchParams.get("min_price") ? Number.parseInt(searchParams.get("min_price")!, 10) : undefined
    const maxPrice = searchParams.get("max_price") ? Number.parseInt(searchParams.get("max_price")!, 10) : undefined
    const seats = searchParams.get("seats") ? Number.parseInt(searchParams.get("seats")!, 10) : undefined
    const featured = searchParams.get("featured") === "true" ? true : undefined
    const verified = searchParams.get("verified") === "true" ? true : undefined
    const search = searchParams.get("search") || undefined
    const sort = searchParams.get("sort") || null

    // -- Build Prisma where clause ------------------------------------------
    const where: Record<string, unknown> = { StatutVehicule: "Actif" }

    if (city && city !== "all") where.LocalisationVille = city
    if (type && type !== "all") where.categorie = { NomCategorie: type }
    if (fuel && fuel !== "all") where.TypeCarburant = fuel
    if (transmission && transmission !== "all") where.TypeTransmission = transmission
    if (typeof featured === "boolean") where.EstVedette = featured
    if (verified) where.StatutVerification = "Verifie"

    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      where.PrixJournalier = {
        ...(typeof minPrice === "number" ? { gte: minPrice } : {}),
        ...(typeof maxPrice === "number" ? { lte: maxPrice } : {}),
      }
    }

    if (typeof seats === "number") where.NombrePlaces = { gte: seats }

    if (search) {
      where.OR = [
        { TitreAnnonce: { contains: search, mode: "insensitive" } },
        { DescriptionVehicule: { contains: search, mode: "insensitive" } },
        { modele: { NomModele: { contains: search, mode: "insensitive" } } },
        { modele: { marque: { NomMarque: { contains: search, mode: "insensitive" } } } },
        { LocalisationVille: { contains: search, mode: "insensitive" } },
      ]
    }

    // -- Execute count + query in parallel ----------------------------------
    const skip = (page - 1) * pageSize

    const [total, items] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        orderBy: getOrderBy(sort),
        skip,
        take: pageSize,
        include: {
          categorie: true,
          modele: { include: { marque: true } },
          photos: { take: 1, orderBy: { OrdreAffichage: "asc" } },
        },
      }),
    ])

    // -- Map to lightweight API response ------------------------------------
    const vehicles = items.map((v) => ({
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
    }))

    const responseObj = NextResponse.json({
      vehicles,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    })

    // Cache-Control: serve stale for 2 min while revalidating
    responseObj.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120")

    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      responseObj.headers.set(key, value)
    })

    return responseObj
  } catch (error) {
    console.error("Vehicles fetch error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // Forward the request to the backend FastAPI
    const body = await req.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/vehicles`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Vehicle creation error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

