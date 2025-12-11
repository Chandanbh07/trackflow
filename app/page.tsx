import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BarChart3, Shield, Zap, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TradeFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
              Features
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-sm text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Real-time stock tracking
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Track stocks in
              <span className="text-emerald-400"> real-time</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              Monitor your favorite stocks with live price updates every second. Build your portfolio and track your
              performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8" asChild>
                <Link href="/auth/sign-up">
                  Start Tracking
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#12121a]/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-gray-400">Professional stock tracking tools for everyone.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "1-Second Updates",
                description: "Stock prices refresh every second with simulated real-time market data.",
              },
              {
                icon: BarChart3,
                title: "Portfolio Tracking",
                description: "Track your P&L, view holdings, and monitor your overall performance.",
              },
              {
                icon: Users,
                title: "Multi-User Support",
                description: "Multiple users can track different stocks with independent dashboards.",
              },
              {
                icon: Shield,
                title: "Secure Auth",
                description: "Email-based authentication with Supabase for secure access.",
              },
              {
                icon: TrendingUp,
                title: "Live P&L",
                description: "See your profit and loss update in real-time as prices change.",
              },
              {
                icon: BarChart3,
                title: "Custom Portfolio",
                description: "Subscribe to any of the 5 supported stocks to build your portfolio.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#12121a] border border-gray-800 rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-gray-800 rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start tracking?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Create a free account and start monitoring your favorite stocks in real-time.
            </p>
            <Button size="lg" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8" asChild>
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">TradeFlow</span>
            </div>
            <p className="text-sm text-gray-500">Stock broker client dashboard demo</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
