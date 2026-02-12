'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Expense {
  id: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
}

const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Shopping', 'Other'];

export default function ExpensesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [budgetRatio, setBudgetRatio] = useState('50/30/20');
  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit',
    category: 'Food',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    totalInvestment: 0,
  });

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) throw error;

      const expenses = data || [];
      setExpenses(expenses);

      const credit = expenses.filter(e => e.type === 'credit').reduce((sum, e) => sum + Number(e.amount), 0);
      const debit = expenses.filter(e => e.type === 'debit').reduce((sum, e) => sum + Number(e.amount), 0);
      const investment = expenses.filter(e => e.type === 'investment').reduce((sum, e) => sum + Number(e.amount), 0);

      setStats({
        totalCredit: credit,
        totalDebit: debit,
        totalInvestment: investment,
      });
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...formData,
          amount: parseFloat(formData.amount),
          user_id: user?.id,
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'Transaction added successfully' });
      setDialogOpen(false);
      resetForm();
      loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save transaction',
        variant: 'destructive',
      });
    }
  };

  const calculateBudget = () => {
    if (!monthlyIncome) return null;

    const income = parseFloat(monthlyIncome);
    const ratios = budgetRatio.split('/').map(Number);

    return {
      usableMoney: (income * ratios[0]) / 100,
      investment: (income * ratios[1]) / 100,
      savings: (income * ratios[2]) / 100,
    };
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'debit',
      category: 'Food',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const budget = calculateBudget();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg">💰 Expenses & Investments</h1>
                <p className="text-emerald-100 mt-1 text-lg">
                  Track your financial transactions
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBudgetDialogOpen(true)} className="bg-white/20 text-white border-white hover:bg-white hover:text-green-600 font-bold">
                  <PieChart className="mr-2 h-4 w-4" />
                  Budget
                </Button>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Transaction
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{stats.totalCredit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{stats.totalDebit.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{stats.totalInvestment.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Recent financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="credit">Income</TabsTrigger>
                  <TabsTrigger value="debit">Expenses</TabsTrigger>
                  <TabsTrigger value="investment">Investments</TabsTrigger>
                </TabsList>
                {['all', 'credit', 'debit', 'investment'].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    {loading ? (
                      <p className="text-muted-foreground">Loading...</p>
                    ) : expenses.filter(e => type === 'all' || e.type === type).length > 0 ? (
                      <div className="space-y-2">
                        {expenses
                          .filter(e => type === 'all' || e.type === type)
                          .map((expense) => (
                            <div
                              key={expense.id}
                              className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{expense.category}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    expense.type === 'credit'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                      : expense.type === 'investment'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {expense.type}
                                  </span>
                                </div>
                                {expense.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {expense.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(expense.date), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <div className={`text-lg font-bold ${
                                expense.type === 'credit'
                                  ? 'text-green-600'
                                  : expense.type === 'investment'
                                  ? 'text-blue-600'
                                  : 'text-red-600'
                              }`}>
                                {expense.type === 'credit' ? '+' : '-'}₹{Number(expense.amount).toFixed(2)}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No transactions found</p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Record a new financial transaction</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">Income</SelectItem>
                        <SelectItem value="debit">Expense</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  💰 Smart Budget Calculator
                </DialogTitle>
                <DialogDescription>Plan your finances with intelligent budgeting</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="income" className="font-semibold">Monthly Income (₹)</Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="Enter your monthly income"
                      className="mt-2 text-lg font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ratio" className="font-semibold">Budget Strategy</Label>
                    <Select value={budgetRatio} onValueChange={setBudgetRatio}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50/30/20">50/30/20 (Usable/Investment/Savings)</SelectItem>
                        <SelectItem value="60/30/10">60/30/10 (Usable/Investment/Savings)</SelectItem>
                        <SelectItem value="70/20/10">70/20/10 (Usable/Investment/Savings)</SelectItem>
                        <SelectItem value="40/40/20">40/40/20 (Usable/Investment/Savings)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {budget && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      📊 Your Budget Breakdown
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          💵 Usable Money ({budgetRatio.split('/')[0]}%)
                        </p>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                          ₹{budget.usableMoney.toFixed(2)}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">For daily expenses</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">
                          📈 Investment ({budgetRatio.split('/')[1]}%)
                        </p>
                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                          ₹{budget.investment.toFixed(2)}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Grow your wealth</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 border-2 border-green-200 dark:border-green-800 shadow-lg">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                          🏦 Savings ({budgetRatio.split('/')[2]}%)
                        </p>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">
                          ₹{budget.savings.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Emergency fund</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-2 border-amber-300 dark:border-amber-700">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">💡 Smart Tips</p>
                      <ul className="text-xs space-y-1 text-amber-700 dark:text-amber-300">
                        <li>• Track every expense to stay within your usable money budget</li>
                        <li>• Consider SIPs or mutual funds for your investment allocation</li>
                        <li>• Build an emergency fund worth 6 months of expenses</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setBudgetDialogOpen(false)} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
