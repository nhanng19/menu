import { getDatabase } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const db = await getDatabase();
    // Clear all reviews from the database
    await db.collection('reviews').deleteMany({});

    return NextResponse.json({ success: true, message: 'All reviews have been deleted' });
  } catch (error) {
    console.error('Error clearing reviews:', error);
    return NextResponse.json({ error: 'Failed to clear reviews' }, { status: 500 });
  }
}
