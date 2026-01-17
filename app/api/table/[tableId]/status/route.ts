import { NextResponse } from 'next/server'
import { canTableOrder, getRemainingCooldown } from '@/lib/orders'

// Cache status for 5 seconds to reduce database queries
export const revalidate = 5;

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

    const response = NextResponse.json({ canOrder, cooldownMinutes })
    // Cache for 5 seconds to reduce connection usage
    response.headers.set('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10')
    return response
  } catch (error) {
    console.error('Error checking table status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

