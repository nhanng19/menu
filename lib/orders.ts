import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Order {
  _id?: ObjectId;
  table_id: number;
  items: string; // JSON string of items
  status: 'pending' | 'completed';
  created_at: Date;
  completed_at: Date | null;
}

export interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
}

// Create a new order
export async function createOrder(tableId: number, items: OrderItem[]): Promise<ObjectId> {
  const db = await getDatabase();
  const itemsJson = JSON.stringify(items);
  const result = await db.collection('orders').insertOne({
    table_id: tableId,
    items: itemsJson,
    status: 'pending',
    created_at: new Date(),
    completed_at: null,
  });
  return result.insertedId;
}

// Get all pending orders
export async function getPendingOrders(): Promise<Order[]> {
  const db = await getDatabase();
  return await db.collection('orders').find({ status: 'pending' }).sort({ created_at: 1 }).toArray() as Order[];
}

// Get all orders (for kitchen view)
export async function getAllOrders(): Promise<Order[]> {
  const db = await getDatabase();
  return await db.collection('orders').find({}).sort({ created_at: -1 }).toArray() as Order[];
}

// Mark order as completed
export async function completeOrder(orderId: ObjectId | string): Promise<void> {
  const db = await getDatabase();
  
  if (!orderId) {
    throw new Error('Order ID is required');
  }
  
  let id: ObjectId;
  try {
    id = typeof orderId === 'string' ? new ObjectId(orderId) : orderId;
  } catch (error) {
    throw new Error(`Invalid order ID format: ${orderId}`);
  }
  
  await db.collection('orders').updateOne(
    { _id: id },
    { $set: { status: 'completed', completed_at: new Date() } }
  );
}

// Get last order time for a table (returns minutes since last order)
export async function getMinutesSinceLastOrder(tableId: number): Promise<number | null> {
  const db = await getDatabase();
  const result = await db.collection('orders').findOne(
    { table_id: tableId },
    { sort: { created_at: -1 } }
  ) as Order | null;
  
  if (!result) return null;
  
  const now = new Date();
  const minutesDiff = (now.getTime() - result.created_at.getTime()) / (1000 * 60);
  return minutesDiff;
}

// Check if table can order (10 minute cooldown)
export async function canTableOrder(tableId: number): Promise<boolean> {
  const minutesSince = await getMinutesSinceLastOrder(tableId);
  if (minutesSince === null) return true;
  
  // If negative, it means the order is in the future (shouldn't happen, but handle it)
  if (minutesSince < 0) {
    console.warn('Order time appears to be in the future, allowing order');
    return true;
  }
  
  return minutesSince >= 10;
}

// Get remaining cooldown time in minutes
export async function getRemainingCooldown(tableId: number): Promise<number> {
  const minutesSince = await getMinutesSinceLastOrder(tableId);
  if (minutesSince === null) return 0;
  
  // If negative, return 0 (shouldn't happen)
  if (minutesSince < 0) {
    return 0;
  }
  
  // Calculate remaining time
  const remaining = 10 - minutesSince;
  return Math.max(0, Math.ceil(remaining));
}

// Keep this for backward compatibility if needed elsewhere
export async function getLastOrderTime(tableId: number): Promise<Date | null> {
  const db = await getDatabase();
  const result = await db.collection('orders').findOne(
    { table_id: tableId },
    { sort: { created_at: -1 } }
  ) as Order | null;
  
  if (!result) return null;
  return result.created_at;
}

// Get order history for a specific table
export async function getTableOrderHistory(tableId: number): Promise<Order[]> {
  const db = await getDatabase();
  return await db.collection('orders').find({ table_id: tableId }).sort({ created_at: -1 }).toArray() as Order[];
}

