'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Target, DollarSign, BookOpen, Bell, Save, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: user?.email || '',
    university: '',
    major: '',
    year_of_study: '',
    bio: '',
    monthly_budget: 0,
    budget_split: '50-30-20',
    academic_goals: '',
  });
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalEvents: 0,
    totalExpenses: 0,
    totalNotes: 0,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user?.email || '',
          university: data.university || '',
          major: data.major || '',
          year_of_study: data.year_of_study || '',
          bio: data.bio || '',
          monthly_budget: data.monthly_budget || 0,
          budget_split: data.budget_split || '50-30-20',
          academic_goals: data.academic_goals || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [tasksResult, eventsResult, expensesResult, notesResult] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('calendar_events').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('expenses').select('id', { count: 'exact' }).eq('user_id', user?.id),
        supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user?.id),
      ]);

      setStats({
        totalTasks: tasksResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalExpenses: expensesResult.count || 0,
        totalNotes: notesResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          university: profile.university,
          major: profile.major,
          year_of_study: profile.year_of_study,
          bio: profile.bio,
          monthly_budget: profile.monthly_budget,
          budget_split: profile.budget_split,
          academic_goals: profile.academic_goals,
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white drop-shadow-lg">
                    {profile.full_name || 'Your Profile'}
                  </h1>
                  <p className="text-purple-100 mt-1 text-lg">{profile.email}</p>
                </div>
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                className="bg-white/20 text-white border-white hover:bg-white hover:text-red-600 font-semibold"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalTasks}</p>
                  </div>
                  <Target className="h-12 w-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Events</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalEvents}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Expenses</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalExpenses}</p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.totalNotes}</p>
                  </div>
                  <BookOpen className="h-12 w-12 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="full_name" className="font-semibold">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="font-semibold">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Academic Information
                  </CardTitle>
                  <CardDescription>Your university and study details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="university" className="font-semibold">University</Label>
                    <Input
                      id="university"
                      value={profile.university}
                      onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                      placeholder="Your university name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="major" className="font-semibold">Major / Course</Label>
                    <Input
                      id="major"
                      value={profile.major}
                      onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="year_of_study" className="font-semibold">Year of Study</Label>
                    <select
                      id="year_of_study"
                      value={profile.year_of_study}
                      onChange={(e) => setProfile({ ...profile, year_of_study: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="academic_goals" className="font-semibold">Academic Goals</Label>
                    <Textarea
                      id="academic_goals"
                      value={profile.academic_goals}
                      onChange={(e) => setProfile({ ...profile, academic_goals: e.target.value })}
                      placeholder="Your academic goals and targets..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Settings */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Financial Settings
                  </CardTitle>
                  <CardDescription>Manage your budget preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="monthly_budget" className="font-semibold">Monthly Budget (₹)</Label>
                    <Input
                      id="monthly_budget"
                      type="number"
                      value={profile.monthly_budget}
                      onChange={(e) => setProfile({ ...profile, monthly_budget: Number(e.target.value) })}
                      placeholder="Enter your monthly budget"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_split" className="font-semibold">Budget Split</Label>
                    <select
                      id="budget_split"
                      value={profile.budget_split}
                      onChange={(e) => setProfile({ ...profile, budget_split: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="50-30-20">50% Usable - 30% Investment - 20% Savings</option>
                      <option value="60-30-10">60% Usable - 30% Investment - 10% Savings</option>
                      <option value="70-20-10">70% Usable - 20% Investment - 10% Savings</option>
                      <option value="40-40-20">40% Usable - 40% Investment - 20% Savings</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-2">Budget Breakdown</p>
                    {profile.monthly_budget > 0 && (
                      <div className="space-y-1 text-sm text-green-700">
                        {profile.budget_split === '50-30-20' && (
                          <>
                            <p>💰 Usable: ₹{(profile.monthly_budget * 0.5).toLocaleString()}</p>
                            <p>📈 Investment: ₹{(profile.monthly_budget * 0.3).toLocaleString()}</p>
                            <p>💾 Savings: ₹{(profile.monthly_budget * 0.2).toLocaleString()}</p>
                          </>
                        )}
                        {profile.budget_split === '60-30-10' && (
                          <>
                            <p>💰 Usable: ₹{(profile.monthly_budget * 0.6).toLocaleString()}</p>
                            <p>📈 Investment: ₹{(profile.monthly_budget * 0.3).toLocaleString()}</p>
                            <p>💾 Savings: ₹{(profile.monthly_budget * 0.1).toLocaleString()}</p>
                          </>
                        )}
                        {profile.budget_split === '70-20-10' && (
                          <>
                            <p>💰 Usable: ₹{(profile.monthly_budget * 0.7).toLocaleString()}</p>
                            <p>📈 Investment: ₹{(profile.monthly_budget * 0.2).toLocaleString()}</p>
                            <p>💾 Savings: ₹{(profile.monthly_budget * 0.1).toLocaleString()}</p>
                          </>
                        )}
                        {profile.budget_split === '40-40-20' && (
                          <>
                            <p>💰 Usable: ₹{(profile.monthly_budget * 0.4).toLocaleString()}</p>
                            <p>📈 Investment: ₹{(profile.monthly_budget * 0.4).toLocaleString()}</p>
                            <p>💾 Savings: ₹{(profile.monthly_budget * 0.2).toLocaleString()}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Notifications</p>
                        <p className="text-sm text-blue-700">Receive reminder alerts</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Email</p>
                        <p className="text-sm text-gray-700">{profile.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Member Since</p>
                    <p className="text-lg font-bold text-gray-900">
                      {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg px-8 py-6"
              >
                <Save className="mr-2 h-5 w-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
