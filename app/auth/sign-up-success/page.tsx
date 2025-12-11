import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TradeFlow</span>
        </Link>

        <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Account created!</h1>
            <p className="text-gray-400">
              Your account has been successfully created. You can now sign in to access your dashboard.
            </p>
          </div>

          <Button asChild className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium">
            <Link href="/auth/login">Sign in to your account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
