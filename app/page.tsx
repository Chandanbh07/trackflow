import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Shield, Zap, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">TradeFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Track stocks in real-time
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Monitor your favorite stocks with live price updates every second. Build your portfolio and track your
              performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Real-time Updates",
                description: "Live price tracking",
              },
              {
                icon: Users,
                title: "Multi-user Support",
                description: "Collaborative platform",
              },
              {
                icon: Shield,
                title: "Secure Authentication",
                description: "Protected accounts",
              },
              {
                icon: BarChart3,
                title: "Portfolio Tracking",
                description: "Monitor performance",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-8 border border-gray-200 text-center">
                <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">TradeFlow</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
