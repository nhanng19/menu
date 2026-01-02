import { NextResponse } from 'next/server'
import { canTableOrder, getRemainingCooldown } from '@/lib/orders'

export async function GET(
  request: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const tableId = parseInt(params.tableId)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    const canOrder = await canTableOrder(tableId)
    const cooldownMinutes = canOrder ? 0 : await getRemainingCooldown(tableId)

    return NextResponse.json({ canOrder, cooldownMinutes })
  } catch (error) {
    console.error('Error checking table status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

