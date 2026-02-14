/**
 * Login API Route
 * ================
 *
 * Direct login endpoint that authenticates with the FastAPI backend.
 * This is used as an alternative to NextAuth for direct API authentication.
 * 
 * Security Features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Audit logging
 * - Generic error messages
 */

import { NextResponse } from "next/server"
import { authenticateWithBackend } from "@/lib/auth/backend-auth"
import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limiter"
import { logLoginAttempt } from "@/lib/security/audit-log"
import { prisma } from "@/lib/db/prisma-client"
import { verifyPassword } from "@/lib/auth/password"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 400 })
    }

    // Appliquer le rate limiting basé sur l'email
    const rateLimitResult = await applyRateLimit(req, "AUTH", email)
    
    if (!rateLimitResult.success) {
      // Logger le dépassement de rate limit
      await logLoginAttempt(email, false, req, rateLimitResult.error)
      
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      )
    }

    // Authenticate with backend (demo users allowed if backend unavailable)
    const result = await authenticateWithBackend(email, password)

    if (!result.success || !result.data) {
      // Backend unavailable: fallback to local DB auth (Prisma)
      if (result.error === "BACKEND_UNAVAILABLE") {
        const localUser = await prisma.user.findUnique({
          where: { Email: email.toLowerCase() },
          select: {
            id: true,
            Email: true,
            Nom: true,
            Prenom: true,
            TypeUtilisateur: true,
            StatutCompte: true,
            MotDePasse: true,
            PhotoProfil: true,
            NumeroTelephone: true,
          },
        })

        const passwordOk = localUser ? await verifyPassword(password, localUser.MotDePasse) : false

        if (!localUser || !passwordOk) {
          await logLoginAttempt(email, false, req, "Email ou mot de passe incorrect")
          return NextResponse.json(
            { error: "Identifiants invalides" },
            {
              status: 401,
              headers: rateLimitResult.headers,
            }
          )
        }

        if (localUser.StatutCompte && localUser.StatutCompte !== "Actif") {
          await logLoginAttempt(email, false, req, "Compte désactivé")
          return NextResponse.json(
            { error: "Identifiants invalides" },
            {
              status: 403,
              headers: rateLimitResult.headers,
            }
          )
        }

        await logLoginAttempt(email, true, req)

        const cookieStore = await cookies()
        const localAccessToken = `local_${localUser.id}_${Date.now()}`

        cookieStore.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, localAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE,
          path: "/",
        })

        cookieStore.set("autoloco_user_role", localUser.TypeUtilisateur as string, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRE,
          path: "/",
        })

        const response = NextResponse.json({
          user: {
            id: localUser.id.toString(),
            email: localUser.Email,
            nom: localUser.Nom,
            prenom: localUser.Prenom,
            type: localUser.TypeUtilisateur,
            avatar: localUser.PhotoProfil,
            statut: localUser.StatutCompte,
            telephone: localUser.NumeroTelephone,
          },
          is_demo_user: false,
          is_local_user: true,
        })

        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          response.headers.set(key, value)
        })

        return response
      }

      // Logger l'échec de connexion
      await logLoginAttempt(email, false, req, result.error)
      
      // Message d'erreur générique pour éviter l'énumération d'utilisateurs
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { 
          status: 401,
          headers: rateLimitResult.headers,
        }
      )
    }

    const loginData = result.data

    // Logger la connexion réussie
    await logLoginAttempt(email, true, req)

    // Set access token cookie for middleware
    const cookieStore = await cookies()
    cookieStore.set(AUTH_CONFIG.ACCESS_TOKEN_KEY, loginData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE,
      path: "/",
    })

    cookieStore.set(AUTH_CONFIG.REFRESH_TOKEN_KEY, loginData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRE,
      path: "/",
    })

    // Store role in a readable cookie for client-side RBAC (no secrets)
    const userRole = "user" in loginData ? loginData.user.type : "locataire"
    cookieStore.set("autoloco_user_role", userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRE,
      path: "/",
    })

    const response = NextResponse.json({
      user: "user" in loginData ? loginData.user : null,
      is_demo_user: result.isDemoUser,
    })

    // Ajouter les headers de rate limit
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  } catch (error) {
    console.error("[API] Login error:", error)
    // Message générique pour ne pas révéler les détails de l'erreur
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 })
  }
}
