import { NextResponse } from 'next/server'
import { completeOrder } from '@/lib/orders'

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    completeOrder(orderId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing order:', error)
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 })
  }
}

