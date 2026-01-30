'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'flat';
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, trend }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400',
  }[changeType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${changeColor}`}>
                {change}
              </span>
              {trend && (
                <span className={`text-xs ${changeColor}`}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: LucideIcon;
  status?: 'success' | 'error' | 'pending';
}

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

export function ActivityFeed({ items, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {item.icon && (
                <div className={`p-2 rounded-lg shrink-0 ${
                  item.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                  item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{item.timestamp}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
