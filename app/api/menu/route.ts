import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export const revalidate = 0; // Disable caching - always fetch fresh data

export async function GET() {
  try {
    const db = await getDatabase()
    const items = await db.collection('menu_items').find({}).sort({ category: 1, name: 1 }).toArray()
    
    // Transform MongoDB _id to id for consistency with frontend
    const transformedItems = items.map((item: any) => ({
      id: item._id?.toString() || item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      image: item.image,
      price: item.price,
    }))
    
    const response = NextResponse.json(transformedItems)
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json([], { status: 200 })
  }
}

