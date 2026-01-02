import { NextResponse } from 'next/server'
import { getMenuItem } from '@/lib/menu'
import db from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid menu item ID' }, { status: 400 })
    }

    const item = getMenuItem(id)
    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid menu item ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, price, category, image } = body

    // Build update query dynamically based on provided fields
    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (price !== undefined) {
      updates.push('price = ?')
      values.push(price)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      values.push(category)
    }
    if (image !== undefined) {
      updates.push('image = ?')
      values.push(image)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(id)
    const query = `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`
    
    db.prepare(query).run(...values)

    const updatedItem = getMenuItem(id)
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

