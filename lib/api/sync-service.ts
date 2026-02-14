/**
 * Service de Synchronisation Backend
 *
 * Synchronise les nouveaux utilisateurs entre la base de données frontend (SQL Server)
 * et le backend FastAPI pour assurer une cohérence complète.
 */

import { AUTH_CONFIG } from "@/lib/auth/config";

export interface SyncResult {
  success: boolean;
  synced: boolean;
  error?: string;
}

/**
 * Synchroniser un nouvel utilisateur avec le backend
 *
 * @param userData - Données de l'utilisateur à synchroniser
 * @returns Résultat de la synchronisation
 */
export async function syncNewUserToBackend(userData: {
  email: string;
  password: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
  type_utilisateur: string;
}): Promise<SyncResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn("[Sync] NEXT_PUBLIC_API_URL not configured");
    return { success: true, synced: false };
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // 409 = user already exists at backend (OK)
    // 201 = user created (OK)
    if (response.ok || response.status === 409) {
      return { success: true, synced: true };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      synced: false,
      error: `Backend sync failed: ${errorData.detail || "Unknown error"}`,
    };
  } catch (error) {
    console.warn("[Sync] Network error:", error);
    return { success: true, synced: false };
  }
}

/**
 * Vérifier si un utilisateur existe déjà au backend
 */
export async function checkBackendUserExists(email: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return false;
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/check-email/${email}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return response.ok;
  } catch (error) {
    console.warn("[Sync] Check user error:", error);
    return false;
  }
}

/**
 * Attendre que le backend soit disponible
 */
export async function waitForBackendAvailable(
  maxAttempts: number = 3,
  delayMs: number = 500,
): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return false;
  }

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${apiUrl}/api/v1/health`, {
        method: "GET",
      });

      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Continue trying
    }

    if (i < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return false;
}
