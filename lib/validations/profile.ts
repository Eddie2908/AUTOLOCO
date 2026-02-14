import { z } from "zod"

// -- Regex patterns --
const CAMEROON_PHONE_REGEX = /^\+237\s?[26]\d{2}\s?\d{3}\s?\d{3}$/
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/
const PASSWORD_UPPERCASE = /[A-Z]/
const PASSWORD_LOWERCASE = /[a-z]/
const PASSWORD_DIGIT = /[0-9]/
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>\-_=+[\]\\\/~`]/

// -- Supported cities --
export const SUPPORTED_CITIES = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Bamenda",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Kribi",
  "Limbé",
] as const

// -- Profile update schema --
export const profileUpdateSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(100, "Le nom ne peut pas depasser 100 caracteres")
    .regex(NAME_REGEX, "Le nom contient des caracteres non autorises")
    .transform((v) => v.trim()),
  prenom: z
    .string()
    .min(2, "Le prenom doit contenir au moins 2 caracteres")
    .max(100, "Le prenom ne peut pas depasser 100 caracteres")
    .regex(NAME_REGEX, "Le prenom contient des caracteres non autorises")
    .transform((v) => v.trim()),
  telephone: z
    .string()
    .regex(CAMEROON_PHONE_REGEX, "Format attendu: +237 6XX XXX XXX")
    .optional()
    .or(z.literal("")),
  ville: z.string().max(100, "La ville ne peut pas depasser 100 caracteres").optional().or(z.literal("")),
  quartier: z.string().max(100, "Le quartier ne peut pas depasser 100 caracteres").optional().or(z.literal("")),
  biographie: z
    .string()
    .max(1000, "La biographie ne peut pas depasser 1000 caracteres")
    .optional()
    .or(z.literal("")),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

// -- Password change schema --
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
      .max(128, "Le mot de passe ne peut pas depasser 128 caracteres")
      .refine((v) => PASSWORD_UPPERCASE.test(v), "Doit contenir au moins une majuscule")
      .refine((v) => PASSWORD_LOWERCASE.test(v), "Doit contenir au moins une minuscule")
      .refine((v) => PASSWORD_DIGIT.test(v), "Doit contenir au moins un chiffre")
      .refine((v) => PASSWORD_SPECIAL.test(v), "Doit contenir au moins un caractere special"),
    confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Le nouveau mot de passe doit etre different de l'ancien",
    path: ["newPassword"],
  })

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>

// -- Notification preferences schema --
export const notificationPreferencesSchema = z.object({
  notificationsEmail: z.boolean(),
  notificationsSMS: z.boolean(),
  notificationsPush: z.boolean(),
  notificationsReservations: z.boolean(),
  notificationsPromotions: z.boolean(),
  notificationsMessages: z.boolean(),
  notificationsAvis: z.boolean(),
})

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>

// -- Account deletion schema --
export const accountDeletionSchema = z.object({
  password: z.string().min(1, "Le mot de passe est requis pour confirmer la suppression"),
  reason: z
    .string()
    .max(500, "La raison ne peut pas depasser 500 caracteres")
    .optional()
    .or(z.literal("")),
})

export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>

// -- Helper to format Zod errors into a field-based map --
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root"
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(issue.message)
  }
  return fieldErrors
}
