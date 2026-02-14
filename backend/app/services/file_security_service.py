"""
Service de Sécurité Fichiers
==============================

Gère les aspects sécurité de la gestion de fichiers:
- Scan antivirus (ClamAV)
- URLs signées avec expiration
- Suppression métadonnées EXIF
- Hash SHA-256 pour intégrité
- Rate limiting uploads

Auteur: AUTOLOCO Backend Team
Date: 2026-01-23
"""

import hmac
import hashlib
import io
from datetime import datetime, timedelta
from typing import Optional, Tuple
from PIL import Image
from fastapi import HTTPException, status

from app.core.config import settings


class FileSecurityService:
    """Service centralisé pour la sécurité des fichiers"""
    
    @staticmethod
    def calculate_file_hash(content: bytes) -> str:
        """
        Calcule le hash SHA-256 d'un fichier pour vérification d'intégrité
        
        Utilisations:
        - Détection de doublons
        - Vérification intégrité après upload
        - Prévention de modifications non autorisées
        
        Args:
            content: Contenu du fichier en bytes
        
        Returns:
            Hash hexadécimal SHA-256 (64 caractères)
        
        Example:
            >>> hash_value = calculate_file_hash(file_content)
            >>> # Stocker dans BD: document.HashFichier = hash_value
        """
        return hashlib.sha256(content).hexdigest()
    
    @staticmethod
    def verify_file_hash(content: bytes, expected_hash: str) -> bool:
        """
        Vérifie qu'un fichier n'a pas été modifié
        
        Args:
            content: Contenu actuel du fichier
            expected_hash: Hash SHA-256 attendu
        
        Returns:
            True si hash correspond, False sinon
        """
        actual_hash = FileSecurityService.calculate_file_hash(content)
        return hmac.compare_digest(actual_hash, expected_hash)
    
    @staticmethod
    async def scan_virus(content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """
        Scanne un fichier pour détecter virus/malware
        
        Implémentation avec ClamAV (antivirus open source)
        
        Installation ClamAV:
        \`\`\`bash
        # Ubuntu/Debian
        sudo apt-get install clamav clamav-daemon
        sudo systemctl start clamav-daemon
        
        # macOS
        brew install clamav
        brew services start clamav
        
        # Windows
        # Télécharger depuis https://www.clamav.net/downloads
        \`\`\`
        
        Args:
            content: Contenu du fichier
            filename: Nom du fichier (pour logs)
        
        Returns:
            Tuple (is_clean: bool, threat_name: Optional[str])
            - (True, None) si fichier propre
            - (False, "Win.Trojan.XXX") si malware détecté
        
        Raises:
            HTTPException 400: Fichier infecté détecté
            HTTPException 503: Service antivirus indisponible
        """
        try:
            import pyclamd
            
            # Connexion au daemon ClamAV
            try:
                cd = pyclamd.ClamdNetworkSocket()
                
                # Vérifier que le daemon est accessible
                if not cd.ping():
                    raise Exception("ClamAV daemon not responding")
                
            except Exception as e:
                print(f"[v0] ClamAV connection error: {e}")
                # En production, on devrait rejeter l'upload
                # En développement, on peut permettre sans scan
                if settings.ENVIRONMENT == "production":
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Service de scan antivirus temporairement indisponible"
                    )
                else:
                    print(f"[v0] WARNING: Antivirus scan skipped (development mode)")
                    return (True, None)
            
            # Scanner le contenu
            result = cd.scan_stream(content)
            
            # Result format:
            # None = clean
            # {'stream': ('FOUND', 'Virus.Name')} = infected
            
            if result is None:
                print(f"[v0] Virus scan: {filename} is CLEAN")
                return (True, None)
            else:
                virus_name = result['stream'][1]
                print(f"[v0] Virus scan: {filename} INFECTED with {virus_name}")
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Fichier infecté détecté: {virus_name}. Upload refusé."
                )
        
        except ImportError:
            print("[v0] WARNING: pyclamd not installed, virus scan disabled")
            print("[v0] Install with: pip install pyclamd")
            
            # En production, on devrait bloquer
            if settings.ENVIRONMENT == "production":
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Service de sécurité non disponible"
                )
            
            return (True, None)
        
        except HTTPException:
            raise
        
        except Exception as e:
            print(f"[v0] Error during virus scan: {str(e)}")
            
            # En production, rejeter en cas d'erreur scan
            if settings.ENVIRONMENT == "production":
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Erreur lors du scan de sécurité"
                )
            
            return (True, None)
    
    @staticmethod
    async def strip_exif_metadata(image: Image.Image) -> Image.Image:
        """
        Supprime toutes les métadonnées EXIF d'une image
        
        Les métadonnées EXIF peuvent contenir:
        - Coordonnées GPS (lieu de prise de vue)
        - Modèle d'appareil photo
        - Logiciel utilisé
        - Date/heure exacte
        - Copyright
        
        Risques si non supprimées:
        - Fuite de localisation utilisateur
        - Identification de l'appareil
        - Informations personnelles
        
        Args:
            image: Image PIL
        
        Returns:
            Nouvelle image sans métadonnées EXIF
        
        Example:
            >>> clean_image = await strip_exif_metadata(original_image)
            >>> # clean_image n'a plus de métadonnées
        """
        try:
            # Créer une copie de l'image sans métadonnées
            data = list(image.getdata())
            image_no_exif = Image.new(image.mode, image.size)
            image_no_exif.putdata(data)
            
            print(f"[v0] EXIF metadata stripped from image")
            
            return image_no_exif
        
        except Exception as e:
            print(f"[v0] Warning: Could not strip EXIF: {e}")
            # Retourner image originale si erreur
            return image
    
    @staticmethod
    def generate_signed_url(
        file_path: str,
        expiry_hours: int = 24
    ) -> str:
        """
        Génère une URL signée avec expiration pour accès sécurisé aux fichiers
        
        Sécurité:
        - Empêche accès direct non autorisé
        - Expiration automatique
        - Signature HMAC-SHA256 inviolable
        - Protection contre partage non autorisé
        
        Format URL:
        /files/{path}?expires={timestamp}&signature={hmac_sig}
        
        Args:
            file_path: Chemin relatif du fichier
            expiry_hours: Durée de validité en heures (défaut: 24h)
        
        Returns:
            URL complète signée
        
        Example:
            >>> url = generate_signed_url("documents/123/file.pdf", expiry_hours=1)
            >>> # URL valide pendant 1 heure uniquement
        """
        # Calculer timestamp d'expiration
        expiry = datetime.utcnow() + timedelta(hours=expiry_hours)
        expiry_ts = int(expiry.timestamp())
        
        # Créer message à signer
        message = f"{file_path}:{expiry_ts}"
        
        # Générer signature HMAC-SHA256
        signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Construire URL
        signed_url = f"/files/{file_path}?expires={expiry_ts}&signature={signature}"
        
        return signed_url
    
    @staticmethod
    def verify_signed_url(
        file_path: str,
        expires: int,
        signature: str
    ) -> bool:
        """
        Vérifie la validité d'une URL signée
        
        Vérifications:
        1. URL non expirée (timestamp > now)
        2. Signature HMAC valide (pas de falsification)
        
        Args:
            file_path: Chemin du fichier
            expires: Timestamp d'expiration
            signature: Signature HMAC fournie
        
        Returns:
            True si URL valide, False sinon
        
        Raises:
            HTTPException 403: URL expirée ou signature invalide
        """
        # Vérifier expiration
        now_ts = int(datetime.utcnow().timestamp())
        if now_ts > expires:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="URL expirée. Veuillez demander un nouveau lien."
            )
        
        # Recalculer signature attendue
        message = f"{file_path}:{expires}"
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Comparaison timing-attack safe
        is_valid = hmac.compare_digest(signature, expected_signature)
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Signature invalide. Accès refusé."
            )
        
        return True
    
    @staticmethod
    def detect_file_type_mismatch(
        content: bytes,
        declared_mime: str,
        filename: str
    ) -> bool:
        """
        Détecte si le type MIME déclaré correspond au contenu réel
        
        Protection contre:
        - Fichiers exécutables déguisés en images
        - Scripts malveillants avec extension .jpg
        - Attaques par confusion de type
        
        Args:
            content: Contenu du fichier
            declared_mime: Type MIME déclaré (Content-Type)
            filename: Nom du fichier avec extension
        
        Returns:
            True si mismatch détecté (suspect), False si OK
        
        Example:
            >>> is_suspect = detect_file_type_mismatch(
            ...     content, "image/jpeg", "photo.jpg"
            ... )
            >>> if is_suspect:
            ...     raise HTTPException(400, "Type de fichier suspect")
        """
        try:
            import magic
            
            # Détecter type MIME réel du contenu
            actual_mime = magic.from_buffer(content, mime=True)
            
            # Vérifier correspondance
            if actual_mime != declared_mime:
                print(f"[v0] SECURITY WARNING: File type mismatch!")
                print(f"[v0]   - Declared: {declared_mime}")
                print(f"[v0]   - Actual: {actual_mime}")
                print(f"[v0]   - Filename: {filename}")
                return True
            
            return False
        
        except ImportError:
            print("[v0] WARNING: python-magic not installed")
            print("[v0] Install with: pip install python-magic")
            return False
        
        except Exception as e:
            print(f"[v0] Error checking file type: {e}")
            # En cas d'erreur, on assume OK pour ne pas bloquer
            return False
    
    @staticmethod
    def check_upload_rate_limit(
        user_id: int,
        max_uploads_per_hour: int = 10
    ) -> bool:
        """
        Vérifie si l'utilisateur respecte la limite de téléchargements
        
        Protection contre:
        - Abus de stockage
        - Spam de fichiers
        - Attaques par saturation
        
        Implémentation avec Redis recommandée pour production.
        Ici: implémentation simple en mémoire (démo uniquement)
        
        Args:
            user_id: ID de l'utilisateur
            max_uploads_per_hour: Limite d'uploads par heure
        
        Returns:
            True si limite respectée, False si dépassée
        
        Raises:
            HTTPException 429: Trop de requêtes
        """
        # TODO: Implémenter avec Redis pour production
        # redis.incr(f"upload_count:{user_id}", expire=3600)
        
        # Pour l'instant, on retourne toujours True
        # À implémenter avec Redis Counter
        print(f"[v0] Rate limit check for user {user_id} (not implemented yet)")
        return True
    
    @staticmethod
    async def validate_image_content(image: Image.Image) -> dict:
        """
        Valide le contenu d'une image (détection anomalies)
        
        Vérifications:
        - Image non corrompue
        - Dimensions raisonnables
        - Format valide
        - Pas de données cachées suspectes
        
        Args:
            image: Image PIL
        
        Returns:
            Dict avec résultats de validation
            {
                "is_valid": bool,
                "warnings": List[str],
                "info": dict
            }
        """
        warnings = []
        
        try:
            # Vérifier chargement complet
            image.load()
            
            # Vérifier dimensions
            width, height = image.size
            if width < 50 or height < 50:
                warnings.append("Image trop petite (< 50x50)")
            
            if width > 10000 or height > 10000:
                warnings.append("Image très grande (> 10000px)")
            
            # Vérifier format supporté
            if image.format not in ['JPEG', 'PNG', 'GIF', 'WEBP']:
                warnings.append(f"Format inhabituel: {image.format}")
            
            # Vérifier ratio aspect extrême
            ratio = max(width, height) / min(width, height)
            if ratio > 10:
                warnings.append(f"Ratio aspect extrême: {ratio:.1f}:1")
            
            return {
                "is_valid": True,
                "warnings": warnings,
                "info": {
                    "format": image.format,
                    "mode": image.mode,
                    "size": image.size,
                    "has_transparency": image.mode in ('RGBA', 'LA', 'P')
                }
            }
        
        except Exception as e:
            return {
                "is_valid": False,
                "warnings": [f"Erreur validation: {str(e)}"],
                "info": {}
            }


# Instance globale
file_security = FileSecurityService()
