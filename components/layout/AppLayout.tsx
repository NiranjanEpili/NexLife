'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogoMinimal } from '@/components/ui/logo';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  CheckSquare,
  BookOpen,
  ShoppingCart,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/academics', label: 'Academics', icon: BookOpen },
  { href: '/shopping', label: 'Shopping', icon: ShoppingCart },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            <div className="flex items-center gap-3">
              <LogoMinimal size="md" />
              <div className="flex flex-col">
                <span className="text-xl font-black text-white leading-none">NexLife</span>
                <span className="text-[8px] font-semibold text-blue-100 tracking-wider uppercase">Life Simplified</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Icon className={cn('mr-3 h-5 w-5', isActive ? 'text-blue-600 dark:text-blue-400' : '')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-slate-200 dark:border-slate-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-slate-500 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden flex items-center justify-between h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 border-b border-slate-200 dark:border-slate-700 px-4 shadow-lg">
          <div className="flex items-center gap-2">
            <LogoMinimal size="sm" />
            <span className="text-lg font-black text-white">NexLife</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/20"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <Icon className={cn('mr-3 h-5 w-5', isActive ? 'text-blue-600 dark:text-blue-400' : '')} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
