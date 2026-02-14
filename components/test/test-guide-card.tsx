/**
 * Composant Guide Visuel de Test
 * ===============================
 * 
 * Carte d'aide visuelle pour guider les utilisateurs dans l'environnement de test
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Info } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface TestGuideStep {
  number: number
  title: string
  description: string
  icon?: LucideIcon
  badge?: string
}

interface TestGuideCardProps {
  title: string
  description?: string
  steps: TestGuideStep[]
  variant?: "default" | "compact"
}

export function TestGuideCard({ 
  title, 
  description, 
  steps,
  variant = "default" 
}: TestGuideCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={variant === "compact" ? "space-y-2" : "space-y-4"}>
          {steps.map((step) => {
            const StepIcon = step.icon || CheckCircle2
            return (
              <div
                key={step.number}
                className={`flex gap-3 ${variant === "compact" ? "text-sm" : ""}`}
              >
                <Badge 
                  variant="outline" 
                  className="h-6 w-6 flex items-center justify-center flex-shrink-0"
                >
                  {step.number}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{step.title}</span>
                    {step.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
                {step.icon && (
                  <StepIcon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Variantes pré-configurées
 */

export function QuickStartGuide() {
  return (
    <TestGuideCard
      title="Démarrage Rapide"
      description="Suivez ces étapes pour commencer à tester l'application"
      steps={[
        {
          number: 1,
          title: "Générez des utilisateurs",
          description: "Allez sur /test/users et créez 5-10 utilisateurs pour vos tests",
          badge: "Important",
        },
        {
          number: 2,
          title: "Testez la connexion rapide",
          description: "Utilisez /test/quick-login pour vous connecter avec différents profils",
        },
        {
          number: 3,
          title: "Explorez les dashboards",
          description: "Testez les fonctionnalités selon le rôle de l'utilisateur connecté",
        },
        {
          number: 4,
          title: "Vérifiez les contrôles d'accès",
          description: "Essayez d'accéder à des ressources non autorisées pour valider la sécurité",
          badge: "Sécurité",
        },
      ]}
    />
  )
}

export function SecurityTestGuide() {
  return (
    <TestGuideCard
      title="Tests de Sécurité Recommandés"
      description="Scénarios pour valider les contrôles d'accès"
      steps={[
        {
          number: 1,
          title: "Test isolation des rôles",
          description: "Connectez-vous comme locataire et tentez d'accéder au dashboard propriétaire",
        },
        {
          number: 2,
          title: "Test accès admin",
          description: "Vérifiez que seuls les admins peuvent accéder aux fonctions d'administration",
        },
        {
          number: 3,
          title: "Test ressources utilisateur",
          description: "Tentez d'accéder aux données d'un autre utilisateur (doit être bloqué)",
        },
        {
          number: 4,
          title: "Test session expirée",
          description: "Vérifiez la déconnexion automatique après expiration de session",
        },
      ]}
      variant="compact"
    />
  )
}

export function PerformanceTestGuide() {
  return (
    <TestGuideCard
      title="Tests de Performance"
      description="Points à vérifier pour la performance de l'application"
      steps={[
        {
          number: 1,
          title: "Temps de chargement",
          description: "Vérifiez que les pages se chargent en moins de 2 secondes",
        },
        {
          number: 2,
          title: "Recherche avec filtres",
          description: "Testez la recherche avec plusieurs filtres simultanés",
        },
        {
          number: 3,
          title: "Upload de fichiers",
          description: "Testez l'upload de photos (performance et validation)",
        },
        {
          number: 4,
          title: "Utilisateurs simultanés",
          description: "Ouvrez plusieurs onglets avec différents utilisateurs",
        },
      ]}
      variant="compact"
    />
  )
}
