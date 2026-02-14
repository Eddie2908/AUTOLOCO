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
  Button,
} from "@react-email/components"

interface BookingCancellationEmailProps {
  userName: string
  bookingId: string
  vehicleName: string
  reason?: string
}

export const BookingCancellationEmail = ({
  userName = "Client",
  bookingId = "RES-12345",
  vehicleName = "Toyota Corolla 2020",
  reason,
}: BookingCancellationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre réservation {bookingId} a été annulée - AUTOLOCO</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src="https://autoloco.cm/logo.png" width="160" height="40" alt="AUTOLOCO" style={logo} />
          </Section>

          <Section style={cancelSection}>
            <div style={cancelIcon}>✕</div>
            <Heading style={heading}>Réservation annulée</Heading>
            <Text style={subheading}>Bonjour {userName}, votre réservation a été annulée.</Text>
          </Section>

          <Section style={bookingReference}>
            <Text style={bookingRefLabel}>Numéro de réservation</Text>
            <Text style={bookingRefNumber}>{bookingId}</Text>
          </Section>

          <Section style={detailsSection}>
            <Text style={vehicleName_}>{vehicleName}</Text>
            {reason && (
              <>
                <Hr style={divider} />
                <Text style={reasonLabel}>Raison de l'annulation :</Text>
                <Text style={reasonText}>{reason}</Text>
              </>
            )}
          </Section>

          <Hr style={divider} />

          <Section style={infoSection}>
            <Text style={infoText}>
              Si vous n'êtes pas à l'origine de cette annulation, veuillez contacter notre support immédiatement.
            </Text>
            <Text style={infoText}>
              Votre remboursement sera traité selon notre politique d'annulation dans un délai de 5 à 7 jours ouvrables.
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href="https://autoloco.cm/vehicles">
              Rechercher d'autres véhicules
            </Button>
          </Section>

          <Section style={supportSection}>
            <Text style={supportText}>
              Besoin d'aide ? Contactez notre support à{" "}
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

export default BookingCancellationEmail

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

const cancelSection = {
  padding: "40px 40px 20px",
  textAlign: "center" as const,
}

const cancelIcon = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#ef4444",
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
  backgroundColor: "#fef2f2",
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
  color: "#ef4444",
  margin: "0",
  letterSpacing: "1px",
}

const detailsSection = {
  padding: "20px 40px",
}

const vehicleName_ = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0",
  color: "#1a1a1a",
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "20px 40px",
}

const reasonLabel = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "16px 0 8px",
}

const reasonText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  lineHeight: "1.6",
}

const infoSection = {
  padding: "20px 40px",
  backgroundColor: "#f8fafc",
  margin: "0 40px",
  borderRadius: "8px",
}

const infoText = {
  fontSize: "14px",
  color: "#64748b",
  margin: "8px 0",
  lineHeight: "1.6",
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
