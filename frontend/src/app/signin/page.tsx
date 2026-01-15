'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { AnimatedButton } from '@/systems/motion';
import { LoadingSpinner } from '@/components/Loading';
import { PageWrapper } from '@/components/PageWrapper';
import { ErrorToast } from '@/components/Feedback';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  useEffect(() => {
    if (user && !authLoading) {
      router.push(returnUrl);
    }
  }, [user, authLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Failed to sign in');
      setLoading(false);
    } else {
      router.push(returnUrl);
    }
  };

  if (authLoading) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <LoadingSpinner label="Loading authentication..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-h2 font-bold text-center mb-2">Sign in to your account</h1>
          <p className="text-center text-body text-muted-foreground">
            Or{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-1"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">We'll never share your email</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <AnimatedButton
            type="submit"
            variant="primary"
            className="w-full h-12"
            isLoading={loading}
            isDisabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </AnimatedButton>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground hover:underline">
              Forgot your password?
            </Link>
          </p>
        </form>
      </div>
    </PageWrapper>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <PageWrapper className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading..." />
      </PageWrapper>
    }>
      <SignInContent />
    </Suspense>
  );
}
