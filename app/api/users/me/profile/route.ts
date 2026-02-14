import { NextResponse } from "next/server"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"
import { getAuthenticatedUser } from "@/lib/auth/get-auth-user"
import { profileUpdateSchema, formatZodErrors } from "@/lib/validations/profile"

const BACKEND_API = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}`

// ---- GET /api/users/me/profile ----
export async function GET() {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (auth.tokenType === "demo") {
      return NextResponse.json({ error: "Non disponible en mode demo" }, { status: 403 })
    }

    // Local DB path
    if (auth.tokenType === "local") {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          adresses: { where: { EstAdressePrincipale: true }, take: 1 },
          documents: {
            select: {
              id: true,
              TypeDocument: true,
              NomFichier: true,
              StatutVerification: true,
              DateTeleversement: true,
              DateExpiration: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 })
      }

      const adresse = user.adresses[0] || null

      return NextResponse.json({
        id: user.id.toString(),
        email: user.Email,
        nom: user.Nom,
        prenom: user.Prenom,
        telephone: user.NumeroTelephone || "",
        ville: adresse?.Ville || "",
        quartier: adresse?.AdresseLigne1 || "",
        biographie: user.BiographieUtilisateur || "",
        avatar: user.PhotoProfil || null,
        statut: user.StatutCompte || "Actif",
        type: user.TypeUtilisateur,
        dateInscription: user.DateInscription,
        emailVerifie: user.EmailVerifie,
        telephoneVerifie: user.TelephoneVerifie,
        niveauFidelite: user.NiveauFidelite,
        documents: user.documents.map((doc) => ({
          id: doc.id,
          type: doc.TypeDocument,
          nom: doc.NomFichier,
          statut: doc.StatutVerification,
          dateTeleversement: doc.DateTeleversement,
          dateExpiration: doc.DateExpiration,
        })),
      })
    }

    // Backend proxy path
    const backendRes = await fetch(`${BACKEND_API}/users/me`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail || "Erreur backend" }, { status: backendRes.status })
    }

    return NextResponse.json(await backendRes.json())
  } catch (error) {
    console.error("[API] GET profile error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// ---- PUT /api/users/me/profile ----
export async function PUT(req: Request) {
  try {
    const auth = await getAuthenticatedUser()
    if (!auth) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (auth.tokenType === "demo") {
      return NextResponse.json({ error: "Non disponible en mode demo" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Corps de requete invalide" }, { status: 400 })
    }

    // Validate with Zod
    const validation = profileUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: formatZodErrors(validation.error) },
        { status: 422 },
      )
    }

    const { nom, prenom, telephone, ville, quartier, biographie } = validation.data

    // Local DB path
    if (auth.tokenType === "local") {
      const updateData: Record<string, unknown> = {
        Nom: nom,
        Prenom: prenom,
      }
      if (telephone) updateData.NumeroTelephone = telephone
      if (biographie !== undefined) updateData.BiographieUtilisateur = biographie || null

      const user = await prisma.user.update({
        where: { id: auth.userId },
        data: updateData,
      })

      // Update or create the primary address if ville or quartier provided
      if (ville || quartier) {
        await prisma.adresseUtilisateur.upsert({
          where: {
            id: (
              await prisma.adresseUtilisateur.findFirst({
                where: { utilisateurId: auth.userId, EstAdressePrincipale: true },
                select: { id: true },
              })
            )?.id ?? 0,
          },
          update: {
            ...(ville ? { Ville: ville } : {}),
            ...(quartier ? { AdresseLigne1: quartier } : {}),
          },
          create: {
            utilisateurId: auth.userId,
            TypeAdresse: "Principale",
            Ville: ville || "Douala",
            AdresseLigne1: quartier || "",
            Pays: "Cameroun",
            EstAdressePrincipale: true,
          },
        })
      }

      return NextResponse.json({
        id: user.id.toString(),
        email: user.Email,
        nom: user.Nom,
        prenom: user.Prenom,
        telephone: user.NumeroTelephone,
        ville: ville || "",
        quartier: quartier || "",
        biographie: user.BiographieUtilisateur || "",
      })
    }

    // Backend proxy path
    const backendRes = await fetch(`${BACKEND_API}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify(validation.data),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}))
      return NextResponse.json({ error: err.detail || "Erreur backend" }, { status: backendRes.status })
    }

    return NextResponse.json(await backendRes.json())
  } catch (error) {
    console.error("[API] PUT profile error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
