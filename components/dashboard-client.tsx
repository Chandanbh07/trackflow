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
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

const AVAILABLE_STOCKS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"]

const STOCK_INFO: Record<string, { name: string; color: string; sector: string }> = {
  GOOG: { name: "Alphabet Inc.", color: "#6B7280", sector: "Technology" },
  TSLA: { name: "Tesla Inc.", color: "#6B7280", sector: "Automotive" },
  AMZN: { name: "Amazon.com Inc.", color: "#6B7280", sector: "E-Commerce" },
  META: { name: "Meta Platforms", color: "#6B7280", sector: "Technology" },
  NVDA: { name: "NVIDIA Corp.", color: "#6B7280", sector: "Semiconductors" },
}

const BASE_PRICES: Record<string, number> = {
  GOOG: 141.8,
  TSLA: 248.5,
  AMZN: 186.4,
  META: 505.75,
  NVDA: 467.3,
}

interface Notification {
  id: string
  type: "price_alert" | "portfolio" | "system"
  title: string
  message: string
  time: Date
  read: boolean
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
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()
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

  // Generate notifications based on stock movements
  useEffect(() => {
    if (subscriptions.length > 0) {
      // Add welcome notification
      setNotifications([
        {
          id: "welcome",
          type: "system",
          title: "Welcome to TradeFlow",
          message: "Your dashboard is ready. Start tracking your stocks!",
          time: new Date(),
          read: false,
        },
      ])
    }
  }, [])

  // Update stock prices every second and generate alerts
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
            const totalChangePercent = ((newPrice - currentStock.previousClose) / currentStock.previousClose) * 100

            // Generate notification for significant price movements (>3%)
            if (Math.abs(totalChangePercent) > 3 && Math.random() > 0.95) {
              const isUp = totalChangePercent > 0
              setNotifications((prev) => [
                {
                  id: `${ticker}-${Date.now()}`,
                  type: "price_alert",
                  title: `${ticker} Price Alert`,
                  message: `${ticker} is ${isUp ? "up" : "down"} ${Math.abs(totalChangePercent).toFixed(2)}% today`,
                  time: new Date(),
                  read: false,
                },
                ...prev.slice(0, 9), // Keep only last 10 notifications
              ])
            }

            newPrices.set(ticker, {
              ...currentStock,
              price: newPrice,
              change: newPrice - currentStock.previousClose,
              changePercent: totalChangePercent,
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

  const handleAddStock = async (ticker: string) => {
    if (!ticker || subscriptions.includes(ticker)) return

    try {
      const { error } = await supabase.from("subscriptions").insert({ user_id: userId, stock_ticker: ticker })
      if (error) throw error

      setSubscriptions((prev) => [...prev, ticker])
      setStockPrices((prev) => new Map(prev).set(ticker, initializeStock(ticker)))

      // Add notification for new stock
      setNotifications((prev) => [
        {
          id: `add-${ticker}-${Date.now()}`,
          type: "portfolio",
          title: "Stock Added",
          message: `${ticker} has been added to your portfolio`,
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 9),
      ])
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

      // Add notification for removed stock
      setNotifications((prev) => [
        {
          id: `remove-${ticker}-${Date.now()}`,
          type: "portfolio",
          title: "Stock Removed",
          message: `${ticker} has been removed from your portfolio`,
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 9),
      ])
    } catch (error) {
      console.error("Error unsubscribing from stock:", error)
    }
  }

  const handleAddShares = (ticker: string) => {
    setStockPrices((prev) => {
      const newPrices = new Map(prev)
      const stock = prev.get(ticker)
      if (stock) {
        newPrices.set(ticker, { ...stock, shares: stock.shares + 1 })
      }
      return newPrices
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Calculate portfolio metrics
  const portfolioValue = useMemo(() => {
    let total = 0
    stockPrices.forEach((stock) => {
      total += stock.price * stock.shares
    })
    return total
  }, [stockPrices])

  const totalPnL = useMemo(() => {
    let pnl = 0
    stockPrices.forEach((stock) => {
      pnl += stock.change * stock.shares
    })
    return pnl
  }, [stockPrices])

  const totalReturn = useMemo(() => {
    let initialValue = 0
    stockPrices.forEach((stock) => {
      initialValue += stock.previousClose * stock.shares
    })
    return initialValue > 0 ? (totalPnL / initialValue) * 100 : 0
  }, [stockPrices, totalPnL])

  // Filter stocks based on search query
  const filteredStocks = useMemo(() => {
    if (!searchQuery) return Array.from(stockPrices.values())
    const query = searchQuery.toLowerCase()
    return Array.from(stockPrices.values()).filter(
      (stock) =>
        stock.ticker.toLowerCase().includes(query) ||
        STOCK_INFO[stock.ticker]?.name.toLowerCase().includes(query) ||
        STOCK_INFO[stock.ticker]?.sector.toLowerCase().includes(query),
    )
  }, [stockPrices, searchQuery])

  const availableToSubscribe = AVAILABLE_STOCKS.filter((ticker) => !subscriptions.includes(ticker))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">TradeFlow</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "portfolio", label: "Portfolio", icon: Briefcase },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">{userEmail[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              <p className="text-xs text-gray-500">Trader</p>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 bg-gray-50 border-gray-200 text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-blue-600 rounded-full" />
                  )}
                </Button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                              !notif.read ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  notif.type === "alert"
                                    ? "bg-red-100"
                                    : notif.type === "portfolio"
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                }`}
                              >
                                {notif.type === "alert" && <TrendingUp className="h-4 w-4 text-red-600" />}
                                {notif.type === "portfolio" && <Briefcase className="h-4 w-4 text-blue-600" />}
                                {notif.type === "system" && <Bell className="h-4 w-4 text-gray-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatTime(notif.time)}</p>
                              </div>
                              {!notif.read && <div className="h-2 w-2 bg-blue-600 rounded-full" />}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Portfolio Value</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(portfolioValue)}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Today's P&L</p>
                        <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {totalPnL >= 0 ? "+" : ""}
                          {formatCurrency(totalPnL)}
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          totalPnL >= 0 ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        {totalPnL >= 0 ? (
                          <ArrowUpRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Return</p>
                        <p
                          className={`text-2xl font-bold mt-1 ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {totalReturn >= 0 ? "+" : ""}
                          {totalReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          totalReturn >= 0 ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <PieChart className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Your Stocks</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Your Stocks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Your Stocks</h2>
                  {searchQuery && (
                    <p className="text-sm text-gray-500">
                      Showing {filteredStocks.length} of {subscriptions.length} stocks
                    </p>
                  )}
                </div>

                {filteredStocks.length === 0 && subscriptions.length > 0 ? (
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-8 text-center">
                      <Search className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No stocks match your search "{searchQuery}"</p>
                      <Button variant="link" className="text-blue-600 mt-2" onClick={() => setSearchQuery("")}>
                        Clear search
                      </Button>
                    </CardContent>
                  </Card>
                ) : subscriptions.length === 0 ? (
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-8 text-center">
                      <Briefcase className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">Your portfolio is empty. Add stocks to get started!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStocks.map((stock) => (
                      <Card key={stock.ticker} className="bg-white border border-gray-200 overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: STOCK_INFO[stock.ticker]?.color || "#666" }}
                              >
                                {stock.ticker.substring(0, 2)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{stock.ticker}</h3>
                                <p className="text-xs text-gray-500">{STOCK_INFO[stock.ticker]?.name}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleUnsubscribe(stock.ticker)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.price)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {stock.changePercent >= 0 ? (
                                  <Badge className="bg-green-50 text-green-600 hover:bg-green-100">
                                    <TrendingUp className="h-3 w-3 mr-1" />+{stock.changePercent.toFixed(2)}%
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-50 text-red-600 hover:bg-red-100">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    {stock.changePercent.toFixed(2)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Shares</p>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-gray-900">{stock.shares}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-green-600 hover:bg-green-50"
                                  onClick={() => handleAddShares(stock.ticker)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">High</p>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(stock.high)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Low</p>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(stock.low)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Value</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(stock.price * stock.shares)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Add to Portfolio */}
              {availableToSubscribe.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Add to Portfolio</h2>
                  <div className="space-y-2">
                    {availableToSubscribe.map((ticker) => (
                      <div
                        key={ticker}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: STOCK_INFO[ticker]?.color || "#666" }}
                          >
                            {ticker.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{ticker}</span>
                            <p className="text-xs text-gray-500">{STOCK_INFO[ticker]?.name}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAddStock(ticker)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No holdings yet. Add stocks from the dashboard.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Stock</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Shares</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Value</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">P&L</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from(stockPrices.values()).map((stock) => (
                            <tr key={stock.ticker} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                                    style={{ backgroundColor: STOCK_INFO[stock.ticker]?.color || "#666" }}
                                  >
                                    {stock.ticker.substring(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{stock.ticker}</p>
                                    <p className="text-xs text-gray-500">{STOCK_INFO[stock.ticker]?.name}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">
                                {formatCurrency(stock.price)}
                              </td>
                              <td className="py-4 px-4 text-right text-gray-900">{stock.shares}</td>
                              <td className="py-4 px-4 text-right font-medium text-gray-900">
                                {formatCurrency(stock.price * stock.shares)}
                              </td>
                              <td
                                className={`py-4 px-4 text-right font-medium ${
                                  stock.change * stock.shares >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {stock.change * stock.shares >= 0 ? "+" : ""}
                                {formatCurrency(stock.change * stock.shares)}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Badge
                                  className={`${
                                    stock.changePercent >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {stock.changePercent >= 0 ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-900 mt-1">{userEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">User ID</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm">{userId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Subscribed Stocks</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subscriptions.length > 0 ? (
                        subscriptions.map((ticker) => (
                          <Badge key={ticker} className="bg-blue-50 text-blue-600">
                            {ticker}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No stocks subscribed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">Price Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when stocks move significantly</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900">Portfolio Updates</p>
                      <p className="text-sm text-gray-500">Notifications when you add or remove stocks</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 border-red-50">
                <CardHeader>
                  <CardTitle className="text-gray-900">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
