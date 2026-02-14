import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
} from "@react-email/components"

interface BookingConfirmationEmailProps {
  userName: string
  bookingId: string
  vehicleName: string
  vehicleImage: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalPrice: number
  ownerName: string
  ownerPhone: string
  bookingUrl: string
}

export const BookingConfirmationEmail = ({
  userName = "Client",
  bookingId = "RES-12345",
  vehicleName = "Toyota Corolla 2020",
  vehicleImage = "/placeholder.svg",
  startDate = "15 Janvier 2024",
  endDate = "18 Janvier 2024",
  pickupLocation = "Douala, Akwa",
  totalPrice = 75000,
  ownerName = "Jean Dupont",
  ownerPhone = "+237 6XX XXX XXX",
  bookingUrl = "https://autoloco.cm/booking/RES-12345",
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre réservation {bookingId} a été confirmée - AUTOLOCO</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img src="https://autoloco.cm/logo.png" width="160" height="40" alt="AUTOLOCO" style={logo} />
          </Section>

          {/* Success Icon */}
          <Section style={successSection}>
            <div style={successIcon}>✓</div>
            <Heading style={heading}>Réservation confirmée !</Heading>
            <Text style={subheading}>Bonjour {userName}, votre réservation a été confirmée avec succès.</Text>
          </Section>

          {/* Booking Reference */}
          <Section style={bookingReference}>
            <Text style={bookingRefLabel}>Numéro de réservation</Text>
            <Text style={bookingRefNumber}>{bookingId}</Text>
          </Section>

          {/* Vehicle Details */}
          <Section style={vehicleSection}>
            <Row>
              <Column style={{ width: "40%" }}>
                <Img src={vehicleImage} width="150" height="100" alt={vehicleName} style={vehicleImage_} />
              </Column>
              <Column style={{ width: "60%", paddingLeft: "20px" }}>
                <Text style={vehicleName_}>{vehicleName}</Text>
                <Text style={priceText}>{totalPrice.toLocaleString()} FCFA</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Booking Details */}
          <Section style={detailsSection}>
            <Text style={sectionTitle}>Détails de votre réservation</Text>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={detailLabelText}>📅 Période</Text>
              </Column>
              <Column>
                <Text style={detailValue}>
                  Du {startDate} au {endDate}
                </Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={detailLabelText}>📍 Lieu de prise en charge</Text>
              </Column>
              <Column>
                <Text style={detailValue}>{pickupLocation}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={detailLabelText}>👤 Propriétaire</Text>
              </Column>
              <Column>
                <Text style={detailValue}>{ownerName}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabel}>
                <Text style={detailLabelText}>📞 Contact</Text>
              </Column>
              <Column>
                <Text style={detailValue}>{ownerPhone}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Next Steps */}
          <Section style={nextStepsSection}>
            <Text style={sectionTitle}>Prochaines étapes</Text>

            <div style={stepItem}>
              <Text style={stepNumber}>1</Text>
              <div>
                <Text style={stepTitle}>Contactez le propriétaire</Text>
                <Text style={stepDescription}>Confirmez l'heure et le lieu de rendez-vous</Text>
              </div>
            </div>

            <div style={stepItem}>
              <Text style={stepNumber}>2</Text>
              <div>
                <Text style={stepTitle}>Préparez vos documents</Text>
                <Text style={stepDescription}>CNI et permis de conduire valide requis</Text>
              </div>
            </div>

            <div style={stepItem}>
              <Text style={stepNumber}>3</Text>
              <div>
                <Text style={stepTitle}>Jour de la location</Text>
                <Text style={stepDescription}>Présentez-vous à l'heure convenue</Text>
              </div>
            </div>
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={bookingUrl}>
              Voir ma réservation
            </Button>
          </Section>

          {/* Support Info */}
          <Section style={supportSection}>
            <Text style={supportText}>
              Besoin d'aide ? Contactez notre support à{" "}
              <Link href="mailto:support@autoloco.cm" style={link}>
                support@autoloco.cm
              </Link>{" "}
              ou au{" "}
              <Link href="tel:+237123456789" style={link}>
                +237 123 456 789
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              AUTOLOCO - Location de véhicules au Cameroun
              <br />
              Douala, Cameroun
              <br />
              <Link href="https://autoloco.cm" style={link}>
                www.autoloco.cm
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href="https://autoloco.cm/terms" style={link}>
                Conditions d'utilisation
              </Link>{" "}
              •{" "}
              <Link href="https://autoloco.cm/privacy" style={link}>
                Politique de confidentialité
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingConfirmationEmail

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  maxWidth: "600px",
}

const header = {
  padding: "20px 40px",
  textAlign: "center" as const,
}

const logo = {
  margin: "0 auto",
}

const successSection = {
  padding: "40px 40px 20px",
  textAlign: "center" as const,
}

const successIcon = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#10b981",
  color: "#ffffff",
  fontSize: "48px",
  lineHeight: "80px",
  margin: "0 auto 20px",
  fontWeight: "bold",
}

const heading = {
  fontSize: "32px",
  fontWeight: "bold",
  margin: "16px 0",
  color: "#1a1a1a",
}

const subheading = {
  fontSize: "16px",
  color: "#64748b",
  margin: "0",
}

const bookingReference = {
  padding: "20px 40px",
  textAlign: "center" as const,
  backgroundColor: "#f8fafc",
  margin: "20px 40px",
  borderRadius: "8px",
}

const bookingRefLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 8px",
}

const bookingRefNumber = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#059669",
  margin: "0",
  letterSpacing: "1px",
}

const vehicleSection = {
  padding: "20px 40px",
}

const vehicleImage_ = {
  borderRadius: "8px",
  objectFit: "cover" as const,
}

const vehicleName_ = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
  color: "#1a1a1a",
}

const priceText = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#059669",
  margin: "0",
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 40px",
}

const detailsSection = {
  padding: "0 40px",
}

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 20px",
  color: "#1a1a1a",
}

const detailRow = {
  marginBottom: "16px",
}

const detailLabel = {
  width: "40%",
  verticalAlign: "top" as const,
}

const detailLabelText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
}

const detailValue = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#1a1a1a",
  margin: "0",
}

const nextStepsSection = {
  padding: "20px 40px",
}

const stepItem = {
  display: "flex",
  marginBottom: "20px",
  alignItems: "flex-start",
}

const stepNumber = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#059669",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center" as const,
  lineHeight: "32px",
  marginRight: "16px",
  flexShrink: 0,
}

const stepTitle = {
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 4px",
  color: "#1a1a1a",
}

const stepDescription = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
}

const buttonSection = {
  padding: "30px 40px",
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#059669",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
}

const supportSection = {
  padding: "20px 40px",
  textAlign: "center" as const,
  backgroundColor: "#f8fafc",
  margin: "0 40px",
  borderRadius: "8px",
}

const supportText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  lineHeight: "1.6",
}

const link = {
  color: "#059669",
  textDecoration: "none",
  fontWeight: "500",
}

const footer = {
  padding: "20px 40px",
  textAlign: "center" as const,
}

const footerText = {
  fontSize: "12px",
  color: "#94a3b8",
  margin: "8px 0",
  lineHeight: "1.6",
}
