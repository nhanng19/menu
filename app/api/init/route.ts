import { initializeMenu } from '@/lib/menu';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await initializeMenu();
    return NextResponse.json({ success: true, message: 'Menu initialized' });
  } catch (error) {
    console.error('Error initializing menu:', error);
    return NextResponse.json({ error: 'Failed to initialize menu' }, { status: 500 });
  }
}
