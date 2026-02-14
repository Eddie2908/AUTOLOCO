"""
Modèles SQLAlchemy pour les rôles et permissions
===============================================
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Role(Base):
    """
    Table des rôles utilisateur.
    """
    __tablename__ = "roles"
    
    id = Column("IDRole", Integer, primary_key=True, index=True)
    nom_role = Column("NomRole", String(50), unique=True, nullable=False)
    description = Column("Description", String(500))
    niveau = Column("Niveau", Integer, nullable=False)
    est_systeme = Column("EstSysteme", Boolean, default=False)
    date_creation = Column("DateCreation", DateTime, default=datetime.utcnow)
    
    # Relations
    permissions = relationship(
        "Permission",
        secondary="roles_permissions",
        back_populates="roles"
    )


class Permission(Base):
    """
    Table des permissions.
    """
    __tablename__ = "permissions"
    
    id = Column("IDPermission", Integer, primary_key=True, index=True)
    nom_permission = Column("NomPermission", String(100), unique=True, nullable=False)
    description = Column("Description", String(500))
    categorie = Column("Categorie", String(50))
    est_systeme = Column("EstSysteme", Boolean, default=False)
    date_creation = Column("DateCreation", DateTime, default=datetime.utcnow)
    
    # Relations
    roles = relationship(
        "Role",
        secondary="roles_permissions",
        back_populates="permissions"
    )


class RolePermission(Base):
    """
    Table de liaison roles-permissions.
    """
    __tablename__ = "roles_permissions"
    
    role_id = Column("IDRole", Integer, ForeignKey("roles.IDRole"), primary_key=True)
    permission_id = Column("IDPermission", Integer, ForeignKey("permissions.IDPermission"), primary_key=True)
    date_attribution = Column("DateAttribution", DateTime, default=datetime.utcnow)


class UserPermission(Base):
    """
    Table des permissions personnalisées par utilisateur.
    """
    __tablename__ = "utilisateurs_permissions"
    
    user_id = Column("IDUtilisateur", Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), primary_key=True)
    permission_id = Column("IDPermission", Integer, ForeignKey("permissions.IDPermission"), primary_key=True)
    type_override = Column("TypeOverride", String(10), nullable=False)  # 'grant' ou 'revoke'
    raison = Column("Raison", String(500))
    date_attribution = Column("DateAttribution", DateTime, default=datetime.utcnow)
    attribue_par = Column("AttributePar", Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
