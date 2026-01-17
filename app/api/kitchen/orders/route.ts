import { NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/orders'

// Cache orders for 5 seconds to reduce database queries
export const revalidate = 5;

export async function GET() {
  try {
    const orders = await getAllOrders()
    
    // Transform MongoDB _id to id for consistency with frontend
    const transformedOrders = orders.map((order: any) => ({
      id: order._id?.toString() || order.id,
      table_id: order.table_id,
      items: order.items,
      status: order.status,
      created_at: order.created_at,
      completed_at: order.completed_at,
    }))
    
    const response = NextResponse.json(transformedOrders)
    // Cache for 5 seconds to reduce connection usage
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    return response
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

