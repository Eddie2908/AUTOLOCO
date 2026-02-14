/**
 * Internationalization Module
 * ===========================
 *
 * Exports all i18n utilities and types
 */

export * from "./types"
export { useLanguage, LanguageProvider } from "./language-context"
export { default as fr } from "./translations/fr"
export { default as en } from "./translations/en"
