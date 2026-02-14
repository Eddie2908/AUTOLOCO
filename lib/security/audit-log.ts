/**
 * Audit Logging System
 * =====================
 * 
 * Enregistre toutes les actions sensibles pour la conformité et la sécurité.
 */

export interface AuditActor {
  id?: string;
  role?: "admin" | "proprietaire" | "locataire";
  email?: string;
}

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "CREATE_BOOKING"
  | "MODIFY_BOOKING"
  | "CANCEL_BOOKING"
  | "CREATE_VEHICLE"
  | "MODIFY_VEHICLE"
  | "DELETE_VEHICLE"
  | "VIEW_SENSITIVE_DATA"
  | "ADMIN_ACTION"
  | "PERMISSION_DENIED"
  | "RATE_LIMIT_EXCEEDED";

export interface AuditLogEntry {
  timestamp: string;
  action: AuditAction;
  userId?: string;
  userRole?: string;
  userEmail?: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogsInMemory = 1000; // En production, envoyer à une base de données

  /**
   * Enregistre une action dans le journal d'audit
   */
  async log(entry: Omit<AuditLogEntry, "timestamp">): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    // Ajouter au tableau en mémoire
    this.logs.push(logEntry);

    // Limiter la taille du tableau
    if (this.logs.length > this.maxLogsInMemory) {
      this.logs.shift();
    }

    // En production, envoyer à une base de données, Sentry, ou service de logging
    if (process.env.NODE_ENV === "production") {
      this.sendToLogService(logEntry);
    } else {
      // En développement, afficher dans la console
      console.log("[AUDIT]", JSON.stringify(logEntry, null, 2));
    }
  }

  /**
   * Envoie le log à un service externe (à implémenter)
   */
  private async sendToLogService(entry: AuditLogEntry): Promise<void> {
    // TODO: Implémenter l'envoi vers un service de logging
    // Exemples: Sentry, Datadog, CloudWatch, etc.
    try {
      // await fetch(process.env.AUDIT_LOG_ENDPOINT, {
      //   method: 'POST',
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error("[AUDIT] Failed to send log:", error);
    }
  }

  /**
   * Récupère les logs récents (pour l'admin)
   */
  getRecentLogs(count: number = 100): AuditLogEntry[] {
    return this.logs.slice(-count).reverse();
  }

  /**
   * Filtre les logs par critères
   */
  filterLogs(filters: {
    userId?: string;
    action?: AuditAction;
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): AuditLogEntry[] {
    return this.logs.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.success !== undefined && log.success !== filters.success)
        return false;
      if (
        filters.startDate &&
        new Date(log.timestamp) < filters.startDate
      )
        return false;
      if (filters.endDate && new Date(log.timestamp) > filters.endDate)
        return false;
      return true;
    });
  }
}

// Instance singleton
const auditLogger = new AuditLogger();

/**
 * Helper pour extraire les informations de la requête
 */
export function getRequestInfo(req: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0]
    : req.headers.get("x-real-ip") || "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

/**
 * Helper pour extraire les informations de la session
 */
export function getSessionInfo(session: AuditActor | null): {
  userId?: string;
  userRole?: string;
  userEmail?: string;
} {
  return {
    userId: session?.id,
    userRole: session?.role,
    userEmail: session?.email,
  };
}

/**
 * Enregistre une tentative de connexion
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  req: Request,
  errorMessage?: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);

  await auditLogger.log({
    action: success ? "LOGIN" : "LOGIN_FAILED",
    userEmail: email,
    success,
    errorMessage,
    ipAddress,
    userAgent,
  });
}

/**
 * Enregistre une déconnexion
 */
export async function logLogout(
  session: AuditActor,
  req: Request
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const sessionInfo = getSessionInfo(session);

  await auditLogger.log({
    action: "LOGOUT",
    ...sessionInfo,
    success: true,
    ipAddress,
    userAgent,
  });
}

/**
 * Enregistre une action sur une ressource
 */
export async function logResourceAction(
  action: AuditAction,
  session: AuditActor | null,
  req: Request,
  resource: {
    id: string;
    type: string;
  },
  success: boolean,
  details?: Record<string, any>,
  errorMessage?: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const sessionInfo = getSessionInfo(session);

  await auditLogger.log({
    action,
    ...sessionInfo,
    resourceId: resource.id,
    resourceType: resource.type,
    details,
    success,
    errorMessage,
    ipAddress,
    userAgent,
  });
}

/**
 * Enregistre un refus de permission
 */
export async function logPermissionDenied(
  session: AuditActor | null,
  req: Request,
  resource: {
    id?: string;
    type: string;
  },
  attemptedAction: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const sessionInfo = getSessionInfo(session);

  await auditLogger.log({
    action: "PERMISSION_DENIED",
    ...sessionInfo,
    resourceId: resource.id,
    resourceType: resource.type,
    details: { attemptedAction },
    success: false,
    errorMessage: "Permission refusée",
    ipAddress,
    userAgent,
  });
}

/**
 * Enregistre un dépassement de rate limit
 */
export async function logRateLimitExceeded(
  req: Request,
  identifier: string
): Promise<void> {
  const { ipAddress, userAgent } = getRequestInfo(req);

  await auditLogger.log({
    action: "RATE_LIMIT_EXCEEDED",
    success: false,
    errorMessage: "Trop de requêtes",
    details: { identifier },
    ipAddress,
    userAgent,
  });
}

export { auditLogger };
