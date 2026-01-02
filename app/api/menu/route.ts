import { NextResponse } from 'next/server'
import { getMenuItems, initializeMenu } from '@/lib/menu'

export async function GET() {
  try {
    await initializeMenu() // Ensure menu is initialized
    const items = await getMenuItems()
    
    // Ensure we always return an array
    if (!Array.isArray(items)) {
      console.error('getMenuItems did not return an array:', items)
      return NextResponse.json([], { status: 200 })
    }
    
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

