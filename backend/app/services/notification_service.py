"""
Service de gestion des notifications pour AUTOLOCO.

Gère l'envoi de notifications par:
- Email (SendGrid)
- SMS (API locale Cameroun + Twilio backup)
- Push notifications (Firebase Cloud Messaging)
- Notifications in-app (WebSockets)
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
import asyncio
from enum import Enum

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import httpx
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from jinja2 import Environment, FileSystemLoader, select_autoescape
import logging

from app.core.config import settings
from app.models.notification import (
    Notification,
    NotificationTemplate,
    NotificationPreference
)

logger = logging.getLogger(__name__)


class NotificationType(str, Enum):
    """Types de notifications"""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationPriority(str, Enum):
    """Priorités des notifications"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(str, Enum):
    """Catégories de notifications"""
    RESERVATION = "reservation"
    PAYMENT = "payment"
    VEHICLE = "vehicle"
    ACCOUNT = "account"
    SECURITY = "security"
    MARKETING = "marketing"
    SUPPORT = "support"
    SYSTEM = "system"


class NotificationService:
    """Service principal de gestion des notifications"""
    
    def __init__(self, db: Session):
        self.db = db
        self.sendgrid_client = None
        self.jinja_env = Environment(
            loader=FileSystemLoader('backend/app/templates/emails'),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Initialiser SendGrid si configuré
        if settings.SENDGRID_API_KEY:
            self.sendgrid_client = SendGridAPIClient(settings.SENDGRID_API_KEY)
    
    async def send_notification(
        self,
        user_id: int,
        category: NotificationCategory,
        template_code: str,
        data: Dict[str, Any],
        priority: NotificationPriority = NotificationPriority.NORMAL,
        channels: Optional[List[NotificationType]] = None
    ) -> Dict[str, bool]:
        """
        Envoie une notification multi-canal.
        
        Args:
            user_id: ID de l'utilisateur destinataire
            category: Catégorie de notification
            template_code: Code du template à utiliser
            data: Données pour le template
            priority: Priorité de la notification
            channels: Canaux spécifiques (None = tous selon préférences)
        
        Returns:
            Dict avec le statut d'envoi par canal
        """
        
        try:
            # Récupérer les préférences utilisateur
            preferences = self._get_user_preferences(user_id, category)
            
            # Déterminer les canaux à utiliser
            if channels is None:
                channels = self._determine_channels(preferences, priority)
            
            # Récupérer le template
            template = self._get_template(template_code)
            if not template:
                logger.error("template_not_found", template_code=template_code)
                return {}
            
            # Envoyer sur chaque canal en parallèle
            results = {}
            tasks = []
            
            if NotificationType.EMAIL in channels:
                tasks.append(self._send_email(user_id, template, data))
            
            if NotificationType.SMS in channels:
                tasks.append(self._send_sms(user_id, template, data))
            
            if NotificationType.PUSH in channels:
                tasks.append(self._send_push(user_id, template, data))
            
            if NotificationType.IN_APP in channels:
                tasks.append(self._send_in_app(user_id, template, data, priority))
            
            # Exécuter tous les envois en parallèle
            if tasks:
                channel_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for i, channel in enumerate(channels):
                    results[channel.value] = not isinstance(channel_results[i], Exception)
            
            # Enregistrer dans la base
            self._log_notification(user_id, category, template_code, data, results, priority)
            
            logger.info(
                "notification_sent",
                user_id=user_id,
                category=category,
                channels=channels,
                results=results
            )
            
            return results
            
        except Exception as e:
            logger.error("notification_failed", error=str(e), user_id=user_id)
            return {}
    
    async def _send_email(
        self,
        user_id: int,
        template: NotificationTemplate,
        data: Dict[str, Any]
    ) -> bool:
        """Envoie un email via SendGrid"""
        
        try:
            # Récupérer l'email utilisateur
            from app.models.user import Utilisateur
            user = self.db.query(Utilisateur).filter(
                Utilisateur.IDUtilisateur == user_id
            ).first()
            
            if not user or not user.Email:
                return False
            
            # Rendre le template
            html_template = self.jinja_env.get_template(f"{template.CodeTemplate}.html")
            html_content = html_template.render(**data, user=user)
            
            # Créer le message
            message = Mail(
                from_email=Email(settings.EMAIL_FROM_ADDRESS, settings.EMAIL_FROM_NAME),
                to_emails=To(user.Email),
                subject=template.SujetEmail or template.TitreNotification,
                html_content=Content("text/html", html_content)
            )
            
            # Envoyer
            if self.sendgrid_client:
                response = self.sendgrid_client.send(message)
                return response.status_code in [200, 202]
            else:
                # Mode développement: logger seulement
                logger.info(
                    "email_simulation",
                    to=user.Email,
                    subject=template.SujetEmail,
                    content=html_content[:200]
                )
                return True
                
        except Exception as e:
            logger.error("email_send_failed", error=str(e), user_id=user_id)
            return False
    
    async def _send_sms(
        self,
        user_id: int,
        template: NotificationTemplate,
        data: Dict[str, Any]
    ) -> bool:
        """Envoie un SMS via API locale Cameroun"""
        
        try:
            # Récupérer le téléphone utilisateur
            from app.models.user import Utilisateur
            user = self.db.query(Utilisateur).filter(
                Utilisateur.IDUtilisateur == user_id
            ).first()
            
            if not user or not user.Telephone:
                return False
            
            # Rendre le contenu SMS
            sms_content = template.ContenuSMS or template.TitreNotification
            for key, value in data.items():
                sms_content = sms_content.replace(f"{{{key}}}", str(value))
            
            # Envoyer via API locale
            if settings.SMS_API_URL and settings.SMS_API_KEY:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        settings.SMS_API_URL,
                        json={
                            "to": user.Telephone,
                            "message": sms_content,
                            "sender": "AUTOLOCO"
                        },
                        headers={
                            "Authorization": f"Bearer {settings.SMS_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        timeout=10.0
                    )
                    return response.status_code == 200
            else:
                # Mode développement
                logger.info(
                    "sms_simulation",
                    to=user.Telephone,
                    message=sms_content
                )
                return True
                
        except Exception as e:
            logger.error("sms_send_failed", error=str(e), user_id=user_id)
            return False
    
    async def _send_push(
        self,
        user_id: int,
        template: NotificationTemplate,
        data: Dict[str, Any]
    ) -> bool:
        """Envoie une notification push via Firebase Cloud Messaging"""
        
        try:
            # Récupérer les tokens FCM de l'utilisateur
            from app.models.device import DeviceToken
            tokens = self.db.query(DeviceToken).filter(
                and_(
                    DeviceToken.IDUtilisateur == user_id,
                    DeviceToken.EstActif == True
                )
            ).all()
            
            if not tokens:
                return False
            
            # Préparer le payload
            notification_data = {
                "title": template.TitreNotification,
                "body": template.ContenuPush or template.TitreNotification,
                "icon": template.IconeNotification or "/logo-icon.svg",
                "click_action": template.ActionURL,
                "data": data
            }
            
            # Envoyer à tous les appareils
            if settings.FIREBASE_SERVER_KEY:
                async with httpx.AsyncClient() as client:
                    for token in tokens:
                        try:
                            response = await client.post(
                                "https://fcm.googleapis.com/fcm/send",
                                json={
                                    "to": token.Token,
                                    "notification": notification_data
                                },
                                headers={
                                    "Authorization": f"key={settings.FIREBASE_SERVER_KEY}",
                                    "Content-Type": "application/json"
                                },
                                timeout=10.0
                            )
                            
                            if response.status_code != 200:
                                logger.warning(
                                    "push_send_failed",
                                    device_id=token.IDDevice,
                                    status=response.status_code
                                )
                        except Exception as e:
                            logger.error("push_device_error", device_id=token.IDDevice, error=str(e))
                
                return True
            else:
                # Mode développement
                logger.info(
                    "push_simulation",
                    user_id=user_id,
                    tokens_count=len(tokens),
                    notification=notification_data
                )
                return True
                
        except Exception as e:
            logger.error("push_send_failed", error=str(e), user_id=user_id)
            return False
    
    async def _send_in_app(
        self,
        user_id: int,
        template: NotificationTemplate,
        data: Dict[str, Any],
        priority: NotificationPriority
    ) -> bool:
        """Enregistre une notification in-app"""
        
        try:
            notification = Notification(
                IDUtilisateur=user_id,
                Titre=template.TitreNotification,
                Contenu=template.ContenuNotification,
                TypeNotification=template.TypeNotification,
                Categorie=template.CategorieNotification,
                Priorite=priority.value,
                IconeNotification=template.IconeNotification,
                ActionURL=template.ActionURL,
                DataJSON=data,
                EstLue=False,
                DateCreation=datetime.utcnow()
            )
            
            self.db.add(notification)
            self.db.commit()
            
            # Envoyer via WebSocket si connecté
            await self._notify_websocket(user_id, notification)
            
            return True
            
        except Exception as e:
            logger.error("in_app_notification_failed", error=str(e), user_id=user_id)
            self.db.rollback()
            return False
    
    async def _notify_websocket(self, user_id: int, notification: Notification):
        """Envoie la notification via WebSocket si l'utilisateur est connecté"""
        # TODO: Implémenter avec WebSocket manager
        pass
    
    def _get_user_preferences(
        self,
        user_id: int,
        category: NotificationCategory
    ) -> Optional[NotificationPreference]:
        """Récupère les préférences de notification de l'utilisateur"""
        
        return self.db.query(NotificationPreference).filter(
            and_(
                NotificationPreference.IDUtilisateur == user_id,
                NotificationPreference.CategorieNotification == category.value
            )
        ).first()
    
    def _determine_channels(
        self,
        preferences: Optional[NotificationPreference],
        priority: NotificationPriority
    ) -> List[NotificationType]:
        """Détermine les canaux à utiliser selon les préférences et la priorité"""
        
        channels = []
        
        if preferences:
            if preferences.NotificationEmail:
                channels.append(NotificationType.EMAIL)
            if preferences.NotificationSMS:
                channels.append(NotificationType.SMS)
            if preferences.NotificationPush:
                channels.append(NotificationType.PUSH)
            if preferences.NotificationInApp:
                channels.append(NotificationType.IN_APP)
        else:
            # Préférences par défaut
            channels = [
                NotificationType.EMAIL,
                NotificationType.IN_APP
            ]
            
            # Ajouter SMS/Push pour priorités élevées
            if priority in [NotificationPriority.HIGH, NotificationPriority.URGENT]:
                channels.extend([NotificationType.SMS, NotificationType.PUSH])
        
        return channels
    
    def _get_template(self, template_code: str) -> Optional[NotificationTemplate]:
        """Récupère un template de notification"""
        
        return self.db.query(NotificationTemplate).filter(
            and_(
                NotificationTemplate.CodeTemplate == template_code,
                NotificationTemplate.EstActif == True
            )
        ).first()
    
    def _log_notification(
        self,
        user_id: int,
        category: NotificationCategory,
        template_code: str,
        data: Dict[str, Any],
        results: Dict[str, bool],
        priority: NotificationPriority
    ):
        """Enregistre l'envoi de notification dans l'audit trail"""
        
        try:
            from app.models.audit import AuditTrail
            
            audit = AuditTrail(
                TypeAction="notification_sent",
                IDUtilisateur=user_id,
                DetailsAction={
                    "category": category.value,
                    "template": template_code,
                    "data": data,
                    "results": results,
                    "priority": priority.value
                },
                DateAction=datetime.utcnow()
            )
            
            self.db.add(audit)
            self.db.commit()
            
        except Exception as e:
            logger.error("audit_log_failed", error=str(e))
            self.db.rollback()


# Fonctions helper pour notifications communes
async def send_verification_email(email: str, user_id: int, db: Session):
    """Envoie un email de vérification de compte"""
    
    service = NotificationService(db)
    
    # Générer token de vérification
    from app.core.security import create_verification_token
    token = create_verification_token(user_id)
    
    await service.send_notification(
        user_id=user_id,
        category=NotificationCategory.ACCOUNT,
        template_code="email_verification",
        data={
            "email": email,
            "verification_url": f"{settings.FRONTEND_URL}/auth/verify?token={token}",
            "token": token
        },
        priority=NotificationPriority.HIGH,
        channels=[NotificationType.EMAIL]
    )


async def send_booking_confirmation(booking_id: int, db: Session):
    """Envoie une confirmation de réservation"""
    
    from app.models.booking import Reservation
    
    booking = db.query(Reservation).filter(
        Reservation.IDReservation == booking_id
    ).first()
    
    if not booking:
        return
    
    service = NotificationService(db)
    
    # Notifier le locataire
    await service.send_notification(
        user_id=booking.IDLocataire,
        category=NotificationCategory.RESERVATION,
        template_code="booking_confirmed_renter",
        data={
            "booking_number": booking.NumeroReservation,
            "vehicle_name": booking.vehicle.MarqueVehicule + " " + booking.vehicle.ModeleVehicule,
            "start_date": booking.DateDebut.strftime("%d/%m/%Y"),
            "end_date": booking.DateFin.strftime("%d/%m/%Y"),
            "total_amount": f"{booking.MontantTotal:,.0f} FCFA"
        },
        priority=NotificationPriority.HIGH
    )
    
    # Notifier le propriétaire
    await service.send_notification(
        user_id=booking.vehicle.IDProprietaire,
        category=NotificationCategory.RESERVATION,
        template_code="booking_confirmed_owner",
        data={
            "booking_number": booking.NumeroReservation,
            "renter_name": booking.renter.Prenom + " " + booking.renter.Nom,
            "vehicle_name": booking.vehicle.MarqueVehicule + " " + booking.vehicle.ModeleVehicule,
            "start_date": booking.DateDebut.strftime("%d/%m/%Y"),
            "end_date": booking.DateFin.strftime("%d/%m/%Y"),
            "total_amount": f"{booking.MontantTotal:,.0f} FCFA"
        },
        priority=NotificationPriority.HIGH
    )


async def send_payment_receipt(transaction_id: int, db: Session):
    """Envoie un reçu de paiement"""
    
    from app.models.transaction import Transaction
    
    transaction = db.query(Transaction).filter(
        Transaction.IDTransaction == transaction_id
    ).first()
    
    if not transaction:
        return
    
    service = NotificationService(db)
    
    await service.send_notification(
        user_id=transaction.IDUtilisateur,
        category=NotificationCategory.PAYMENT,
        template_code="payment_receipt",
        data={
            "transaction_number": transaction.NumeroTransaction,
            "amount": f"{transaction.Montant:,.0f} FCFA",
            "method": transaction.MethodePaiement,
            "date": transaction.DateTransaction.strftime("%d/%m/%Y %H:%M")
        },
        priority=NotificationPriority.NORMAL,
        channels=[NotificationType.EMAIL, NotificationType.SMS, NotificationType.IN_APP]
    )
