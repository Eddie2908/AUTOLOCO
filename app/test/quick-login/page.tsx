"use client"

/**
 * Connexion Rapide pour Tests
 * ============================
 * 
 * Interface simplifiée pour se connecter rapidement avec différents
 * profils utilisateurs lors des tests
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { 
  User, 
  Car, 
  Shield, 
  LogIn, 
  Loader2,
  CheckCircle2,
  Clock,
  Star
} from "lucide-react"

interface QuickLoginProfile {
  email: string
  password: string
  role: string
  label: string
  description: string
  icon: any
  badge?: string
  features: string[]
}

const DEMO_PROFILES: QuickLoginProfile[] = [
  {
    email: "locataire@autoloco.cm",
    password: "Demo@2024!",
    role: "locataire",
    label: "Locataire Standard",
    description: "Utilisateur locataire avec quelques réservations",
    icon: User,
    features: [
      "12 réservations effectuées",
      "Note : 4.8/5",
      "Compte vérifié",
    ],
  },
  {
    email: "premium@autoloco.cm",
    password: "Demo@2024!",
    role: "locataire",
    label: "Locataire Premium",
    description: "Client fidèle avec statut Gold",
    icon: Star,
    badge: "GOLD",
    features: [
      "45 réservations effectuées",
      "Note : 4.9/5",
      "2500 points fidélité",
    ],
  },
  {
    email: "nouveau@autoloco.cm",
    password: "Demo@2024!",
    role: "locataire",
    label: "Nouveau Locataire",
    description: "Compte récemment créé, pas encore vérifié",
    icon: Clock,
    features: [
      "Aucune réservation",
      "Compte en attente",
      "Email non vérifié",
    ],
  },
  {
    email: "proprietaire@autoloco.cm",
    password: "Demo@2024!",
    role: "proprietaire",
    label: "Propriétaire Particulier",
    description: "Propriétaire avec quelques véhicules",
    icon: Car,
    features: [
      "2 véhicules",
      "87 locations effectuées",
      "Note : 4.9/5",
    ],
  },
  {
    email: "agence@autoloco.cm",
    password: "Demo@2024!",
    role: "proprietaire",
    label: "Agence Professionnelle",
    description: "Agence de location avec flotte de véhicules",
    icon: Car,
    badge: "PRO",
    features: [
      "8 véhicules",
      "456 locations effectuées",
      "Temps réponse < 30 min",
    ],
  },
  {
    email: "flotte@autoloco.cm",
    password: "Demo@2024!",
    role: "proprietaire",
    label: "Gestionnaire de Flotte",
    description: "Grande entreprise avec flotte importante",
    icon: Car,
    badge: "ENTERPRISE",
    features: [
      "15 véhicules",
      "1250 locations effectuées",
      "Note : 4.8/5",
    ],
  },
  {
    email: "admin@autoloco.cm",
    password: "Admin@2024!",
    role: "admin",
    label: "Administrateur Principal",
    description: "Accès complet à toutes les fonctionnalités",
    icon: Shield,
    features: [
      "Gestion utilisateurs",
      "Gestion véhicules",
      "Analytics & Rapports",
    ],
  },
  {
    email: "moderateur@autoloco.cm",
    password: "Modo@2024!",
    role: "admin",
    label: "Modérateur",
    description: "Modération du contenu et support",
    icon: Shield,
    features: [
      "Modération contenu",
      "Gestion réclamations",
      "Support utilisateurs",
    ],
  },
]

export default function QuickLoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleQuickLogin = async (profile: QuickLoginProfile) => {
    setLoading(profile.email)
    
    try {
      const success = await login({
        email: profile.email,
        password: profile.password,
      })

      if (success) {
        toast({
          title: "Connexion réussie",
          description: `Connecté en tant que ${profile.label}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la connexion",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" => {
    if (role === "admin") return "destructive"
    if (role === "proprietaire") return "secondary"
    return "default"
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connexion Rapide (Test)</h1>
        <p className="text-muted-foreground">
          Connectez-vous rapidement avec un profil utilisateur pour tester l'application
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_PROFILES.map((profile) => {
          const Icon = profile.icon
          const isLoading = loading === profile.email

          return (
            <Card key={profile.email} className="relative overflow-hidden">
              {profile.badge && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="font-semibold">
                    {profile.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{profile.label}</CardTitle>
                    <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {profile.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {profile.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="font-mono">{profile.email}</div>
                    <div className="font-mono">••••••••</div>
                  </div>
                </div>

                <Button
                  onClick={() => handleQuickLogin(profile)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informations de Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Mots de passe</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Locataires & Propriétaires : <code className="bg-muted px-1 py-0.5 rounded">Demo@2024!</code></li>
                <li>Administrateurs : <code className="bg-muted px-1 py-0.5 rounded">Admin@2024!</code></li>
                <li>Modérateurs : <code className="bg-muted px-1 py-0.5 rounded">Modo@2024!</code></li>
                <li>Utilisateurs générés : <code className="bg-muted px-1 py-0.5 rounded">Test@2024!</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fonctionnalités testables</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Contrôles d'accès par rôle</li>
                <li>Dashboards personnalisés</li>
                <li>Gestion des réservations</li>
                <li>Gestion des véhicules</li>
                <li>Interface d'administration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
