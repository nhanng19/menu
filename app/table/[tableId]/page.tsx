'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Clock, Plus, Minus, ShoppingCart, X, Star } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getTableIdFromCode } from '@/lib/tableMapping'

interface MenuItem {
  id: string | number
  name: string
  description?: string
  price?: number
  category?: string
  image?: string
}

interface OrderItem {
  id: string | number
  name: string
  quantity: number
  image?: string
}

interface OrderHistory {
  id: number
  table_id: number
  items: string
  status: 'pending' | 'completed'
  created_at: string
  completed_at: string | null
}

export default function TablePage() {
  const params = useParams()
  const tableParam = params.tableId as string
  
  // Only accept valid UUID codes - no numeric IDs allowed
  const tableId = getTableIdFromCode(tableParam)
  
  // If code is invalid, show error
  if (tableId === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Invalid Table Code</h1>
          <p className="text-muted-foreground">The table code you provided is invalid.</p>
          <p className="text-sm text-muted-foreground mt-2">Please scan a valid QR code to access your table.</p>
        </div>
      </div>
    )
  }

  const { toast } = useToast()

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [canOrder, setCanOrder] = useState(true)
  const [cooldownMinutes, setCooldownMinutes] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [activeTab, setActiveTab] = useState('menu')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showReviewSheet, setShowReviewSheet] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewData, setReviewData] = useState({
    customer_name: '',
    server_name: '',
    rating: 5,
    comment: '',
  })

  const SERVER_NAMES = ['Linh', 'Nhan', 'Ben', 'Tin', 'Samantha', 'Brandon', 'Corey']

  useEffect(() => {
    // Fetch menu items
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu')
        const data = await res.json()
        // Ensure data is an array
        if (Array.isArray(data)) {
          setMenuItems(data)
        } else {
          console.error('Menu data is not an array:', data)
          setMenuItems([])
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error)
        setMenuItems([])
      }
    }

    fetchMenu()
    
    // Check order status on page load
    checkOrderStatus()
  }, [tableId])

  // Poll for cooldown status every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(checkOrderStatus, 10000)
    return () => clearInterval(pollInterval)
  }, [tableId])

  useEffect(() => {
    fetchOrderHistory()
  }, [tableId])

  const fetchOrderHistory = async () => {
    try {
      const res = await fetch(`/api/table/${tableId}/history`)
      const data = await res.json()
      setOrderHistory(data)
    } catch (error) {
      console.error('Error fetching order history:', error)
    }
  }

  const checkOrderStatus = async () => {
    const res = await fetch(`/api/table/${tableId}/status`)
    const data = await res.json()
    setCanOrder(data.canOrder)
    setCooldownMinutes(data.cooldownMinutes)
  }

  const addToCart = (item: MenuItem) => {
    const currentTotal = cart.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)
    if (currentTotal >= 10) {
      toast({
        variant: "default",
        title: "Maximum Items Reached",
        description: "You can only add up to 10 items per order.",
      })
      return
    }

    const existingItem = cart.find((c: OrderItem) => c.id === item.id)
    if (existingItem) {
      setCart(cart.map((c: OrderItem) => 
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ))
    } else {
      setCart([...cart, { id: item.id, name: item.name, quantity: 1, image: item.image }])
    }
  }

  const removeFromCart = (itemId: string | number) => {
    setCart(cart.filter((c: OrderItem) => c.id !== itemId))
  }

  const updateQuantity = (itemId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map((c: OrderItem) => 
        c.id === itemId ? { ...c, quantity } : c
      ))
    }
  }

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast({
        variant: "default",
        title: "Empty Cart",
        description: "Please add items to your order!",
      })
      return
    }

    if (!canOrder) {
      toast({
        variant: "warning",
        title: "Please Wait",
        description: `Please wait ${cooldownMinutes} more minute(s) before ordering again.`,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/table/${tableId}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })

      if (res.ok) {
        toast({
          variant: "success",
          title: "Order Submitted!",
          description: "Your order has been sent to the kitchen. 🎉",
        })
        setCart([])
        setShowCart(false)
        fetchOrderHistory()
        setTimeout(() => {
          checkOrderStatus()
        }, 1000)
      } else {
        const data = await res.json()
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: data.error || 'Failed to submit order',
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Error submitting order. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewData.customer_name.trim() || !reviewData.server_name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      })
      return
    }

    setIsSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          table_id: tableId,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit review')

      toast({
        title: 'Success',
        description: 'Thank you for your review! 🙏',
      })

      setReviewData({
        customer_name: '',
        server_name: '',
        rating: 5,
        comment: '',
      })
      setShowReviewSheet(false)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const totalItems = cart.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)
  const groupedMenu = Array.isArray(menuItems) 
    ? menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
        if (!acc[item.category || 'Other']) {
          acc[item.category || 'Other'] = []
        }
        acc[item.category || 'Other'].push(item)
        return acc
      }, {})
    : {}

  // Get categories for tabs - filter menu based on selected category
  const filteredMenu = activeCategory === 'all' 
    ? groupedMenu 
    : activeCategory === 'Sides'
    ? { 'Side': groupedMenu['Side'] || [] }  // Map "Sides" tab to "Side" category in DB
    : { [activeCategory]: groupedMenu[activeCategory] || [] }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pb-24 md:pb-4  md:pr-80">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="bg-background shadow-md sticky top-0 z-10 border-b">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Table {tableId}</h1>
                <p className="text-sm text-muted-foreground mt-1">Select up to 10 items</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {totalItems} / 10 items in cart
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!canOrder && cooldownMinutes > 0 && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Wait {cooldownMinutes} min
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Before next order
                    </div>
                  </div>
                )}
                <Sheet open={showReviewSheet} onOpenChange={setShowReviewSheet}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Write Review</span>
                      <span className="sm:hidden">Review</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-96 max-h-screen overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Write a Review</SheetTitle>
                      <SheetDescription>
                        Share your dining experience with us
                      </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Your Name *
                        </label>
                        <Input
                          placeholder="e.g., John Doe"
                          value={reviewData.customer_name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setReviewData({
                              ...reviewData,
                              customer_name: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Server's Name *
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={reviewData.server_name}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setReviewData({
                              ...reviewData,
                              server_name: e.target.value,
                            })
                          }
                        >
                          <option value="">Select a server</option>
                          {SERVER_NAMES.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rating *
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                setReviewData({ ...reviewData, rating: star })
                              }
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= reviewData.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Comments
                        </label>
                        <Textarea
                          placeholder="Tell us about your experience..."
                          value={reviewData.comment}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setReviewData({
                              ...reviewData,
                              comment: e.target.value,
                            })
                          }
                          className="min-h-24"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className="flex-1"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowReviewSheet(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          <TabsList className="w-full rounded-none h-auto p-0 bg-transparent border-t">
            <TabsTrigger value="menu" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Menu
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              Order History ({orderHistory.length})
            </TabsTrigger>
          </TabsList>
        </div>
        {/* Menu Tab */}
        <TabsContent value="menu" className="px-4 pb-4 pt-4 mt-0">
          {/* Category Tabs */}
          <div className="mb-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="w-full grid grid-cols-5 h-auto p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="Meat" className="text-xs sm:text-sm">Meat</TabsTrigger>
                <TabsTrigger value="Seafood" className="text-xs sm:text-sm">Seafood</TabsTrigger>
                <TabsTrigger value="Side" className="text-xs sm:text-sm">Sides</TabsTrigger>
                <TabsTrigger value="Drinks" className="text-xs sm:text-sm">Drinks</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {Object.entries(filteredMenu).map(([category, items]) => {
              const categoryItems = items as MenuItem[]
              if (categoryItems.length === 0) {
                return (
                  <Card key={category}>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No items in this category
                    </CardContent>
                  </Card>
                )
              }
              return (
                <Card key={category} className="overflow-hidden">
                  <CardHeader className="bg-primary text-primary-foreground p-4">
                    <CardTitle className="text-lg">{category === 'Side' ? 'Sides' : category}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y">
                    {categoryItems.map((item: MenuItem) => (
                    <div key={item.id} className="p-4 active:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        {item.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-border"
                              onError={(e) => {
                                // Hide image if it fails to load
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className={`flex-1 min-w-0 ${item.image ? '' : ''}`}>
                          <div className="font-semibold text-base mb-1">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mb-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => addToCart(item)}
                          disabled={!canOrder || totalItems >= 10}
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Order History Tab */}
        <TabsContent value="history" className="px-4 pb-4 pt-8  mt-0">
          {orderHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">No orders yet</p>
                <p className="text-muted-foreground text-sm mt-2">Your order history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orderHistory.map((order: OrderHistory) => {
                const items = JSON.parse(order.items) as OrderItem[]
                const orderDate = new Date(order.created_at)
                const isPending = order.status === 'pending'
                
                return (
                  <Card key={order.id} className={`border-l-4 ${isPending ? 'border-yellow-500' : 'border-green-500'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">Order #{order.id}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </CardDescription>
                        </div>
                        <Badge variant={isPending ? 'warning' : 'success'}>
                          {isPending ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map((item: OrderItem, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-sm">{item.name}</span>
                            <span className="text-sm font-semibold">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="text-sm font-semibold">
                        Total: {items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)} items
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Cart Button */}
      {totalItems > 0 && (
        <Sheet open={showCart} onOpenChange={setShowCart}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-4 left-4 right-4 md:hidden z-20 shadow-lg bg-red-600 hover:bg-red-700 text-white h-16 text-lg font-semibold"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Your Order</SheetTitle>
              <SheetDescription>
                {totalItems} / 10 items
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              ) : (
                <>
                  {cart.map((item: OrderItem) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {item.image && (
                            <div className="flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-base">{item.name}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantity</span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-10 w-10"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={totalItems >= 10}
                              className="h-10 w-10"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={handleSubmit}
                    disabled={cart.length === 0 || !canOrder || isSubmitting}
                    size="lg"
                    className="w-full mt-4"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Order'}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Cart Sidebar */}
      <div className="hidden md:block fixed right-0 top-0 h-screen w-80 bg-background shadow-xl border-l overflow-y-auto">
        <div className="p-6 sticky top-0 bg-background border-b">
          <h2 className="text-2xl font-bold mb-2">Your Order</h2>
          <p className="text-sm text-muted-foreground">
            {totalItems} / 10 items
          </p>
        </div>
        <div className="p-6">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {cart.map((item: OrderItem) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-24 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{item.name}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="h-6 w-6 p-0 text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Qty</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={totalItems >= 10}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={cart.length === 0 || !canOrder || isSubmitting}
                size="lg"
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
