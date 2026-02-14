"""
Modèles SQLAlchemy pour les incidents et réclamations
======================================================
Compatible avec le schéma Prisma (BD_autoloca v3 FINAL)
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Incident(Base):
    """Table des incidents - Synchronisé avec le schéma Prisma"""
    
    __tablename__ = "Incidents"
    
    IdentifiantIncident = Column(Integer, primary_key=True, autoincrement=True)
    NumeroIncident = Column(String(50), unique=True, nullable=False)
    
    # Relations
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation"), nullable=False)
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule"), nullable=False)
    
    # Type et gravité
    TypeIncident = Column(String(50), nullable=False)
    GraviteIncident = Column(String(20), nullable=False)
    DescriptionIncident = Column(Text, nullable=False)
    
    # Date et lieu
    DateIncident = Column(DateTime, nullable=False)
    LieuIncident = Column(String(500))
    # CoordonneesIncident = geography type géré par SQL Server
    
    # Photos et rapports
    PhotosIncident = Column(Text)  # JSON array
    RapportPolice = Column(String(500))
    NumeroConstat = Column(String(100))
    
    # Tiers
    TierImplique = Column(Boolean, default=False)
    InfoTiers = Column(Text)  # JSON
    
    # Assurance
    AssuranceNotifiee = Column(Boolean, default=False)
    DateNotificationAssurance = Column(DateTime)
    NumeroSinistre = Column(String(100))
    
    # Dommages et réparations
    EstimationDommages = Column(DECIMAL(10, 2))
    CoutReparations = Column(DECIMAL(10, 2))
    ResponsabiliteLocataire = Column(Boolean)
    
    # Statut et traitement
    StatutTraitement = Column(String(30), default='Declare')
    DateDeclaration = Column(DateTime, default=datetime.utcnow)
    DateResolution = Column(DateTime)
    TraitePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    NotesTraitement = Column(Text)
    
    # Relations inverses
    reservation = relationship("Reservation", foreign_keys=[IdentifiantReservation])
    vehicule = relationship("Vehicule", foreign_keys=[IdentifiantVehicule])
    traitant = relationship("Utilisateur", foreign_keys=[TraitePar])


class Reclamation(Base):
    """Table des réclamations - Synchronisé avec le schéma Prisma"""
    
    __tablename__ = "Reclamations"
    
    IdentifiantReclamation = Column(Integer, primary_key=True, autoincrement=True)
    NumeroReclamation = Column(String(50), unique=True, nullable=False)
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation"))
    IdentifiantReclamant = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    # Type et sujet
    TypeReclamation = Column(String(50), nullable=False)
    CategorieReclamation = Column(String(50))
    SujetReclamation = Column(String(255), nullable=False)
    DescriptionReclamation = Column(Text, nullable=False)
    
    # Pièces jointes et montant
    PieceJointes = Column(Text)  # JSON array
    MontantReclame = Column(DECIMAL(10, 2))
    
    # Priorité et statut
    StatutReclamation = Column(String(30), default='Ouverte')
    PrioriteReclamation = Column(String(20), default='Normal')
    
    # Dates
    DateCreation = Column(DateTime, default=datetime.utcnow)
    DateResolution = Column(DateTime)
    DateFermeture = Column(DateTime)
    
    # Traitement
    AssigneA = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    ReponseReclamation = Column(Text)
    ActionsPrises = Column(Text)
    
    # Compensation
    MontantRembourse = Column(DECIMAL(10, 2))
    
    # Satisfaction
    SatisfactionClient = Column(DECIMAL(3, 2))
    
    # Relations inverses
    reclamant = relationship("Utilisateur", foreign_keys=[IdentifiantReclamant])
    reservation = relationship("Reservation", foreign_keys=[IdentifiantReservation])
    assignee = relationship("Utilisateur", foreign_keys=[AssigneA])
    
    @property
    def EstResolue(self):
        return self.StatutReclamation in ['Resolue', 'Fermee']
    
    @property
    def DelaiTraitement(self):
        """Retourne le délai de traitement en heures"""
        if self.DateResolution and self.DateCreation:
            delta = self.DateResolution - self.DateCreation
            return delta.total_seconds() / 3600
        return None


class CommentaireIncident(Base):
    """Table des commentaires sur les incidents"""
    
    __tablename__ = "CommentairesIncidents"
    
    IdentifiantCommentaire = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantIncident = Column(Integer, ForeignKey("Incidents.IdentifiantIncident"), nullable=False)
    IdentifiantAuteur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    Commentaire = Column(Text, nullable=False)
    EstInterne = Column(Boolean, default=False)  # Visible uniquement par admin/staff
    
    DateCommentaire = Column(DateTime, default=datetime.utcnow)
    DateModification = Column(DateTime)
    
    # Relations
    incident = relationship("Incident", backref="commentaires")
    auteur = relationship("Utilisateur", foreign_keys=[IdentifiantAuteur])


class ActionIncident(Base):
    """Table de suivi des actions sur les incidents"""
    
    __tablename__ = "ActionsIncidents"
    
    IdentifiantAction = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantIncident = Column(Integer, ForeignKey("Incidents.IdentifiantIncident"), nullable=False)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    TypeAction = Column(String(50), nullable=False)
    # ChangementStatut, AjoutDocument, ContactPolice, RemboursementEffectue, etc.
    
    DescriptionAction = Column(String(500))
    AncienneValeur = Column(String(255))
    NouvelleValeur = Column(String(255))
    
    DateAction = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    incident = relationship("Incident", backref="actions")
    utilisateur = relationship("Utilisateur", foreign_keys=[IdentifiantUtilisateur])
