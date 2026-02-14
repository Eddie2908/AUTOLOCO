/**
 * API de Génération d'Utilisateurs de Test
 * ==========================================
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { generateBatchUsers, getTestCredentials } from "@/lib/test/user-generator"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { locataires = 0, proprietaires = 0, admins = 0 } = body

    // Validation
    if (locataires > 50 || proprietaires > 20 || admins > 5) {
      return NextResponse.json(
        { error: "Limites dépassées" },
        { status: 400 }
      )
    }

    // Générer les utilisateurs
    const usersData = await generateBatchUsers({
      locataires,
      proprietaires,
      admins,
    })

    // Créer dans la base de données
    const createdUsers = await Promise.all(
      usersData.map(async (userData) => {
        try {
          return await prisma.user.create({
            data: userData,
          })
        } catch (error: any) {
          // Si l'utilisateur existe déjà, le récupérer
          if (error.code === "P2002") {
            return await prisma.user.findUnique({
              where: { Email: userData.Email },
            })
          }
          throw error
        }
      })
    )

    // Retourner les identifiants
    const credentials = getTestCredentials(usersData)

    return NextResponse.json({
      success: true,
      count: createdUsers.length,
      users: credentials.map(cred => ({
        email: cred.email,
        password: cred.password,
        role: cred.role,
        nom: cred.nom,
        statut: usersData.find(u => u.Email === cred.email)?.StatutCompte || "Actif",
      })),
    })
  } catch (error) {
    console.error("Error generating test users:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération des utilisateurs" },
      { status: 500 }
    )
  }
}
