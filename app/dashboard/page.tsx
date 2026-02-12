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
  Clock,
  BarChart3,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    totalExpenses: 0,
    totalIncome: 0,
    totalInvestments: 0,
  });
  const [previousStats, setPreviousStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
    totalExpenses: 0,
  });
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeframe]);

  const getTimeRange = () => {
    const now = new Date();
    let start, end, prevStart, prevEnd;
    
    switch (timeframe) {
      case 'week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        prevStart = startOfWeek(subWeeks(now, 1));
        prevEnd = endOfWeek(subWeeks(now, 1));
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        prevStart = startOfMonth(subMonths(now, 1));
        prevEnd = endOfMonth(subMonths(now, 1));
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        prevStart = startOfYear(subMonths(now, 12));
        prevEnd = endOfYear(subMonths(now, 12));
        break;
      default:
        start = startOfWeek(now);
        end = endOfWeek(now);
        prevStart = startOfWeek(subWeeks(now, 1));
        prevEnd = endOfWeek(subWeeks(now, 1));
    }
    
    return { start, end, prevStart, prevEnd };
  };

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { start, end, prevStart, prevEnd } = getTimeRange();

      // Current period stats
      const [tasksResult, completedResult, eventsResult, expensesResult, incomeResult, investmentsResult, upcomingTasksResult, todayEventsResult] = await Promise.all([
        supabase.from('tasks').select('id').eq('user_id', user?.id).gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
        supabase.from('tasks').select('id').eq('user_id', user?.id).eq('status', 'completed').gte('created_at', start.toISOString()).lte('created_at', end.toISOString()),
        supabase.from('calendar_events').select('id').eq('user_id', user?.id).gte('start_time', start.toISOString()).lte('start_time', end.toISOString()),
        supabase.from('expenses').select('amount').eq('user_id', user?.id).eq('type', 'debit').gte('date', format(start, 'yyyy-MM-dd')).lte('date', format(end, 'yyyy-MM-dd')),
        supabase.from('expenses').select('amount').eq('user_id', user?.id).eq('type', 'credit').gte('date', format(start, 'yyyy-MM-dd')).lte('date', format(end, 'yyyy-MM-dd')),
        supabase.from('expenses').select('amount').eq('user_id', user?.id).eq('type', 'investment').gte('date', format(start, 'yyyy-MM-dd')).lte('date', format(end, 'yyyy-MM-dd')),
        supabase.from('tasks').select('*').eq('user_id', user?.id).neq('status', 'completed').order('due_date', { ascending: true }).limit(5),
        supabase.from('calendar_events').select('*').eq('user_id', user?.id).gte('start_time', today.toISOString()).lte('start_time', endOfDay.toISOString()).order('start_time', { ascending: true })
      ]);

      // Previous period stats for comparison
      const [prevTasksResult, prevCompletedResult, prevEventsResult, prevExpensesResult] = await Promise.all([
        supabase.from('tasks').select('id').eq('user_id', user?.id).gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString()),
        supabase.from('tasks').select('id').eq('user_id', user?.id).eq('status', 'completed').gte('created_at', prevStart.toISOString()).lte('created_at', prevEnd.toISOString()),
        supabase.from('calendar_events').select('id').eq('user_id', user?.id).gte('start_time', prevStart.toISOString()).lte('start_time', prevEnd.toISOString()),
        supabase.from('expenses').select('amount').eq('user_id', user?.id).eq('type', 'debit').gte('date', format(prevStart, 'yyyy-MM-dd')).lte('date', format(prevEnd, 'yyyy-MM-dd')),
      ]);

      const totalExpenses = expensesResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const totalIncome = incomeResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const totalInvestments = investmentsResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
      const prevTotalExpenses = prevExpensesResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

      setStats({
        totalTasks: tasksResult.data?.length || 0,
        completedTasks: completedResult.data?.length || 0,
        upcomingEvents: eventsResult.data?.length || 0,
        totalExpenses,
        totalIncome,
        totalInvestments,
      });

      setPreviousStats({
        totalTasks: prevTasksResult.data?.length || 0,
        completedTasks: prevCompletedResult.data?.length || 0,
        upcomingEvents: prevEventsResult.data?.length || 0,
        totalExpenses: prevTotalExpenses,
      });

      setUpcomingTasks(upcomingTasksResult.data || []);
      setTodayEvents(todayEventsResult.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
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
        <div className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-10 blur-3xl"></div>
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
                    Welcome to NexLife! ✨
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Your personalized dashboard • {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={timeframe === 'week' ? 'secondary' : 'outline'}
                    onClick={() => setTimeframe('week')}
                    className={timeframe === 'week' ? 'bg-white text-purple-600 font-bold' : 'bg-white/20 text-white border-white hover:bg-white hover:text-purple-600'}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeframe === 'month' ? 'secondary' : 'outline'}
                    onClick={() => setTimeframe('month')}
                    className={timeframe === 'month' ? 'bg-white text-purple-600 font-bold' : 'bg-white/20 text-white border-white hover:bg-white hover:text-purple-600'}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={timeframe === 'year' ? 'secondary' : 'outline'}
                    onClick={() => setTimeframe('year')}
                    className={timeframe === 'year' ? 'bg-white text-purple-600 font-bold' : 'bg-white/20 text-white border-white hover:bg-white hover:text-purple-600'}
                  >
                    Year
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon={CheckSquare}
              description={`${stats.completedTasks} completed`}
              trend={calculateTrend(stats.totalTasks, previousStats.totalTasks)}
            />
            <StatCard
              title="Upcoming Events"
              value={stats.upcomingEvents}
              icon={Calendar}
              description={`This ${timeframe}`}
              trend={calculateTrend(stats.upcomingEvents, previousStats.upcomingEvents)}
            />
            <StatCard
              title="Monthly Expenses"
              value={`₹${stats.totalExpenses.toFixed(2)}`}
              icon={TrendingDown}
              description={`This ${timeframe}`}
              trend={calculateTrend(stats.totalExpenses, previousStats.totalExpenses)}
            />
            <StatCard
              title="Productivity"
              value={`${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
              icon={TrendingUp}
              description="Task completion rate"
            />
          </div>

          {/* Financial Overview */}
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                💰 Financial Overview - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </CardTitle>
              <CardDescription>Track your income, expenses, and investments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Total Income</p>
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">₹{stats.totalIncome.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Total Expenses</p>
                  <p className="text-3xl font-black text-red-600 dark:text-red-400">₹{stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Investments</p>
                  <p className="text-3xl font-black text-purple-600 dark:text-purple-400">₹{stats.totalInvestments.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-300 dark:border-emerald-700">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Net Balance</p>
                <p className={`text-4xl font-black ${(stats.totalIncome - stats.totalExpenses - stats.totalInvestments) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  ₹{(stats.totalIncome - stats.totalExpenses - stats.totalInvestments).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Upcoming Tasks 📋</CardTitle>
                    <CardDescription>Your next priorities</CardDescription>
                  </div>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900">
                      View All →
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
                        className="flex items-start justify-between p-4 rounded-xl bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-blue-950/30 border border-blue-200 dark:border-blue-900 hover:shadow-md transition-all"
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

            <Card className="border-2 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Today's Events 📅</CardTitle>
                    <CardDescription>Your schedule for today</CardDescription>
                  </div>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm" className="hover:bg-purple-100 dark:hover:bg-purple-900">
                      View Calendar →
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
                        className="flex items-start p-4 rounded-xl bg-gradient-to-r from-white to-purple-50 dark:from-slate-800 dark:to-purple-950/30 border border-purple-200 dark:border-purple-900 hover:shadow-md transition-all"
                      >
                        <div
                          className="w-2 h-12 rounded-full mr-3 shadow-lg"
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

          <Card className="border-2 border-gradient-to-r shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-200 dark:to-gray-200 bg-clip-text text-transparent">Quick Actions ⚡</CardTitle>
              <CardDescription>Jump to common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Link href="/tasks">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 hover:from-blue-100 hover:to-indigo-200 border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">Add Task</span>
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-950 hover:from-purple-100 hover:to-pink-200 border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold">Add Event</span>
                  </Button>
                </Link>
                <Link href="/expenses">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 hover:from-green-100 hover:to-emerald-200 border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Add Expense</span>
                  </Button>
                </Link>
                <Link href="/academics">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-200 border-2 border-orange-200 dark:border-orange-800 hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <span className="font-semibold">Add Study</span>
                  </Button>
                </Link>
                <Link href="/shopping">
                  <Button variant="outline" className="w-full h-20 flex-col gap-2 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-950 hover:from-red-100 hover:to-rose-200 border-2 border-red-200 dark:border-red-800 hover:scale-105 transition-transform">
                    <Plus className="h-6 w-6 text-red-600 dark:text-red-400" />
                    <span className="font-semibold">Add List</span>
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
