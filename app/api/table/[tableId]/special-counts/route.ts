import { NextResponse } from 'next/server'
import { getTableOrderHistory } from '@/lib/orders'
import { getDatabase } from '@/lib/mongodb'

export const revalidate = 0; // Disable caching - always fetch fresh data

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = parseInt(params.tableId)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    // Get all orders for this table
    const orders = await getTableOrderHistory(tableId)
    
    // Count special items across all orders
    const db = await getDatabase()
    const specialItemCounts: Record<string, number> = {}
    
    // Get all menu items to build a lookup map
    const menuItems = await db.collection('menu_items').find({}).toArray()
    const menuItemMap = new Map()
    menuItems.forEach((item: any) => {
      menuItemMap.set(String(item._id), item)
      menuItemMap.set(item.name, item) // Also map by name as fallback
    })
    
    for (const order of orders) {
      const items = JSON.parse(order.items)
      for (const item of items) {
        // Use category from item if available (newer orders include it), otherwise look it up
        let itemCategory = item.category
        let itemId = String(item.id)
        
        if (!itemCategory) {
          // Get item category from menu using ID or name
          const menuItem = menuItemMap.get(String(item.id)) || menuItemMap.get(item.name)
          if (menuItem) {
            itemCategory = menuItem.category
            itemId = String(menuItem._id)
          }
        }
        
        if (itemCategory === 'Special') {
          specialItemCounts[itemId] = (specialItemCounts[itemId] || 0) + (parseInt(item.quantity) || item.quantity)
        }
      }
    }
    
    const response = NextResponse.json({ counts: specialItemCounts })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error fetching special item counts:', error)
    return NextResponse.json({ error: 'Failed to fetch special item counts' }, { status: 500 })
  }
}
