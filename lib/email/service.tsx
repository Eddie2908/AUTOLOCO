import { Resend } from "resend"
import { BookingConfirmationEmail } from "./templates/booking-confirmation"
import { BookingCancellationEmail } from "./templates/booking-cancellation"
import { BookingReminderEmail } from "./templates/booking-reminder"

interface EmailServiceConfig {
  apiKey: string
  fromEmail: string
}

interface BookingConfirmationData {
  to: string
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

interface BookingCancellationData {
  to: string
  userName: string
  bookingId: string
  vehicleName: string
  reason?: string
}

interface BookingReminderData {
  to: string
  userName: string
  bookingId: string
  vehicleName: string
  startDate: string
  pickupLocation: string
  ownerName: string
  ownerPhone: string
}

class EmailService {
  private resend: Resend | null = null
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ""
    this.fromEmail = process.env.EMAIL_FROM || "AUTOLOCO <noreply@autoloco.cm>"

    // Initialize Resend only if API key is provided
    if (this.apiKey) {
      this.resend = new Resend(this.apiKey)
    } else if (process.env.NODE_ENV === "development") {
      console.warn("[v0] RESEND_API_KEY not configured. Emails will be simulated in development.")
    }
  }

  async sendBookingConfirmation(data: BookingConfirmationData) {
    try {
      // In development without API key, simulate email sending
      if (!this.resend) {
        console.log("[v0] Simulated email sent to:", data.to)
        console.log("[v0] Email type: Booking Confirmation")
        console.log("[v0] Booking ID:", data.bookingId)
        return {
          success: true,
          message: "Email simulated in development mode",
        }
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Confirmation de réservation ${data.bookingId} - AUTOLOCO`,
        react: BookingConfirmationEmail(data),
      })

      console.log("[v0] Booking confirmation email sent:", result)

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error("[v0] Failed to send booking confirmation email:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }

  async sendBookingCancellation(data: BookingCancellationData) {
    try {
      if (!this.resend) {
        console.log("[v0] Simulated cancellation email sent to:", data.to)
        console.log("[v0] Booking ID:", data.bookingId)
        return {
          success: true,
          message: "Email simulated in development mode",
        }
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Annulation de réservation ${data.bookingId} - AUTOLOCO`,
        react: BookingCancellationEmail(data),
      })

      console.log("[v0] Booking cancellation email sent:", result)

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error("[v0] Failed to send booking cancellation email:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }

  async sendBookingReminder(data: BookingReminderData) {
    try {
      if (!this.resend) {
        console.log("[v0] Simulated reminder email sent to:", data.to)
        console.log("[v0] Booking ID:", data.bookingId)
        return {
          success: true,
          message: "Email simulated in development mode",
        }
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Rappel : Votre location commence demain - AUTOLOCO`,
        react: BookingReminderEmail(data),
      })

      console.log("[v0] Booking reminder email sent:", result)

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error("[v0] Failed to send booking reminder email:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }

  async sendOwnerBookingNotification(data: {
    to: string
    ownerName: string
    bookingId: string
    vehicleName: string
    renterName: string
    startDate: string
    endDate: string
    totalPrice: number
  }) {
    try {
      if (!this.resend) {
        console.log("[v0] Simulated owner notification email sent to:", data.to)
        return {
          success: true,
          message: "Email simulated in development mode",
        }
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Nouvelle réservation pour ${data.vehicleName} - AUTOLOCO`,
        html: `
          <h2>Bonjour ${data.ownerName},</h2>
          <p>Vous avez reçu une nouvelle demande de réservation !</p>
          <p><strong>Réservation :</strong> ${data.bookingId}</p>
          <p><strong>Véhicule :</strong> ${data.vehicleName}</p>
          <p><strong>Locataire :</strong> ${data.renterName}</p>
          <p><strong>Période :</strong> Du ${data.startDate} au ${data.endDate}</p>
          <p><strong>Montant :</strong> ${data.totalPrice.toLocaleString()} FCFA</p>
          <p>Connectez-vous à votre tableau de bord pour accepter ou refuser cette demande.</p>
        `,
      })

      return {
        success: true,
        data: result,
      }
    } catch (error: any) {
      console.error("[v0] Failed to send owner notification email:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }
  }
}

export const emailService = new EmailService()
