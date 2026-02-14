/**
 * Security Utilities Index
 * =========================
 * 
 * Exports centralisés pour toutes les fonctionnalités de sécurité.
 */

// Rate Limiting
export {
  rateLimiter,
  RATE_LIMIT_PRESETS,
  applyRateLimit,
  getRequestIdentifier,
} from "./rate-limiter"

// Permissions
export {
  hasRole,
  hasAnyRole,
  isResourceOwner,
  canAccessBooking,
  canModifyBooking,
  canAccessVehicle,
  canModifyVehicle,
  canAccessProfile,
  getGenericErrorMessage,
  filterAccessibleResources,
} from "./permissions"

export type { UserRole, ResourceOwnership } from "./permissions"

// Audit Logging
export {
  auditLogger,
  logLoginAttempt,
  logLogout,
  logResourceAction,
  logPermissionDenied,
  logRateLimitExceeded,
  getRequestInfo,
  getSessionInfo,
} from "./audit-log"

export type { AuditAction, AuditLogEntry } from "./audit-log"
