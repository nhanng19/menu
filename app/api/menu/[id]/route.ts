import { NextResponse } from 'next/server'
import { getMenuItem } from '@/lib/menu'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'Invalid menu item ID' }, { status: 400 })
    }

    const item = await getMenuItem(id)
    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 })
  }
}

