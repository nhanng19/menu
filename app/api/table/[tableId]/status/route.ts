import { NextResponse } from 'next/server'
import { canTableOrder, getRemainingCooldown } from '@/lib/orders'

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

    const canOrder = await canTableOrder(tableId)
    const cooldownMinutes = canOrder ? 0 : await getRemainingCooldown(tableId)

    const response = NextResponse.json({ canOrder, cooldownMinutes })
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error checking table status:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}

