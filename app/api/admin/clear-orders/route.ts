import { getDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const db = await getDatabase();
    // Clear all orders from the database
    await db.collection('orders').deleteMany({});

    return NextResponse.json({ success: true, message: 'All orders have been deleted' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    return NextResponse.json({ error: 'Failed to clear orders' }, { status: 500 });
  }
}
