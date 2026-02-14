"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  Download,
  Share2,
  Home,
  Car,
  FileText,
  Phone,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Booking } from "@/lib/api/types"

const steps = [
  { id: 1, name: "Configuration", description: "Dates et options" },
  { id: 2, name: "Récapitulatif", description: "Vérification" },
  { id: 3, name: "Paiement", description: "Finalisation" },
  { id: 4, name: "Confirmation", description: "Réservation" },
]

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.id as string

  const [mounted, setMounted] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)

        if (!response.ok) {
          throw new Error("Réservation non trouvée")
        }

        const data = await response.json()
        setBooking(data)
      } catch (err: any) {
        console.error("[v0] Booking fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setShowAnimation(true), 100)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de votre réservation...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Réservation introuvable</h2>
            <p className="text-muted-foreground mb-4">{error || "Cette réservation n'existe pas"}</p>
            <Button asChild>
              <Link href="/vehicles">Rechercher des véhicules</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const vehicleName = `${booking.vehicule?.marque} ${booking.vehicule?.modele}`
  const startDate = new Date(booking.date_debut)
  const endDate = new Date(booking.date_fin)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <BookingStepper steps={steps} currentStep={4} />

        {/* Success Animation */}
        <div
          className={cn(
            "text-center mb-8 transition-all duration-700",
            showAnimation ? "opacity-100 scale-100" : "opacity-0 scale-95",
          )}
        >
          <div className="relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="relative rounded-full bg-green-500/10 p-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-6">Réservation confirmée !</h1>
          <p className="text-muted-foreground mt-2">
            Votre réservation a été confirmée avec succès. Un email de confirmation vous a été envoyé.
          </p>
        </div>

        {/* Booking Reference */}
        <Card
          className={cn(
            "mb-6 border-primary/20 bg-primary/5 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Numéro de réservation</p>
            <p className="text-2xl font-bold text-primary tracking-wider">{booking.id}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Conservez ce numéro pour vos échanges avec le propriétaire
            </p>
          </CardContent>
        </Card>

        <div
          className={cn(
            "grid gap-6 lg:grid-cols-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Détails de la réservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle */}
              <div className="flex gap-4">
                <img
                  src={booking.vehicule?.photos?.[0]?.url || "/placeholder.svg?height=80&width=112"}
                  alt={vehicleName}
                  className="h-20 w-28 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold">{vehicleName}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {booking.vehicule?.type_vehicule}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Période</p>
                    <p className="font-medium">
                      {format(startDate, "d MMM", { locale: fr })} - {format(endDate, "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu de prise en charge</p>
                    <p className="font-medium">{booking.lieu_prise}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lieu de restitution</p>
                    <p className="font-medium">{booking.lieu_retour}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Votre propriétaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={booking.vehicule?.proprietaire?.avatar || "/placeholder.svg?height=64&width=64"}
                  alt={booking.vehicule?.proprietaire?.nom || "Propriétaire"}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{booking.vehicule?.proprietaire?.nom || "Propriétaire"}</p>
                  <p className="text-sm text-muted-foreground">
                    Membre depuis{" "}
                    {format(new Date(booking.vehicule?.proprietaire?.date_inscription || new Date()), "yyyy", {
                      locale: fr,
                    })}
                  </p>
                  {booking.vehicule?.proprietaire?.is_verified && (
                    <Badge variant="secondary" className="mt-1 text-xs bg-green-500/10 text-green-600">
                      Vérifié
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Button variant="outline" className="justify-start bg-transparent" asChild>
                  <Link href="/dashboard/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start bg-transparent" asChild>
                  <a href={`tel:${booking.vehicule?.proprietaire?.telephone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Appeler le propriétaire
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card
          className={cn(
            "mt-6 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg">Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: 1,
                  title: "Contactez le propriétaire",
                  description: "Confirmez l'heure et le lieu de rendez-vous",
                  icon: MessageSquare,
                },
                {
                  step: 2,
                  title: "Préparez vos documents",
                  description: "CNI, permis de conduire valide",
                  icon: FileText,
                },
                {
                  step: 3,
                  title: "Jour de la location",
                  description: "Présentez-vous à l'heure convenue",
                  icon: Car,
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 mt-8 justify-center transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "500ms" }}
        >
          <Button variant="outline" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Télécharger la confirmation
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            size="lg"
            asChild
          >
            <Link href="/dashboard/renter">
              <Home className="h-4 w-4 mr-2" />
              Voir mes réservations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
