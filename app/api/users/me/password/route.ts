import { NextResponse } from "next/server"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"
import { getAuthenticatedUser } from "@/lib/auth/get-auth-user"
import { passwordChangeSchema, formatZodErrors } from "@/lib/validations/profile"
import { verifyPassword, hashPassword } from "@/lib/auth/password"

const BACKEND_API = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}`

// ---- PUT /api/users/me/password ----
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
    const validation = passwordChangeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: formatZodErrors(validation.error) },
        { status: 422 },
      )
    }

    const { currentPassword, newPassword } = validation.data

    // Local DB path
    if (auth.tokenType === "local") {
      // Get current hashed password
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, MotDePasse: true },
      })

      if (!user) {
        return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 })
      }

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.MotDePasse)
      if (!isValid) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect", details: { currentPassword: ["Mot de passe actuel incorrect"] } },
          { status: 403 },
        )
      }

      // Hash and update the new password
      const hashedNew = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: auth.userId },
        data: { MotDePasse: hashedNew },
      })

      return NextResponse.json({ message: "Mot de passe mis a jour avec succes" })
    }

    // Backend proxy path
    const backendRes = await fetch(`${BACKEND_API}/users/me/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || "Erreur lors du changement de mot de passe" },
        { status: backendRes.status },
      )
    }

    return NextResponse.json({ message: "Mot de passe mis a jour avec succes" })
  } catch (error) {
    console.error("[API] PUT password error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
