"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Users, Car, Calendar, Download, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type ReportsResponse = {
  stats: {
    totalRevenue: number
    totalBookings: number
    totalNewUsers: number
    occupancyRate: number
  }
  monthlyData: { month: string; revenue: number; bookings: number; users: number }[]
  topVehicles: { name: string; bookings: number; revenue: number }[]
  topCities: { name: string; bookings: number; revenue: number; growth: number }[]
}

export default function AdminReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [period, setPeriod] = useState("month")
  const [data, setData] = useState<ReportsResponse | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/reports?period=${encodeURIComponent(period)}`)
        if (!res.ok) return
        const json = (await res.json()) as ReportsResponse
        if (cancelled) return
        setData(json)
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
      value: data?.stats?.totalRevenue ? (data.stats.totalRevenue / 1000000000).toFixed(1) : "0.0",
      unit: "FCFA",
      change: "+14.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Reservations",
      value: (data?.stats?.totalBookings ?? 0).toLocaleString(),
      change: "+18.5%",
      trend: "up",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Nouveaux utilisateurs",
      value: (data?.stats?.totalNewUsers ?? 0).toLocaleString(),
      change: "+22.3%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Taux d'occupation",
      value: `${(data?.stats?.occupancyRate ?? 0).toFixed(1)}%`,
      change: "+3.2%",
      trend: "up",
      icon: Car,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  const monthlyData = data?.monthlyData || []
  const topVehicles = data?.topVehicles || []
  const topCities = data?.topCities || []
  const maxRevenue = monthlyData.length ? Math.max(...monthlyData.map((d) => d.revenue)) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Rapports et analyses</h1>
          <p className="text-muted-foreground mt-1 text-sm">Vue detaillee des performances de la plateforme</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette annee</SelectItem>
              <SelectItem value="all">Toute periode</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exporter PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtres avances</span>
            <span className="sm:hidden">Filtres</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 grid-cols-2 lg:grid-cols-4 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("rounded-xl p-2", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
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
                <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                <p className="text-lg md:text-xl font-bold mt-1">
                  {stat.value}
                  {stat.unit && <span className="text-xs font-normal text-muted-foreground ml-1">{stat.unit}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Evolution des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((item) => (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium w-10">{item.month}</span>
                    <span className="text-muted-foreground flex-1 mx-2 sm:mx-4 hidden sm:inline">
                      {item.bookings.toLocaleString()} reservations
                    </span>
                    <span className="font-semibold text-primary">{(item.revenue / 1000000).toFixed(0)}M FCFA</span>
                  </div>
                  <Progress value={(item.revenue / maxRevenue) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vehicles */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Vehicules les plus demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVehicles.map((vehicle, index) => (
                <div key={vehicle.name} className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.bookings} reservations</p>
                  </div>
                  <p className="font-semibold text-green-600 text-xs flex-shrink-0">{(vehicle.revenue / 1000000).toFixed(1)}M</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "400ms" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Villes les plus actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCities.map((city, index) => (
                <div key={city.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-500/10 text-blue-500 font-bold text-xs flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{city.name}</p>
                      <p className="text-xs text-muted-foreground">{city.bookings} res.</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-xs">{(city.revenue / 1000000).toFixed(0)}M</p>
                    <p className={cn("text-xs font-medium", city.growth >= 0 ? "text-green-600" : "text-red-600")}>
                      {city.growth >= 0 ? "+" : ""}
                      {city.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
