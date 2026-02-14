"use client"

import * as React from "react"
import { Shield, CreditCard, MapPin, MessageSquare, Star, Calendar, Smartphone, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Vérification des identités, contrats numériques et assurance incluse pour chaque location.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: CreditCard,
    title: "Paiement Flexible",
    description: "MTN Mobile Money, Orange Money, cartes bancaires. Choisissez votre moyen de paiement préféré.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: MapPin,
    title: "GPS Intégré",
    description: "Suivez votre véhicule en temps réel et définissez des zones géographiques autorisées.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: MessageSquare,
    title: "Messagerie Instantanée",
    description: "Communiquez directement avec les propriétaires ou locataires via notre chat sécurisé.",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Star,
    title: "Système d'Avis",
    description: "Consultez les évaluations vérifiées et gagnez des badges de confiance.",
    color: "from-yellow-500 to-amber-600",
  },
  {
    icon: Calendar,
    title: "Réservation Simple",
    description: "Calendrier interactif, réservation instantanée et options d'annulation flexibles.",
    color: "from-teal-500 to-green-600",
  },
  {
    icon: Smartphone,
    title: "Mode Hors-ligne",
    description: "Accédez à vos réservations même sans connexion internet. Synchronisation automatique.",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: FileCheck,
    title: "Documents Numériques",
    description: "Stockez et partagez vos documents en toute sécurité. Vérification automatique.",
    color: "from-indigo-500 to-blue-600",
  },
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = React.useState(false)
  const sectionRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="features" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn("text-center max-w-3xl mx-auto mb-16 opacity-0", isVisible && "animate-slide-up opacity-100")}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Tout ce dont vous avez besoin pour <span className="text-primary">louer en confiance</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Une plateforme complète conçue pour le marché camerounais, avec des fonctionnalités adaptées à vos besoins
            locaux.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={cn(
                "group relative bg-card rounded-2xl p-6 border border-border/50",
                "transition-all duration-500 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1",
                "opacity-0",
                isVisible && "animate-scale-in opacity-100",
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4",
                  "bg-gradient-to-br text-white shadow-lg",
                  "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                  feature.color,
                )}
              >
                <feature.icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
