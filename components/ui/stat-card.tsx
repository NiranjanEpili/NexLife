import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  const gradients = {
    'Total Tasks': 'from-blue-500 to-indigo-600',
    'Upcoming Events': 'from-purple-500 to-pink-600',
    'Monthly Expenses': 'from-green-500 to-emerald-600',
    'Productivity': 'from-orange-500 to-red-600',
  };

  const iconBg = {
    'Total Tasks': 'bg-blue-100 dark:bg-blue-950',
    'Upcoming Events': 'bg-purple-100 dark:bg-purple-950',
    'Monthly Expenses': 'bg-green-100 dark:bg-green-950',
    'Productivity': 'bg-orange-100 dark:bg-orange-950',
  };

  const iconColor = {
    'Total Tasks': 'text-blue-600 dark:text-blue-400',
    'Upcoming Events': 'text-purple-600 dark:text-purple-400',
    'Monthly Expenses': 'text-green-600 dark:text-green-400',
    'Productivity': 'text-orange-600 dark:text-orange-400',
  };

  return (
    <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:scale-105 transform overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[title as keyof typeof gradients]} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconBg[title as keyof typeof iconBg]}`}>
          <Icon className={`h-5 w-5 ${iconColor[title as keyof typeof iconColor]}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={`text-3xl font-black bg-gradient-to-r ${gradients[title as keyof typeof gradients]} bg-clip-text text-transparent`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
        )}
        {trend && (
          <p className={`text-xs mt-1 font-bold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↗ +' : '↘ '}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
