"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Car, Shield, Smartphone } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function CTASection() {
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
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative bg-card rounded-3xl p-8 md:p-12 lg:p-16 border border-border/50 shadow-2xl overflow-hidden opacity-0",
            isVisible && "animate-scale-in opacity-100",
          )}
        >
          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Prêt à commencer votre <span className="text-primary">aventure</span> ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto text-pretty">
              Rejoignez AUTOLOCO aujourd'hui et découvrez une nouvelle façon de louer des véhicules au Cameroun.
              Inscription gratuite en moins de 2 minutes.
            </p>

            {/* Features row */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[
                { icon: Shield, text: "100% Sécurisé" },
                { icon: Smartphone, text: "Mobile Money" },
                { icon: Car, text: "5000+ Véhicules" },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className={cn(
                    "flex items-center gap-2 text-muted-foreground opacity-0",
                    isVisible && "animate-fade-in opacity-100",
                  )}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="text-lg h-14 px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 group"
              >
                <Link href="/auth/register">
                  Créer mon compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg h-14 px-8 transition-all duration-300 hover:scale-105 bg-transparent"
              >
                <Link href="/vehicles">Explorer les véhicules</Link>
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 border border-primary/20 rounded-full" />
          <div className="absolute bottom-4 right-4 w-32 h-32 border border-accent/20 rounded-full" />
          <div className="absolute top-1/2 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 -right-16 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  )
}
