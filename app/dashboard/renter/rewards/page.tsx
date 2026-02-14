"use client"

import { useState, useEffect } from "react"
import { Gift, Star, Trophy, Zap, Crown, TrendingUp, Calendar, Award, Check, Lock, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const rewards = [
  {
    id: 1,
    name: "Réduction 10% sur votre prochaine location",
    points: 500,
    icon: Gift,
    color: "text-primary",
    bgColor: "bg-primary/10",
    claimed: false,
  },
  {
    id: 2,
    name: "Surclassement gratuit",
    points: 1000,
    icon: TrendingUp,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    claimed: false,
  },
  {
    id: 3,
    name: "Réduction 20% - Location week-end",
    points: 750,
    icon: Calendar,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    claimed: true,
  },
  {
    id: 4,
    name: "Assurance Premium offerte",
    points: 1500,
    icon: Award,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    claimed: false,
  },
  {
    id: 5,
    name: "Location gratuite - 1 jour",
    points: 2500,
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    claimed: false,
  },
  {
    id: 6,
    name: "Accès anticipé aux nouveaux véhicules",
    points: 2000,
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    claimed: false,
  },
]

const tierLevels = [
  { name: "Bronze", minPoints: 0, color: "text-amber-700", benefits: ["Points de base", "Support standard"] },
  {
    name: "Silver",
    minPoints: 1000,
    color: "text-gray-400",
    benefits: ["2x points", "Support prioritaire", "Réductions exclusives"],
  },
  {
    name: "Gold",
    minPoints: 2500,
    color: "text-amber-500",
    benefits: ["3x points", "Surclassement gratuit", "Support VIP"],
  },
  {
    name: "Platinum",
    minPoints: 5000,
    color: "text-blue-400",
    benefits: ["5x points", "Accès anticipé", "Concierge dédié"],
  },
]

const recentActivity = [
  { action: "Location Toyota Corolla", points: 350, date: "2024-12-15" },
  { action: "Avis 5 étoiles", points: 50, date: "2024-12-18" },
  { action: "Parrainage réussi", points: 200, date: "2024-12-10" },
  { action: "Location BMW X5", points: 850, date: "2024-11-28" },
]

export default function RenterRewardsPage() {
  const [mounted, setMounted] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [pointsThisMonth, setPointsThisMonth] = useState(0)
  const [recentActivityData, setRecentActivityData] = useState<{ action: string; points: number; date: string }[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/renter/rewards")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setUserPoints(typeof data?.userPoints === "number" ? data.userPoints : 0)
        setPointsThisMonth(typeof data?.pointsThisMonth === "number" ? data.pointsThisMonth : 0)
        setRecentActivityData(Array.isArray(data?.recentActivity) ? data.recentActivity : [])
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const currentTier = tierLevels.reduce((prev, curr) => (userPoints >= curr.minPoints ? curr : prev))
  const nextTier = tierLevels.find((tier) => tier.minPoints > userPoints)
  const progressToNextTier = nextTier
    ? ((userPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  const stats = [
    {
      title: "Points totaux",
      value: userPoints.toLocaleString(),
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Niveau actuel",
      value: currentTier.name,
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Récompenses réclamées",
      value: rewards.filter((r) => r.claimed).length.toString(),
      icon: Gift,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Points ce mois",
      value: pointsThisMonth.toLocaleString(),
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

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
          <h1 className="text-3xl font-bold tracking-tight">Programme de fidélité</h1>
          <p className="text-muted-foreground mt-1">Gagnez des points et débloquez des récompenses exclusives</p>
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
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("rounded-xl p-3", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tier Progress */}
        <Card
          className={cn(
            "lg:col-span-2 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <CardHeader>
            <CardTitle>Progression du niveau</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className={cn("h-5 w-5", currentTier.color)} />
                  <span className="font-semibold">{currentTier.name}</span>
                </div>
                {nextTier && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Prochain niveau:</p>
                    <p className="font-medium">{nextTier.name}</p>
                  </div>
                )}
              </div>
              <Progress value={progressToNextTier} className="h-3" />
              {nextTier && (
                <p className="text-sm text-muted-foreground">
                  {nextTier.minPoints - userPoints} points jusqu'au niveau {nextTier.name}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {tierLevels.map((tier) => {
                const isUnlocked = userPoints >= tier.minPoints
                return (
                  <Card key={tier.name} className={cn("border-2", isUnlocked ? "border-primary" : "border-border")}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {isUnlocked ? (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className={cn("font-semibold", tier.color)}>{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.minPoints} points</p>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit) => (
                          <li key={benefit} className="text-xs text-muted-foreground flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card
          className={cn(
            "transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: "300ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentActivityData.length ? recentActivityData : recentActivity).map((activity, index) => (
                <div key={index} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    +{activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Catalog */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "400ms" }}
      >
        <CardHeader>
          <CardTitle>Catalogue de récompenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const canClaim = userPoints >= reward.points && !reward.claimed
              return (
                <Card
                  key={reward.id}
                  className={cn(
                    "transition-all duration-300 hover:shadow-lg",
                    reward.claimed && "opacity-60",
                    canClaim && "border-primary",
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("rounded-xl p-3", reward.bgColor)}>
                        <reward.icon className={cn("h-6 w-6", reward.color)} />
                      </div>
                      {reward.claimed && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          Réclamé
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{reward.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold">{reward.points}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!canClaim || reward.claimed}
                        className={cn(canClaim && "bg-primary hover:bg-primary/90")}
                      >
                        {reward.claimed ? "Réclamé" : canClaim ? "Réclamer" : "Verrouillé"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* How to earn points */}
      <Card
        className={cn("transition-all duration-500", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "500ms" }}
      >
        <CardHeader>
          <CardTitle>Comment gagner des points ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { action: "Louer un véhicule", points: "10 points / 1000 FCFA", icon: Calendar },
              { action: "Laisser un avis", points: "50 points", icon: Star },
              { action: "Parrainer un ami", points: "200 points", icon: Gift },
              { action: "Compléter votre profil", points: "100 points", icon: Award },
            ].map((item) => (
              <div key={item.action} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="rounded-lg p-2 bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.points}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
