"""
Service de gestion des permissions
=================================

Service centralisé pour la vérification des permissions RBAC.
"""

from typing import List, Set
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role, Permission, RolePermission, UserPermission


class PermissionService:
    """
    Service de gestion des permissions RBAC.
    """
    
    @staticmethod
    def get_user_permissions(user: User, db: Session) -> Set[str]:
        """
        Récupère toutes les permissions effectives d'un utilisateur.
        
        Combine:
        1. Permissions héritées du rôle
        2. Permissions personnalisées (overrides grant/revoke)
        """
        
        # 1. Permissions du rôle
        role_permissions = db.query(Permission.nom_permission)\
            .join(RolePermission, Permission.id == RolePermission.permission_id)\
            .join(Role, RolePermission.role_id == Role.id)\
            .filter(Role.nom_role == user.type_utilisateur)\
            .all()
        
        permissions = {p[0] for p in role_permissions}
        
        # 2. Permissions personnalisées
        user_overrides = db.query(UserPermission)\
            .join(Permission, UserPermission.permission_id == Permission.id)\
            .filter(UserPermission.user_id == user.id)\
            .all()
        
        for override in user_overrides:
            perm_name = override.permission.nom_permission
            
            if override.type_override == "grant":
                permissions.add(perm_name)
            elif override.type_override == "revoke":
                permissions.discard(perm_name)
        
        return permissions
    
    @staticmethod
    def has_permission(user: User, permission: str, db: Session) -> bool:
        """
        Vérifie si un utilisateur a une permission spécifique.
        
        Supporte les wildcards:
        - "*" = toutes les permissions
        - "vehicles:*" = toutes les permissions de la catégorie vehicles
        """
        
        user_permissions = PermissionService.get_user_permissions(user, db)
        
        # Super admin avec wildcard complet
        if "*" in user_permissions:
            return True
        
        # Vérification exacte
        if permission in user_permissions:
            return True
        
        # Vérification avec wildcard de catégorie
        if ":" in permission:
            category = permission.split(":")[0]
            if f"{category}:*" in user_permissions:
                return True
        
        return False
    
    @staticmethod
    def has_any_permission(
        user: User,
        permissions: List[str],
        db: Session
    ) -> bool:
        """
        Vérifie si un utilisateur a au moins une des permissions listées.
        """
        for permission in permissions:
            if PermissionService.has_permission(user, permission, db):
                return True
        return False
    
    @staticmethod
    def has_all_permissions(
        user: User,
        permissions: List[str],
        db: Session
    ) -> bool:
        """
        Vérifie si un utilisateur a toutes les permissions listées.
        """
        for permission in permissions:
            if not PermissionService.has_permission(user, permission, db):
                return False
        return True
    
    @staticmethod
    def grant_permission(
        user: User,
        permission_name: str,
        granted_by: User,
        reason: str,
        db: Session
    ):
        """
        Accorde une permission personnalisée à un utilisateur.
        
        Nécessite la permission "admin:manage_roles".
        """
        
        # Vérifier que celui qui accorde a le droit
        if not PermissionService.has_permission(
            granted_by, "admin:manage_roles", db
        ):
            raise PermissionError(
                "Vous n'avez pas le droit de gérer les permissions"
            )
        
        # Récupérer la permission
        permission = db.query(Permission)\
            .filter(Permission.nom_permission == permission_name)\
            .first()
        
        if not permission:
            raise ValueError(f"Permission '{permission_name}' inexistante")
        
        # Créer ou mettre à jour l'override
        override = db.query(UserPermission)\
            .filter_by(user_id=user.id, permission_id=permission.id)\
            .first()
        
        if override:
            override.type_override = "grant"
            override.raison = reason
            override.attribue_par = granted_by.id
        else:
            override = UserPermission(
                user_id=user.id,
                permission_id=permission.id,
                type_override="grant",
                raison=reason,
                attribue_par=granted_by.id
            )
            db.add(override)
        
        db.commit()
    
    @staticmethod
    def revoke_permission(
        user: User,
        permission_name: str,
        revoked_by: User,
        reason: str,
        db: Session
    ):
        """
        Révoque une permission à un utilisateur.
        
        Nécessite la permission "admin:manage_roles".
        """
        
        # Vérifier que celui qui révoque a le droit
        if not PermissionService.has_permission(
            revoked_by, "admin:manage_roles", db
        ):
            raise PermissionError(
                "Vous n'avez pas le droit de gérer les permissions"
            )
        
        # Récupérer la permission
        permission = db.query(Permission)\
            .filter(Permission.nom_permission == permission_name)\
            .first()
        
        if not permission:
            raise ValueError(f"Permission '{permission_name}' inexistante")
        
        # Créer ou mettre à jour l'override
        override = db.query(UserPermission)\
            .filter_by(user_id=user.id, permission_id=permission.id)\
            .first()
        
        if override:
            override.type_override = "revoke"
            override.raison = reason
            override.attribue_par = revoked_by.id
        else:
            override = UserPermission(
                user_id=user.id,
                permission_id=permission.id,
                type_override="revoke",
                raison=reason,
                attribue_par=revoked_by.id
            )
            db.add(override)
        
        db.commit()
    
    @staticmethod
    def get_available_permissions(db: Session) -> List[Permission]:
        """
        Retourne toutes les permissions disponibles.
        """
        return db.query(Permission).order_by(
            Permission.categorie,
            Permission.nom_permission
        ).all()
    
    @staticmethod
    def get_role_permissions(role_name: str, db: Session) -> List[str]:
        """
        Retourne les permissions d'un rôle.
        """
        permissions = db.query(Permission.nom_permission)\
            .join(RolePermission, Permission.id == RolePermission.permission_id)\
            .join(Role, RolePermission.role_id == Role.id)\
            .filter(Role.nom_role == role_name)\
            .all()
        
        return [p[0] for p in permissions]
