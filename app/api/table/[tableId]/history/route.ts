import { NextResponse } from 'next/server'
import { getTableOrderHistory } from '@/lib/orders'

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = parseInt(params.tableId)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    const orders = getTableOrderHistory(tableId)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  }
}

