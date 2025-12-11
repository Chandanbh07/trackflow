"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  LogOut,
  Plus,
  X,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  Search,
  Briefcase,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const AVAILABLE_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"]

const STOCK_INFO: Record<string, { name: string; color: string; sector: string }> = {
  GOOG: { name: "Alphabet Inc.", color: "#4285F4", sector: "Technology" },
  TSLA: { name: "Tesla Inc.", color: "#CC0000", sector: "Automotive" },
  AMZN: { name: "Amazon.com Inc.", color: "#FF9900", sector: "E-Commerce" },
  META: { name: "Meta Platforms", color: "#1877F2", sector: "Technology" },
  NVDA: { name: "NVIDIA Corp.", color: "#76B900", sector: "Semiconductors" },
}

const BASE_PRICES: Record<string, number> = {
  GOOG: 141.8,
  TSLA: 248.5,
  AMZN: 186.4,
  META: 505.75,
  NVDA: 467.3,
}

interface StockPrice {
  ticker: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  high: number
  low: number
  volume: number
  shares: number
}

interface DashboardClientProps {
  userEmail: string
  userId: string
  initialSubscriptions: string[]
}

export default function DashboardClient({ userEmail, userId, initialSubscriptions }: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState<string[]>(initialSubscriptions)
  const [stockPrices, setStockPrices] = useState<Map<string, StockPrice>>(new Map())
  const [selectedStock, setSelectedStock] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Initialize stock prices
  const initializeStock = useCallback((ticker: string): StockPrice => {
    const basePrice = BASE_PRICES[ticker] || 100
    const shares = Math.floor(Math.random() * 20) + 5
    return {
      ticker,
      price: basePrice,
      change: 0,
      changePercent: 0,
      previousClose: basePrice,
      high: basePrice,
      low: basePrice,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      shares,
    }
  }, [])

  useEffect(() => {
    const initialPrices = new Map<string, StockPrice>()
    subscriptions.forEach((ticker) => {
      initialPrices.set(ticker, initializeStock(ticker))
    })
    setStockPrices(initialPrices)
  }, [subscriptions, initializeStock])

  // Update stock prices every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStockPrices((prevPrices) => {
        const newPrices = new Map(prevPrices)

        subscriptions.forEach((ticker) => {
          const currentStock = prevPrices.get(ticker)
          if (currentStock) {
            const changePercent = (Math.random() - 0.5) * 2
            const priceChange = currentStock.price * (changePercent / 100)
            const newPrice = Math.max(1, currentStock.price + priceChange)

            newPrices.set(ticker, {
              ...currentStock,
              price: newPrice,
              change: newPrice - currentStock.previousClose,
              changePercent: ((newPrice - currentStock.previousClose) / currentStock.previousClose) * 100,
              high: Math.max(currentStock.high, newPrice),
              low: Math.min(currentStock.low, newPrice),
              volume: currentStock.volume + Math.floor(Math.random() * 10000),
            })
          }
        })

        return newPrices
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [subscriptions])

  const handleSubscribe = async () => {
    if (!selectedStock || subscriptions.includes(selectedStock)) return

    try {
      const { error } = await supabase.from("subscriptions").insert({ user_id: userId, stock_ticker: selectedStock })
      if (error) throw error

      setSubscriptions((prev) => [...prev, selectedStock])
      setStockPrices((prev) => new Map(prev).set(selectedStock, initializeStock(selectedStock)))
      setSelectedStock("")
    } catch (error) {
      console.error("Error subscribing to stock:", error)
    }
  }

  const handleUnsubscribe = async (ticker: string) => {
    try {
      const { error } = await supabase.from("subscriptions").delete().eq("user_id", userId).eq("stock_ticker", ticker)
      if (error) throw error

      setSubscriptions((prev) => prev.filter((t) => t !== ticker))
      setStockPrices((prev) => {
        const newPrices = new Map(prev)
        newPrices.delete(ticker)
        return newPrices
      })
    } catch (error) {
      console.error("Error unsubscribing from stock:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const availableToSubscribe = AVAILABLE_STOCKS.filter((stock) => !subscriptions.includes(stock))

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    let totalValue = 0
    let totalCost = 0
    let totalChange = 0

    stockPrices.forEach((stock) => {
      totalValue += stock.price * stock.shares
      totalCost += stock.previousClose * stock.shares
    })

    totalChange = totalValue - totalCost
    const changePercent = totalCost > 0 ? (totalChange / totalCost) * 100 : 0

    return {
      totalValue,
      totalCost,
      totalChange,
      changePercent,
      stockCount: subscriptions.length,
    }
  }, [stockPrices, subscriptions.length])

  const filteredStocks = subscriptions.filter(
    (ticker) =>
      ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      STOCK_INFO[ticker]?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "portfolio", label: "Portfolio", icon: Briefcase },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#12121a] border-r border-gray-800 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TradeFlow</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userEmail}</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div className="lg:hidden flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <h1 className="text-xl font-semibold text-white capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 h-10 bg-[#1a1a24] border-gray-800 text-white placeholder:text-gray-500"
                />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="lg:hidden text-gray-400" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Portfolio Value</p>
                        <p className="text-2xl font-bold text-white">
                          $
                          {portfolioMetrics.totalValue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Today&apos;s P&L</p>
                        <p
                          className={`text-2xl font-bold ${portfolioMetrics.totalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {portfolioMetrics.totalChange >= 0 ? "+" : ""}$
                          {portfolioMetrics.totalChange.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${portfolioMetrics.totalChange >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}
                      >
                        {portfolioMetrics.totalChange >= 0 ? (
                          <ArrowUpRight className="h-6 w-6 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-red-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Return %</p>
                        <p
                          className={`text-2xl font-bold ${portfolioMetrics.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {portfolioMetrics.changePercent >= 0 ? "+" : ""}
                          {portfolioMetrics.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">Watchlist</p>
                        <p className="text-2xl font-bold text-white">{portfolioMetrics.stockCount} Stocks</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center">
                        <PieChart className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Stock Section */}
              <Card className="bg-[#12121a] border-gray-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base text-white">Add to Watchlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Select value={selectedStock} onValueChange={setSelectedStock}>
                      <SelectTrigger className="flex-1 bg-[#1a1a24] border-gray-800 text-white">
                        <SelectValue placeholder="Select a stock to track" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a24] border-gray-800">
                        {availableToSubscribe.length === 0 ? (
                          <SelectItem value="none" disabled className="text-gray-400">
                            All stocks added
                          </SelectItem>
                        ) : (
                          availableToSubscribe.map((stock) => (
                            <SelectItem key={stock} value={stock} className="text-white">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{stock}</span>
                                <span className="text-gray-400">- {STOCK_INFO[stock]?.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleSubscribe}
                      disabled={!selectedStock}
                      className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Stock
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Cards */}
              {filteredStocks.length === 0 ? (
                <Card className="bg-[#12121a] border-gray-800 py-16">
                  <CardContent className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No stocks in watchlist</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto">
                      Add stocks to your watchlist to start tracking real-time prices.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredStocks.map((ticker) => {
                    const stock = stockPrices.get(ticker)
                    if (!stock) return null

                    const isPositive = stock.change >= 0
                    const stockInfo = STOCK_INFO[ticker]

                    return (
                      <Card
                        key={ticker}
                        className="bg-[#12121a] border-gray-800 hover:border-emerald-500/30 transition-colors"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-white">{ticker}</span>
                                <Badge
                                  className={`gap-1 text-xs ${isPositive ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/20 text-red-400 hover:bg-red-500/20"}`}
                                >
                                  {isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {isPositive ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">{stockInfo?.name}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleUnsubscribe(ticker)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-3xl font-bold text-white">${stock.price.toFixed(2)}</p>
                            <p className={`text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                              {isPositive ? "+" : ""}
                              {stock.change.toFixed(2)} today
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-800">
                            <div>
                              <p className="text-xs text-gray-500">High</p>
                              <p className="text-sm font-medium text-white">${stock.high.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Low</p>
                              <p className="text-sm font-medium text-white">${stock.low.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Shares</p>
                              <p className="text-sm font-medium text-white">{stock.shares}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <Card className="bg-[#12121a] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No holdings yet. Add stocks from the dashboard.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Stock</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Price</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Shares</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Value</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P&L</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptions.map((ticker) => {
                            const stock = stockPrices.get(ticker)
                            if (!stock) return null
                            const isPositive = stock.change >= 0
                            const value = stock.price * stock.shares
                            const pnl = stock.change * stock.shares

                            return (
                              <tr key={ticker} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                <td className="py-4 px-4">
                                  <div>
                                    <p className="font-medium text-white">{ticker}</p>
                                    <p className="text-sm text-gray-500">{STOCK_INFO[ticker]?.name}</p>
                                  </div>
                                </td>
                                <td className="text-right py-4 px-4 text-white font-medium">
                                  ${stock.price.toFixed(2)}
                                </td>
                                <td className="text-right py-4 px-4 text-gray-300">{stock.shares}</td>
                                <td className="text-right py-4 px-4 text-white font-medium">${value.toFixed(2)}</td>
                                <td
                                  className={`text-right py-4 px-4 font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                                >
                                  {isPositive ? "+" : ""}${pnl.toFixed(2)}
                                </td>
                                <td
                                  className={`text-right py-4 px-4 font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                                >
                                  {isPositive ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-800/30">
                            <td className="py-4 px-4 font-semibold text-white">Total</td>
                            <td className="py-4 px-4"></td>
                            <td className="py-4 px-4"></td>
                            <td className="text-right py-4 px-4 font-bold text-white">
                              ${portfolioMetrics.totalValue.toFixed(2)}
                            </td>
                            <td
                              className={`text-right py-4 px-4 font-bold ${portfolioMetrics.totalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {portfolioMetrics.totalChange >= 0 ? "+" : ""}${portfolioMetrics.totalChange.toFixed(2)}
                            </td>
                            <td
                              className={`text-right py-4 px-4 font-bold ${portfolioMetrics.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {portfolioMetrics.changePercent >= 0 ? "+" : ""}
                              {portfolioMetrics.changePercent.toFixed(2)}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <Card className="bg-[#12121a] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-400">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white">{userEmail}</p>
                      <p className="text-sm text-gray-400">Free Plan</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-800">
                    <div>
                      <label className="text-sm text-gray-400">Email Address</label>
                      <Input value={userEmail} disabled className="mt-2 bg-[#1a1a24] border-gray-800 text-white" />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">User ID</label>
                      <Input
                        value={userId}
                        disabled
                        className="mt-2 bg-[#1a1a24] border-gray-800 text-gray-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-sm font-medium text-white mb-4">Subscribed Stocks</h3>
                    <div className="flex flex-wrap gap-2">
                      {subscriptions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No subscriptions</p>
                      ) : (
                        subscriptions.map((ticker) => (
                          <Badge key={ticker} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">
                            {ticker}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800">
                    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
