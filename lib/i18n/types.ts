/**
 * Internationalization Types
 * ==========================
 *
 * Type definitions for the i18n system
 */

export type Locale = "fr" | "en"

export type TranslationKey = keyof typeof import("./translations/fr").default

export interface LanguageOption {
  code: Locale
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LOCALES: LanguageOption[] = [
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
]

export const DEFAULT_LOCALE: Locale = "fr"

export const LOCALE_COOKIE_NAME = "autoloco_locale"
