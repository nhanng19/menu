import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    // Clear all orders from the database
    const deleteStmt = db.prepare('DELETE FROM orders');
    deleteStmt.run();

    return NextResponse.json({ success: true, message: 'All orders have been deleted' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    return NextResponse.json({ error: 'Failed to clear orders' }, { status: 500 });
  }
}
