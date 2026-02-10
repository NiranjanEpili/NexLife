'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isTomorrow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    monthlyExpenses: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [tasksResult, completedResult, eventsResult, expensesResult, upcomingTasksResult, todayEventsResult] = await Promise.all([
        supabase.from('tasks').select('id').eq('user_id', user?.id),
        supabase.from('tasks').select('id').eq('user_id', user?.id).eq('status', 'completed'),
        supabase.from('calendar_events').select('id').eq('user_id', user?.id).gte('start_time', new Date().toISOString()),
        supabase.from('expenses').select('amount').eq('user_id', user?.id).eq('type', 'debit').gte('date', format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd')),
        supabase.from('tasks').select('*').eq('user_id', user?.id).neq('status', 'completed').order('due_date', { ascending: true }).limit(5),
        supabase.from('calendar_events').select('*').eq('user_id', user?.id).gte('start_time', today.toISOString()).lte('start_time', endOfDay.toISOString()).order('start_time', { ascending: true })
      ]);

      const totalExpenses = expensesResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      setStats({
        totalTasks: tasksResult.data?.length || 0,
        completedTasks: completedResult.data?.length || 0,
        upcomingEvents: eventsResult.data?.length || 0,
        monthlyExpenses: totalExpenses,
      });

      setUpcomingTasks(upcomingTasksResult.data || []);
      setTodayEvents(todayEventsResult.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateLabel = (dueDate: string) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Welcome back! Here's your overview
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon={CheckSquare}
              description={`${stats.completedTasks} completed`}
            />
            <StatCard
              title="Upcoming Events"
              value={stats.upcomingEvents}
              icon={Calendar}
              description="Scheduled ahead"
            />
            <StatCard
              title="Monthly Expenses"
              value={`$${stats.monthlyExpenses.toFixed(2)}`}
              icon={DollarSign}
              description="This month"
            />
            <StatCard
              title="Productivity"
              value={`${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
              icon={TrendingUp}
              description="Task completion rate"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Tasks</CardTitle>
                    <CardDescription>Your next priorities</CardDescription>
                  </div>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getDueDateLabel(task.due_date)}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming tasks</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Events</CardTitle>
                    <CardDescription>Your schedule for today</CardDescription>
                  </div>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm">
                      View Calendar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div
                          className="w-1 h-full rounded-full mr-3"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events today</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Link href="/tasks">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </Link>
                <Link href="/expenses">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </Link>
                <Link href="/academics">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Study
                  </Button>
                </Link>
                <Link href="/shopping">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
