"use client"

/**
 * Language Context
 * ================
 *
 * Provides language state management and translation functions
 * across the application.
 */

import * as React from "react"
import { type Locale, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "./types"
import fr from "./translations/fr"
import en from "./translations/en"

type TranslationKeys = keyof typeof fr

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string
  isLoading: boolean
}

const translations = { fr, en }

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE

  // Try to get from cookie
  const cookieMatch = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE_NAME}=([^;]+)`))
  if (cookieMatch) {
    const cookieLocale = cookieMatch[2] as Locale
    if (cookieLocale === "fr" || cookieLocale === "en") {
      return cookieLocale
    }
  }

  // Try to get from browser language
  const browserLang = navigator.language.split("-")[0]
  if (browserLang === "en") return "en"

  return DEFAULT_LOCALE
}

function setLocaleCookie(locale: Locale): void {
  if (typeof window === "undefined") return

  // Set cookie for 1 year
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)
  const [isLoading, setIsLoading] = React.useState(true)

  // Initialize locale from cookie/browser on mount
  React.useEffect(() => {
    const initialLocale = getInitialLocale()
    setLocaleState(initialLocale)
    setIsLoading(false)

    // Update HTML lang attribute
    document.documentElement.lang = initialLocale
  }, [])

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setLocaleCookie(newLocale)

    // Update HTML lang attribute
    document.documentElement.lang = newLocale
  }, [])

  const t = React.useCallback(
    (key: TranslationKeys, params?: Record<string, string | number>): string => {
      const translation = translations[locale][key] || translations[DEFAULT_LOCALE][key] || key

      if (!params) return translation

      // Replace placeholders like {name} with actual values
      return Object.entries(params).reduce(
        (acc, [paramKey, value]) => acc.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value)),
        translation,
      )
    },
    [locale],
  )

  const value = React.useMemo(() => ({ locale, setLocale, t, isLoading }), [locale, setLocale, t, isLoading])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
