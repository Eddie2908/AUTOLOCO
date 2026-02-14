"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import {
  Car,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Camera,
  MapPin,
  DollarSign,
  Shield,
  Info,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const steps = [
  { id: 1, title: "Informations", icon: Car },
  { id: 2, title: "Photos", icon: Camera },
  { id: 3, title: "Localisation", icon: MapPin },
  { id: 4, title: "Tarification", icon: DollarSign },
  { id: 5, title: "Confirmation", icon: Check },
]

type VehicleMeta = {
  categories: { id: string; name: string }[]
  brands: { id: string; name: string }[]
  models: { id: string; name: string; brandId: string }[]
  cities: string[]
  fuelTypes: { value: string; label: string }[]
  transmissions: { value: string; label: string }[]
  features: string[]
}

export default function NewVehiclePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [meta, setMeta] = useState<VehicleMeta | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [selectedModelId, setSelectedModelId] = useState<string>("")
  const [useCustomBrand, setUseCustomBrand] = useState(false)
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    type: "",
    fuel: "",
    transmission: "",
    seats: "",
    doors: "",
    description: "",
    city: "",
    address: "",
    pricePerDay: "",
    pricePerWeek: "",
    pricePerMonth: "",
    minDays: "1",
    maxDays: "30",
    kmPerDay: "200",
    extraKmPrice: "100",
    deposit: "",
    instantBooking: true,
    driverAvailable: false,
    driverPrice: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!meta) return

    if (!useCustomBrand && selectedBrandId) {
      const brandName = meta.brands.find((b) => b.id === selectedBrandId)?.name || ""
      setFormData((prev) => ({ ...prev, brand: brandName }))
    }

    if (!useCustomModel && selectedModelId) {
      const modelName = meta.models.find((m) => m.id === selectedModelId)?.name || ""
      setFormData((prev) => ({ ...prev, model: modelName }))
    }
  }, [meta, selectedBrandId, selectedModelId, useCustomBrand, useCustomModel])

  const availableModels = meta?.models
    ? meta.models.filter((m) => (!selectedBrandId ? true : m.brandId === selectedBrandId))
    : []

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/vehicles/meta")
        if (!res.ok) return
        const data = (await res.json()) as VehicleMeta
        if (cancelled) return
        setMeta(data)

        // If meta exists and no selection yet, keep empty to force user choice.
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const triggerFilePicker = () => {
    fileInputRef.current?.click()
  }

  const uploadOneImage = async (file: File) => {
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

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      if (files.length === 0) return

      const remaining = Math.max(0, 10 - uploadedImages.length)
      const toUpload = files.slice(0, remaining)
      if (toUpload.length === 0) {
        toast.error("Maximum 10 photos autorisees")
        return
      }

      const urls = await Promise.all(toUpload.map(uploadOneImage))
      setUploadedImages((prev) => [...prev, ...urls])
      toast.success("Photo ajoutee avec succes")
    } catch (error) {
      toast.error("Erreur upload", {
        description: error instanceof Error ? error.message : "Veuillez reessayer plus tard",
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
    toast.info("Photo supprimee")
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) => 
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.brand.trim()) newErrors.brand = "La marque est requise"
      if (!formData.model.trim()) newErrors.model = "Le modele est requis"
      if (!formData.year.trim()) newErrors.year = "L'annee est requise"
      if (!formData.type) newErrors.type = "Le type est requis"
      if (!formData.fuel) newErrors.fuel = "Le carburant est requis"
      if (!formData.transmission) newErrors.transmission = "La transmission est requise"
      if (!formData.seats.trim()) newErrors.seats = "Le nombre de places est requis"
      if (!formData.doors.trim()) newErrors.doors = "Le nombre de portes est requis"
    }

    if (step === 2) {
      if (uploadedImages.length < 1) {
        newErrors.images = "Ajoutez au moins 1 photo"
        toast.error("Veuillez ajouter au moins une photo")
      }
    }

    if (step === 3) {
      if (!formData.city) newErrors.city = "La ville est requise"
      if (!formData.address.trim()) newErrors.address = "L'adresse est requise"
    }

    if (step === 4) {
      if (!formData.pricePerDay.trim()) newErrors.pricePerDay = "Le prix par jour est requis"
      if (!formData.deposit.trim()) newErrors.deposit = "La caution est requise"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleSubmit = async () => {
    // Final validation
    if (!validateStep(4)) {
      toast.error("Veuillez corriger les erreurs avant de continuer")
      return
    }

    setIsSubmitting(true)

    try {
      // Create vehicle data object
      const vehicleData = {
        ...formData,
        features: selectedFeatures,
        images: uploadedImages,
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      // Make API call to create vehicle
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de la creation du vehicule")
      }

      const createdVehicle = (await response.json().catch(() => null)) as any

      // Show success message
      toast.success("Vehicule ajoute avec succes!", {
        description: "Votre annonce sera verifiee par notre equipe avant publication.",
      })

      // Redirect to vehicles list
      router.push("/dashboard/owner/vehicles")
    } catch (error) {
      console.error("[v0] Vehicle creation error:", error)
      toast.error("Erreur lors de la creation", {
        description: error instanceof Error ? error.message : "Veuillez reessayer plus tard",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <Button 
          variant="ghost" 
          className="gap-2 mb-4 bg-transparent" 
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">Ajouter un vehicule</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Remplissez les informations pour mettre votre vehicule en location.
        </p>
      </div>

      {/* Progress steps - Responsive */}
      <div
        className={cn(
          "transition-all duration-500 overflow-x-auto pb-2",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "100ms" }}
      >
        <div className="flex items-center justify-between min-w-[500px] md:min-w-0">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (step.id < currentStep) {
                      setCurrentStep(step.id)
                    }
                  }}
                  disabled={step.id > currentStep}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                    step.id < currentStep && "cursor-pointer hover:opacity-80"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center",
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8 sm:w-12 lg:w-20 mx-1 sm:mx-2 transition-colors duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <Card
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: "200ms" }}
      >
        <CardContent className="p-4 md:p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque *</Label>
                  <Select
                    value={useCustomBrand ? "__custom__" : selectedBrandId}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        setUseCustomBrand(true)
                        setSelectedBrandId("")
                        setUseCustomModel(true)
                        setSelectedModelId("")
                        setFormData((prev) => ({ ...prev, brand: "", model: "" }))
                        return
                      }

                      setUseCustomBrand(false)
                      setSelectedBrandId(value)
                      setUseCustomModel(false)
                      setSelectedModelId("")
                      setFormData((prev) => ({ ...prev, model: "" }))
                    }}
                  >
                    <SelectTrigger className={errors.brand ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(meta?.brands || []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {useCustomBrand && (
                    <Input
                      id="brand"
                      placeholder="ex: Toyota"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className={errors.brand ? "border-destructive" : ""}
                    />
                  )}
                  {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modele *</Label>
                  <Select
                    value={useCustomModel ? "__custom__" : selectedModelId}
                    onValueChange={(value) => {
                      if (value === "__custom__") {
                        setUseCustomModel(true)
                        setSelectedModelId("")
                        setFormData((prev) => ({ ...prev, model: "" }))
                        return
                      }

                      setUseCustomModel(false)
                      setSelectedModelId(value)
                    }}
                    disabled={!useCustomBrand && !selectedBrandId}
                  >
                    <SelectTrigger className={errors.model ? "border-destructive" : ""}>
                      <SelectValue placeholder={useCustomBrand ? "Selectionner" : selectedBrandId ? "Selectionner" : "Choisir une marque"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {useCustomModel && (
                    <Input
                      id="model"
                      placeholder="ex: Corolla"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className={errors.model ? "border-destructive" : ""}
                    />
                  )}
                  {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Annee *</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="ex: 2022"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={errors.year ? "border-destructive" : ""}
                  />
                  {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Type de vehicule *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(meta?.categories || []).map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Carburant *</Label>
                  <Select value={formData.fuel} onValueChange={(value) => setFormData({ ...formData, fuel: value })}>
                    <SelectTrigger className={errors.fuel ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(meta?.fuelTypes || []).map((fuel) => (
                        <SelectItem key={fuel.value} value={fuel.value}>
                          {fuel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuel && <p className="text-xs text-destructive">{errors.fuel}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                  >
                    <SelectTrigger className={errors.transmission ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {(meta?.transmissions || []).map((trans) => (
                        <SelectItem key={trans.value} value={trans.value}>
                          {trans.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.transmission && <p className="text-xs text-destructive">{errors.transmission}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Nombre de places *</Label>
                  <Input
                    id="seats"
                    type="number"
                    placeholder="ex: 5"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className={errors.seats ? "border-destructive" : ""}
                  />
                  {errors.seats && <p className="text-xs text-destructive">{errors.seats}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doors">Nombre de portes *</Label>
                  <Input
                    id="doors"
                    type="number"
                    placeholder="ex: 4"
                    value={formData.doors}
                    onChange={(e) => setFormData({ ...formData, doors: e.target.value })}
                    className={errors.doors ? "border-destructive" : ""}
                  />
                  {errors.doors && <p className="text-xs text-destructive">{errors.doors}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Decrivez votre vehicule, son etat, ses particularites..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Equipements</Label>
                <div className="flex flex-wrap gap-2">
                  {(meta?.features || []).map((feature) => (
                    <Badge
                      key={feature}
                      variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all text-xs",
                        selectedFeatures.includes(feature)
                          ? "bg-primary hover:bg-primary/90"
                          : "hover:border-primary"
                      )}
                      onClick={() => toggleFeature(feature)}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Photos */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="font-semibold mb-2">Photos du vehicule</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez au moins 1 photo de qualite. La premiere sera la photo principale.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />

                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-xl overflow-hidden border border-border group"
                    >
                      <img
                        src={image || "/placeholder.jpg"}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-primary text-xs">
                          Photo principale
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 10 && (
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-medium">Ajouter une photo</span>
                    </button>
                  )}
                </div>

                {errors.images && (
                  <p className="text-sm text-destructive mt-2">{errors.images}</p>
                )}
              </div>

              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Conseils pour de meilleures photos</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>- Prenez les photos en pleine lumiere</li>
                      <li>- Montrez le vehicule sous differents angles</li>
                      <li>- Incluez des photos de l'interieur</li>
                      <li>- Assurez-vous que le vehicule est propre</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ville *</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className={errors.city ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {(meta?.cities || []).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city.charAt(0).toUpperCase() + city.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse / Quartier *</Label>
                  <Input
                    id="address"
                    placeholder="ex: Bastos, pres du marche"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
              </div>

              <div className="aspect-video rounded-xl bg-muted border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Carte interactive</p>
                  <p className="text-sm">Cliquez pour definir l'emplacement exact</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="font-semibold mb-4">Tarifs de location</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerDay">Prix / jour (FCFA) *</Label>
                    <Input
                      id="pricePerDay"
                      type="number"
                      placeholder="ex: 15000"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      className={errors.pricePerDay ? "border-destructive" : ""}
                    />
                    {errors.pricePerDay && <p className="text-xs text-destructive">{errors.pricePerDay}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerWeek">Prix / semaine (FCFA)</Label>
                    <Input
                      id="pricePerWeek"
                      type="number"
                      placeholder="ex: 90000"
                      value={formData.pricePerWeek}
                      onChange={(e) => setFormData({ ...formData, pricePerWeek: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerMonth">Prix / mois (FCFA)</Label>
                    <Input
                      id="pricePerMonth"
                      type="number"
                      placeholder="ex: 300000"
                      value={formData.pricePerMonth}
                      onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Conditions de location</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="kmPerDay">Km inclus / jour</Label>
                    <Input
                      id="kmPerDay"
                      type="number"
                      placeholder="ex: 200"
                      value={formData.kmPerDay}
                      onChange={(e) => setFormData({ ...formData, kmPerDay: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extraKmPrice">Prix km supplementaire (FCFA)</Label>
                    <Input
                      id="extraKmPrice"
                      type="number"
                      placeholder="ex: 100"
                      value={formData.extraKmPrice}
                      onChange={(e) => setFormData({ ...formData, extraKmPrice: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Caution (FCFA) *</Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="ex: 50000"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      className={errors.deposit ? "border-destructive" : ""}
                    />
                    {errors.deposit && <p className="text-xs text-destructive">{errors.deposit}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-sm">Reservation instantanee</p>
                    <p className="text-xs text-muted-foreground">
                      Les locataires peuvent reserver sans votre approbation
                    </p>
                  </div>
                  <Switch
                    checked={formData.instantBooking}
                    onCheckedChange={(checked) => setFormData({ ...formData, instantBooking: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-sm">Chauffeur disponible</p>
                    <p className="text-xs text-muted-foreground">Proposez un service de chauffeur en option</p>
                  </div>
                  <Switch
                    checked={formData.driverAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, driverAvailable: checked })}
                  />
                </div>

                {formData.driverAvailable && (
                  <div className="space-y-2 pl-4">
                    <Label htmlFor="driverPrice">Prix chauffeur / jour (FCFA)</Label>
                    <Input
                      id="driverPrice"
                      type="number"
                      placeholder="ex: 10000"
                      value={formData.driverPrice}
                      onChange={(e) => setFormData({ ...formData, driverPrice: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center py-6">
                <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Recapitulatif</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Verifiez les informations avant de publier votre annonce
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Vehicule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {formData.brand} {formData.model} {formData.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formData.seats} places - {meta?.transmissions?.find((t) => t.value === formData.transmission)?.label || formData.transmission}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Localisation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold capitalize">{formData.city || "Non defini"}</p>
                    <p className="text-sm text-muted-foreground">{formData.address || "Adresse non definie"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tarif</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-primary">{formData.pricePerDay || "0"} FCFA / jour</p>
                    <p className="text-sm text-muted-foreground">Caution: {formData.deposit || "0"} FCFA</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{uploadedImages.length} photo{uploadedImages.length > 1 ? "s" : ""}</p>
                    <p className="text-sm text-muted-foreground">{selectedFeatures.length} equipement{selectedFeatures.length > 1 ? "s" : ""}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Votre annonce sera verifiee</p>
                    <p className="text-muted-foreground mt-1">
                      Notre equipe verifiera votre annonce avant publication. Vous recevrez une notification une fois approuvee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border gap-3">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1} 
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedent</span>
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <span className="hidden sm:inline">Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Publication...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Publier l'annonce</span>
                    <span className="sm:hidden">Publier</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
