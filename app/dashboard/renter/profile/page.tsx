import { redirect } from "next/navigation"

export default function RenterProfileRedirect() {
  redirect("/dashboard/profile?type=renter")
}
