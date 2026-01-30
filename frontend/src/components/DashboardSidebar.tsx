'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Key,
  Users,
  Settings,
  FileText,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Shield,
  Zap,
  GitBranch,
} from 'lucide-react';

interface SidebarProps {
  user?: {
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/activity', label: 'Activity', icon: BarChart3 },
  { href: '/library', label: 'Library', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const secondaryNavItems = [
  { href: '/dashboard/security', label: 'Security', icon: Shield },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Zap },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: GitBranch },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Key className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">KEYS</span>
        </Link>
      </div>

      {/* User Profile */}
      {user && (
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-slate-200 dark:ring-slate-700 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.role || 'Member'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-8 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500 font-mono">
            /
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Advanced
          </p>
          <nav className="flex flex-col gap-1">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
          <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
        </button>
        <Link
          href="/signout"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
