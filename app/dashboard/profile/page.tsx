"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { checkPasswordStrength } from "@/lib/auth/password"
import {
  profileUpdateSchema,
  passwordChangeSchema,
  notificationPreferencesSchema,
  accountDeletionSchema,
  formatZodErrors,
} from "@/lib/validations/profile"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Shield,
  Bell,
  Key,
  FileText,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Smartphone,
  LogOut,
  Loader2,
  Trash2,
  Save,
  X,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

// -- Field error display component --
function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  const messages = errors[field]
  if (!messages || messages.length === 0) return null
  return (
    <div className="text-sm text-destructive mt-1" role="alert">
      {messages.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  )
}

// -- Password strength indicator component --
function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null
  const { score, level, suggestions } = checkPasswordStrength(password)
  const percentage = (score / 4) * 100

  const colorMap: Record<string, string> = {
    weak: "bg-destructive",
    fair: "bg-orange-500",
    good: "bg-yellow-500",
    strong: "bg-green-500",
  }

  const labelMap: Record<string, string> = {
    weak: "Faible",
    fair: "Moyen",
    good: "Bon",
    strong: "Fort",
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Force du mot de passe</span>
        <span
          className={cn(
            "font-medium",
            level === "weak" && "text-destructive",
            level === "fair" && "text-orange-500",
            level === "good" && "text-yellow-600",
            level === "strong" && "text-green-600",
          )}
        >
          {labelMap[level]}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", colorMap[level])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user: authUser, updateUser, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const userType =
    authUser?.role || (searchParams.get("type") as "renter" | "owner" | "admin") || "locataire"

  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({})

  // Form data
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    quartier: "",
    biographie: "",
  })

  // Password form
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({})
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    notificationsEmail: true,
    notificationsSMS: true,
    notificationsPush: true,
    notificationsReservations: true,
    notificationsPromotions: false,
    notificationsMessages: true,
    notificationsAvis: true,
  })
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)
  const [prefsLoaded, setPrefsLoaded] = useState(false)

  // Account deletion
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string[]>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Documents
  const [documents, setDocuments] = useState<
    Array<{
      id: number
      type: string
      nom: string
      statut: string
      dateTeleversement: string | null
      dateExpiration: string | null
    }>
  >([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync form with auth user
  useEffect(() => {
    if (authUser) {
      setFormData({
        nom: authUser.nom || "",
        prenom: authUser.prenom || "",
        email: authUser.email || "",
        telephone: authUser.telephone || "",
        ville: authUser.ville || "",
        quartier: "",
        biographie: "",
      })
    }
  }, [authUser])

  // Load full profile + documents from GET endpoint
  useEffect(() => {
    if (!authUser) return
    fetch("/api/users/me/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ville: data.ville || prev.ville,
            quartier: data.quartier || "",
            biographie: data.biographie || "",
          }))
          if (data.documents) setDocuments(data.documents)
        }
      })
      .catch(() => {})
  }, [authUser])

  // Load notification preferences
  useEffect(() => {
    if (!authUser) return
    fetch("/api/users/me/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setNotifications({
            notificationsEmail: data.notificationsEmail ?? true,
            notificationsSMS: data.notificationsSMS ?? true,
            notificationsPush: data.notificationsPush ?? true,
            notificationsReservations: data.notificationsReservations ?? true,
            notificationsPromotions: data.notificationsPromotions ?? false,
            notificationsMessages: data.notificationsMessages ?? true,
            notificationsAvis: data.notificationsAvis ?? true,
          })
          setPrefsLoaded(true)
        }
      })
      .catch(() => {})
  }, [authUser])

  // -- PROFILE UPDATE --
  const handleSaveProfile = useCallback(async () => {
    setProfileErrors({})

    // Client-side validation
    const validation = profileUpdateSchema.safeParse(formData)
    if (!validation.success) {
      setProfileErrors(formatZodErrors(validation.error))
      toast({ title: "Erreur de validation", description: "Veuillez corriger les champs en erreur", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("/api/users/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.details) {
          setProfileErrors(result.details)
        }
        toast({ title: "Erreur", description: result.error || "Erreur lors de la mise a jour", variant: "destructive" })
        return
      }

      // Update auth context
      updateUser({
        nom: validation.data.nom,
        prenom: validation.data.prenom,
        name: `${validation.data.prenom} ${validation.data.nom}`.trim(),
        telephone: validation.data.telephone || authUser?.telephone,
        ville: validation.data.ville || authUser?.ville,
      })

      setIsEditing(false)
      toast({ title: "Profil mis a jour", description: "Vos informations ont ete enregistrees avec succes" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de contacter le serveur", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }, [formData, updateUser, authUser, toast])

  // -- PASSWORD CHANGE --
  const handleChangePassword = useCallback(async () => {
    setPasswordErrors({})

    const validation = passwordChangeSchema.safeParse(passwordForm)
    if (!validation.success) {
      setPasswordErrors(formatZodErrors(validation.error))
      toast({ title: "Erreur de validation", description: "Veuillez corriger les champs en erreur", variant: "destructive" })
      return
    }

    setIsChangingPassword(true)
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.details) {
          setPasswordErrors(result.details)
        }
        toast({ title: "Erreur", description: result.error || "Erreur lors du changement de mot de passe", variant: "destructive" })
        return
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast({ title: "Mot de passe mis a jour", description: "Votre mot de passe a ete change avec succes" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de contacter le serveur", variant: "destructive" })
    } finally {
      setIsChangingPassword(false)
    }
  }, [passwordForm, toast])

  // -- SAVE NOTIFICATION PREFERENCES --
  const handleSavePreferences = useCallback(async () => {
    const validation = notificationPreferencesSchema.safeParse(notifications)
    if (!validation.success) {
      toast({ title: "Erreur", description: "Preferences invalides", variant: "destructive" })
      return
    }

    setIsSavingPrefs(true)
    try {
      const res = await fetch("/api/users/me/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      if (!res.ok) {
        const result = await res.json().catch(() => ({}))
        toast({ title: "Erreur", description: result.error || "Erreur lors de la sauvegarde", variant: "destructive" })
        return
      }

      toast({ title: "Preferences enregistrees", description: "Vos preferences de notification ont ete mises a jour" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de contacter le serveur", variant: "destructive" })
    } finally {
      setIsSavingPrefs(false)
    }
  }, [notifications, toast])

  // -- DELETE ACCOUNT --
  const handleDeleteAccount = useCallback(async () => {
    setDeleteErrors({})

    const validation = accountDeletionSchema.safeParse({ password: deletePassword })
    if (!validation.success) {
      setDeleteErrors(formatZodErrors(validation.error))
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch("/api/users/me/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      })

      const result = await res.json()

      if (!res.ok) {
        if (result.details) {
          setDeleteErrors(result.details)
        }
        toast({ title: "Erreur", description: result.error || "Erreur lors de la desactivation", variant: "destructive" })
        return
      }

      toast({ title: "Compte desactive", description: "Votre compte a ete desactive. Vous allez etre redirige." })
      setDeleteDialogOpen(false)
      // Redirect after a short delay
      setTimeout(() => {
        logout()
      }, 1500)
    } catch {
      toast({ title: "Erreur", description: "Impossible de contacter le serveur", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }, [deletePassword, toast, logout])

  // Cancel editing and reset to auth state
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setProfileErrors({})
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        nom: authUser.nom || "",
        prenom: authUser.prenom || "",
        email: authUser.email || "",
        telephone: authUser.telephone || "",
      }))
    }
  }, [authUser])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Veuillez vous connecter pour acceder a votre profil.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <h1 className="text-3xl font-bold tracking-tight text-balance">Mon profil</h1>
        <p className="text-muted-foreground mt-1">Gerez vos informations personnelles et parametres</p>
      </div>

      {/* Profile Header Card */}
      <Card
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={authUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{(authUser.nom || "U")[0]}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Changer la photo de profil</span>
              </Button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-balance">
                {authUser.prenom} {authUser.nom}
              </h2>
              <p className="text-muted-foreground">{authUser.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="secondary">
                  {userType === "proprietaire"
                    ? "Proprietaire"
                    : userType === "admin"
                      ? "Admin"
                      : "Locataire"}
                </Badge>
                {authUser.statut === "verifie" || authUser.statut === "Actif" ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">
                    <Check className="h-3 w-3 mr-1" />
                    Verifie
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    En attente de verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        defaultValue="info"
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="security">Securite</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* ============ INFORMATIONS TAB ============ */}
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>Mettez a jour vos informations de profil</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Enregistrer
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => {
                      setFormData({ ...formData, nom: e.target.value })
                      setProfileErrors((prev) => ({ ...prev, nom: [] }))
                    }}
                    disabled={!isEditing}
                    className={profileErrors.nom?.length ? "border-destructive" : ""}
                    aria-invalid={!!profileErrors.nom?.length}
                  />
                  <FieldError errors={profileErrors} field="nom" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prenom</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => {
                      setFormData({ ...formData, prenom: e.target.value })
                      setProfileErrors((prev) => ({ ...prev, prenom: [] }))
                    }}
                    disabled={!isEditing}
                    className={profileErrors.prenom?.length ? "border-destructive" : ""}
                    aria-invalid={!!profileErrors.prenom?.length}
                  />
                  <FieldError errors={profileErrors} field="prenom" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input id="email" type="email" value={formData.email} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">{"L'email ne peut pas etre modifie directement. Contactez le support."}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telephone
                </Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => {
                    setFormData({ ...formData, telephone: e.target.value })
                    setProfileErrors((prev) => ({ ...prev, telephone: [] }))
                  }}
                  disabled={!isEditing}
                  placeholder="+237 6XX XXX XXX"
                  className={profileErrors.telephone?.length ? "border-destructive" : ""}
                  aria-invalid={!!profileErrors.telephone?.length}
                />
                <FieldError errors={profileErrors} field="telephone" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ville" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ville
                  </Label>
                  <Select
                    value={formData.ville}
                    onValueChange={(value) => setFormData({ ...formData, ville: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Douala">Douala</SelectItem>
                      <SelectItem value="Yaoundé">Yaounde</SelectItem>
                      <SelectItem value="Bafoussam">Bafoussam</SelectItem>
                      <SelectItem value="Bamenda">Bamenda</SelectItem>
                      <SelectItem value="Garoua">Garoua</SelectItem>
                      <SelectItem value="Maroua">Maroua</SelectItem>
                      <SelectItem value="Kribi">Kribi</SelectItem>
                      <SelectItem value="Limbé">Limbe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quartier">Quartier</Label>
                  <Input
                    id="quartier"
                    value={formData.quartier}
                    onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Votre quartier"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ SECURITY TAB ============ */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Assurez-vous d'utiliser un mot de passe fort</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      setPasswordErrors((prev) => ({ ...prev, currentPassword: [] }))
                    }}
                    className={passwordErrors.currentPassword?.length ? "border-destructive pr-10" : "pr-10"}
                    aria-invalid={!!passwordErrors.currentPassword?.length}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    </span>
                  </Button>
                </div>
                <FieldError errors={passwordErrors} field="currentPassword" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      setPasswordErrors((prev) => ({ ...prev, newPassword: [] }))
                    }}
                    className={passwordErrors.newPassword?.length ? "border-destructive pr-10" : "pr-10"}
                    aria-invalid={!!passwordErrors.newPassword?.length}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    </span>
                  </Button>
                </div>
                <FieldError errors={passwordErrors} field="newPassword" />
                <PasswordStrengthIndicator password={passwordForm.newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    setPasswordErrors((prev) => ({ ...prev, confirmPassword: [] }))
                  }}
                  className={passwordErrors.confirmPassword?.length ? "border-destructive" : ""}
                  aria-invalid={!!passwordErrors.confirmPassword?.length}
                />
                <FieldError errors={passwordErrors} field="confirmPassword" />
              </div>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise a jour...
                  </>
                ) : (
                  "Mettre a jour le mot de passe"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Authentification a deux facteurs
              </CardTitle>
              <CardDescription>Ajoutez une couche de securite supplementaire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Authentification par SMS</p>
                    <p className="text-sm text-muted-foreground">Recevez un code par SMS lors de la connexion</p>
                  </div>
                </div>
                <Switch disabled />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {"L'authentification a deux facteurs sera disponible prochainement."}
              </p>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessions actives</CardTitle>
              <CardDescription>Gerez vos appareils connectes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Session actuelle</p>
                    <p className="text-sm text-muted-foreground">Navigateur web</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-green-200">Actif</Badge>
              </div>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Deconnecter toutes les autres sessions
              </Button>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Zone de danger
              </CardTitle>
              <CardDescription>Actions irreversibles sur votre compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div>
                  <p className="font-medium">Desactiver mon compte</p>
                  <p className="text-sm text-muted-foreground">
                    Votre compte sera desactive. Vos donnees seront conservees 12 mois avant suppression definitive.
                  </p>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Desactiver
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desactiver votre compte ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action desactivera votre compte. Vous ne pourrez plus vous connecter ni acceder a vos
                        donnees. Vos informations seront conservees pendant 12 mois avant suppression definitive.
                        Entrez votre mot de passe pour confirmer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-4">
                      <Label htmlFor="delete-password">Mot de passe de confirmation</Label>
                      <Input
                        id="delete-password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => {
                          setDeletePassword(e.target.value)
                          setDeleteErrors({})
                        }}
                        placeholder="Entrez votre mot de passe"
                        className={deleteErrors.password?.length ? "border-destructive" : ""}
                        aria-invalid={!!deleteErrors.password?.length}
                      />
                      <FieldError errors={deleteErrors} field="password" />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setDeletePassword("")
                          setDeleteErrors({})
                        }}
                      >
                        Annuler
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || !deletePassword}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Desactivation...
                          </>
                        ) : (
                          "Confirmer la desactivation"
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ PREFERENCES TAB ============ */}
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Gerez vos preferences de notification</CardDescription>
              </div>
              <Button onClick={handleSavePreferences} disabled={isSavingPrefs} size="sm">
                {isSavingPrefs ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Enregistrer
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: "notificationsEmail" as const,
                    label: "Notifications email",
                    desc: "Recevez des emails pour les reservations et messages",
                  },
                  {
                    key: "notificationsSMS" as const,
                    label: "Notifications SMS",
                    desc: "Recevez des SMS pour les alertes urgentes",
                  },
                  {
                    key: "notificationsPush" as const,
                    label: "Notifications push",
                    desc: "Notifications sur votre appareil",
                  },
                  {
                    key: "notificationsReservations" as const,
                    label: "Reservations",
                    desc: "Mises a jour sur vos reservations",
                  },
                  {
                    key: "notificationsMessages" as const,
                    label: "Messages",
                    desc: "Nouveaux messages de la messagerie",
                  },
                  {
                    key: "notificationsAvis" as const,
                    label: "Avis",
                    desc: "Nouveaux avis sur vos vehicules ou profil",
                  },
                  {
                    key: "notificationsPromotions" as const,
                    label: "Communications marketing",
                    desc: "Offres speciales et nouveautes",
                  },
                ].map((item, index) => (
                  <div key={item.key}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, [item.key]: checked })
                        }
                        aria-label={item.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ DOCUMENTS TAB ============ */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {"Documents d'identite"}
              </CardTitle>
              <CardDescription>Documents requis pour la verification de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {documents.map((doc) => {
                    const isVerified = doc.statut === "Verifie" || doc.statut === "Approuve"
                    const isPending = doc.statut === "EnAttente"
                    return (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="text-center">
                          <div
                            className={cn(
                              "mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-3",
                              isVerified && "bg-green-500/10",
                              isPending && "bg-amber-500/10",
                              !isVerified && !isPending && "bg-destructive/10",
                            )}
                          >
                            {isVerified ? (
                              <Check className="h-6 w-6 text-green-500" />
                            ) : isPending ? (
                              <Loader2 className="h-6 w-6 text-amber-500" />
                            ) : (
                              <AlertTriangle className="h-6 w-6 text-destructive" />
                            )}
                          </div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isVerified ? "Document verifie" : isPending ? "En attente de verification" : "Rejete"}
                          </p>
                          <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                            Voir le document
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Fallback: static document cards when no data from API */
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">{"Carte d'identite nationale"}</p>
                      <p className="text-sm text-muted-foreground mt-1">Non televerse</p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        Ajouter le document
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Permis de conduire</p>
                      <p className="text-sm text-muted-foreground mt-1">Non televerse</p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        Ajouter le document
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {userType === "proprietaire" && (
                <div className="p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Registre de commerce (RCCM)</p>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez votre RCCM pour beneficier du statut proprietaire professionnel
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        Ajouter le document
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
