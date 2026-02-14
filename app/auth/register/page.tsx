"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Eye, EyeOff, Mail, Lock, ArrowRight, User, Phone, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserType } from "@/lib/auth/config"

const passwordRequirements = [
  { text: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { text: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { text: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
  { text: "Un chiffre", test: (p: string) => /\d/.test(p) },
]

export default function RegisterPage() {
  const { register, isLoading: authLoading } = useAuth()

  const [isVisible, setIsVisible] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [step, setStep] = React.useState(1)
  const [error, setError] = React.useState<string | null>(null)

  // Form state
  const [userType, setUserType] = React.useState<UserType>("locataire")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [city, setCity] = React.useState("")
  const [acceptTerms, setAcceptTerms] = React.useState(false)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (step < 2) {
      // Validate step 1
      if (!name || !email || !password) {
        setError("Veuillez remplir tous les champs obligatoires")
        return
      }

      // Check password requirements
      const allRequirementsMet = passwordRequirements.every((req) => req.test(password))
      if (!allRequirementsMet) {
        setError("Le mot de passe ne respecte pas tous les critères")
        return
      }

      setStep(step + 1)
      return
    }

    // Validate step 2
    if (!phone || !city) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les conditions d'utilisation")
      return
    }

    setIsSubmitting(true)

    try {
      const nameParts = name.split(" ")
      const prenom = nameParts[0]
      const nom = nameParts.slice(1).join(" ") || nameParts[0]

      const result = await register({
        email,
        password,
        nom,
        prenom,
        telephone: phone,
        ville: city,
        type_utilisateur: userType,
      })

      if (!result.success) {
        setError(result.error || "Erreur lors de l'inscription")
      }
      // If successful, the auth context will handle the redirect
    } catch (err) {
      console.error("[RegisterPage] Registration error:", err)
      setError("Une erreur est survenue lors de l'inscription")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isSubmitting || authLoading

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
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
            isVisible && "animate-slide-up stagger-2 opacity-100",
          )}
        >
          <img
            src="/modern-car-rental-signup-illustration.jpg"
            alt="Inscription AUTOLOCO"
            className="w-full h-auto rounded-3xl shadow-2xl mb-8 border border-border/50"
          />
          <h2 className="text-2xl font-bold mb-4">Rejoignez AUTOLOCO</h2>
          <p className="text-muted-foreground">
            Créez votre compte en quelques minutes et accédez à des milliers de véhicules ou mettez le vôtre en
            location.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
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

          {/* Progress indicator */}
          <div
            className={cn(
              "flex items-center gap-2 mb-6 opacity-0",
              isVisible && "animate-slide-up stagger-1 opacity-100",
            )}
          >
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-500",
                  step >= s ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>

          {/* Card */}
          <Card
            className={cn(
              "border-border/50 shadow-xl opacity-0",
              isVisible && "animate-slide-up stagger-1 opacity-100",
            )}
          >
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">
                {step === 1 ? "Créer un compte" : "Complétez votre profil"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Rejoignez la communauté AUTOLOCO en quelques étapes"
                  : "Quelques informations supplémentaires"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    {/* User type selection */}
                    <div className="space-y-2">
                      <Label>Je souhaite</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setUserType("locataire")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                            userType === "locataire"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <Car className="h-6 w-6 mb-2 text-primary" />
                          <p className="font-medium">Louer</p>
                          <p className="text-xs text-muted-foreground">Je cherche un véhicule</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserType("proprietaire")}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-300 text-left",
                            userType === "proprietaire"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <User className="h-6 w-6 mb-2 text-accent" />
                          <p className="font-medium">Mettre en location</p>
                          <p className="text-xs text-muted-foreground">Je possède un véhicule</p>
                        </button>
                      </div>
                    </div>

                    {/* Name input */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Jean Dupont"
                          className="pl-10 h-12"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="exemple@email.com"
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
                      <Label htmlFor="password">Mot de passe</Label>
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
                      {/* Password requirements */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.text}
                            className={cn(
                              "flex items-center gap-1.5 text-xs transition-colors",
                              req.test(password) ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3 w-3 transition-all",
                                req.test(password) ? "opacity-100 scale-100" : "opacity-50 scale-75",
                              )}
                            />
                            {req.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Phone input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+237 6XX XXX XXX"
                          className="pl-10 h-12"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Vous recevrez un code de vérification par SMS</p>
                    </div>

                    {/* City selection */}
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <select
                        id="city"
                        className="w-full h-12 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        disabled={isLoading}
                      >
                        <option value="">Sélectionnez votre ville</option>
                        <option value="Douala">Douala</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Maroua">Maroua</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    {/* Terms checkbox */}
                    <div className="flex items-start gap-2 mt-4">
                      <Checkbox
                        id="terms"
                        className="mt-1"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                        J'accepte les{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          conditions d'utilisation
                        </Link>{" "}
                        et la{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          politique de confidentialité
                        </Link>
                      </Label>
                    </div>
                  </>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 h-12 bg-transparent"
                      disabled={isLoading}
                    >
                      Retour
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {step < 2 ? "Validation..." : "Création..."}
                      </div>
                    ) : step < 2 ? (
                      <>
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Sign in link */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Déjà un compte ?{" "}
                  <Link href="/auth/login" className="text-primary font-medium hover:underline">
                    Se connecter
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
