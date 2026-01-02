'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image?: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  image: string;
}

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState<'orders' | 'reviews' | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    image: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu/manage');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch menu items',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      image: '',
    });
    setEditingId(null);
  };

  const openAddSheet = () => {
    resetForm();
    setShowSheet(true);
  };

  const openEditSheet = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      image: item.image || '',
    });
    setEditingId(item.id);
    setShowSheet(true);
  };

  const handleSaveItem = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Item name is required',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update existing item
        const res = await fetch('/api/menu/manage', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (!res.ok) throw new Error('Failed to update item');

        setItems(
          items.map((item) =>
            item.id === editingId ? { id: editingId, ...formData } : item
          )
        );

        toast({
          title: 'Success',
          description: 'Menu item updated successfully',
        });
      } else {
        // Add new item
        const res = await fetch('/api/menu/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error('Failed to add item');

        const newItem = await res.json();
        setItems([...items, newItem]);

        toast({
          title: 'Success',
          description: 'Menu item added successfully',
        });
      }

      resetForm();
      setShowSheet(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: editingId
          ? 'Failed to update menu item'
          : 'Failed to add menu item',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/menu/manage?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete item');

      setItems(items.filter((i) => i.id !== id));
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete menu item',
      });
    }
  };

  const handleClearOrders = async () => {
    if (!window.confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      return;
    }

    setIsClearing('orders');
    try {
      const res = await fetch('/api/admin/clear-orders', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to clear orders');

      toast({
        title: 'Success',
        description: 'All orders have been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear orders',
      });
    } finally {
      setIsClearing(null);
    }
  };

  const handleClearReviews = async () => {
    if (!window.confirm('Are you sure you want to delete ALL reviews? This action cannot be undone.')) {
      return;
    }

    setIsClearing('reviews');
    try {
      const res = await fetch('/api/admin/clear-reviews', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to clear reviews');

      toast({
        title: 'Success',
        description: 'All reviews have been deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear reviews',
      });
    } finally {
      setIsClearing(null);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <div className="flex gap-2">
            <Link href="/admin/reviews">
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                Reviews
              </Button>
            </Link>
            <Button onClick={openAddSheet} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Clear Data Section */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg text-red-900">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-800 mb-4">
              Use these options to permanently delete data. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                onClick={handleClearOrders}
                disabled={isClearing === 'orders'}
              >
                {isClearing === 'orders' ? 'Clearing Orders...' : 'Clear All Orders'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearReviews}
                disabled={isClearing === 'reviews'}
              >
                {isClearing === 'reviews' ? 'Clearing Reviews...' : 'Clear All Reviews'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden">
              {item.image && (
                <div className="w-full h-40 overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="flex-1 p-4">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                {item.category && (
                  <p className="text-xs font-medium text-primary mb-2">
                    {item.category}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </CardContent>
              <div className="flex gap-2 p-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => openEditSheet(item)}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No menu items yet</p>
              <Button onClick={openAddSheet} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit/Add Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="w-full sm:w-96 max-h-screen overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {editingId ? 'Edit Menu Item' : 'Add New Menu Item'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Name *
              </label>
              <Input
                placeholder="e.g., Bulgogi"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>
              <Input
                placeholder="e.g., Meat, Seafood, Side"
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Input
                placeholder="e.g., Marinated beef"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Image URL
              </label>
              <Input
                placeholder="https://..."
                value={formData.image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, image: e.target.value })
                }
              />
              {formData.image && (
                <div className="mt-3 rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6">
              <Button
                onClick={handleSaveItem}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Item'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowSheet(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}