/**
 * Error Boundary Component
 * 
 * Catches React errors and displays user-friendly error messages
 */

'use client';

import React, { type ReactNode } from 'react';
import { AnimatedButton, AnimatedCard } from '@/systems/motion';
import { Reveal } from '@/systems/motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div 
          className="error-boundary min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800"
          role="alert"
          aria-live="assertive"
        >
          <Reveal direction="fade">
            <AnimatedCard variant="elevated" className="max-w-md w-full p-6 sm:p-8">
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Something went wrong
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <div className="flex gap-3 justify-center">
                  <AnimatedButton 
                    variant="primary"
                    onClick={this.resetError}
                  >
                    Try Again
                  </AnimatedButton>
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => window.location.href = '/'}
                  >
                    Go Home
                  </AnimatedButton>
                </div>
              </div>
            </AnimatedCard>
          </Reveal>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
