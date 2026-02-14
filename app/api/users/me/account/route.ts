import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma-client"
import { getAuthenticatedUser } from "@/lib/auth/get-auth-user"
import { accountDeletionSchema, formatZodErrors } from "@/lib/validations/profile"
import { verifyPassword } from "@/lib/auth/password"

// ---- DELETE /api/users/me/account ----
export async function DELETE(req: Request) {
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
    const validation = accountDeletionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: formatZodErrors(validation.error) },
        { status: 422 },
      )
    }

    const { password } = validation.data

    if (auth.tokenType === "local") {
      // Get current user to verify password
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, MotDePasse: true, StatutCompte: true },
      })

      if (!user) {
        return NextResponse.json({ error: "Utilisateur non trouve" }, { status: 404 })
      }

      if (user.StatutCompte === "Desactive") {
        return NextResponse.json({ error: "Ce compte est deja desactive" }, { status: 400 })
      }

      // Verify password
      const isValid = await verifyPassword(password, user.MotDePasse)
      if (!isValid) {
        return NextResponse.json(
          { error: "Mot de passe incorrect", details: { password: ["Mot de passe incorrect"] } },
          { status: 403 },
        )
      }

      // Soft delete: set status to Desactive
      await prisma.user.update({
        where: { id: auth.userId },
        data: { StatutCompte: "Desactive" },
      })

      // Clear auth cookies
      const cookieStore = await cookies()
      cookieStore.delete(AUTH_CONFIG.ACCESS_TOKEN_KEY)
      cookieStore.delete(AUTH_CONFIG.REFRESH_TOKEN_KEY)

      return NextResponse.json({ message: "Compte desactive avec succes" })
    }

    // Backend proxy path
    const BACKEND_API = `${AUTH_CONFIG.API_BASE_URL}${AUTH_CONFIG.API_V1_PREFIX}`
    const backendRes = await fetch(`${BACKEND_API}/users/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({ password }),
    })

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail || "Erreur lors de la desactivation" },
        { status: backendRes.status },
      )
    }

    // Clear auth cookies
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_CONFIG.ACCESS_TOKEN_KEY)
    cookieStore.delete(AUTH_CONFIG.REFRESH_TOKEN_KEY)

    return NextResponse.json({ message: "Compte desactive avec succes" })
  } catch (error) {
    console.error("[API] DELETE account error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
