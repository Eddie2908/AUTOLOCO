"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, MapPin, User, Star, Shield, Clock, Check, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { PriceBreakdown } from "@/components/booking/price-breakdown"
import { cn } from "@/lib/utils"
import { useVehicle } from "@/hooks/use-vehicles"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/loading-states"
import {
  bookingOptions,
  pickupLocations,
  calculateBookingPrice,
  cancellationPolicies,
} from "@/lib/constants/booking"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const steps = [
  { id: 1, name: "Configuration", description: "Dates et options" },
  { id: 2, name: "Récapitulatif", description: "Vérification" },
  { id: 3, name: "Paiement", description: "Finalisation" },
  { id: 4, name: "Confirmation", description: "Réservation" },
]

export default function BookingSummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Récupérer les paramètres
  const vehicleId = searchParams.get("vehicleId") || "1"
  const startDateStr = searchParams.get("startDate")
  const endDateStr = searchParams.get("endDate")
  const pickupLocationId = searchParams.get("pickupLocation") || ""
  const returnLocationId = searchParams.get("returnLocation") || ""
  const optionsStr = searchParams.get("options") || ""

  const { vehicle, isLoading, error: vehicleError } = useVehicle(vehicleId)
  const startDate = startDateStr ? new Date(startDateStr) : new Date()
  const endDate = endDateStr ? new Date(endDateStr) : new Date()
  const selectedOptions = optionsStr ? optionsStr.split(",").filter(Boolean) : []
  const pickupLocation = pickupLocations.find((l) => l.value === pickupLocationId)
  const returnLocation = pickupLocations.find((l) => l.value === returnLocationId)

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const pricing = calculateBookingPrice(vehicle?.price || 0, days, selectedOptions, vehicle?.deposit || 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (vehicleError || !vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-8">
          <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <ErrorState
            title="Véhicule non disponible"
            message="Ce véhicule n'existe pas ou n'est plus disponible pour la réservation"
            action={<Button onClick={() => router.push("/vehicles")}>Voir tous les véhicules</Button>}
          />
        </div>
      </div>
    )
  }

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams.toString())
    router.push(`/booking/payment?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/booking/configure?vehicleId=${vehicleId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Modifier la configuration
          </Link>
        </Button>

        {/* Stepper */}
        <BookingStepper steps={steps} currentStep={2} />

        <div
          className={cn(
            "grid gap-8 lg:grid-cols-3 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {/* Summary Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Véhicule réservé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={vehicle.name}
                    className="h-32 w-44 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{vehicle.name}</h2>
                    <Badge variant="secondary" className="mt-1">
                      {vehicle.type}
                    </Badge>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{vehicle.rating}</span>
                        <span className="text-muted-foreground">({vehicle.reviews} avis)</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {vehicle.features.slice(0, 4).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={vehicle.owner.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{vehicle.owner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{vehicle.owner.name}</p>
                      {vehicle.owner.verified && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {vehicle.owner.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Répond {vehicle.owner.responseTime}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Détails de la réservation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p className="font-medium">{format(startDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de fin</p>
                    <p className="font-medium">{format(endDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Lieu de prise en charge
                    </p>
                    <p className="font-medium">{pickupLocation?.label || "Non spécifié"}</p>
                    <p className="text-xs text-muted-foreground">{pickupLocation?.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Lieu de restitution
                    </p>
                    <p className="font-medium">{returnLocation?.label || pickupLocation?.label || "Non spécifié"}</p>
                    <p className="text-xs text-muted-foreground">
                      {returnLocation?.address || pickupLocation?.address}
                    </p>
                  </div>
                </div>

                {selectedOptions.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Options sélectionnées</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOptions.map((optionId) => {
                          const option = bookingOptions.find((o) => o.id === optionId)
                          return option ? (
                            <Badge key={optionId} variant="secondary">
                              {option.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Conditions d'annulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-semibold">{cancellationPolicies.flexible.name}:</span>{" "}
                    {cancellationPolicies.flexible.description}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                    J'accepte les{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Conditions Générales d'Utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Politique de Confidentialité
                    </Link>{" "}
                    d'AUTOLOCO. Je confirme avoir lu et compris les conditions d'annulation.
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Détail des coûts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PriceBreakdown
                  basePrice={pricing.basePrice}
                  days={days}
                  optionsPrice={pricing.optionsPrice}
                  serviceFee={pricing.serviceFee}
                  insurance={pricing.insurance}
                  total={pricing.total}
                  deposit={pricing.deposit}
                />

                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  size="lg"
                  onClick={handleContinue}
                  disabled={!acceptedTerms}
                >
                  Procéder au paiement
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
