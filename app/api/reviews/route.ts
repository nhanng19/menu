import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
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

    const insert = db.prepare(
      'INSERT INTO reviews (customer_name, server_name, rating, comment, table_id) VALUES (?, ?, ?, ?, ?)'
    );
    const result = insert.run(
      customer_name,
      server_name,
      rating,
      comment || null,
      table_id || null
    );

    return NextResponse.json(
      {
        id: result.lastInsertRowid,
        customer_name,
        server_name,
        rating,
        comment,
        table_id,
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
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const reviews = db
      .prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?')
      .all(parseInt(limit));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
