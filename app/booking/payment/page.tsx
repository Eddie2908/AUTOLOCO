"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, Smartphone, Lock, Shield, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BookingStepper } from "@/components/booking/booking-stepper"
import { PriceBreakdown } from "@/components/booking/price-breakdown"
import { cn } from "@/lib/utils"
import { useVehicle } from "@/hooks/use-vehicles"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/loading-states"
import { paymentMethods, calculateBookingPrice } from "@/lib/constants/booking"

const steps = [
  { id: 1, name: "Configuration", description: "Dates et options" },
  { id: 2, name: "Récapitulatif", description: "Vérification" },
  { id: 3, name: "Paiement", description: "Finalisation" },
  { id: 4, name: "Confirmation", description: "Réservation" },
]

export default function BookingPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("mtn_momo")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Card payment fields
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  // Récupérer les paramètres
  const vehicleId = searchParams.get("vehicleId") || "1"
  const startDateStr = searchParams.get("startDate")
  const endDateStr = searchParams.get("endDate")
  const optionsStr = searchParams.get("options") || ""

  const { vehicle, isLoading: vehicleLoading, error: vehicleError } = useVehicle(vehicleId)
  const startDate = startDateStr ? new Date(startDateStr) : new Date()
  const endDate = endDateStr ? new Date(endDateStr) : new Date()
  const selectedOptions = optionsStr ? optionsStr.split(",").filter(Boolean) : []

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const pricing = calculateBookingPrice(vehicle?.price || 0, days, selectedOptions, vehicle?.deposit || 0)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (vehicleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
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
            message="Ce véhicule n'existe pas ou n'est plus disponible"
            action={<Button onClick={() => router.push("/vehicles")}>Voir tous les véhicules</Button>}
          />
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const bookingData = {
        vehicule_id: vehicleId,
        date_debut: startDate.toISOString(),
        date_fin: endDate.toISOString(),
        lieu_prise: searchParams.get("pickupLocation") || "Douala, Akwa",
        lieu_retour: searchParams.get("returnLocation") || searchParams.get("pickupLocation") || "Douala, Akwa",
        avec_chauffeur: selectedOptions.includes("chauffeur"),
        assurance_etendue: selectedOptions.includes("assurance_etendue"),
        options_supplementaires: selectedOptions,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création de la réservation")
      }

      const booking = await response.json()

      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(`/booking/confirmation/${booking.id}`)
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message || "Une erreur est survenue lors du paiement")
      setIsProcessing(false)
    }
  }

  const isValidMobileNumber = phoneNumber.length >= 9
  const isValidCard = cardNumber.length >= 16 && cardExpiry.length >= 4 && cardCvc.length >= 3

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={`/booking/summary?${searchParams.toString()}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au récapitulatif
          </Link>
        </Button>

        <BookingStepper steps={steps} currentStep={3} />

        <div
          className={cn(
            "grid gap-8 lg:grid-cols-3 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600">Erreur de paiement</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Méthode de paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "flex items-center space-x-4 rounded-xl border-2 p-4 cursor-pointer transition-all",
                        paymentMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-3 flex-1">
                        {method.id === "mtn_momo" && (
                          <div className="h-10 w-10 rounded-lg bg-yellow-400 flex items-center justify-center font-bold text-black text-xs">
                            MTN
                          </div>
                        )}
                        {method.id === "orange_money" && (
                          <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs">
                            OM
                          </div>
                        )}
                        {method.id === "card" && (
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-medium cursor-pointer">
                            {method.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        {method.popular && (
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full font-medium">
                            Populaire
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Informations de paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(paymentMethod === "mtn_momo" || paymentMethod === "orange_money") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 border rounded-lg bg-muted">
                          <span className="text-sm font-medium">+237</span>
                        </div>
                        <Input
                          id="phone"
                          placeholder="6XX XXX XXX"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Vous recevrez une demande de confirmation sur ce numéro
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-mobile"
                        checked={savePaymentMethod}
                        onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
                      />
                      <Label htmlFor="save-mobile" className="text-sm font-normal">
                        Sauvegarder pour mes prochains paiements
                      </Label>
                    </div>
                  </>
                )}

                {paymentMethod === "card" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Numéro de carte</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Date d'expiration</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-card"
                        checked={savePaymentMethod}
                        onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
                      />
                      <Label htmlFor="save-card" className="text-sm font-normal">
                        Sauvegarder cette carte pour mes prochains paiements
                      </Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-600">Paiement sécurisé</p>
                    <p className="text-sm text-muted-foreground">
                      Vos informations de paiement sont chiffrées et sécurisées. Nous ne stockons jamais vos données de
                      carte complètes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Montant à payer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <img
                    src={vehicle.image || "/placeholder.svg"}
                    alt={vehicle.name}
                    className="h-16 w-20 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{days} jours</p>
                  </div>
                </div>

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
                  onClick={handlePayment}
                  disabled={
                    isProcessing ||
                    ((paymentMethod === "mtn_momo" || paymentMethod === "orange_money") && !isValidMobileNumber) ||
                    (paymentMethod === "card" && !isValidCard)
                  }
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Payer {pricing.grandTotal.toLocaleString()} FCFA
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En cliquant sur "Payer", vous acceptez les conditions de paiement
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
