"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Shield,
  Navigation,
  Baby,
  Users,
  Car,
  Star,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { PriceBreakdown } from "@/components/booking/price-breakdown"
import { cn } from "@/lib/utils"
import { useVehicle } from "@/hooks/use-vehicles"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/loading-states"
import { bookingOptions, pickupLocations, calculateBookingPrice } from "@/lib/constants/booking"
import { format, differenceInDays, addDays } from "date-fns"
import { fr } from "date-fns/locale"

const steps = [
  { id: 1, name: "Configuration", description: "Dates et options" },
  { id: 2, name: "Récapitulatif", description: "Vérification" },
  { id: 3, name: "Paiement", description: "Finalisation" },
  { id: 4, name: "Confirmation", description: "Réservation" },
]

const optionIcons: Record<string, React.ElementType> = {
  shield: Shield,
  "map-pin": Navigation,
  baby: Baby,
  users: Users,
}

export default function BookingConfigurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get("vehicleId") || "1"

  const [mounted, setMounted] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 4))
  const [pickupLocation, setPickupLocation] = useState("")
  const [returnLocation, setReturnLocation] = useState("")
  const [sameReturnLocation, setSameReturnLocation] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const { vehicle, isLoading, error } = useVehicle(vehicleId)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
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

  const days = startDate && endDate ? differenceInDays(endDate, startDate) : 0
  const pricing = calculateBookingPrice(vehicle.price, days > 0 ? days : 1, selectedOptions, vehicle.deposit)

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]))
  }

  const handleContinue = () => {
    const params = new URLSearchParams({
      vehicleId,
      startDate: startDate?.toISOString() || "",
      endDate: endDate?.toISOString() || "",
      pickupLocation,
      returnLocation: sameReturnLocation ? pickupLocation : returnLocation,
      options: selectedOptions.join(","),
    })
    router.push(`/booking/summary?${params.toString()}`)
  }

  const isValid = startDate && endDate && pickupLocation && days > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        {/* Back button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/vehicles/${vehicleId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au véhicule
          </Link>
        </Button>

        {/* Stepper */}
        <BookingStepper steps={steps} currentStep={1} />

        <div
          className={cn(
            "grid gap-8 lg:grid-cols-3 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={vehicle.name}
                    className="h-24 w-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{vehicle.name}</h2>
                    <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{vehicle.rating}</span>
                        <span className="text-sm text-muted-foreground">({vehicle.reviews} avis)</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {vehicle.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{vehicle.price.toLocaleString()} FCFA</p>
                    <p className="text-sm text-muted-foreground">/jour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Dates de location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: fr }) : "Sélectionner"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < (startDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {days > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Durée: <span className="font-medium text-foreground">{days} jours</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Lieux de prise en charge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Lieu de prise en charge</Label>
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un lieu" />
                    </SelectTrigger>
                    <SelectContent>
                      {pickupLocations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          <div>
                            <p className="font-medium">{location.label}</p>
                            <p className="text-xs text-muted-foreground">{location.address}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="same-location"
                    checked={sameReturnLocation}
                    onCheckedChange={(checked) => setSameReturnLocation(checked as boolean)}
                  />
                  <Label htmlFor="same-location" className="text-sm font-normal">
                    Restitution au même endroit
                  </Label>
                </div>

                {!sameReturnLocation && (
                  <div className="space-y-2">
                    <Label>Lieu de restitution</Label>
                    <Select value={returnLocation} onValueChange={setReturnLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lieu" />
                      </SelectTrigger>
                      <SelectContent>
                        {pickupLocations.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            <div>
                              <p className="font-medium">{location.label}</p>
                              <p className="text-xs text-muted-foreground">{location.address}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Options supplémentaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {bookingOptions.map((option) => {
                    const Icon = optionIcons[option.icon] || Shield
                    const isSelected = selectedOptions.includes(option.id)
                    return (
                      <div
                        key={option.id}
                        onClick={() => handleOptionToggle(option.id)}
                        className={cn(
                          "relative flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all",
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                        )}
                      >
                        <div className={cn("rounded-lg p-2", isSelected ? "bg-primary/10" : "bg-muted")}>
                          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            +{option.pricePerDay.toLocaleString()} FCFA/jour
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PriceBreakdown
                  basePrice={pricing.basePrice}
                  days={days > 0 ? days : 1}
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
                  disabled={!isValid}
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">Vous ne serez pas débité maintenant</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
