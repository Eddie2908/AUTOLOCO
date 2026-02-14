/**
 * Gestion des Sessions Utilisateur
 * ==================================
 *
 * Utilitaires pour gérer les sessions côté serveur
 * avec NextAuth.js et validation des tokens.
 */

import { cookies } from "next/headers"
import { AUTH_CONFIG } from "@/lib/auth/config"
import { getCurrentUserFromBackend } from "@/lib/auth/backend-auth"

// Types de session étendus
export interface SessionUser {
  id: string
  email: string
  name: string
  role: "locataire" | "proprietaire" | "admin"
  avatar?: string | null
  statut: string
  telephone?: string
  ville?: string
}

export interface ExtendedSession {
  user: SessionUser
  isDemoUser: boolean
  expires: string
}

/**
 * Récupère la session côté serveur
 * À utiliser dans les Server Components et Route Handlers
 */
export async function getSession(): Promise<ExtendedSession | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_CONFIG.ACCESS_TOKEN_KEY)?.value

  if (!accessToken) return null

  if (accessToken.startsWith("demo_")) {
    const role = (cookieStore.get("autoloco_user_role")?.value as any) || "locataire"
    return {
      user: {
        id: "demo",
        email: "demo@autoloco.cm",
        name: "Demo",
        role,
        statut: "verifie",
      },
      isDemoUser: true,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }
  }

  const backendUser = await getCurrentUserFromBackend(accessToken)
  if (!backendUser) return null

  return {
    user: {
      id: backendUser.id,
      email: backendUser.email,
      name: `${backendUser.prenom || ""} ${backendUser.nom}`.trim() || backendUser.nom,
      role: backendUser.type,
      avatar: backendUser.avatar,
      statut: backendUser.statut,
      telephone: backendUser.telephone,
      ville: backendUser.ville,
    },
    isDemoUser: false,
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.user
}

/**
 * Récupère l'utilisateur actuel avec ses données complètes
 */
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user?.email) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    nom: session.user.name.split(" ").slice(1).join(" ") || session.user.name,
    prenom: session.user.name.split(" ")[0] || null,
    type: session.user.role,
    statut: session.user.statut,
    telephone: session.user.telephone,
    ville: session.user.ville,
    avatar: session.user.avatar,
    isDemoUser: session.isDemoUser,
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function hasRole(requiredRoles: ("locataire" | "proprietaire" | "admin")[]): Promise<boolean> {
  const session = await getSession()

  if (!session?.user?.role) {
    return false
  }

  return requiredRoles.includes(session.user.role)
}

/**
 * Vérifie si l'utilisateur est propriétaire
 */
export async function isOwner(): Promise<boolean> {
  return hasRole(["proprietaire", "admin"])
}

/**
 * Vérifie si l'utilisateur est administrateur
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(["admin"])
}

/**
 * Middleware de protection des routes API
 */
export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getSession()

  if (!session?.user) {
    throw new Error("Non authentifié")
  }

  return session
}

/**
 * Middleware de protection par rôle
 */
export async function requireRole(roles: ("locataire" | "proprietaire" | "admin")[]): Promise<ExtendedSession> {
  const session = await requireAuth()

  if (!roles.includes(session.user.role)) {
    throw new Error("Accès non autorisé")
  }

  return session
}
