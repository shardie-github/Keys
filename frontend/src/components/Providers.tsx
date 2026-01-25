/**
 * Client-side Providers
 * 
 * Wraps app with error boundary, auth context, toast container, and diagnostics
 */

'use client';

import type { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ToastContainer } from './Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { RuntimeUiBanner } from './RuntimeUiBanner';
import { KeyboardShortcutsHelp } from './KeyboardShortcuts';
import { useKeyboardShortcuts, defaultShortcuts } from '@/hooks/useKeyboardShortcuts';

function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  useKeyboardShortcuts(defaultShortcuts, true);
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <KeyboardShortcutsProvider>
          <RuntimeUiBanner />
          {children}
          <ToastContainer />
          <DiagnosticsPanel />
          <KeyboardShortcutsHelp />
        </KeyboardShortcutsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
