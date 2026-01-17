import { NextResponse } from 'next/server'
import { getTableOrderHistory } from '@/lib/orders'

// Cache history for 10 seconds to reduce database queries
export const revalidate = 10;

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = parseInt(params.tableId)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    const orders = await getTableOrderHistory(tableId)
    
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
    // Cache for 10 seconds to reduce connection usage
    response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20')
    return response
  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  }
}

