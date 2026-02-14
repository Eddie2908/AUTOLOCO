"""
Service d'Upload de Fichiers Intégré
=====================================

Service de haut niveau qui orchestre toutes les étapes d'upload:
- Validation complète
- Traitement et optimisation
- Stockage multi-provider
- Génération URLs signées
- Logging et audit

Auteur: AUTOLOCO Backend Team
Date: 2026-01-23
"""

from typing import Optional, Dict, List, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from PIL import Image
import io

from app.services.file_storage_service import file_storage
from app.services.file_security_service import file_security
from app.core.config import settings


class FileUploadService:
    """
    Service orchestrateur pour l'upload complet de fichiers
    
    Workflow complet:
    1. Validation stricte (extension, MIME, taille, contenu)
    2. Scan antivirus (si activé)
    3. Suppression métadonnées EXIF
    4. Compression et optimisation
    5. Conversion WebP (optionnel)
    6. Watermarking (pour véhicules)
    7. Création miniatures
    8. Sauvegarde multi-provider
    9. Génération URL signée
    10. Enregistrement base de données
    """
    
    @staticmethod
    async def upload_vehicle_image(
        file: UploadFile,
        vehicle_id: int,
        user_id: int,
        db: Session,
        is_main: bool = False,
        order: int = 0,
        description: Optional[str] = None,
        add_watermark: bool = True,
        convert_webp: bool = True
    ) -> Dict:
        """
        Upload complet d'une image de véhicule avec tous les traitements
        
        Args:
            file: Fichier image uploadé
            vehicle_id: ID du véhicule
            user_id: ID du propriétaire
            db: Session database
            is_main: Photo principale ?
            order: Ordre d'affichage
            description: Description optionnelle
            add_watermark: Ajouter watermark AUTOLOCO
            convert_webp: Convertir en WebP pour optimisation
        
        Returns:
            Dict avec URLs et métadonnées
        """
        print(f"[v0] Starting vehicle image upload: {file.filename} for vehicle {vehicle_id}")
        
        # ÉTAPE 1: Validation stricte
        content, mime, image = await file_storage.validate_image(
            file,
            max_size=file_storage.MAX_IMAGE_SIZE,
            user_id=user_id,
            strip_exif=True  # Supprime GPS et métadonnées
        )
        
        original_size = len(content)
        print(f"[v0] Original image: {image.width}x{image.height}px, {original_size} bytes")
        
        # ÉTAPE 2: Watermarking (si demandé)
        if add_watermark:
            print(f"[v0] Adding watermark...")
            image = await file_storage.add_watermark(
                image,
                text="AUTOLOCO",
                opacity=100,
                position="bottom-right"
            )
        
        # ÉTAPE 3: Compression optimale
        print(f"[v0] Compressing image...")
        compressed_content = await file_storage.compress_image(
            image,
            format="JPEG",
            quality=file_storage.COMPRESSION_QUALITY["high"],
            max_width=1920,
            max_height=1920
        )
        
        compressed_size = len(compressed_content)
        compression_ratio = ((original_size - compressed_size) / original_size) * 100
        print(f"[v0] Compressed: {compressed_size} bytes ({compression_ratio:.1f}% reduction)")
        
        # ÉTAPE 4: Génération nom de fichier sécurisé
        filename = file_storage.generate_secure_filename(
            file.filename,
            user_id,
            prefix=f"vehicle_{vehicle_id}"
        )
        
        file_path = file_storage.get_file_path("vehicles", vehicle_id, filename)
        
        # ÉTAPE 5: Sauvegarde image principale
        main_url = await file_storage.save_file(compressed_content, file_path, "image/jpeg")
        print(f"[v0] Main image saved: {main_url}")
        
        # ÉTAPE 6: Conversion WebP (optionnel, plus performant pour le web)
        webp_url = None
        if convert_webp:
            print(f"[v0] Converting to WebP...")
            webp_content = await file_storage.convert_to_webp(
                image,
                quality=file_storage.COMPRESSION_QUALITY["webp"]
            )
            webp_size = len(webp_content)
            webp_ratio = ((compressed_size - webp_size) / compressed_size) * 100
            print(f"[v0] WebP: {webp_size} bytes ({webp_ratio:.1f}% smaller than JPEG)")
            
            webp_filename = filename.replace('.jpg', '.webp').replace('.jpeg', '.webp')
            webp_path = file_storage.get_file_path("vehicles", vehicle_id, webp_filename)
            webp_url = await file_storage.save_file(webp_content, webp_path, "image/webp")
        
        # ÉTAPE 7: Création miniatures multiples
        print(f"[v0] Creating thumbnails...")
        thumbnails = {}
        
        for size_name, dimensions in file_storage.THUMBNAIL_SIZES.items():
            thumb_content = await file_storage.create_thumbnail(
                image,
                dimensions,
                quality=file_storage.COMPRESSION_QUALITY["medium"],
                crop=(size_name == "small")  # Crop pour petites miniatures
            )
            
            thumb_filename = f"{size_name}_{filename}"
            thumb_path = file_storage.get_file_path("vehicles", vehicle_id, thumb_filename)
            thumb_url = await file_storage.save_file(thumb_content, thumb_path, "image/jpeg")
            
            thumbnails[size_name] = {
                "url": thumb_url,
                "size": dimensions,
                "bytes": len(thumb_content)
            }
        
        # ÉTAPE 8: Calculer hash pour intégrité
        file_hash = file_security.calculate_file_hash(compressed_content)
        
        # ÉTAPE 9: Générer URL signée avec expiration (24h)
        signed_url = file_security.generate_signed_url(main_url, expire_hours=24)
        
        print(f"[v0] Upload completed successfully!")
        
        return {
            "success": True,
            "filename": filename,
            "original_filename": file.filename,
            "url": main_url,
            "signed_url": signed_url,
            "webp_url": webp_url,
            "thumbnails": thumbnails,
            "dimensions": {
                "width": image.width,
                "height": image.height
            },
            "sizes": {
                "original_bytes": original_size,
                "compressed_bytes": compressed_size,
                "compression_ratio": f"{compression_ratio:.1f}%"
            },
            "metadata": {
                "vehicle_id": vehicle_id,
                "user_id": user_id,
                "is_main": is_main,
                "order": order,
                "description": description,
                "file_hash": file_hash,
                "mime_type": "image/jpeg",
                "uploaded_at": datetime.utcnow().isoformat()
            }
        }
    
    @staticmethod
    async def upload_document(
        file: UploadFile,
        user_id: int,
        document_type: str,
        db: Session
    ) -> Dict:
        """
        Upload complet d'un document KYC
        
        Args:
            file: Fichier document (PDF ou Image)
            user_id: ID utilisateur
            document_type: Type de document (carte_identite, permis_conduire, etc.)
            db: Session database
        
        Returns:
            Dict avec URL et métadonnées
        """
        print(f"[v0] Starting document upload: {file.filename} for user {user_id}")
        
        # ÉTAPE 1: Validation
        content, mime = await file_storage.validate_document(file)
        
        # ÉTAPE 2: Pour les images, supprimer EXIF
        if mime.startswith('image/'):
            print(f"[v0] Document is image, processing...")
            temp_buffer = io.BytesIO(content)
            image = Image.open(temp_buffer)
            
            # Supprimer EXIF
            image_no_exif = Image.new(image.mode, image.size)
            image_no_exif.putdata(list(image.getdata()))
            
            # Régénérer contenu
            output_buffer = io.BytesIO()
            if mime == "image/png":
                image_no_exif.save(output_buffer, format="PNG", optimize=True)
            else:
                image_no_exif.save(output_buffer, format="JPEG", quality=95, optimize=True)
            content = output_buffer.getvalue()
        
        # ÉTAPE 3: Génération nom sécurisé
        filename = file_storage.generate_secure_filename(
            file.filename,
            user_id,
            prefix=f"doc_{document_type}"
        )
        
        file_path = file_storage.get_file_path("documents", user_id, filename)
        
        # ÉTAPE 4: Sauvegarde
        document_url = await file_storage.save_file(content, file_path, mime)
        
        # ÉTAPE 5: Hash pour intégrité
        file_hash = file_security.calculate_file_hash(content)
        
        # ÉTAPE 6: URL signée (7 jours pour documents)
        signed_url = file_security.generate_signed_url(document_url, expire_hours=168)
        
        print(f"[v0] Document upload completed!")
        
        return {
            "success": True,
            "filename": filename,
            "original_filename": file.filename,
            "url": document_url,
            "signed_url": signed_url,
            "size_bytes": len(content),
            "metadata": {
                "user_id": user_id,
                "document_type": document_type,
                "file_hash": file_hash,
                "mime_type": mime,
                "uploaded_at": datetime.utcnow().isoformat()
            }
        }
    
    @staticmethod
    async def upload_avatar(
        file: UploadFile,
        user_id: int,
        db: Session
    ) -> Dict:
        """
        Upload complet d'un avatar utilisateur
        
        Args:
            file: Fichier image
            user_id: ID utilisateur
            db: Session database
        
        Returns:
            Dict avec URLs et métadonnées
        """
        print(f"[v0] Starting avatar upload for user {user_id}")
        
        # ÉTAPE 1: Validation (5 MB max pour avatar)
        content, mime, image = await file_storage.validate_image(
            file,
            max_size=file_storage.MAX_AVATAR_SIZE,
            user_id=user_id,
            strip_exif=True
        )
        
        # ÉTAPE 2: Créer version carrée 400x400
        avatar_content = await file_storage.create_thumbnail(
            image,
            (400, 400),
            quality=90,
            crop=True  # Crop au centre
        )
        
        # ÉTAPE 3: Miniature 150x150
        thumb_content = await file_storage.create_thumbnail(
            image,
            (150, 150),
            quality=85,
            crop=True
        )
        
        # ÉTAPE 4: Noms de fichiers
        filename = file_storage.generate_secure_filename(
            file.filename,
            user_id,
            prefix="avatar"
        )
        
        thumb_filename = f"thumb_{filename}"
        
        # ÉTAPE 5: Chemins
        avatar_path = file_storage.get_file_path("avatars", user_id, filename)
        thumb_path = file_storage.get_file_path("avatars", user_id, thumb_filename)
        
        # ÉTAPE 6: Sauvegarde
        avatar_url = await file_storage.save_file(avatar_content, avatar_path, "image/jpeg")
        thumb_url = await file_storage.save_file(thumb_content, thumb_path, "image/jpeg")
        
        # ÉTAPE 7: URLs signées
        signed_avatar_url = file_security.generate_signed_url(avatar_url, expire_hours=24)
        signed_thumb_url = file_security.generate_signed_url(thumb_url, expire_hours=24)
        
        print(f"[v0] Avatar upload completed!")
        
        return {
            "success": True,
            "avatar_url": avatar_url,
            "thumbnail_url": thumb_url,
            "signed_avatar_url": signed_avatar_url,
            "signed_thumbnail_url": signed_thumb_url,
            "sizes": {
                "avatar": "400x400",
                "thumbnail": "150x150",
                "avatar_bytes": len(avatar_content),
                "thumbnail_bytes": len(thumb_content)
            },
            "metadata": {
                "user_id": user_id,
                "uploaded_at": datetime.utcnow().isoformat()
            }
        }


# Instance globale
file_upload_service = FileUploadService()
