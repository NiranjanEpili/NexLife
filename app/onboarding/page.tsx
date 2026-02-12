'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LogoMinimal } from '@/components/ui/logo';
import { ChevronRight, ChevronLeft, Check, Target, DollarSign, BookOpen, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    major: '',
    year_of_study: '',
    bio: '',
    monthly_budget: '',
    budget_split: '50-30-20',
    academic_goals: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const { error} = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          university: formData.university,
          major: formData.major,
          year_of_study: formData.year_of_study,
          bio: formData.bio,
          monthly_budget: Number(formData.monthly_budget) || 0,
          budget_split: formData.budget_split,
          academic_goals: formData.academic_goals,
          onboarding_completed: true,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Welcome to NexLife! 🎉',
        description: 'Your account is all set up',
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete setup',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-4 border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <LogoMinimal size="lg" />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Welcome to NexLife
            </h1>
            <p className="text-gray-600 text-lg">
              Let's set up your personal Student Life OS
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
                  <p className="text-gray-600">Basic information to personalize your experience</p>
                </div>
              </div>

              <div>
                <Label htmlFor="full_name" className="font-semibold text-lg">What's your name?</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2 h-12 text-lg"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="bio" className="font-semibold text-lg">A bit about you (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a little about yourself..."
                  className="mt-2 text-lg"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Academic Journey</h2>
                  <p className="text-gray-600">Help us understand your study goals</p>
                </div>
              </div>

              <div>
                <Label htmlFor="university" className="font-semibold text-lg">Which university do you attend?</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g., Stanford University"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="major" className="font-semibold text-lg">What's your major?</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="year_of_study" className="font-semibold text-lg">Current year of study</Label>
                <select
                  id="year_of_study"
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full mt-2 px-4 py-3 border rounded-md text-lg"
                >
                  <option value="">Select year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Budget Setup */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Smart Budget Planning</h2>
                  <p className="text-gray-600">Set up your financial goals and habits</p>
                </div>
              </div>

              <div>
                <Label htmlFor="monthly_budget" className="font-semibold text-lg">Monthly Budget (₹)</Label>
                <Input
                  id="monthly_budget"
                  type="number"
                  value={formData.monthly_budget}
                  onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
                  placeholder="Enter your monthly budget"
                  className="mt-2 h-12 text-lg"
                />
              </div>

              <div>
                <Label htmlFor="budget_split" className="font-semibold text-lg">Budget Split Strategy</Label>
                <select
                  id="budget_split"
                  value={formData.budget_split}
                  onChange={(e) => setFormData({ ...formData, budget_split: e.target.value })}
                  className="w-full mt-2 px-4 py-3 border rounded-md text-lg"
                >
                  <option value="50-30-20">50% Usable - 30% Investment - 20% Savings</option>
                  <option value="60-30-10">60% Usable - 30% Investment - 10% Savings</option>
                  <option value="70-20-10">70% Usable - 20% Investment - 10% Savings</option>
                  <option value="40-40-20">40% Usable - 40% Investment - 20% Savings</option>
                </select>
              </div>

              {formData.monthly_budget && Number(formData.monthly_budget) > 0 && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <p className="font-bold text-green-800 mb-3 text-lg">Your Budget Breakdown</p>
                  <div className="space-y-2">
                    {formData.budget_split === '50-30-20' && (
                      <>
                        <p className="text-green-700 text-lg">💰 Usable: ₹{(Number(formData.monthly_budget) * 0.5).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">📈 Investment: ₹{(Number(formData.monthly_budget) * 0.3).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">💾 Savings: ₹{(Number(formData.monthly_budget) * 0.2).toLocaleString()}</p>
                      </>
                    )}
                    {formData.budget_split === '60-30-10' && (
                      <>
                        <p className="text-green-700 text-lg">💰 Usable: ₹{(Number(formData.monthly_budget) * 0.6).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">📈 Investment: ₹{(Number(formData.monthly_budget) * 0.3).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">💾 Savings: ₹{(Number(formData.monthly_budget) * 0.1).toLocaleString()}</p>
                      </>
                    )}
                    {formData.budget_split === '70-20-10' && (
                      <>
                        <p className="text-green-700 text-lg">💰 Usable: ₹{(Number(formData.monthly_budget) * 0.7).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">📈 Investment: ₹{(Number(formData.monthly_budget) * 0.2).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">💾 Savings: ₹{(Number(formData.monthly_budget) * 0.1).toLocaleString()}</p>
                      </>
                    )}
                    {formData.budget_split === '40-40-20' && (
                      <>
                        <p className="text-green-700 text-lg">💰 Usable: ₹{(Number(formData.monthly_budget) * 0.4).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">📈 Investment: ₹{(Number(formData.monthly_budget) * 0.4).toLocaleString()}</p>
                        <p className="text-green-700 text-lg">💾 Savings: ₹{(Number(formData.monthly_budget) * 0.2).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Set Your Goals</h2>
                  <p className="text-gray-600">What do you want to achieve?</p>
                </div>
              </div>

              <div>
                <Label htmlFor="academic_goals" className="font-semibold text-lg">Academic Goals</Label>
                <Textarea
                  id="academic_goals"
                  value={formData.academic_goals}
                  onChange={(e) => setFormData({ ...formData, academic_goals: e.target.value })}
                  placeholder="e.g., Maintain 3.5 GPA, Complete thesis by June, Learn Python..."
                  className="mt-2 text-lg"
                  rows={6}
                />
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 mb-3 text-lg">🎯 You're all set!</h3>
                <p className="text-blue-800">
                  NexLife will help you manage your time, money, tasks, and academics all in one place. 
                  You're about to unlock your most productive student life!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={step === 1}
              className="text-lg px-6 py-6"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-8 py-6"
              >
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg px-8 py-6"
              >
                <Check className="mr-2 h-5 w-5" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
