'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react'

interface OrderItem {
  id: number
  name: string
  quantity: number
}

interface Order {
  id: string | number
  table_id: number
  items: string
  status: 'pending' | 'completed'
  created_at: string
  completed_at: string | null
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // Reduced polling frequency from 3s to 10s to reduce connection usage
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/kitchen/orders')
      const data = await res.json()
      setOrders(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const completeOrder = async (orderId: string | number) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}/complete`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Error completing order:', error)
      alert('Failed to mark order as complete')
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 10) // Show last 10 completed

  const parseItems = (itemsJson: string): OrderItem[] => {
    try {
      return JSON.parse(itemsJson)
    } catch {
      return []
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-4xl mb-2">🍖 Kitchen Dashboard</CardTitle>
                <CardDescription>Manage incoming orders</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Auto-refreshing every 3 seconds
            </div>
          </CardHeader>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading orders...
            </CardContent>
          </Card>
        )}

        {/* Pending Orders */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Pending Orders ({pendingOrders.length})
          </h2>
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingOrders.map(order => {
                const items = parseItems(order.items)
                return (
                  <Card key={order.id} className="border-l-4 border-l-destructive">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Table {order.table_id}</CardTitle>
                          <CardDescription>
                            Order #{order.id} • {formatTime(order.created_at)}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => completeOrder(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name}</span>
                            <span className="font-medium">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Recent Completed Orders
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {completedOrders.map(order => {
                const items = parseItems(order.items)
                return (
                  <Card key={order.id} className="border-l-4 border-l-green-500 opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Table {order.table_id}</CardTitle>
                          <CardDescription className="text-xs">
                            Completed at {formatTime(order.completed_at || order.created_at)}
                          </CardDescription>
                        </div>
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                            <span>{item.name}</span>
                            <span>×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
