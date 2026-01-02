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
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json([], { status: 200 })
  }
}

