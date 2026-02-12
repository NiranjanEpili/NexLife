'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit2, Bell, BellRing, Check, Clock, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Reminder {
  id: string;
  title: string;
  description: string;
  reminder_date: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  is_completed: boolean;
  category: string;
  created_at: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    is_recurring: false,
    recurrence_pattern: '',
    category: 'general',
  });

  useEffect(() => {
    if (user) {
      loadReminders();
      // Check for due reminders every minute
      const interval = setInterval(checkDueReminders, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user?.id)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const checkDueReminders = async () => {
    const now = new Date();
    const dueReminders = reminders.filter(r => 
      !r.is_completed && 
      new Date(r.reminder_date) <= now
    );

    dueReminders.forEach(reminder => {
      if (Notification.permission === 'granted') {
        new Notification(`⏰ ${reminder.title}`, {
          body: reminder.description || 'Reminder due now!',
          icon: '/icon-192x192.png',
        });
      }
      
      toast({
        title: `⏰ ${reminder.title}`,
        description: reminder.description || 'Reminder due now!',
      });
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: 'Notifications enabled',
          description: 'You will receive reminder notifications',
        });
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReminder) {
        const { error } = await supabase
          .from('reminders')
          .update(formData)
          .eq('id', editingReminder.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Reminder updated successfully' });
      } else {
        const { error } = await supabase
          .from('reminders')
          .insert({
            ...formData,
            user_id: user?.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Reminder created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadReminders();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reminder',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Reminder deleted successfully' });
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive',
      });
    }
  };

  const toggleComplete = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !reminder.is_completed })
        .eq('id', reminder.id);

      if (error) throw error;
      loadReminders();
    } catch (error) {
      console.error('Error toggling complete:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_date: '',
      is_recurring: false,
      recurrence_pattern: '',
      category: 'general',
    });
    setEditingReminder(null);
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      reminder_date: new Date(reminder.reminder_date).toISOString().slice(0, 16),
      is_recurring: reminder.is_recurring,
      recurrence_pattern: reminder.recurrence_pattern || '',
      category: reminder.category,
    });
    setDialogOpen(true);
  };

  const getTimingLabel = (date: string) => {
    const reminderDate = new Date(date);
    if (isPast(reminderDate)) return { text: 'Overdue', color: 'bg-red-100 text-red-700' };
    if (isToday(reminderDate)) return { text: 'Today', color: 'bg-blue-100 text-blue-700' };
    if (isTomorrow(reminderDate)) return { text: 'Tomorrow', color: 'bg-green-100 text-green-700' };
    return { text: format(reminderDate, 'MMM d, yyyy'), color: 'bg-gray-100 text-gray-700' };
  };

  const categories = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'task', label: 'Tasks', icon: Check },
    { value: 'bill', label: 'Bills', icon: Clock },
    { value: 'study', label: 'Study', icon: BellRing },
    { value: 'goal', label: 'Goals', icon: Repeat },
    { value: 'general', label: 'General', icon: Bell },
  ];

  const filteredReminders = filterCategory === 'all' 
    ? reminders 
    : reminders.filter(r => r.category === filterCategory);

  const activeReminders = filteredReminders.filter(r => !r.is_completed);
  const completedReminders = filteredReminders.filter(r => r.is_completed);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">🔔 Reminders</h1>
                <p className="text-orange-100 mt-1 text-lg">Never miss what matters</p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Reminder
              </Button>
            </div>

            {/* Category Filters */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterCategory(cat.value)}
                    className={`${
                      filterCategory === cat.value
                        ? 'bg-white text-orange-600 border-white'
                        : 'bg-white/20 text-white border-white hover:bg-white hover:text-orange-600'
                    } font-semibold`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {cat.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Reminders</p>
                    <p className="text-3xl font-bold text-orange-600">{activeReminders.length}</p>
                  </div>
                  <BellRing className="h-12 w-12 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{completedReminders.length}</p>
                  </div>
                  <Check className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-3xl font-bold text-red-600">
                      {activeReminders.filter(r => isPast(new Date(r.reminder_date))).length}
                    </p>
                  </div>
                  <Clock className="h-12 w-12 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Reminders */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Reminders</h2>
            {activeReminders.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">No active reminders</h3>
                  <p className="text-gray-400 mb-4">Create a reminder to stay on track</p>
                  <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeReminders.map(reminder => {
                  const timing = getTimingLabel(reminder.reminder_date);
                  return (
                    <Card key={reminder.id} className="border-2 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-full mt-1"
                            onClick={() => toggleComplete(reminder)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg">{reminder.title}</h3>
                                {reminder.description && (
                                  <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                                )}
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge className={timing.color}>{timing.text}</Badge>
                                  <Badge variant="outline">{reminder.category}</Badge>
                                  {reminder.is_recurring && (
                                    <Badge variant="outline">
                                      <Repeat className="mr-1 h-3 w-3" />
                                      {reminder.recurrence_pattern}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(reminder.reminder_date), 'h:mm a')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditDialog(reminder)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(reminder.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-500">Completed</h2>
              <div className="space-y-3 opacity-60">
                {completedReminders.map(reminder => (
                  <Card key={reminder.id} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-full mt-1 bg-green-100"
                          onClick={() => toggleComplete(reminder)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg line-through">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-gray-600 mt-1 line-through">{reminder.description}</p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                </DialogTitle>
                <DialogDescription>
                  {editingReminder ? 'Update your reminder' : 'Set a new reminder to stay on track'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="font-semibold">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Submit Assignment"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add details..."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reminder_date" className="font-semibold">Date & Time</Label>
                      <Input
                        id="reminder_date"
                        type="datetime-local"
                        value={formData.reminder_date}
                        onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="font-semibold">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      >
                        <option value="general">General</option>
                        <option value="task">Task</option>
                        <option value="bill">Bill</option>
                        <option value="study">Study</option>
                        <option value="goal">Goal</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_recurring" className="cursor-pointer">Recurring reminder</Label>
                  </div>
                  {formData.is_recurring && (
                    <div>
                      <Label htmlFor="recurrence_pattern" className="font-semibold">Repeat</Label>
                      <select
                        id="recurrence_pattern"
                        value={formData.recurrence_pattern}
                        onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      >
                        <option value="">Select pattern</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>
                <DialogFooter className="mt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  {editingReminder && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        handleDelete(editingReminder.id);
                        setDialogOpen(false);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button type="submit" className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold">
                    {editingReminder ? 'Update' : 'Create'} Reminder
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
