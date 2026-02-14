"use client";

/**
 * Unified Authentication Context
 * ===============================
 *
 * Provides a unified authentication state that bridges NextAuth sessions
 * with the FastAPI backend tokens. This context should be used throughout
 * the application for authentication-related operations.
 */

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_CONFIG,
  getDashboardUrl,
  type UserType,
  type UserStatus,
} from "@/lib/auth/config";
import { toast } from "@/hooks/use-toast";

// User type that combines NextAuth session with backend user data
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserType;
  avatar?: string | null;
  statut?: UserStatus;
  telephone?: string;
  ville?: string;
  prenom?: string;
  nom?: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register data
export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
  type_utilisateur: UserType;
}

// Auth context type
export interface AuthContextType {
  // User state
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoUser: boolean;

  // Auth methods
  login: (
    credentials: LoginCredentials,
    redirectTo?: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;

  // Token management
  getAccessToken: () => Promise<string | null>;
  refreshSession: () => Promise<void>;

  // User management
  updateUser: (data: Partial<AuthUser>) => void;

  // Session error
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const isAuthenticated = !!user;

  const loadCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        setUser(null);
        setIsDemoUser(false);
        return;
      }

      const me = await res.json();
      setIsDemoUser(!!me.is_demo_user);
      setUser({
        id: me.id,
        email: me.email,
        name: me.prenom ? `${me.prenom} ${me.nom}`.trim() : me.nom,
        role: me.type,
        avatar: me.avatar,
        statut: me.statut,
        telephone: me.telephone,
        ville: me.ville,
        prenom: me.prenom,
        nom: me.nom,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    void loadCurrentUser();
  }, [loadCurrentUser]);

  /**
   * Login with credentials
   *
   * IMPORTANT: Uses redirect: false to allow manual control of navigation
   * This prevents NextAuth from doing a hard redirect and allows us to:
   * 1. Show a success toast
   * 2. Verify the session is available
   * 3. Use router.push for smooth client-side transition
   */
  const login = useCallback(
    async (
      credentials: LoginCredentials,
      redirectTo?: string,
    ): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorMessage = result?.error || "Email ou mot de passe incorrect";
          setError(errorMessage);
          toast({
            title: "Erreur de connexion",
            description: errorMessage,
            variant: "destructive",
          });
          return false;
        }

        {
          // Login succeeded - show success message
          toast({
            title: "Connexion réussie",
            description: "Bienvenue sur AUTOLOCO !",
          });

          await loadCurrentUser();

          // Redirect to appropriate dashboard or specified URL
          const destination = redirectTo || "/dashboard";
          router.push(destination);
          router.refresh();
          return true;
        }
      } catch (err) {
        console.error("[AuthContext] Login error:", err);
        const errorMessage = "Une erreur est survenue lors de la connexion";
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [router, loadCurrentUser],
  );

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);

      setUser(null);
      setIsDemoUser(false);

      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès",
      });

      // Redirect to login
      router.push(AUTH_CONFIG.ROUTES.LOGIN);
      router.refresh();
    } catch (err) {
      console.error("[AuthContext] Logout error:", err);
    }
  }, [router]);

  /**
   * Register a new user
   */
  const register = useCallback(
    async (
      data: RegisterData,
    ): Promise<{
      success: boolean;
      error?: string;
      autoLoginFailed?: boolean;
    }> => {
      setError(null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error || "Erreur lors de l'inscription";
          setError(errorMessage);
          toast({
            title: "Erreur d'inscription",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: errorMessage };
        }

        // ✅ Inscription réussie
        console.log(
          "[AuthContext] Registration successful, attempting auto-login",
        );

        // ✨ NOUVEAU: Ajouter délai de 500ms avant la tentative de connexion
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Essayer la connexion automatique
        let loginSuccess = await login(
          { email: data.email, password: data.password },
          getDashboardUrl(data.type_utilisateur),
        );

        // ✨ NOUVEAU: Retry si première tentative échoue
        if (!loginSuccess) {
          console.warn(
            "[AuthContext] Auto-login failed on first attempt, retrying...",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));

          loginSuccess = await login(
            { email: data.email, password: data.password },
            getDashboardUrl(data.type_utilisateur),
          );
        }

        // ✅ Auto-login réussie
        if (loginSuccess) {
          toast({
            title: "Inscription réussie",
            description: "Bienvenue sur AUTOLOCO !",
          });
          return { success: true };
        }

        // ⚠️ Inscription réussie mais auto-login échouée
        console.warn(
          "[AuthContext] Registration succeeded but auto-login failed",
        );

        toast({
          title: "Compte créé avec succès",
          description: "Veuillez vous connecter avec vos identifiants",
          variant: "default",
        });

        // ✨ NOUVEAU: Rediriger vers login manuel
        router.push(AUTH_CONFIG.ROUTES.LOGIN);

        return {
          success: true,
          autoLoginFailed: true,
          error:
            "Connexion automatique échouée. Veuillez vous connecter manuellement.",
        };
      } catch (err) {
        console.error("[AuthContext] Register error:", err);
        const errorMessage = "Une erreur est survenue lors de l'inscription";
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [login, router],
  );

  /**
   * Get a valid access token for API calls
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return null;
  }, []);

  /**
   * Refresh the session
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      if (refreshRes.ok) {
        await loadCurrentUser();
      }
    } catch (err) {
      console.error("[AuthContext] Refresh session error:", err);
    }
  }, [loadCurrentUser]);

  /**
   * Update user data in session
   */
  const updateUser = useCallback(
    (data: Partial<AuthUser>): void => {
      setUser((prev) => (prev ? { ...prev, ...data } : prev));
    },
    [],
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isDemoUser,
    login,
    logout,
    register,
    getAccessToken,
    refreshSession,
    updateUser,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use the auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo?: string): AuthContextType {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const loginUrl = new URL(
        AUTH_CONFIG.ROUTES.LOGIN,
        window.location.origin,
      );
      if (redirectTo) {
        loginUrl.searchParams.set("callbackUrl", redirectTo);
      } else {
        loginUrl.searchParams.set("callbackUrl", window.location.pathname);
      }
      router.push(loginUrl.toString());
    }
  }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

  return auth;
}

/**
 * Hook to require a specific role
 */
export function useRequireRole(
  allowedRoles: UserType[],
): AuthContextType & { hasAccess: boolean } {
  const auth = useRequireAuth();
  const router = useRouter();

  const hasAccess = auth.user ? allowedRoles.includes(auth.user.role) : false;

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && !hasAccess) {
      router.push("/dashboard/unauthorized");
    }
  }, [auth.isLoading, auth.isAuthenticated, hasAccess, router]);

  return { ...auth, hasAccess };
}
