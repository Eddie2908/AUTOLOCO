"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { login, isLoading: authLoading, error: authError } = useAuth()

  const [isVisible, setIsVisible] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loginMethod, setLoginMethod] = React.useState<"email" | "phone">("email")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  // Sync auth error with local state
  React.useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const success = await login({ email, password }, callbackUrl)
      if (!success) {
        // Error is handled by the auth context and shown via authError
      }
    } catch (err) {
      console.error("[LoginPage] Login error:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || authLoading

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between mb-8 opacity-0",
              isVisible && "animate-slide-up opacity-100",
            )}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-110">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">AUTOLOCO</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Card */}
          <Card
            className={cn(
              "border-border/50 shadow-xl opacity-0",
              isVisible && "animate-slide-up stagger-1 opacity-100",
            )}
          >
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Bon retour !</CardTitle>
              <CardDescription>Connectez-vous pour accéder à votre compte AUTOLOCO</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Login method toggle */}
                <div className="flex p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("email")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300",
                      loginMethod === "email" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("phone")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300",
                      loginMethod === "phone" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Smartphone className="h-4 w-4" />
                    Téléphone
                  </button>
                </div>

                {/* Email/Phone input */}
                <div className="space-y-2">
                  <Label htmlFor="identifier">
                    {loginMethod === "email" ? "Adresse email" : "Numéro de téléphone"}
                  </Label>
                  <div className="relative">
                    {loginMethod === "email" ? (
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      id="identifier"
                      type={loginMethod === "email" ? "email" : "tel"}
                      placeholder={loginMethod === "email" ? "exemple@email.com" : "+237 6XX XXX XXX"}
                      className="pl-10 h-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:underline transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                {/* Demo users info */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground text-center mb-2">Comptes de démonstration :</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <strong>Locataire:</strong> locataire@autoloco.cm / Demo@2024!
                    </p>
                    <p>
                      <strong>Propriétaire:</strong> proprietaire@autoloco.cm / Demo@2024!
                    </p>
                    <p>
                      <strong>Admin:</strong> admin@autoloco.cm / Admin@2024!
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Ou continuer avec</span>
                  </div>
                </div>

                {/* Social login */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" className="h-12 bg-transparent" disabled={isLoading}>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="h-12 bg-transparent" disabled={isLoading}>
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Pas encore de compte ?{" "}
                  <Link href="/auth/register" className="text-primary font-medium hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-background to-accent/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "-3s" }}
          />
        </div>

        <div
          className={cn(
            "relative max-w-lg text-center opacity-0",
            isVisible && "animate-slide-in-right stagger-2 opacity-100",
          )}
        >
          <img
            src="/vehicle-rental-illustration-cameroon.jpg"
            alt="AUTOLOCO"
            className="w-full h-auto rounded-3xl shadow-2xl mb-8 border border-border/50"
          />
          <h2 className="text-2xl font-bold mb-4">Bienvenue sur AUTOLOCO</h2>
          <p className="text-muted-foreground">
            La plateforme de référence pour la location de véhicules au Cameroun. Sécurisée, simple et accessible.
          </p>
        </div>
      </div>
    </div>
  )
}
