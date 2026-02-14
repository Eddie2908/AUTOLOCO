"use client"

import { useState, useEffect } from "react"
import { Settings, DollarSign, Shield, Bell, Smartphone, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres de la plateforme</h1>
          <p className="text-muted-foreground mt-1">Configurez les paramètres globaux d'AUTOLOCO</p>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          {saved ? "Enregistré !" : "Enregistrer les modifications"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-2" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la plateforme</CardTitle>
              <CardDescription>Configurez les informations générales d'AUTOLOCO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Nom de la plateforme</Label>
                  <Input id="platform-name" defaultValue="AUTOLOCO" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-email">Email de contact</Label>
                  <Input id="platform-email" type="email" defaultValue="contact@autoloco.cm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-description">Description</Label>
                <Textarea
                  id="platform-description"
                  defaultValue="Plateforme de location de véhicules entre particuliers et professionnels au Cameroun"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="support-phone">Téléphone support</Label>
                  <Input id="support-phone" defaultValue="+237 699 123 456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue par défaut</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commission de la plateforme</CardTitle>
              <CardDescription>Définissez les taux de commission sur les transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="commission-rate">Taux de commission (%)</Label>
                  <Input id="commission-rate" type="number" defaultValue="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-commission">Commission minimale (FCFA)</Label>
                  <Input id="min-commission" type="number" defaultValue="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-commission">Commission maximale (FCFA)</Label>
                  <Input id="max-commission" type="number" defaultValue="50000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités de la plateforme</CardTitle>
              <CardDescription>Activez ou désactivez certaines fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Réservation instantanée</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux propriétaires d'activer la réservation sans validation
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Système de points de fidélité</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le programme de récompenses pour les locataires
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vérification d'identité obligatoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger la vérification d'identité pour tous les utilisateurs
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de paiement</CardTitle>
              <CardDescription>Configurez les moyens de paiement acceptés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-amber-500" />
                  <div>
                    <Label>MTN Mobile Money</Label>
                    <p className="text-sm text-muted-foreground">Paiements via MTN MoMo</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-orange-500" />
                  <div>
                    <Label>Orange Money</Label>
                    <p className="text-sm text-muted-foreground">Paiements via Orange Money</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label>Cartes bancaires</Label>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard via Stripe</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clés API de paiement</CardTitle>
              <CardDescription>Configurez vos clés API pour les passerelles de paiement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mtn-api-key">MTN MoMo API Key</Label>
                <Input id="mtn-api-key" type="password" placeholder="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orange-api-key">Orange Money API Key</Label>
                <Input id="orange-api-key" type="password" placeholder="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-api-key">Stripe Secret Key</Label>
                <Input id="stripe-api-key" type="password" placeholder="sk_live_••••••••••••••••" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Email</CardTitle>
              <CardDescription>Configurez les notifications envoyées par email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelle réservation</Label>
                  <p className="text-sm text-muted-foreground">Notifier les propriétaires des nouvelles réservations</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmation de paiement</Label>
                  <p className="text-sm text-muted-foreground">Envoyer un email après chaque paiement réussi</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappels de réservation</Label>
                  <p className="text-sm text-muted-foreground">Rappeler aux locataires 24h avant la prise en charge</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications SMS</CardTitle>
              <CardDescription>Configurez les notifications envoyées par SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Code de vérification</Label>
                  <p className="text-sm text-muted-foreground">Envoyer les codes OTP par SMS</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmation de réservation</Label>
                  <p className="text-sm text-muted-foreground">SMS de confirmation après réservation</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2 pt-4">
                <Label htmlFor="sms-api-key">API SMS (Twilio/Nexah)</Label>
                <Input id="sms-api-key" type="password" placeholder="••••••••••••••••" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et authentification</CardTitle>
              <CardDescription>Configurez les paramètres de sécurité de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs (2FA)</Label>
                  <p className="text-sm text-muted-foreground">Exiger la 2FA pour les administrateurs</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vérification du permis de conduire</Label>
                  <p className="text-sm text-muted-foreground">Vérifier automatiquement les permis de conduire</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Détection de fraude</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer la détection automatique de transactions suspectes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde et données</CardTitle>
              <CardDescription>Gestion des sauvegardes et de la protection des données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Fréquence des sauvegardes</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Chiffrement des données sensibles</Label>
                  <p className="text-sm text-muted-foreground">Chiffrer les informations personnelles et bancaires</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Lancer une sauvegarde manuelle
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
