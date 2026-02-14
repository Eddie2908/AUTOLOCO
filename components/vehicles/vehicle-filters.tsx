"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { vehicleTypes, cities, fuelTypes, transmissions } from "@/hooks/use-vehicles"

export interface Filters {
  type: string
  city: string
  fuel: string
  transmission: string
  priceRange: [number, number]
  seats: number[]
  features: string[]
  instantBooking: boolean
  verified: boolean
}

interface VehicleFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  activeFiltersCount: number
}

const allFeatures = [
  "Climatisation",
  "GPS",
  "Bluetooth",
  "USB",
  "Caméra de recul",
  "Sièges cuir",
  "Toit ouvrant",
  "4x4",
  "Apple CarPlay",
  "Android Auto",
]

const seatOptions = [2, 4, 5, 7, 9, 15]

export function VehicleFilters({ filters, onFiltersChange, activeFiltersCount }: VehicleFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      type: "all",
      city: "all",
      fuel: "all",
      transmission: "all",
      priceRange: [0, 100000],
      seats: [],
      features: [],
      instantBooking: false,
      verified: false,
    })
  }

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature]
    updateFilter("features", newFeatures)
  }

  const toggleSeats = (seats: number) => {
    const newSeats = filters.seats.includes(seats)
      ? filters.seats.filter((s) => s !== seats)
      : [...filters.seats, seats]
    updateFilter("seats", newSeats)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Type de véhicule */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Type de véhicule</Label>
        <div className="flex flex-wrap gap-2">
          {vehicleTypes.map((type) => (
            <Button
              key={type.value}
              variant={filters.type === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("type", type.value)}
              className={cn("transition-all duration-200", filters.type !== type.value && "bg-transparent")}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Ville */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ville</Label>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Button
              key={city.value}
              variant={filters.city === city.value ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter("city", city.value)}
              className={cn("transition-all duration-200", filters.city !== city.value && "bg-transparent")}
            >
              {city.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Prix par jour</Label>
          <span className="text-sm text-muted-foreground">
            {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
          </span>
        </div>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
          min={0}
          max={100000}
          step={5000}
          className="py-4"
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Min</Label>
            <Input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilter("priceRange", [Number(e.target.value), filters.priceRange[1]])}
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Max</Label>
            <Input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter("priceRange", [filters.priceRange[0], Number(e.target.value)])}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Carburant & Transmission */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Carburant</Label>
          <div className="space-y-2">
            {fuelTypes.map((fuel) => (
              <Button
                key={fuel.value}
                variant={filters.fuel === fuel.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("fuel", fuel.value)}
                className={cn("w-full justify-start", filters.fuel !== fuel.value && "bg-transparent")}
              >
                {fuel.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">Transmission</Label>
          <div className="space-y-2">
            {transmissions.map((trans) => (
              <Button
                key={trans.value}
                variant={filters.transmission === trans.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter("transmission", trans.value)}
                className={cn("w-full justify-start", filters.transmission !== trans.value && "bg-transparent")}
              >
                {trans.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Nombre de places */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Nombre de places</Label>
        <div className="flex flex-wrap gap-2">
          {seatOptions.map((seats) => (
            <Button
              key={seats}
              variant={filters.seats.includes(seats) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSeats(seats)}
              className={cn("transition-all duration-200", !filters.seats.includes(seats) && "bg-transparent")}
            >
              {seats}+
            </Button>
          ))}
        </div>
      </div>

      {/* Équipements */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Équipements</Label>
        <div className="grid grid-cols-2 gap-2">
          {allFeatures.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={filters.features.includes(feature)}
                onCheckedChange={() => toggleFeature(feature)}
              />
              <label htmlFor={feature} className="text-sm cursor-pointer">
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Options</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="instant" className="text-sm cursor-pointer">
              Réservation instantanée
            </label>
            <Checkbox
              id="instant"
              checked={filters.instantBooking}
              onCheckedChange={(checked) => updateFilter("instantBooking", !!checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="verified" className="text-sm cursor-pointer">
              Propriétaires vérifiés uniquement
            </label>
            <Checkbox
              id="verified"
              checked={filters.verified}
              onCheckedChange={(checked) => updateFilter("verified", !!checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="sticky top-24 bg-card rounded-2xl border border-border/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Filtres</h2>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground">
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
          <Accordion type="multiple" defaultValue={["type", "city", "price"]} className="space-y-2">
            <AccordionItem value="type" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">Type de véhicule</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {vehicleTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={filters.type === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("type", type.value)}
                      className={cn("transition-all duration-200", filters.type !== type.value && "bg-transparent")}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="city" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">Ville</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2 pt-2">
                  {cities.map((city) => (
                    <Button
                      key={city.value}
                      variant={filters.city === city.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter("city", city.value)}
                      className={cn("transition-all duration-200", filters.city !== city.value && "bg-transparent")}
                    >
                      {city.label}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">Prix</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="text-sm text-muted-foreground text-center">
                    {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
                  </div>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter("priceRange", value as [number, number])}
                    min={0}
                    max={100000}
                    step={5000}
                    className="py-2"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specs" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">Spécifications</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Carburant</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {fuelTypes.map((fuel) => (
                        <Button
                          key={fuel.value}
                          variant={filters.fuel === fuel.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter("fuel", fuel.value)}
                          className={cn("text-xs", filters.fuel !== fuel.value && "bg-transparent")}
                        >
                          {fuel.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Transmission</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {transmissions.map((trans) => (
                        <Button
                          key={trans.value}
                          variant={filters.transmission === trans.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilter("transmission", trans.value)}
                          className={cn("text-xs", filters.transmission !== trans.value && "bg-transparent")}
                        >
                          {trans.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="options" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">Options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instant-desktop"
                      checked={filters.instantBooking}
                      onCheckedChange={(checked) => updateFilter("instantBooking", !!checked)}
                    />
                    <label htmlFor="instant-desktop" className="text-sm cursor-pointer">
                      Réservation instantanée
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="verified-desktop"
                      checked={filters.verified}
                      onCheckedChange={(checked) => updateFilter("verified", !!checked)}
                    />
                    <label htmlFor="verified-desktop" className="text-sm cursor-pointer">
                      Propriétaires vérifiés
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle>Filtres</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100%-8rem)] py-6">
              <FilterContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
              <Button className="w-full h-12" onClick={() => setIsOpen(false)}>
                Voir les résultats
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
