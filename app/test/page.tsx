import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  LogIn, 
  FileText, 
  Zap, 
  Shield, 
  Database,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

export default function TestHomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">
          Environnement de développement
        </Badge>
        <h1 className="text-4xl font-bold">Environnement de Test AUTOLOCO</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Générez des utilisateurs fictifs et testez toutes les fonctionnalités de l'application
          avec des données réalistes et des profils variés.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <LogIn className="h-10 w-10 mb-4 text-primary" />
            <CardTitle>Connexion Rapide</CardTitle>
            <CardDescription>
              Connectez-vous instantanément avec différents profils utilisateurs pré-configurés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                8 profils disponibles (locataires, propriétaires, admins)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Connexion en 1 clic sans mémoriser les mots de passe
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Description détaillée de chaque profil
              </li>
            </ul>
            <Button asChild className="w-full">
              <Link href="/test/quick-login">
                Accéder à la connexion rapide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <Users className="h-10 w-10 mb-4 text-primary" />
            <CardTitle>Gestion des Utilisateurs</CardTitle>
            <CardDescription>
              Générez des utilisateurs fictifs avec données réalistes pour vos tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Génération en lot (jusqu'à 50 utilisateurs)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Données camerounaises réalistes
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                Export CSV et copie des identifiants
              </li>
            </ul>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/test/users">
                Gérer les utilisateurs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Génération Rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Créez des dizaines d'utilisateurs en quelques secondes avec des données cohérentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Test de Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vérifiez les contrôles d'accès et permissions avec différents rôles utilisateurs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-lg">Données Réalistes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Noms camerounais, numéros de téléphone valides, et historiques cohérents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profils disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Profils Pré-configurés</CardTitle>
          <CardDescription>
            Utilisez ces profils pour tester immédiatement les différentes fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Locataires */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="default">Locataires</Badge>
              </h4>
              <div className="space-y-1 text-sm">
                <div>
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    locataire@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">12 réservations, 4.8/5</div>
                </div>
                <div>
                  <div className="font-medium">Premium (Gold)</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    premium@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">45 réservations, 4.9/5</div>
                </div>
                <div>
                  <div className="font-medium">Nouveau</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    nouveau@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">Sans historique</div>
                </div>
              </div>
            </div>

            {/* Propriétaires */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="secondary">Propriétaires</Badge>
              </h4>
              <div className="space-y-1 text-sm">
                <div>
                  <div className="font-medium">Particulier</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    proprietaire@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">2 véhicules, 87 locations</div>
                </div>
                <div>
                  <div className="font-medium">Agence Pro</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    agence@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">8 véhicules, 456 locations</div>
                </div>
                <div>
                  <div className="font-medium">Gestionnaire Flotte</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    flotte@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">15 véhicules, 1250 locations</div>
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="destructive">Administrateurs</Badge>
              </h4>
              <div className="space-y-1 text-sm">
                <div>
                  <div className="font-medium">Admin Principal</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    admin@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">Accès complet</div>
                </div>
                <div>
                  <div className="font-medium">Modérateur</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    moderateur@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">Modération</div>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    support@autoloco.cm
                  </div>
                  <div className="text-xs text-muted-foreground">Support client</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-2">Mots de passe par défaut :</h5>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Locataires & Propriétaires :</span>
                <code className="bg-background px-2 py-1 rounded">Demo@2024!</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Administrateurs :</span>
                <code className="bg-background px-2 py-1 rounded">Admin@2024!</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Utilisateurs générés :</span>
                <code className="bg-background px-2 py-1 rounded">Test@2024!</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <FileText className="h-10 w-10 mb-4 text-primary" />
          <CardTitle>Documentation</CardTitle>
          <CardDescription>
            Guides complets pour utiliser efficacement l'environnement de test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Guide complet de l'environnement de test</div>
              <div className="text-sm text-muted-foreground">
                Instructions détaillées, scénarios de test, résolution de problèmes
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/docs/GUIDE-ENVIRONNEMENT-TEST.md" target="_blank" rel="noopener noreferrer">
                Lire
              </a>
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Documentation technique du générateur</div>
              <div className="text-sm text-muted-foreground">
                API, structure, maintenance et contribution
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/lib/test/README.md" target="_blank" rel="noopener noreferrer">
                Lire
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Démarrage Rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                1
              </Badge>
              <div>
                <div className="font-medium">Générez des utilisateurs de test</div>
                <div className="text-muted-foreground">
                  Allez sur <Link href="/test/users" className="underline">/test/users</Link> et créez 5-10 utilisateurs
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                2
              </Badge>
              <div>
                <div className="font-medium">Testez la connexion rapide</div>
                <div className="text-muted-foreground">
                  Utilisez <Link href="/test/quick-login" className="underline">/test/quick-login</Link> pour vous connecter
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                3
              </Badge>
              <div>
                <div className="font-medium">Explorez les dashboards</div>
                <div className="text-muted-foreground">
                  Testez les fonctionnalités selon le rôle de l'utilisateur connecté
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 flex items-center justify-center flex-shrink-0">
                4
              </Badge>
              <div>
                <div className="font-medium">Vérifiez les contrôles d'accès</div>
                <div className="text-muted-foreground">
                  Essayez d'accéder à des ressources non autorisées pour valider la sécurité
                </div>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
