"use client"
import { Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  showLabel?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = "ghost",
  size = "icon",
  showLabel = false,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t, isLoading } = useLanguage()

  const currentLanguage = SUPPORTED_LOCALES.find((l) => l.code === locale)

  if (isLoading) {
    return (
      <Button variant={variant} size={size} className={cn("h-9", className)} disabled>
        <Globe className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showLabel ? "default" : size}
          className={cn("gap-2", showLabel ? "px-3" : "h-9 w-9", className)}
          aria-label={t("language.select")}
        >
          <Globe className="h-4 w-4" />
          {showLabel && <span className="hidden sm:inline">{currentLanguage?.nativeName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {SUPPORTED_LOCALES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLocale(language.code as Locale)}
            className={cn(
              "flex items-center justify-between gap-3 cursor-pointer",
              locale === language.code && "bg-accent",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language.flag}</span>
              <span>{language.nativeName}</span>
            </div>
            {locale === language.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
