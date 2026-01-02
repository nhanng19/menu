import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    // Clear all reviews from the database
    const deleteStmt = db.prepare('DELETE FROM reviews');
    deleteStmt.run();

    return NextResponse.json({ success: true, message: 'All reviews have been deleted' });
  } catch (error) {
    console.error('Error clearing reviews:', error);
    return NextResponse.json({ error: 'Failed to clear reviews' }, { status: 500 });
  }
}
