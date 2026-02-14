import { redirect } from "next/navigation"

export default function OwnerProfileRedirect() {
  redirect("/dashboard/profile?type=owner")
}
