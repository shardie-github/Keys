/**
 * PageWrapper
 * 
 * Wrapper component that adds page transitions and consistent layout.
 */

'use client';

import { PageTransition } from '@/systems/motion';
import type { ReactNode } from 'react';

export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <PageTransition className={className}>
      {children}
    </PageTransition>
  );
}
