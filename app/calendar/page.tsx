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
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  color: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'routine'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentDate]);

  const loadEvents = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update({
            title: formData.title,
            description: formData.description,
            start_time: formData.start_time,
            end_time: formData.end_time,
            color: formData.color,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({ 
          title: 'Success', 
          description: 'Event updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert({
            title: formData.title,
            description: formData.description,
            start_time: formData.start_time,
            end_time: formData.end_time,
            color: formData.color,
            user_id: user?.id,
          });

        if (error) throw error;
        toast({ 
          title: 'Success', 
          description: 'Event created successfully'
        });
      }

      setDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Event deleted successfully' });
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    const now = new Date();
    const startTime = new Date(selectedDate);
    startTime.setHours(now.getHours() + 1, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    setFormData({
      title: '',
      description: '',
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16),
      color: '#3b82f6',
    });
    setEditingEvent(null);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: new Date(event.end_time).toISOString().slice(0, 16),
      color: event.color,
    });
    setDialogOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_time), day));
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">📅 Calendar & Events</h1>
                <p className="text-pink-100 mt-1 text-lg">
                  Manage your events and schedule
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button 
                  onClick={() => setViewMode('all')} 
                  variant="outline" 
                  className={`${viewMode === 'all' ? 'bg-white text-rose-600' : 'bg-white/20 text-white border-white hover:bg-white hover:text-rose-600'} font-semibold`}
                >
                  📋 All Events
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentDate(new Date());
                    setViewMode('today');
                  }} 
                  variant="outline" 
                  className={`${viewMode === 'today' ? 'bg-white text-rose-600' : 'bg-white/20 text-white border-white hover:bg-white hover:text-rose-600'} font-semibold`}
                >
                  ✨ Today
                </Button>
                <Button 
                  onClick={() => setViewMode('routine')} 
                  variant="outline" 
                  className={`${viewMode === 'routine' ? 'bg-white text-rose-600' : 'bg-white/20 text-white border-white hover:bg-white hover:text-rose-600'} font-semibold`}
                >
                  🔄 Routine
                </Button>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-white text-rose-600 hover:bg-rose-50 font-bold shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Event
                </Button>
              </div>
            </div>
          </div>

          <Card className="border-2 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    className="hover:bg-pink-50 hover:border-pink-300 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentDate(new Date())}
                    className="font-bold hover:bg-pink-50 hover:border-pink-300 transition-all"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    className="hover:bg-pink-50 hover:border-pink-300 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg shadow-md">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setDialogOpen(true);
                        resetForm();
                      }}
                      className={`min-h-28 p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        isCurrentMonth
                          ? 'bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-pink-950/20 border-pink-200 dark:border-pink-900 shadow-md hover:shadow-xl'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                      } ${isToday ? 'ring-4 ring-pink-500 ring-offset-2 shadow-2xl' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent ? 'Update your event details' : 'Create a new calendar event'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="font-semibold">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Team Meeting"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add event details..."
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_time" className="font-semibold">Start Time</Label>
                      <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_time" className="font-semibold">End Time</Label>
                      <Input
                        id="end_time"
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color" className="font-semibold">Event Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="h-10 w-20"
                      />
                      <div className="flex gap-2">
                        {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                          <button
                            key={color}
                            type="button"
                            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData({ ...formData, color })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6 gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        handleDelete(editingEvent.id);
                        setDialogOpen(false);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold"
                  >
                    {editingEvent ? 'Update' : 'Create'} Event
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
