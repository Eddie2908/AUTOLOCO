"use client"

import * as React from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Car,
  Fuel,
  Users,
  Star,
  Heart,
  MapPin,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageSquare,
  Clock,
  CalendarIcon,
  Check,
  Info,
  ArrowLeft,
  Gauge,
  Settings,
  DoorOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useVehicle } from "@/hooks/use-vehicles"
import { ErrorState } from "@/components/loading-states"
import { Skeleton } from "@/components/ui/skeleton"
import { addDays, format, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"

import { useToast } from "@/hooks/use-toast"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isVisible, setIsVisible] = React.useState(false)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isLiked, setIsLiked] = React.useState(false)
  const [isBooking, setIsBooking] = React.useState(false)
  const { toast } = useToast()
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: addDays(new Date(), 1),
    to: addDays(new Date(), 4),
  })

  const { vehicle, isLoading, error } = useVehicle(id)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-[500px] w-full rounded-3xl mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <ErrorState
              title="Véhicule non trouvé"
              message="Ce véhicule n'existe pas ou n'est plus disponible"
              action={<Button onClick={() => router.push("/vehicles")}>Voir tous les véhicules</Button>}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const images = vehicle.images.length > 0 ? vehicle.images : [vehicle.image]
  const days = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0
  const totalPrice = days * vehicle.price
  const serviceFee = Math.round(totalPrice * 0.1)
  const insurance = Math.round(totalPrice * 0.05)
  const grandTotal = totalPrice + serviceFee + insurance

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        {/* Back button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Retour
          </Button>
        </div>

        {/* Image Gallery */}
        <div
          className={cn(
            "container mx-auto px-4 sm:px-6 lg:px-8 mb-8 opacity-0",
            isVisible && "animate-fade-in opacity-100",
          )}
        >
          <div className="relative rounded-3xl overflow-hidden bg-muted h-[300px] sm:h-[400px] lg:h-[500px]">
            <img
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-500"
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110 shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110 shadow-lg"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70",
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background hover:scale-110"
              >
                <Heart className={cn("h-5 w-5", isLiked ? "fill-destructive text-destructive" : "text-foreground")} />
              </button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {vehicle.featured && (
                <Badge className="bg-accent text-accent-foreground">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Populaire
                </Badge>
              )}
              {vehicle.instantBooking && (
                <Badge className="bg-primary">
                  <Zap className="h-3 w-3 mr-1" />
                  Réservation instantanée
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Basic Info */}
              <div className={cn("space-y-4 opacity-0", isVisible && "animate-slide-up stagger-1 opacity-100")}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">{vehicle.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {vehicle.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                      {vehicle.rating}
                    </Badge>
                    <span className="text-muted-foreground">({vehicle.reviews} avis)</span>
                  </div>
                </div>

                {/* Quick specs */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Car className="h-5 w-5 text-primary" />
                    <span className="capitalize">{vehicle.type}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Fuel className="h-5 w-5 text-primary" />
                    <span className="capitalize">{vehicle.fuel}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="capitalize">{vehicle.transmission}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <span>{vehicle.seats} places</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <DoorOpen className="h-5 w-5 text-primary" />
                    <span>{vehicle.doors} portes</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Gauge className="h-5 w-5 text-primary" />
                    <span>{vehicle.mileageLimit} km/jour</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Owner */}
              {vehicle.owner && (
              <div className={cn("opacity-0", isVisible && "animate-slide-up stagger-2 opacity-100")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={vehicle.owner.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{vehicle.owner.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{vehicle.owner.name}</h3>
                        {vehicle.owner.verified && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Shield className="h-3 w-3 mr-1" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          {vehicle.owner.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Répond {vehicle.owner.responseTime}
                        </span>
                        <span>Membre depuis {vehicle.owner.memberSince}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                </div>
              </div>
              )}

              <Separator />

              {/* Tabs */}
              <Tabs
                defaultValue="description"
                className={cn("opacity-0", isVisible && "animate-slide-up stagger-3 opacity-100")}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Équipements</TabsTrigger>
                  <TabsTrigger value="reviews">Avis</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <h4 className="font-medium mb-2">Limite de kilométrage</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.mileageLimit} km par jour inclus</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <h4 className="font-medium mb-2">Caution</h4>
                      <p className="text-sm text-muted-foreground">{vehicle.deposit.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="mt-6">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {vehicle.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">Utilisateur {i}</p>
                          <p className="text-xs text-muted-foreground">Il y a {i} semaine(s)</p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn("h-4 w-4", s <= 5 - i + 1 ? "fill-accent text-accent" : "text-muted")}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Excellente expérience avec ce véhicule. Propriétaire très réactif et véhicule conforme à la
                        description.
                      </p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div
                className={cn("sticky top-24 opacity-0", isVisible && "animate-slide-in-right stagger-2 opacity-100")}
              >
                <Card className="shadow-xl border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <CardTitle className="text-3xl font-bold text-primary">
                          {vehicle.price.toLocaleString()} FCFA
                        </CardTitle>
                        <p className="text-muted-foreground">/jour</p>
                      </div>
                      {vehicle.insurance && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Assuré
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sélectionnez vos dates</label>
                      <div className="border rounded-xl overflow-hidden">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                          locale={fr}
                          disabled={(date) => date < new Date()}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Selected dates summary */}
                    {dateRange.from && dateRange.to && (
                      <div className="p-3 bg-muted rounded-xl">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            {format(dateRange.from, "d MMM", { locale: fr })} -{" "}
                            {format(dateRange.to, "d MMM yyyy", { locale: fr })}
                          </span>
                          <span className="font-medium">{days} jour(s)</span>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Price breakdown */}
                    {days > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {vehicle.price.toLocaleString()} FCFA x {days} jours
                          </span>
                          <span>{totalPrice.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            Frais de service
                            <Info className="h-3 w-3" />
                          </span>
                          <span>{serviceFee.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Assurance</span>
                          <span>{insurance.toLocaleString()} FCFA</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-primary">{grandTotal.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    )}

                    {/* Book button */}
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30"
                      disabled={days === 0 || isBooking}
                      onClick={async () => {
                        if (!dateRange.from || !dateRange.to) return
                        setIsBooking(true)
                        try {
                          const res = await fetch('/api/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              identifiant_vehicule: Number(vehicle.id),
                              date_debut: format(dateRange.from, 'yyyy-MM-dd'),
                              date_fin: format(dateRange.to, 'yyyy-MM-dd'),
                              lieu_prise_en_charge: vehicle.location || vehicle.city || 'À définir',
                              lieu_restitution: vehicle.location || vehicle.city || 'À définir',
                              assurance: true,
                            }),
                          })
                          const data = await res.json().catch(() => null)
                          if (!res.ok) {
                            toast({
                              variant: 'destructive',
                              title: 'Erreur',
                              description: data?.error || data?.detail || 'Impossible de créer la réservation',
                            })
                          } else {
                            toast({
                              title: 'Demande envoyée !',
                              description: 'Votre demande de réservation a été envoyée au propriétaire.',
                            })
                            router.push('/dashboard/renter')
                          }
                        } catch (err) {
                          toast({
                            variant: 'destructive',
                            title: 'Erreur',
                            description: 'Une erreur est survenue lors de la réservation.',
                          })
                        } finally {
                          setIsBooking(false)
                        }
                      }}
                    >
                      {isBooking ? (
                        "Envoi en cours..."
                      ) : vehicle.instantBooking ? (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Réserver instantanément
                        </>
                      ) : (
                        "Envoyer une demande"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Annulation gratuite jusqu'à 24h avant la prise en charge
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
