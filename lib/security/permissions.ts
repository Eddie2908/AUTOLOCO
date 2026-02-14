/**
 * Permission & Ownership Validation
 * ==================================
 * 
 * Valide que les utilisateurs ne peuvent accéder qu'à leurs propres ressources.
 */

export interface PermissionActor {
  id?: string;
  role?: UserRole;
  email?: string;
}

export type UserRole = "admin" | "proprietaire" | "locataire";

export interface ResourceOwnership {
  userId?: string;
  ownerId?: string;
  renterId?: string;
  creatorId?: string;
}

/**
 * Vérifie si l'utilisateur a le rôle requis
 */
export function hasRole(session: PermissionActor | null, requiredRole: UserRole): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  return userRole === requiredRole;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles requis
 */
export function hasAnyRole(session: PermissionActor | null, roles: UserRole[]): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  return roles.includes(userRole);
}

/**
 * Vérifie si l'utilisateur est propriétaire d'une ressource
 */
export function isResourceOwner(
  session: PermissionActor | null,
  resource: ResourceOwnership
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  // Vérifier les différents champs de propriété
  return (
    resource.userId === userId ||
    resource.ownerId === userId ||
    resource.renterId === userId ||
    resource.creatorId === userId
  );
}

/**
 * Vérifie si l'utilisateur peut accéder à une réservation
 */
export function canAccessBooking(
  session: PermissionActor | null,
  booking: {
    locataire_id?: string;
    vehicule?: {
      proprietaire_id?: string;
    };
  }
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  // Le locataire peut voir ses propres réservations
  if (booking.locataire_id === userId) return true;
  
  // Le propriétaire du véhicule peut voir les réservations de son véhicule
  if (booking.vehicule?.proprietaire_id === userId) return true;
  
  return false;
}

/**
 * Vérifie si l'utilisateur peut modifier une réservation
 */
export function canModifyBooking(
  session: PermissionActor | null,
  booking: {
    locataire_id?: string;
    statut?: string;
  }
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin peut tout modifier
  if (userRole === "admin") return true;
  
  // Le locataire peut modifier ses réservations en attente
  if (
    booking.locataire_id === userId &&
    (booking.statut === "en_attente" || booking.statut === "confirmee")
  ) {
    return true;
  }
  
  return false;
}

/**
 * Vérifie si l'utilisateur peut accéder à un véhicule
 */
export function canAccessVehicle(
  session: PermissionActor | null,
  vehicle: {
    proprietaire_id?: string;
    disponible?: boolean;
  }
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  // Le propriétaire peut toujours accéder à son véhicule
  if (vehicle.proprietaire_id === userId) return true;
  
  // Les autres ne peuvent voir que les véhicules disponibles
  return vehicle.disponible === true;
}

/**
 * Vérifie si l'utilisateur peut modifier un véhicule
 */
export function canModifyVehicle(
  session: PermissionActor | null,
  vehicle: {
    proprietaire_id?: string;
  }
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin peut tout modifier
  if (userRole === "admin") return true;
  
  // Le propriétaire peut modifier son véhicule
  return vehicle.proprietaire_id === userId;
}

/**
 * Vérifie si l'utilisateur peut accéder au profil
 */
export function canAccessProfile(
  session: PermissionActor | null,
  profileUserId: string
): boolean {
  if (!session?.id || !session?.role) return false;
  
  const userId = session.id;
  const userRole = session.role;
  
  // Admin a tous les droits
  if (userRole === "admin") return true;
  
  // L'utilisateur peut accéder à son propre profil
  return userId === profileUserId;
}

/**
 * Retourne un message d'erreur générique
 */
export function getGenericErrorMessage(action: string): string {
  return `Vous n'êtes pas autorisé à effectuer cette action.`;
}

/**
 * Filtre une liste de ressources pour ne retourner que celles accessibles
 */
export function filterAccessibleResources<T extends ResourceOwnership>(
  session: PermissionActor | null,
  resources: T[]
): T[] {
  if (!session?.id || !session?.role) return [];
  
  const userRole = session.role;
  
  // Admin voit tout
  if (userRole === "admin") return resources;
  
  const userId = session.id;
  
  return resources.filter((resource) => isResourceOwner(session, resource));
}
