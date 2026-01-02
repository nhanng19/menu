import { NextResponse } from 'next/server'
import { createOrder, canTableOrder } from '@/lib/orders'

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

    if (items.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 items per order' }, { status: 400 })
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || !item.name || item.quantity === undefined || item.quantity <= 0) {
        console.error('Invalid item format:', item)
        return NextResponse.json({ error: 'Invalid item format' }, { status: 400 })
      }
    }

    // Normalize items to ensure id is a string
    const normalizedItems = items.map((item: any) => ({
      id: String(item.id),
      name: item.name,
      quantity: parseInt(item.quantity) || item.quantity,
    }))

    const orderId = await createOrder(tableId, normalizedItems)
    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

