"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Download,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  CreditCard,
  Filter,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { paymentStatusLabels, paymentStatusColors } from "@/lib/constants/owner-payments"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

type RevenueChartPoint = {
  month: string
  revenue: number
  bookings?: number
}

type NextPayout = {
  amount: number
  date: string
  method: string
  accountNumber: string
}

export default function OwnerPaymentsPage() {
  const [mounted, setMounted] = useState(false)
  const [periodFilter, setPeriodFilter] = useState("30")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState<any[]>([])
  const [revenueChartData, setRevenueChartData] = useState<RevenueChartPoint[]>([])
  const [nextPayout, setNextPayout] = useState<NextPayout | null>(null)
  const [statsData, setStatsData] = useState<
    { totalRevenue: number; monthRevenue: number; pendingPayout: number; completedPayout: number } | null
  >(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/payments?scope=owner")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setPayments(Array.isArray(data?.payments) ? data.payments : [])
        setStatsData(data?.stats || null)
        setRevenueChartData(Array.isArray(data?.revenueChartData) ? data.revenueChartData : [])
        setNextPayout(data?.nextPayout || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter === "all") return true
    return payment.status === statusFilter
  })

  const stats = [
    {
      title: "Revenus totaux",
      value: statsData?.totalRevenue || 0,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      change: "+18.2%",
    },
    {
      title: "Ce mois",
      value: statsData?.monthRevenue || 0,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12.5%",
    },
    {
      title: "En attente",
      value: statsData?.pendingPayout || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      change: null,
    },
    {
      title: "Deja verse",
      value: statsData?.completedPayout || 0,
      icon: CheckCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      change: null,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mes revenus</h1>
          <p className="text-muted-foreground mt-1 text-sm">Suivez vos gains et versements</p>
        </div>
        <Button variant="outline" className="bg-transparent w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
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
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2", stat.bgColor)}>
                  <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                <p className="text-lg md:text-xl font-bold">
                  {stat.value.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted-foreground">FCFA</span>
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
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <CardTitle className="text-base font-semibold">Evolution des revenus</CardTitle>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">3 derniers mois</SelectItem>
                <SelectItem value="365">Cette annee</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, "Revenus"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Next Payout */}
        <Card
          className={cn(
            "transition-all duration-500 h-fit",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Prochain versement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Wallet className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-xl md:text-2xl font-bold text-primary">{(nextPayout?.amount || 0).toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground mt-1">Montant estime</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
                <span className="font-medium text-xs">
                  {new Date(nextPayout?.date || new Date()).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Methode</span>
                </div>
                <span className="font-medium text-xs">{nextPayout?.method || ""}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Compte</span>
                </div>
                <span className="font-medium text-xs">{nextPayout?.accountNumber || ""}</span>
              </div>
            </div>

            <Button className="w-full bg-transparent text-sm" variant="outline" asChild>
              <Link href="/dashboard/owner/profile">Modifier mes infos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card
        className={cn(
          "transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "400ms" }}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="text-base font-semibold">Historique des paiements</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="processing">En cours</SelectItem>
              <SelectItem value="completed">Verse</SelectItem>
              <SelectItem value="failed">Echoue</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Client</TableHead>
                  <TableHead className="hidden lg:table-cell">Vehicule</TableHead>
                  <TableHead className="hidden xl:table-cell">Periode</TableHead>
                  <TableHead className="hidden md:table-cell">Brut</TableHead>
                  <TableHead className="hidden xl:table-cell">Commission</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={payment.renterAvatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-xs">{payment.renterName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs truncate max-w-[80px] sm:max-w-[120px]">{payment.renterName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <img
                          src={payment.vehicleImage || "/placeholder.jpg"}
                          alt={payment.vehicleName}
                          className="h-8 w-12 rounded object-cover"
                        />
                        <span className="text-xs truncate max-w-[100px]">{payment.vehicleName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-xs">{payment.dates}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{payment.grossAmount.toLocaleString()} FCFA</TableCell>
                    <TableCell className="hidden xl:table-cell text-red-500 text-xs">-{payment.platformFee.toLocaleString()} FCFA</TableCell>
                    <TableCell className="font-semibold text-green-600 text-xs whitespace-nowrap">
                      {payment.netAmount.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px]", paymentStatusColors[payment.status])}>
                        {paymentStatusLabels[payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link href={`/dashboard/bookings/${payment.bookingId}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12 px-4">
              <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-base font-semibold mb-2">Aucun paiement trouve</h3>
              <p className="text-muted-foreground text-sm">Aucun paiement ne correspond a vos criteres.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
