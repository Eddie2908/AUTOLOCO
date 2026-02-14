import { NextResponse } from "next/server"
import { backendApi } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendApi.getPaymentMethods()

    if (response.error) {
      // Return default methods if backend unavailable
      return NextResponse.json([
        { id: "mobile_money_mtn", name: "MTN Mobile Money", icon: "/mtn-logo.png", available: true },
        { id: "mobile_money_orange", name: "Orange Money", icon: "/orange-logo.png", available: true },
        { id: "carte_bancaire", name: "Carte Bancaire", icon: "/visa-mastercard.png", available: true },
      ])
    }

    return NextResponse.json(response.data)
  } catch (error) {
    console.error("[API] Payment methods fetch error:", error)
    return NextResponse.json([
      { id: "mobile_money_mtn", name: "MTN Mobile Money", icon: "/mtn-logo.png", available: true },
      { id: "mobile_money_orange", name: "Orange Money", icon: "/orange-logo.png", available: true },
      { id: "carte_bancaire", name: "Carte Bancaire", icon: "/visa-mastercard.png", available: true },
    ])
  }
}
