"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  CreditCard,
  Download,
  Star,
  Filter,
  FileText,
  ChevronRight,
  Plus,
  Trash2,
  MoreVertical,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const paymentMethodLabels: Record<string, string> = {
  mobile_money_mtn: "MTN MoMo",
  mobile_money_orange: "Orange Money",
  carte_bancaire: "Carte bancaire",
}

const renterPaymentStatusLabels: Record<string, string> = {
  completed: "Payé",
  pending: "En attente",
  failed: "Échoué",
  refunded: "Remboursé",
}

const renterPaymentStatusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-600",
  pending: "bg-amber-500/10 text-amber-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-blue-500/10 text-blue-600",
}

export default function RenterPaymentsPage() {
  const [mounted, setMounted] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [payments, setPayments] = useState<any[]>([])
  const [statsData, setStatsData] = useState<{ totalSpent: number; thisMonth: number } | null>(null)
  const savedPaymentMethods: any[] = []

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/payments?scope=renter")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setPayments(Array.isArray(data?.payments) ? data.payments : [])
        setStatsData(data?.stats || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter
    return matchesStatus && matchesMethod
  })

  const stats = [
    {
      title: "Total depense",
      value: statsData?.totalSpent || 0,
      suffix: "FCFA",
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Ce mois",
      value: statsData?.thisMonth || 0,
      suffix: "FCFA",
      icon: CreditCard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Points fidelite",
      value: 0,
      suffix: "pts",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
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
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mes paiements</h1>
          <p className="text-muted-foreground mt-1 text-sm">Historique de vos paiements et methodes enregistrees</p>
        </div>
        <Button variant="outline" className="bg-transparent w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Stats */}
      <div
        className={cn(
          "grid gap-4 grid-cols-1 sm:grid-cols-3 transition-all duration-500",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{ transitionDelay: "100ms" }}
      >
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("rounded-xl p-2.5", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className="text-lg md:text-xl font-bold">
                  {stat.value.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{stat.suffix}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payments Table */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <CardTitle className="text-base font-semibold">Historique des paiements</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="completed">Paye</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="refunded">Rembourse</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Methode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="mobile_money_mtn">MTN MoMo</SelectItem>
                  <SelectItem value="mobile_money_orange">Orange Money</SelectItem>
                  <SelectItem value="carte_bancaire">Carte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Reservation</TableHead>
                    <TableHead className="hidden lg:table-cell">Proprietaire</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="hidden sm:table-cell">Methode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={payment.vehicleImage || "/placeholder.svg"}
                            alt={payment.vehicleName}
                            className="h-10 w-14 rounded-lg object-cover hidden sm:block"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-xs truncate max-w-[120px] sm:max-w-none">{payment.vehicleName}</p>
                            <p className="text-xs text-muted-foreground">{payment.dates}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={payment.ownerAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{payment.ownerName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-[100px]">{payment.ownerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs whitespace-nowrap">{payment.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs">{paymentMethodLabels[payment.paymentMethod]}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-[10px]", renterPaymentStatusColors[payment.status])}>
                          {renterPaymentStatusLabels[payment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {payment.invoiceUrl && (
                            <Button variant="ghost" size="sm" className="hidden md:inline-flex h-8 w-8 p-0">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link href={`/dashboard/renter/bookings`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12 px-4">
                <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base font-semibold mb-2">Aucun paiement trouve</h3>
                <p className="text-muted-foreground text-sm">Aucun paiement ne correspond a vos criteres.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Payment Methods */}
        <Card
          className={cn(
            "transition-all duration-500 h-fit",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Methodes de paiement</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedPaymentMethods.map((method: any) => (
              <div
                key={method.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                  method.isDefault ? "border-primary bg-primary/5" : "border-border",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {method.type === "mobile_money_mtn" && (
                    <div className="h-9 w-9 rounded-lg bg-yellow-400 flex items-center justify-center font-bold text-black text-xs flex-shrink-0">
                      MTN
                    </div>
                  )}
                  {method.type === "mobile_money_orange" && (
                    <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                      OM
                    </div>
                  )}
                  {method.type === "carte_bancaire" && (
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary hidden sm:inline-flex">
                      Defaut
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!method.isDefault && <DropdownMenuItem>Definir par defaut</DropdownMenuItem>}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full justify-start bg-transparent text-sm">
              <Smartphone className="h-4 w-4 mr-2" />
              Ajouter une methode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
