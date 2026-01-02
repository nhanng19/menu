import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const items = db.prepare('SELECT * FROM menu_items ORDER BY category, name').all();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, image } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const insert = db.prepare(
      'INSERT INTO menu_items (name, description, category, image) VALUES (?, ?, ?, ?)'
    );
    const result = insert.run(name, description || null, category || null, image || null);

    return NextResponse.json(
      { id: result.lastInsertRowid, name, description, category, image },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, category, image } = body;

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const update = db.prepare(
      'UPDATE menu_items SET name = ?, description = ?, category = ?, image = ? WHERE id = ?'
    );
    update.run(name, description || null, category || null, image || null, id);

    return NextResponse.json({ id, name, description, category, image });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deleteStmt = db.prepare('DELETE FROM menu_items WHERE id = ?');
    deleteStmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
