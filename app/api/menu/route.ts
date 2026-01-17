import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

// Menu items don't change often, so we can cache for 60 seconds
export const revalidate = 60;

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
    // Cache menu for 60 seconds to reduce database queries
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json([], { status: 200 })
  }
}

