import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Environnement de Test - AUTOLOCO",
  description: "Outils de test et génération d'utilisateurs fictifs",
}

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AUTOLOCO Test Environment</h1>
              <p className="text-sm text-muted-foreground">
                Environnement de test et génération de données fictives
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Alert variant="default" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Environnement de test</AlertTitle>
          <AlertDescription>
            Cette section est réservée aux tests et au développement.
            Les données générées sont fictives et peuvent être supprimées à tout moment.
          </AlertDescription>
        </Alert>

        <nav className="mb-6 flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/test/quick-login">Connexion rapide</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/test/users">Gestion utilisateurs</Link>
          </Button>
        </nav>

        <main>{children}</main>
      </div>

      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>AUTOLOCO Test Environment - Développement et Tests uniquement</p>
          <p className="mt-1">
            Consultez le{" "}
            <Link href="/docs/GUIDE-ENVIRONNEMENT-TEST.md" className="underline">
              guide complet
            </Link>{" "}
            pour plus d'informations
          </p>
        </div>
      </footer>
    </div>
  )
}
