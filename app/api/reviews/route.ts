import { getDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0; // Disable caching - always fetch fresh data

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { customer_name, server_name, rating, comment, table_id } = body;

    if (!customer_name || !server_name || !rating) {
      return NextResponse.json(
        { error: 'Customer name, server name, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const result = await db.collection('reviews').insertOne({
      customer_name,
      server_name,
      rating,
      comment: comment || null,
      table_id: table_id || null,
      created_at: new Date(),
    });

    return NextResponse.json(
      {
        id: result.insertedId,
        customer_name,
        server_name,
        rating,
        comment,
        table_id,
        created_at: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const reviews = await db
      .collection('reviews')
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    const response = NextResponse.json(reviews)
    // Add headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
