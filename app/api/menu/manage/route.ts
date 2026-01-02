import { getDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const items = await db.collection('menu_items').find({}).sort({ category: 1, name: 1 }).toArray();
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

    const db = await getDatabase();
    const result = await db.collection('menu_items').insertOne({
      name,
      description: description || null,
      category: category || null,
      image: image || null,
      created_at: new Date(),
    });

    return NextResponse.json(
      { id: result.insertedId.toString(), name, description, category, image },
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

    const db = await getDatabase();
    
    await db.collection('menu_items').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description: description || null,
          category: category || null,
          image: image || null,
          updated_at: new Date(),
        },
      }
    );

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

    const db = await getDatabase();
    
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
