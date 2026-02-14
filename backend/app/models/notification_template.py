from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Index, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class TemplateNotification(Base):
    """
    Modèle pour les templates de notifications
    Table: TemplatesNotifications - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "TemplatesNotifications"

    IdentifiantTemplate = Column(Integer, primary_key=True, index=True, autoincrement=True)
    TypeNotification = Column(String(100), nullable=False, unique=True)
    NomTemplate = Column(String(200), nullable=False)
    TitreTemplate = Column(String(255), nullable=False)
    CorpsTemplate = Column(Text, nullable=False)
    CorpsHTML = Column(Text)
    CorpsSMS = Column(String(500))
    VariablesDisponibles = Column(Text)
    CanauxDisponibles = Column(Text)
    Categorie = Column(String(50))
    Langue = Column(String(10), default='fr')
    DateCreation = Column(DateTime, server_default=func.now())
    DateModification = Column(DateTime)
    Actif = Column(Boolean, default=True)

    # Relations
    declencheurs = relationship("DeclencheurNotification", back_populates="template")

    __table_args__ = (
        Index('idx_template_type', 'TypeNotification'),
        Index('idx_template_categorie', 'Categorie'),
        Index('idx_template_actif', 'Actif'),
    )


class DeclencheurNotification(Base):
    """
    Modèle pour les déclencheurs de notifications automatiques
    Table: DeclencheursNotifications - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "DeclencheursNotifications"

    IdentifiantDeclencheur = Column(Integer, primary_key=True, index=True, autoincrement=True)
    TypeDeclencheur = Column(String(100), nullable=False)
    NomDeclencheur = Column(String(200), nullable=False)
    IdentifiantTemplate = Column(Integer, ForeignKey("TemplatesNotifications.IdentifiantTemplate"), nullable=False)
    DelaiMinutes = Column(Integer, default=0)
    Conditions = Column(Text)
    Actif = Column(Boolean, default=True)
    Priorite = Column(Integer, default=5)
    DateCreation = Column(DateTime, server_default=func.now())

    # Relations
    template = relationship("TemplateNotification", back_populates="declencheurs")

    __table_args__ = (
        Index('idx_declencheur_type', 'TypeDeclencheur'),
        Index('idx_declencheur_actif', 'Actif'),
        Index('idx_declencheur_priorite', 'Priorite'),
    )
