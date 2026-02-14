/**
 * API de Suppression d'Utilisateurs de Test
 * ==========================================
 */

import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(req: Request) {
  try {
    // Supprimer uniquement les utilisateurs créés avec le domaine de test
    const result = await prisma.user.deleteMany({
      where: {
        OR: [
          { Email: { contains: "@email.cm" } },
          { Email: { contains: "test@" } },
          { Email: { contains: ".test" } },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error("Error deleting test users:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    )
  }
}
