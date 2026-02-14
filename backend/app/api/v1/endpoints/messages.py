"""
Endpoints de messagerie
========================

Routes pour la messagerie entre locataires et propriétaires.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.message import (
    MessageCreate,
    MessageResponse,
    ConversationResponse,
    ConversationListResponse
)
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les conversations de l'utilisateur."""
    query = select(Conversation).where(
        or_(
            Conversation.IdentifiantUtilisateur1 == current_user.IdentifiantUtilisateur,
            Conversation.IdentifiantUtilisateur2 == current_user.IdentifiantUtilisateur
        )
    )
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Conversation.DateDernierMessage.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    return ConversationListResponse(
        conversations=[ConversationResponse.model_validate(c) for c in conversations],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les messages d'une conversation."""
    # Vérifier accès
    conv_result = await db.execute(
        select(Conversation).where(Conversation.IdentifiantConversation == conversation_id)
    )
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation non trouvée"
        )
    
    if (conversation.IdentifiantUtilisateur1 != current_user.IdentifiantUtilisateur and
        conversation.IdentifiantUtilisateur2 != current_user.IdentifiantUtilisateur):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Messages
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Message)
        .where(Message.IdentifiantConversation == conversation_id)
        .order_by(Message.DateEnvoi.desc())
        .offset(offset)
        .limit(page_size)
    )
    messages = result.scalars().all()
    
    # Marquer comme lus
    for msg in messages:
        if msg.IdentifiantDestinataire == current_user.IdentifiantUtilisateur:
            msg.EstLu = True
    await db.commit()
    
    return [MessageResponse.model_validate(m) for m in reversed(messages)]


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Envoie un nouveau message."""
    # Vérifier que le destinataire existe
    recipient_result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == message_data.identifiant_destinataire
        )
    )
    recipient = recipient_result.scalar_one_or_none()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinataire non trouvé"
        )
    
    # Trouver ou créer la conversation
    conv_result = await db.execute(
        select(Conversation).where(
            or_(
                and_(
                    Conversation.IdentifiantUtilisateur1 == current_user.IdentifiantUtilisateur,
                    Conversation.IdentifiantUtilisateur2 == message_data.identifiant_destinataire
                ),
                and_(
                    Conversation.IdentifiantUtilisateur1 == message_data.identifiant_destinataire,
                    Conversation.IdentifiantUtilisateur2 == current_user.IdentifiantUtilisateur
                )
            )
        )
    )
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(
            IdentifiantUtilisateur1=current_user.IdentifiantUtilisateur,
            IdentifiantUtilisateur2=message_data.identifiant_destinataire,
            DateCreation=datetime.utcnow()
        )
        await db.add(conversation)
        await db.flush()
    
    # Créer le message
    message = Message(
        IdentifiantConversation=conversation.IdentifiantConversation,
        IdentifiantExpediteur=current_user.IdentifiantUtilisateur,
        IdentifiantDestinataire=message_data.identifiant_destinataire,
        Contenu=message_data.contenu,
        DateEnvoi=datetime.utcnow(),
        EstLu=False
    )
    
    await db.add(message)
    
    # Mettre à jour la conversation
    conversation.DateDernierMessage = datetime.utcnow()
    conversation.NombreMessages = (conversation.NombreMessages or 0) + 1
    
    await db.commit()
    await db.refresh(message)
    
    return MessageResponse.model_validate(message)


@router.get("/unread/count")
async def get_unread_count(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Compte les messages non lus."""
    result = await db.execute(
        select(func.count()).where(
            and_(
                Message.IdentifiantDestinataire == current_user.IdentifiantUtilisateur,
                Message.EstLu == False
            )
        )
    )
    count = result.scalar() or 0
    
    return {"unread_count": count}
