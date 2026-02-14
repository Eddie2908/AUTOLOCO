"use client"

import * as React from "react"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

type Testimonial = {
  id: number
  name: string
  role: string
  avatar: string
  rating: number
  comment: string
}

export function TestimonialsSection() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([])
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

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/public/testimonials")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled || !Array.isArray(data?.testimonials)) return
        setTestimonials(data.testimonials)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])

  if (testimonials.length === 0) return null

  return (
    <section ref={sectionRef} className="py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={cn("text-center max-w-3xl mx-auto mb-16 opacity-0", isVisible && "animate-slide-up opacity-100")}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
            Ce que disent nos <span className="text-primary">utilisateurs</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Rejoignez des milliers de Camerounais qui font confiance à AUTOLOCO pour leurs besoins de location.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "relative bg-card rounded-2xl p-6 border border-border/50 shadow-lg",
                "transition-all duration-500 hover:shadow-xl hover:-translate-y-1",
                "opacity-0",
                isVisible && "animate-slide-up opacity-100",
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.comment}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
