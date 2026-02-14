import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma-client"

// Fallback demo testimonials shown when the database is not connected
const DEMO_TESTIMONIALS = [
  {
    id: 1,
    name: "Alain Kamga",
    avatar: "/placeholder-user.jpg",
    role: "Locataire",
    rating: 5,
    comment:
      "Service excellent ! La voiture etait en parfait etat et le proprietaire tres professionnel. Je recommande vivement AutoLoco.",
  },
  {
    id: 2,
    name: "Sophie Ngo Biyong",
    avatar: "/placeholder-user.jpg",
    role: "Proprietaire",
    rating: 4.8,
    comment:
      "Plateforme tres fiable pour louer mes vehicules. Les paiements sont securises et les locataires respectueux.",
  },
  {
    id: 3,
    name: "Thierry Essomba",
    avatar: "/placeholder-user.jpg",
    role: "Locataire",
    rating: 4.9,
    comment:
      "Facile a utiliser, prix competitifs et un large choix de vehicules a Douala. Mon experience a ete parfaite.",
  },
]

export async function GET() {
  try {
    const reviews = await prisma.avis.findMany({
      where: {
        StatutAvis: "Publie",
        NoteGlobale: { gte: 4 },
        CommentaireAvis: { not: null },
      },
      orderBy: [{ NombreUtile: "desc" }, { NoteGlobale: "desc" }, { DateCreation: "desc" }],
      take: 3,
      include: {
        auteur: {
          select: {
            Prenom: true,
            Nom: true,
            PhotoProfil: true,
            TypeUtilisateur: true,
          },
        },
      },
    })

    const testimonials = reviews.map((r) => ({
      id: r.id,
      name: `${r.auteur?.Prenom || ""} ${r.auteur?.Nom || ""}`.trim() || "Utilisateur",
      avatar: r.auteur?.PhotoProfil || "/placeholder-user.jpg",
      role: r.auteur?.TypeUtilisateur === "Proprietaire" ? "Proprietaire" : "Locataire",
      rating: Math.round(Number(r.NoteGlobale) * 10) / 10,
      comment: r.CommentaireAvis || "",
    }))

    const res = NextResponse.json({ testimonials })
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    return res
  } catch (error) {
    console.warn("[API] Testimonials: database unavailable, using demo data")
    const res = NextResponse.json({ testimonials: DEMO_TESTIMONIALS })
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return res
  }
}
