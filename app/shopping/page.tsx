'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ShoppingList {
  id: string;
  name: string;
  items?: ShoppingItem[];
}

interface ShoppingItem {
  id: string;
  list_id: string;
  name: string;
  category: string;
  quantity: number;
  is_checked: boolean;
}

const categories = ['Groceries', 'Electronics', 'Clothing', 'Home', 'Health', 'Other'];

export default function ShoppingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'Groceries',
    quantity: 1,
  });

  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  useEffect(() => {
    if (selectedList) {
      loadItems(selectedList);
    }
  }, [selectedList]);

  const loadLists = async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data || []);
      if (data && data.length > 0 && !selectedList) {
        setSelectedList(data[0].id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (listId: string) => {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          name: listName,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'List created successfully' });
      setListDialogOpen(false);
      setListName('');
      loadLists();
      if (data) {
        setSelectedList(data.id);
      }
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create list',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async (id: string) => {
    if (!confirm('Are you sure? This will delete all items in this list.')) return;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'List deleted successfully' });
      if (selectedList === id) {
        setSelectedList(null);
      }
      loadLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedList) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .insert({
          ...itemFormData,
          list_id: selectedList,
          user_id: user?.id,
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'Item added successfully' });
      setItemDialogOpen(false);
      setItemFormData({ name: '', category: 'Groceries', quantity: 1 });
      loadItems(selectedList);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleItem = async (item: ShoppingItem) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ is_checked: !item.is_checked })
        .eq('id', item.id);

      if (error) throw error;
      loadItems(selectedList!);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadItems(selectedList!);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shopping Lists</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Organize your shopping items
              </p>
            </div>
            <Button onClick={() => setListDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New List
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Your Lists</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : lists.length > 0 ? (
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <div
                        key={list.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedList === list.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setSelectedList(list.id)}
                      >
                        <span className="font-medium">{list.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No lists yet. Create one!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedList ? lists.find(l => l.id === selectedList)?.name : 'Select a list'}
                  </CardTitle>
                  {selectedList && (
                    <Button onClick={() => setItemDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedList ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a list to view items
                    </p>
                  </div>
                ) : items.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-3">{category}</h3>
                        <div className="space-y-2">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                  checked={item.is_checked}
                                  onCheckedChange={() => handleToggleItem(item)}
                                />
                                <div className="flex-1">
                                  <p className={`font-medium ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Quantity: {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No items in this list. Add some!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>Add a new shopping list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateList}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listName">List Name</Label>
                    <Input
                      id="listName"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="e.g., Weekly Groceries"
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setListDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create List</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item</DialogTitle>
                <DialogDescription>Add a new item to your list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={itemFormData.category}
                      onValueChange={(value) => setItemFormData({ ...itemFormData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={itemFormData.quantity}
                      onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
