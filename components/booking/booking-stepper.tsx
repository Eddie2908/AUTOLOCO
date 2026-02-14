"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
  description: string
}

interface BookingStepperProps {
  steps: Step[]
  currentStep: number
}

export function BookingStepper({ steps, currentStep }: BookingStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => (
          <li key={step.id} className={cn("relative flex-1", index !== steps.length - 1 && "pr-8")}>
            <div className="flex items-center">
              <div
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  step.id < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : step.id === currentStep
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground",
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-10 -ml-px h-0.5 w-full -translate-y-1/2 transition-all duration-300",
                    step.id < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
            <div className="mt-3 hidden md:block">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  step.id <= currentStep ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.name}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
