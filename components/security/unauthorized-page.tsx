"use client";

/**
 * Unauthorized Access Page
 * ========================
 *
 * Displayed when user attempts to access a page they don't have permission for.
 */

import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserType } from "@/lib/auth/config";

interface UnauthorizedPageProps {
  userRole?: UserType;
}

export function UnauthorizedPage({ userRole }: UnauthorizedPageProps) {
  const dashboardUrls: Record<string, string> = {
    admin: "/dashboard/admin",
    proprietaire: "/dashboard/owner",
    locataire: "/dashboard/renter",
  };

  const dashboardUrl = userRole
    ? dashboardUrls[userRole] || "/dashboard"
    : "/auth/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Accès Refusé
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas la permission d'accéder à cette page.
          {userRole && (
            <>
              {" "}
              Votre rôle actuel est{" "}
              <span className="font-semibold">
                {userRole === "admin"
                  ? "Administrateur"
                  : userRole === "proprietaire"
                    ? "Propriétaire"
                    : "Locataire"}
              </span>
              .
            </>
          )}
        </p>

        {/* Error Code */}
        <div className="bg-muted p-4 rounded-lg mb-8 font-mono text-sm text-muted-foreground">
          Erreur 403 - Forbidden
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href={dashboardUrl}>
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              Aller au Tableau de Bord
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'Accueil
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-8">
          Si vous pensez que c'est une erreur,{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contactez le support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
