import { NextResponse } from 'next/server'
import { getMenuItems, initializeMenu } from '@/lib/menu'

export async function GET() {
  try {
    initializeMenu() // Ensure menu is initialized
    const items = getMenuItems()
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

