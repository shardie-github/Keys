'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { AnimatedButton } from '@/systems/motion';
import { LoadingSpinner } from '@/components/Loading';
import { PageWrapper } from '@/components/PageWrapper';
import { ErrorToast, SuccessToast } from '@/components/Feedback';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);
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
          <h1 className="text-h2 font-bold text-center mb-2">Create your account</h1>
          <p className="text-center text-body text-muted-foreground">
            Or{' '}
            <Link
              href="/signin"
              className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded px-1"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 border border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </div>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create account'}
          </AnimatedButton>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link href="#" className="hover:text-foreground hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="hover:text-foreground hover:underline">
              Privacy Policy
            </Link>
          </p>
        </form>

        <SuccessToast
          message="Account created successfully! Redirecting..."
          isVisible={success}
          onDismiss={() => setSuccess(false)}
        />
      </div>
    </PageWrapper>
  );
}
