'use client';

import { ReactNode } from 'react';
import { Providers } from '@/components/Providers';

export function RootProvider({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
