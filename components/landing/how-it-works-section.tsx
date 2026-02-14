"use client"

import * as React from "react"
import { Search, CalendarCheck, Key, ThumbsUp, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Recherchez",
    description: "Trouvez le véhicule parfait parmi des milliers d'annonces vérifiées.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Réservez",
    description: "Choisissez vos dates et effectuez votre réservation en quelques clics.",
  },
  {
    number: "03",
    icon: Key,
    title: "Récupérez",
    description: "Rencontrez le propriétaire, signez le contrat numérique et partez.",
  },
  {
    number: "04",
    icon: ThumbsUp,
    title: "Évaluez",
    description: "Partagez votre expérience pour aider la communauté.",
  },
]

export function HowItWorksSection() {
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
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn("text-center max-w-3xl mx-auto mb-16 opacity-0", isVisible && "animate-slide-up opacity-100")}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Comment ça marche ?</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Louez un véhicule en 4 étapes simples. Notre processus est conçu pour être rapide, sécurisé et transparent.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={cn("relative text-center opacity-0", isVisible && "animate-slide-up opacity-100")}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Step number & icon */}
                <div className="relative inline-flex mb-6">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border-2 border-primary/20 shadow-lg group transition-all duration-300 hover:scale-110 hover:border-primary hover:shadow-xl hover:shadow-primary/20">
                    <step.icon className="h-8 w-8 text-primary" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
