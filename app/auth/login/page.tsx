"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TrendingUp, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TradeFlow</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400">Sign in to access your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-[#1a1a24] border-gray-800 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-[#1a1a24] border-gray-800 text-white placeholder:text-gray-500 pr-12 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#12121a] border-l border-gray-800 items-center justify-center p-12">
        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Track your investments</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Access real-time stock prices, monitor your portfolio performance, and make data-driven trading decisions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a24] rounded-xl p-5 border border-gray-800">
              <div className="text-3xl font-bold text-emerald-400">5</div>
              <div className="text-sm text-gray-400 mt-1">Supported Stocks</div>
            </div>
            <div className="bg-[#1a1a24] rounded-xl p-5 border border-gray-800">
              <div className="text-3xl font-bold text-emerald-400">1s</div>
              <div className="text-sm text-gray-400 mt-1">Update Interval</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
