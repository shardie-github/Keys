/**
 * Client-side Providers
 * 
 * Wraps app with error boundary, auth context, and toast container
 */

'use client';

import ErrorBoundary from './ErrorBoundary';
import { ToastContainer } from './Toast';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  );
}
