import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface MenuItem {
  _id?: ObjectId;
  id?: number;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
}

// Menu item images mapping
const menuItemImages: Record<string, string> = {
  'Bulgogi': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
  'Galbi': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop',
  'Samgyeopsal': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=400&fit=crop',
  'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop',
  'Shrimp': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  'Squid': 'https://images.unsplash.com/photo-1563379091339-03246963d29b?w=400&h=400&fit=crop',
  'Kimchi': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&h=400&fit=crop',
  'Rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop',
  'Lettuce': 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop',
  'Bean Sprouts': 'https://images.unsplash.com/photo-1596797038530-2c199229d51e?w=400&h=400&fit=crop',
  'Seaweed Salad': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  'Japchae': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
};

// Initialize menu items if database is empty
export async function initializeMenu() {
  const db = await getDatabase();
  const count = await db.collection('menu_items').countDocuments();
  
  if (count === 0) {
    const defaultMenu: MenuItem[] = [
      { name: 'Bulgogi', description: 'Marinated beef', category: 'Meat', image: menuItemImages['Bulgogi'] },
      { name: 'Galbi', description: 'Short ribs', category: 'Meat', image: menuItemImages['Galbi'] },
      { name: 'Samgyeopsal', description: 'Pork belly', category: 'Meat', image: menuItemImages['Samgyeopsal'] },
      { name: 'Chicken', description: 'Marinated chicken', category: 'Meat', image: menuItemImages['Chicken'] },
      { name: 'Shrimp', description: 'Grilled shrimp', category: 'Seafood', image: menuItemImages['Shrimp'] },
      { name: 'Squid', description: 'Grilled squid', category: 'Seafood', image: menuItemImages['Squid'] },
      { name: 'Kimchi', description: 'Fermented cabbage', category: 'Side', image: menuItemImages['Kimchi'] },
      { name: 'Rice', description: 'Steamed rice', category: 'Side', image: menuItemImages['Rice'] },
      { name: 'Lettuce', description: 'Fresh lettuce wraps', category: 'Side', image: menuItemImages['Lettuce'] },
      { name: 'Bean Sprouts', description: 'Seasoned bean sprouts', category: 'Side', image: menuItemImages['Bean Sprouts'] },
      { name: 'Seaweed Salad', description: 'Fresh seaweed', category: 'Side', image: menuItemImages['Seaweed Salad'] },
      { name: 'Japchae', description: 'Glass noodles', category: 'Side', image: menuItemImages['Japchae'] },
    ];

    await db.collection('menu_items').insertMany(defaultMenu);
  } else {
    // Update existing menu items with images if they don't have one
    const items = await db.collection('menu_items').find({}).toArray() as MenuItem[];
    
    for (const item of items) {
      // Only update if image is missing or empty
      if (menuItemImages[item.name] && (!item.image || item.image.trim() === '')) {
        await db.collection('menu_items').updateOne(
          { _id: item._id },
          { $set: { image: menuItemImages[item.name] } }
        );
      }
    }
  }
}

// Get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  const db = await getDatabase();
  return await db.collection('menu_items').find({}).sort({ category: 1, name: 1 }).toArray() as MenuItem[];
}

// Get menu item by ID
export async function getMenuItem(id: string): Promise<MenuItem | null> {
  const db = await getDatabase();
  return await db.collection('menu_items').findOne({ _id: new ObjectId(id) }) as MenuItem | null;
}

