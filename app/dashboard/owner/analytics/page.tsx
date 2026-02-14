"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Star, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type RevenuePoint = { label: string; revenue: number; bookings: number }
type VehiclePerf = { name: string; bookings: number; revenue: number; occupancy: number }
type AnalyticsStats = { totalRevenue: number; bookings: number; averageRating: number; occupancyRate: number }
type AnalyticsAdditional = {
  conversionRate: number
  totalViews: number
  requests: number
  confirmed: number
  averageDurationDays: number
  durationDistribution: { "1_3": number; "4_7": number; "7_plus": number }
  reviewsCount: number
  ratingsDistribution: { rating: number; count: number }[]
}

export default function OwnerAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState("year")
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(null)
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>([])
  const [vehiclePerformance, setVehiclePerformance] = useState<VehiclePerf[]>([])
  const [additional, setAdditional] = useState<AnalyticsAdditional | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/dashboard/owner/analytics?period=${period}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setStatsData(data?.stats || null)
        setRevenueSeries(Array.isArray(data?.revenueSeries) ? data.revenueSeries : [])
        setVehiclePerformance(Array.isArray(data?.vehiclePerformance) ? data.vehiclePerformance : [])
        setAdditional(data?.additional || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [period])

  const stats = [
    {
      title: "Revenus totaux",
      value: `${((statsData?.totalRevenue || 0) / 1000000).toFixed(2)}M`,
      unit: "FCFA",
      change: "+24.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Réservations",
      value: (statsData?.bookings || 0).toString(),
      change: "+18.2%",
      trend: "up",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Note moyenne",
      value: (statsData?.averageRating || 0).toFixed(2),
      change: "+0.15",
      trend: "up",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Taux d'occupation",
      value: `${statsData?.occupancyRate || 0}%`,
      change: "+5.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  const maxRevenue = Math.max(1, ...revenueSeries.map((d) => d.revenue))

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
          <h1 className="text-3xl font-bold tracking-tight">Analyses et statistiques</h1>
          <p className="text-muted-foreground mt-1">Suivez les performances de votre activité</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("rounded-xl p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === "up" ? "text-green-500" : "text-red-500",
                  )}
                >
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">
                  {stat.value}
                  {stat.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueSeries.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-12">{item.label}</span>
                    <span className="text-muted-foreground flex-1 mx-4">{item.bookings} réservations</span>
                    <span className="font-semibold text-primary">{(item.revenue / 1000).toFixed(0)}K FCFA</span>
                  </div>
                  <Progress value={(item.revenue / maxRevenue) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Vehicles */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader>
            <CardTitle>Performance des véhicules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {vehiclePerformance.map((vehicle, index) => (
                <div key={vehicle.name} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{vehicle.name}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.bookings} réservations</p>
                    </div>
                  </div>
                  <div className="space-y-1 pl-11">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Revenus</span>
                      <span className="font-semibold text-green-600">
                        {(vehicle.revenue / 1000000).toFixed(2)}M FCFA
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Occupation</span>
                      <span className="font-semibold">{vehicle.occupancy}%</span>
                    </div>
                    <Progress value={vehicle.occupancy} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div
        className={cn(
          "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "400ms" }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taux de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{(additional?.conversionRate ?? 0).toString()}%</p>
                <p className="text-sm text-muted-foreground mt-1">Vues → Réservations</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vues totales</span>
                  <span className="font-medium">{(additional?.totalViews ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Demandes</span>
                  <span className="font-medium">{(additional?.requests ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confirmées</span>
                  <span className="font-medium text-green-600">{(additional?.confirmed ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Durée moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div>
                <p className="text-4xl font-bold text-primary">{(additional?.averageDurationDays ?? 0).toString()}</p>
                <p className="text-sm text-muted-foreground">jours par location</p>
              </div>
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">1-3 jours</span>
                  <span className="font-medium">{(additional?.durationDistribution?.["1_3"] ?? 0).toString()}%</span>
                </div>
                <Progress value={additional?.durationDistribution?.["1_3"] ?? 0} className="h-1.5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">4-7 jours</span>
                  <span className="font-medium">{(additional?.durationDistribution?.["4_7"] ?? 0).toString()}%</span>
                </div>
                <Progress value={additional?.durationDistribution?.["4_7"] ?? 0} className="h-1.5" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">7+ jours</span>
                  <span className="font-medium">{(additional?.durationDistribution?.["7_plus"] ?? 0).toString()}%</span>
                </div>
                <Progress value={additional?.durationDistribution?.["7_plus"] ?? 0} className="h-1.5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Satisfaction client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                  <p className="text-4xl font-bold">{(statsData?.averageRating || 0).toFixed(2)}</p>
                </div>
                <p className="text-sm text-muted-foreground">Note moyenne ({(additional?.reviewsCount ?? 0).toLocaleString()} avis)</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const dist = additional?.ratingsDistribution?.find((d) => d.rating === rating)
                  const total = additional?.reviewsCount || 0
                  const percent = total > 0 && dist ? Math.round((dist.count / total) * 100) : 0
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs w-8">{rating} ★</span>
                      <Progress value={percent} className="h-1.5" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{percent}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
