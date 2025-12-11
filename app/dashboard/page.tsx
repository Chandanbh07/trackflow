import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch user's subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("stock_ticker")
    .eq("user_id", data.user.id)

  const subscribedTickers = subscriptions?.map((sub) => sub.stock_ticker) || []

  return (
    <DashboardClient userEmail={data.user.email || ""} userId={data.user.id} initialSubscriptions={subscribedTickers} />
  )
}
