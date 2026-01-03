import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

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
    
    return NextResponse.json(transformedItems)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json([], { status: 200 })
  }
}

