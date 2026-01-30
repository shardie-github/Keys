'use client';

import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
