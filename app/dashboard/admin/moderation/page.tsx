"use client"

import { useState, useEffect } from "react"
import { Car, Users, Flag, CheckCircle, XCircle, Clock, AlertTriangle, Shield, Eye, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type ModerationQueueItem = {
  id: string
  type: "vehicle" | "user" | "report"
  title: string
  description: string
  owner: string
  ownerAvatar: string
  date: string
  priority: "low" | "medium" | "high" | "urgent"
  reason: string
  status: "pending"
}

type RecentDecisionItem = {
  id: string
  title: string
  decision: "approved" | "rejected"
  moderator: string
  date: string
  reason: string
}

type ModerationStats = {
  pending: number
  approvedToday: number
  rejectedToday: number
  urgent: number
}

export default function AdminModerationPage() {
  const [mounted, setMounted] = useState(false)
  const [queue, setQueue] = useState<ModerationQueueItem[]>([])
  const [recentDecisions, setRecentDecisions] = useState<RecentDecisionItem[]>([])
  const [statsData, setStatsData] = useState<ModerationStats | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/admin/moderation")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setQueue(Array.isArray(data?.moderationQueue) ? (data.moderationQueue as ModerationQueueItem[]) : [])
        setRecentDecisions(Array.isArray(data?.recentDecisions) ? (data.recentDecisions as RecentDecisionItem[]) : [])
        setStatsData(data?.stats || null)
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      title: "En attente",
      value: (statsData?.pending ?? 0).toString(),
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Approuvés aujourd'hui",
      value: (statsData?.approvedToday ?? 0).toString(),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Rejetés aujourd'hui",
      value: (statsData?.rejectedToday ?? 0).toString(),
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Urgents",
      value: (statsData?.urgent ?? 0).toString(),
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "high":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "medium":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vehicle":
        return Car
      case "user":
        return Users
      case "report":
        return Flag
      default:
        return Shield
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Centre de modération</h1>
          <p className="text-muted-foreground mt-1">Gérez les demandes de validation et les signalements</p>
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
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Moderation Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">En attente ({queue.length})</TabsTrigger>
          <TabsTrigger value="recent">Décisions récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {queue.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type)
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all duration-500 hover:shadow-lg",
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                )}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          item.priority === "urgent" && "bg-red-500/10",
                          item.priority === "high" && "bg-amber-500/10",
                          item.priority === "medium" && "bg-blue-500/10",
                          item.priority === "low" && "bg-gray-500/10",
                        )}
                      >
                        <TypeIcon
                          className={cn(
                            "h-6 w-6",
                            item.priority === "urgent" && "text-red-500",
                            item.priority === "high" && "text-amber-500",
                            item.priority === "medium" && "text-blue-500",
                            item.priority === "low" && "text-gray-500",
                          )}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <Badge
                                variant="secondary"
                                className={cn("text-xs border", getPriorityColor(item.priority))}
                              >
                                {item.priority === "urgent" && "Urgent"}
                                {item.priority === "high" && "Priorité haute"}
                                {item.priority === "medium" && "Priorité moyenne"}
                                {item.priority === "low" && "Priorité basse"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{item.id}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={item.ownerAvatar || "/placeholder-user.jpg"} />
                              <AvatarFallback>{item.owner[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{item.owner}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.reason}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2 lg:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        Examiner
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter
                      </Button>
                      <Button size="sm" className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                      <Button variant="destructive" size="sm" className="flex-1 lg:flex-none">
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentDecisions.map((item, index) => (
            <Card
              key={item.id}
              className={cn(
                "transition-all duration-500",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        item.decision === "approved" && "bg-green-500/10",
                        item.decision === "rejected" && "bg-red-500/10",
                      )}
                    >
                      {item.decision === "approved" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.title}</p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            item.decision === "approved" && "bg-green-500/10 text-green-600",
                            item.decision === "rejected" && "bg-red-500/10 text-red-600",
                          )}
                        >
                          {item.decision === "approved" ? "Approuvé" : "Rejeté"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Par {item.moderator} • {item.date}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
