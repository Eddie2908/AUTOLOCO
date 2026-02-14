# Guide du Service d'E-mails - AUTOLOCO

Ce guide explique comment configurer et utiliser le service d'envoi d'e-mails automatiques pour les confirmations de réservation.

## Configuration

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (50 e-mails/jour)
3. Vérifiez votre domaine ou utilisez le domaine de test

### 2. Obtenir la clé API

1. Dans votre dashboard Resend, allez dans **API Keys**
2. Créez une nouvelle clé API
3. Copiez la clé (format: `re_xxxxxxxxxxxxx`)

### 3. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

\`\`\`env
# Email Service
RESEND_API_KEY=re_votre_cle_api_resend
EMAIL_FROM=AUTOLOCO <noreply@autoloco.cm>
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Important :** 
- Remplacez `noreply@autoloco.cm` par votre domaine vérifié
- En développement sans clé API, les e-mails sont simulés dans les logs

## Types d'E-mails

### 1. Confirmation de Réservation

Envoyé automatiquement après un paiement réussi.

**Contenu :**
- Numéro de réservation
- Détails du véhicule
- Dates et lieu de prise en charge
- Informations du propriétaire
- Prochaines étapes
- Lien vers la réservation

**Déclenchement :**
\`\`\`typescript
await emailService.sendBookingConfirmation({
  to: user.email,
  userName: user.name,
  bookingId: "RES-12345",
  vehicleName: "Toyota Corolla 2020",
  vehicleImage: "/images/vehicle.jpg",
  startDate: "15 Janvier 2024",
  endDate: "18 Janvier 2024",
  pickupLocation: "Douala, Akwa",
  totalPrice: 75000,
  ownerName: "Jean Dupont",
  ownerPhone: "+237 6XX XXX XXX",
  bookingUrl: "https://autoloco.cm/booking/confirmation/RES-12345"
})
\`\`\`

### 2. Annulation de Réservation

Envoyé lors de l'annulation d'une réservation.

**Contenu :**
- Numéro de réservation annulée
- Nom du véhicule
- Raison de l'annulation (optionnel)
- Informations de remboursement
- Lien pour rechercher d'autres véhicules

**Déclenchement :**
\`\`\`typescript
await emailService.sendBookingCancellation({
  to: user.email,
  userName: user.name,
  bookingId: "RES-12345",
  vehicleName: "Toyota Corolla 2020",
  reason: "Annulation par le locataire"
})
\`\`\`

### 3. Rappel de Location

Envoyé 24h avant le début de la location.

**Contenu :**
- Rappel de la date de début
- Liste de vérification (documents requis)
- Informations de contact du propriétaire
- Conseils pour la prise en charge

**Déclenchement :**
\`\`\`typescript
await emailService.sendBookingReminder({
  to: user.email,
  userName: user.name,
  bookingId: "RES-12345",
  vehicleName: "Toyota Corolla 2020",
  startDate: "15 Janvier 2024",
  pickupLocation: "Douala, Akwa",
  ownerName: "Jean Dupont",
  ownerPhone: "+237 6XX XXX XXX"
})
\`\`\`

### 4. Notification au Propriétaire

Envoyé au propriétaire lors d'une nouvelle réservation.

**Contenu :**
- Détails de la nouvelle réservation
- Informations du locataire
- Montant à recevoir
- Lien vers le dashboard

## Architecture du Service

### Structure des fichiers

\`\`\`
lib/email/
├── service.ts                          # Service principal
└── templates/
    ├── booking-confirmation.tsx        # Template de confirmation
    ├── booking-cancellation.tsx        # Template d'annulation
    └── booking-reminder.tsx            # Template de rappel
\`\`\`

### Fonctionnement

1. **Création de réservation** → API Route `/api/bookings`
2. **Sauvegarde en base** → Backend FastAPI
3. **Envoi d'e-mail** → Service Resend
4. **Gestion d'erreurs** → Logs + continuation du processus

**Important :** Les e-mails sont envoyés de manière asynchrone. Une erreur d'envoi n'empêche pas la création de la réservation.

## Mode Développement

Sans clé API Resend, les e-mails sont simulés :

\`\`\`
[v0] Simulated email sent to: user@example.com
[v0] Email type: Booking Confirmation
[v0] Booking ID: RES-1234567890
\`\`\`

Les templates sont toujours générés et validés.

## Personnalisation des Templates

Les templates utilisent `@react-email/components` :

\`\`\`tsx
import { Html, Body, Container, Button } from "@react-email/components"

export const CustomEmail = ({ userName }) => (
  <Html>
    <Body>
      <Container>
        <h1>Bonjour {userName}</h1>
        <Button href="https://autoloco.cm">
          Voir ma réservation
        </Button>
      </Container>
    </Body>
  </Html>
)
\`\`\`

### Styles en ligne

Les e-mails nécessitent des styles en ligne :

\`\`\`tsx
const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1a1a1a"
}

<h1 style={heading}>Mon titre</h1>
\`\`\`

## Tests

### Tester l'envoi en local

1. Configurez `RESEND_API_KEY` dans `.env.local`
2. Utilisez votre propre e-mail comme destinataire
3. Créez une réservation de test

### Tester les templates

Utilisez le package `@react-email/render` :

\`\`\`tsx
import { render } from "@react-email/render"
import { BookingConfirmationEmail } from "./templates/booking-confirmation"

const html = render(BookingConfirmationEmail({
  userName: "Test User",
  bookingId: "TEST-123",
  // ... autres props
}))

console.log(html) // HTML généré
\`\`\`

## Gestion des Erreurs

Le service gère automatiquement les erreurs :

\`\`\`typescript
const result = await emailService.sendBookingConfirmation(data)

if (!result.success) {
  console.error("Email error:", result.error)
  // La réservation est quand même créée
}
\`\`\`

**Stratégie :**
- Les erreurs sont loggées mais n'empêchent pas le flux
- L'utilisateur voit toujours la page de confirmation
- Un système de retry peut être implémenté

## Production

### Configuration recommandée

1. **Domaine vérifié** : Utilisez votre propre domaine
2. **Rate limiting** : Surveillez vos quotas Resend
3. **Monitoring** : Loggez tous les envois/erreurs
4. **Queue système** : Considérez une file d'attente (Bull, BullMQ)

### Sécurité

- Stockez `RESEND_API_KEY` en secret (Vercel Secrets)
- Ne jamais exposer la clé API côté client
- Validez toujours les données avant envoi

## Support

- Documentation Resend : [resend.com/docs](https://resend.com/docs)
- React Email : [react.email](https://react.email)
- Support AUTOLOCO : support@autoloco.cm
