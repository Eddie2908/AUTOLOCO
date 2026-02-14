"use client"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface PriceBreakdownProps {
  basePrice: number
  days: number
  optionsPrice: number
  serviceFee: number
  insurance: number
  total: number
  deposit: number
  showDeposit?: boolean
  className?: string
}

export function PriceBreakdown({
  basePrice,
  days,
  optionsPrice,
  serviceFee,
  insurance,
  total,
  deposit,
  showDeposit = true,
  className,
}: PriceBreakdownProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {(basePrice / days).toLocaleString()} FCFA x {days} jours
        </span>
        <span>{basePrice.toLocaleString()} FCFA</span>
      </div>

      {optionsPrice > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Options supplémentaires</span>
          <span>{optionsPrice.toLocaleString()} FCFA</span>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Frais de service (5%)</span>
        <span>{serviceFee.toLocaleString()} FCFA</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Assurance de base</span>
        <span>{insurance.toLocaleString()} FCFA</span>
      </div>

      <Separator />

      <div className="flex items-center justify-between font-semibold">
        <span>Total location</span>
        <span className="text-primary">{total.toLocaleString()} FCFA</span>
      </div>

      {showDeposit && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Caution (remboursable)</span>
            <span>{deposit.toLocaleString()} FCFA</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-bold text-lg">
            <span>Total à payer</span>
            <span className="text-primary">{(total + deposit).toLocaleString()} FCFA</span>
          </div>
        </>
      )}
    </div>
  )
}
