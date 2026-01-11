import { NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/orders'

export const revalidate = 0; // Disable caching - always fetch fresh data

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
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

