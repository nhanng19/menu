import db from './db';

export interface Order {
  id: number;
  table_id: number;
  items: string; // JSON string of items
  status: 'pending' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
}

// Create a new order
export function createOrder(tableId: number, items: OrderItem[]): number {
  const itemsJson = JSON.stringify(items);
  const result = db.prepare('INSERT INTO orders (table_id, items) VALUES (?, ?)').run(tableId, itemsJson);
  return result.lastInsertRowid as number;
}

// Get all pending orders
export function getPendingOrders(): Order[] {
  return db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC').all('pending') as Order[];
}

// Get all orders (for kitchen view)
export function getAllOrders(): Order[] {
  return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Order[];
}

// Mark order as completed
export function completeOrder(orderId: number): void {
  db.prepare('UPDATE orders SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run('completed', orderId);
}

// Get last order time for a table (returns minutes since last order)
export function getMinutesSinceLastOrder(tableId: number): number | null {
  // Use SQLite's datetime functions to calculate the difference in minutes
  // This avoids timezone issues by doing the calculation in the database
  const result = db.prepare(`
    SELECT 
      (julianday('now') - julianday(created_at)) * 24 * 60 as minutes_diff
    FROM orders 
    WHERE table_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `).get(tableId) as { minutes_diff: number } | undefined;
  
  if (!result) return null;
  return result.minutes_diff;
}

// Check if table can order (10 minute cooldown)
export function canTableOrder(tableId: number): boolean {
  const minutesSince = getMinutesSinceLastOrder(tableId);
  if (minutesSince === null) return true;
  
  // If negative, it means the order is in the future (shouldn't happen, but handle it)
  if (minutesSince < 0) {
    console.warn('Order time appears to be in the future, allowing order');
    return true;
  }
  
  return minutesSince >= 10;
}

// Get remaining cooldown time in minutes
export function getRemainingCooldown(tableId: number): number {
  const minutesSince = getMinutesSinceLastOrder(tableId);
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
export function getLastOrderTime(tableId: number): Date | null {
  const result = db.prepare('SELECT created_at FROM orders WHERE table_id = ? ORDER BY created_at DESC LIMIT 1').get(tableId) as { created_at: string } | undefined;
  if (!result) return null;
  return new Date(result.created_at);
}

// Get order history for a specific table
export function getTableOrderHistory(tableId: number): Order[] {
  return db.prepare('SELECT * FROM orders WHERE table_id = ? ORDER BY created_at DESC').all(tableId) as Order[];
}

