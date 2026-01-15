'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RunAnalytics } from '@/components/Admin/RunAnalytics';
import { ActionHistory } from '@/components/BackgroundAgent/ActionHistory';
import { ProactiveSuggestions } from '@/components/BackgroundAgent/ProactiveSuggestions';
import { UsageDashboard } from '@/components/UsageDashboard';
import { ExportData } from '@/components/ExportData';
import { MoatMetricsDashboard } from '@/components/MoatMetricsDashboard';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper } from '@/components/PageWrapper';
import { LoadingSpinner } from '@/components/Loading';
import { Reveal, AnimatedCard } from '@/systems/motion';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const { profile, loading: profileLoading } = useUserProfile(userId || '');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?returnUrl=/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !userId) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading dashboard..." />
      </PageWrapper>
    );
  }

  if (profileLoading) {
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading dashboard..." />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-h1 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Dashboard
          </h1>
          <p className="text-body text-muted-foreground">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </p>
        </header>

        <main id="main-content" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-8" aria-label="Analytics and activity">
            <Reveal direction="left" delay={0}>
              <AnimatedCard variant="elevated" hoverable className="p-6 sm:p-8">
                <h2 className="text-h3 font-bold text-foreground mb-6">Analytics</h2>
                <RunAnalytics />
              </AnimatedCard>
            </Reveal>

            <Reveal direction="left" delay={100}>
              <AnimatedCard variant="elevated" hoverable className="p-6 sm:p-8">
                <h2 className="text-h3 font-bold text-foreground mb-6">Recent Activity</h2>
                <ActionHistory userId={userId} limit={10} />
              </AnimatedCard>
            </Reveal>
          </section>

          <aside className="space-y-8" aria-label="Quick information">
            <Reveal direction="right" delay={0}>
              <UsageDashboard />
            </Reveal>

            <Reveal direction="right" delay={100}>
              <AnimatedCard variant="elevated" hoverable className="p-6 sm:p-8">
                <h2 className="text-h3 font-bold text-foreground mb-6">Suggestions</h2>
                <ProactiveSuggestions userId={userId} />
              </AnimatedCard>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <MoatMetricsDashboard />
            </Reveal>

            <Reveal direction="right" delay={300}>
              <ExportData />
            </Reveal>

            <Reveal direction="right" delay={400}>
              <AnimatedCard variant="elevated" hoverable className="p-6 sm:p-8">
                <h2 className="text-h3 font-bold text-foreground mb-6">Quick Stats</h2>
                <dl className="space-y-4">
                  {profile && (
                    <>
                      <div>
                        <dt className="text-sm font-semibold text-muted-foreground">Role</dt>
                        <dd className="font-medium text-foreground mt-1">{profile.role || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-muted-foreground">Vertical</dt>
                        <dd className="font-medium text-foreground mt-1 capitalize">{profile.vertical || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-semibold text-muted-foreground mb-2">Stack</dt>
                        <dd>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(profile.stack || {})
                              .filter(([, enabled]) => enabled)
                              .map(([key]) => (
                                <span
                                  key={key}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium"
                                >
                                  {key}
                                </span>
                              ))}
                          </div>
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </AnimatedCard>
            </Reveal>
          </aside>
        </main>
      </div>
    </PageWrapper>
  );
}
