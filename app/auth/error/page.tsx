"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const errorMessages: Record<string, string> = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
  Verification: "Le lien de vérification a expiré ou a déjà été utilisé.",
  OAuthSignin: "Erreur lors de la tentative de connexion avec le fournisseur.",
  OAuthCallback: "Erreur lors du traitement de la réponse du fournisseur.",
  OAuthCreateAccount: "Impossible de créer un compte avec le fournisseur.",
  EmailCreateAccount: "Impossible de créer un compte avec cette adresse email.",
  Callback: "Erreur lors du traitement de la connexion.",
  OAuthAccountNotLinked:
    "Pour confirmer votre identité, connectez-vous avec le même compte que vous avez utilisé à l'origine.",
  EmailSignin: "L'email n'a pas pu être envoyé.",
  CredentialsSignin: "Échec de la connexion. Vérifiez que les informations fournies sont correctes.",
  SessionRequired: "Veuillez vous connecter pour accéder à cette page.",
  default: "Une erreur est survenue lors de l'authentification.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-destructive/10 via-background to-background">
      <Card className="max-w-md w-full border-destructive/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Erreur d'authentification</CardTitle>
          <CardDescription className="text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
