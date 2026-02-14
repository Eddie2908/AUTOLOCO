"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, CreditCard, Eye, EyeOff, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder-user.jpg")
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        // Récupérer le profil complet
        const res = await fetch("/api/dashboard/user/profile")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setProfile(data)
        
        // Récupérer l'avatar depuis /api/auth/me
        const avatarRes = await fetch("/api/auth/me")
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json()
          if (avatarData.avatar) setAvatarUrl(avatarData.avatar)
        }
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setNotificationsLoading(true)
      try {
        const res = await fetch("/api/notifications?limit=10")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setNotifications(Array.isArray(data) ? data : [])
      } catch {
        // ignore
      } finally {
        setNotificationsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const triggerFilePicker = () => {
    fileInputRef.current?.click()
  }

  const uploadAvatar = async (file: File) => {
    const form = new FormData()
    form.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Erreur lors de l'upload")
    }

    const data = (await response.json()) as { url?: string }
    if (!data.url) throw new Error("Réponse upload invalide")
    return data.url
  }

  const handleProfileSave = async () => {
    const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value
    const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value
    const email = (document.getElementById("email") as HTMLInputElement)?.value
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value
    const address = (document.getElementById("address") as HTMLTextAreaElement)?.value
    const city = (document.getElementById("city") as HTMLInputElement)?.value

    setProfileLoading(true)
    try {
      const res = await fetch("/api/dashboard/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, address, city }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || err?.error || "Erreur lors de la sauvegarde")
      }

      const updated = await res.json()
      setProfile(updated)

      toast.success("Profil mis à jour", {
        description: "Vos informations ont été sauvegardées avec succès.",
      })
    } catch (error) {
      toast.error("Échec de la sauvegarde", {
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarLoading(true)
    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)

      const persistRes = await fetch("/api/users/me/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      })

      if (!persistRes.ok) {
        const err = await persistRes.json().catch(() => ({}))
        throw new Error(err?.message || err?.error || "Erreur lors de la sauvegarde")
      }

      toast.success("Photo de profil sauvegardée", {
        description: "Votre photo de profil a été mise à jour avec succès.",
      })
    } catch (error) {
      toast.error("Échec de la sauvegarde", {
        description: error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.",
      })
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        className={cn(
          "flex flex-col gap-2 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="payment">Paiements</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card
            className={cn(
              "transition-all duration-500",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className={cn("h-24 w-24 ring-2 ring-border", avatarLoading && "opacity-50")}>
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  {avatarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarSelected}
                  />
                  <Button variant="outline" size="sm" onClick={triggerFilePicker} disabled={avatarLoading}>
                    {avatarLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Changer la photo"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              {/* Form fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue={profile?.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue={profile?.lastName || ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue={profile?.email || ""} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" type="tel" defaultValue={profile?.phone || ""} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <textarea
                    id="address"
                    className="w-full min-h-20 rounded-md border border-input bg-background px-3 pl-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue={profile?.address || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="city" defaultValue={profile?.city || ""} className="pl-10" />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90" onClick={handleProfileSave} disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vos notifications récentes</CardTitle>
              <CardDescription>Les dernières notifications vous concernant</CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className={cn("w-2 h-2 rounded-full mt-2", notif.read ? "bg-muted" : "bg-primary")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Réservations",
                  description: "Notifications pour les nouvelles réservations et modifications",
                  checked: true,
                },
                {
                  title: "Messages",
                  description: "Alertes pour les nouveaux messages",
                  checked: true,
                },
                {
                  title: "Paiements",
                  description: "Confirmations de paiement et reçus",
                  checked: true,
                },
                {
                  title: "Promotions",
                  description: "Offres spéciales et réductions",
                  checked: false,
                },
                {
                  title: "Rappels",
                  description: "Rappels de réservation et échéances",
                  checked: true,
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={item.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et connexion</CardTitle>
              <CardDescription>Gérez votre mot de passe et vos paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" />
                </div>

                <Button>Changer le mot de passe</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Authentification à deux facteurs</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Activer 2FA</p>
                    <p className="text-sm text-muted-foreground">Sécurité supplémentaire pour votre compte</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences générales</CardTitle>
              <CardDescription>Personnalisez votre expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <select
                  id="language"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <select
                  id="currency"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="fcfa">FCFA</option>
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Mode sombre</p>
                  <p className="text-sm text-muted-foreground">Utiliser le thème sombre</p>
                </div>
                <Switch />
              </div>

              <Button>Enregistrer les préférences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement</CardTitle>
              <CardDescription>Gérez vos moyens de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: "Mobile Money MTN", number: "•••• 7890", icon: "📱", primary: true },
                { type: "Orange Money", number: "•••• 1234", icon: "📱", primary: false },
              ].map((method, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-medium">{method.type}</p>
                      <p className="text-sm text-muted-foreground">{method.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.primary && <Badge variant="secondary">Principal</Badge>}
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full bg-transparent">
                <CreditCard className="h-4 w-4 mr-2" />
                Ajouter un moyen de paiement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
