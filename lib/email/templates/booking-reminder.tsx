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

interface BookingReminderEmailProps {
  userName: string
  bookingId: string
  vehicleName: string
  startDate: string
  pickupLocation: string
  ownerName: string
  ownerPhone: string
}

export const BookingReminderEmail = ({
  userName = "Client",
  bookingId = "RES-12345",
  vehicleName = "Toyota Corolla 2020",
  startDate = "15 Janvier 2024",
  pickupLocation = "Douala, Akwa",
  ownerName = "Jean Dupont",
  ownerPhone = "+237 6XX XXX XXX",
}: BookingReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre location commence demain - {vehicleName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src="https://autoloco.cm/logo.png" width="160" height="40" alt="AUTOLOCO" style={logo} />
          </Section>

          <Section style={reminderSection}>
            <div style={reminderIcon}>🚗</div>
            <Heading style={heading}>Votre location commence demain !</Heading>
            <Text style={subheading}>Bonjour {userName}, préparez-vous pour votre location.</Text>
          </Section>

          <Section style={bookingReference}>
            <Text style={bookingRefLabel}>Réservation</Text>
            <Text style={bookingRefNumber}>{bookingId}</Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={sectionTitle}>Détails de votre location</Text>

            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>🚗 Véhicule</Text>
                <Text style={detailValue}>{vehicleName}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>📅 Date de début</Text>
                <Text style={detailValue}>{startDate}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>📍 Lieu de prise en charge</Text>
                <Text style={detailValue}>{pickupLocation}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>👤 Propriétaire</Text>
                <Text style={detailValue}>{ownerName}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column>
                <Text style={detailLabel}>📞 Contact</Text>
                <Text style={detailValue}>{ownerPhone}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={checklistSection}>
            <Text style={sectionTitle}>Liste de vérification</Text>
            <div style={checklistItem}>
              <Text style={checklistIcon}>✓</Text>
              <Text style={checklistText}>Carte d'identité nationale (CNI)</Text>
            </div>
            <div style={checklistItem}>
              <Text style={checklistIcon}>✓</Text>
              <Text style={checklistText}>Permis de conduire valide</Text>
            </div>
            <div style={checklistItem}>
              <Text style={checklistIcon}>✓</Text>
              <Text style={checklistText}>Confirmer l'heure avec le propriétaire</Text>
            </div>
            <div style={checklistItem}>
              <Text style={checklistIcon}>✓</Text>
              <Text style={checklistText}>Inspecter le véhicule avant le départ</Text>
            </div>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={`https://autoloco.cm/booking/confirmation/${bookingId}`}>
              Voir ma réservation
            </Button>
          </Section>

          <Section style={supportSection}>
            <Text style={supportText}>
              Besoin d'aide ? Contactez-nous à{" "}
              <Link href="mailto:support@autoloco.cm" style={link}>
                support@autoloco.cm
              </Link>
            </Text>
          </Section>

          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              AUTOLOCO - Location de véhicules au Cameroun
              <br />
              <Link href="https://autoloco.cm" style={link}>
                www.autoloco.cm
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingReminderEmail

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

const reminderSection = {
  padding: "40px 40px 20px",
  textAlign: "center" as const,
}

const reminderIcon = {
  fontSize: "64px",
  margin: "0 auto 20px",
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

const detailsSection = {
  padding: "20px 40px",
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
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 4px",
}

const detailValue = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#1a1a1a",
  margin: "0",
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
}

const checklistSection = {
  padding: "20px 40px",
  backgroundColor: "#f8fafc",
  margin: "0 40px 20px",
  borderRadius: "8px",
}

const checklistItem = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
}

const checklistIcon = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#10b981",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textAlign: "center" as const,
  lineHeight: "24px",
  marginRight: "12px",
  flexShrink: 0,
}

const checklistText = {
  fontSize: "14px",
  color: "#1a1a1a",
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
