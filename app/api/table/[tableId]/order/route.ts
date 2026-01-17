import { NextResponse } from 'next/server'
import { createOrder, canTableOrder, getTableOrderHistory } from '@/lib/orders'
import { getDatabase } from '@/lib/mongodb'

export async function POST(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = parseInt(params.tableId)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    // Check if table can order
    if (!(await canTableOrder(tableId))) {
      return NextResponse.json(
        { error: 'Please wait 10 minutes before placing another order' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 })
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || !item.name || item.quantity === undefined || item.quantity <= 0) {
        console.error('Invalid item format:', item)
        return NextResponse.json({ error: 'Invalid item format' }, { status: 400 })
      }
    }

    // Get menu items to check categories
    const db = await getDatabase()
    const menuItems = await db.collection('menu_items').find({}).toArray()
    const menuItemMap = new Map()
    menuItems.forEach((item: any) => {
      menuItemMap.set(String(item._id), item)
      menuItemMap.set(item.name, item) // Also map by name as fallback
    })

    // Check meat limit (max 4 meat items per order)
    let meatCount = 0
    for (const item of items) {
      const menuItem = menuItemMap.get(String(item.id)) || menuItemMap.get(item.name)
      if (menuItem && menuItem.category === 'Meat') {
        meatCount += parseInt(item.quantity) || item.quantity
      }
    }
    
    if (meatCount > 4) {
      return NextResponse.json({ 
        error: `Maximum 4 meats per order. You have ${meatCount} meats.` 
      }, { status: 400 })
    }

    // Check special item limits (max 5 per item across all orders for this table)
    const existingOrders = await getTableOrderHistory(tableId)
    const specialItemCounts: Record<string, number> = {}
    
    // Count existing special items from all previous orders
    for (const order of existingOrders) {
      const orderItems = JSON.parse(order.items)
      for (const orderItem of orderItems) {
        const menuItem = menuItemMap.get(String(orderItem.id)) || menuItemMap.get(orderItem.name)
        if (menuItem && menuItem.category === 'Special') {
          const itemId = String(menuItem._id)
          specialItemCounts[itemId] = (specialItemCounts[itemId] || 0) + (parseInt(orderItem.quantity) || orderItem.quantity)
        }
      }
    }

    // Check if adding new items would exceed the limit
    for (const item of items) {
      const menuItem = menuItemMap.get(String(item.id)) || menuItemMap.get(item.name)
      if (menuItem && menuItem.category === 'Special') {
        const itemId = String(menuItem._id)
        const currentCount = specialItemCounts[itemId] || 0
        const newQuantity = parseInt(item.quantity) || item.quantity
        const totalCount = currentCount + newQuantity
        
        if (totalCount > 5) {
          return NextResponse.json({ 
            error: `Maximum 5 orders per special item. ${menuItem.name} has been ordered ${currentCount} times. You can only order ${5 - currentCount} more.` 
          }, { status: 400 })
        }
      }
    }

    // Normalize items to ensure id is a string and include category
    const normalizedItems = items.map((item: any) => {
      const menuItem = menuItemMap.get(String(item.id)) || menuItemMap.get(item.name)
      return {
        id: String(menuItem?._id || item.id),
        name: item.name,
        quantity: parseInt(item.quantity) || item.quantity,
        category: menuItem?.category || item.category,
      }
    })

    const orderId = await createOrder(tableId, normalizedItems)
    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

