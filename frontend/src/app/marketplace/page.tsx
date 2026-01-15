'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainerVariants, scaleVariants } from '@/systems/motion/variants';
import { getDemoKeys, DEMO_DISCOVERY_RECOMMENDATIONS } from '@/services/demoData';
import { SituationKeyCard } from '@/components/Marketplace/SituationKeyCard';
import { getKeySituation, groupKeysBySituation, situationGroupLabels } from '@/utils/keySituations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Key {
  id: string;
  slug: string;
  title: string;
  description?: string;
  key_type: 'jupyter' | 'node' | 'next' | 'runbook';
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  version: string;
  license_spdx: string;
  outcome?: string;
  maturity?: 'starter' | 'operator' | 'scale' | 'enterprise';
  created_at?: string;
  isDemo?: boolean;
}

interface DiscoveryRecommendation {
  id: string;
  slug: string;
  title: string;
  description?: string;
  key_type: string;
  version: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function MarketplacePage() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [recommendations, setRecommendations] = useState<DiscoveryRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyTypeFilter, setKeyTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  }, []);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const params = new URLSearchParams();
      if (keyTypeFilter) params.append('key_type', keyTypeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (searchQuery) params.append('search', searchQuery);

      try {
        const response = await fetch(`${apiUrl}/marketplace/keys?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setKeys(data.keys || []);
          setError(null);
          return;
        }
      } catch {
        // Fall through to demo data
      }

      const demoKeys = getDemoKeys({
        key_type: keyTypeFilter || undefined,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      });
      
      const convertedKeys: Key[] = demoKeys.map(demoKey => ({
        ...demoKey,
        created_at: new Date().toISOString(),
        isDemo: true,
      }));
      
      setKeys(convertedKeys);
      setError(null);
    } catch {
      setKeys([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [keyTypeFilter, categoryFilter, searchQuery]);

  const fetchRecommendations = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/marketplace/discover`, {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.recommendations && data.recommendations.length > 0) {
                setRecommendations(data.recommendations);
                return;
              }
            }
          } catch {
            // Fall through to demo recommendations
          }
        }
      }

      setRecommendations(DEMO_DISCOVERY_RECOMMENDATIONS);
    } catch {
      setRecommendations(DEMO_DISCOVERY_RECOMMENDATIONS);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkAuth();
    fetchKeys();
  }, [checkAuth, fetchKeys]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const recordDiscoveryClick = async (keyId: string, reason: string) => {
    if (!isAuthenticated) return;

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/marketplace/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          event_type: 'discovery_click',
          key_id: keyId,
          discovery_reason: reason,
        }),
      });
    } catch (err) {
      console.error('Failed to track discovery click:', err);
    }
  };

  const categories = Array.from(new Set(keys.map((k) => k.category).filter(Boolean))) as string[];
  const keyTypes: Array<'jupyter' | 'node' | 'next' | 'runbook'> = ['jupyter', 'node', 'next', 'runbook'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"
          />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="mb-4 text-6xl" aria-hidden="true">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Unable to load marketplace
          </h2>
          <p className="text-muted-foreground mb-6">
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setError(null);
              fetchKeys();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
        Skip to main content
      </a>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12 sm:mb-16"
      >
        <h1 className="text-h1 font-bold mb-4">KEYS Marketplace</h1>
        <p className="text-body text-muted-foreground mb-8 max-w-3xl">
          Discover and unlock practical capability in Cursor, Jupyter, Node.js, and more. 
          Each key unlocks a specific workflow, component, or runbook you can integrate into your projects.
        </p>
        {keys.some(k => k.isDemo) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Demo Mode:</strong> You&apos;re viewing sample Keys.{' '}
              <Link href="/signup" className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-100">
                Sign up
              </Link>
              {' '}to access the full marketplace.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <h2 className="text-h3 font-bold mb-4">Recommended for You</h2>
              <motion.div
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    variants={scaleVariants}
                    custom={index}
                  >
                    <Link
                      href={`/marketplace/${rec.slug}`}
                      onClick={() => recordDiscoveryClick(rec.id, rec.reason)}
                      className="block border rounded-lg p-4 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">{rec.title}</h3>
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`px-2 py-1 text-xs rounded ${
                            rec.confidence === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            rec.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {rec.confidence}
                        </motion.span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {rec.description || 'No description available'}
                      </p>
                      <p className="text-xs text-primary italic">{rec.reason}</p>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8"
        >
          <label htmlFor="search-keys" className="sr-only">
            Search keys
          </label>
          <motion.div className="flex-1 min-w-full sm:min-w-[200px]" whileFocus={{ scale: 1.02 }}>
            <Input
              id="search-keys"
              type="text"
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search keys"
            />
          </motion.div>
          <label htmlFor="key-type-filter" className="sr-only">
            Filter by key type
          </label>
          <select
            id="key-type-filter"
            value={keyTypeFilter}
            onChange={(e) => setKeyTypeFilter(e.target.value)}
            aria-label="Filter by key type"
            className="px-4 py-2 border rounded-lg bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
          >
            <option value="">All Types</option>
            {keyTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {categories.length > 0 && (
            <>
              <label htmlFor="category-filter" className="sr-only">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="px-4 py-2 border rounded-lg bg-background text-foreground dark:bg-slate-800 dark:border-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </>
          )}
        </motion.div>
      </motion.div>

      <main id="main-content">
        <AnimatePresence mode="wait">
          {keys.length === 0 && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="mb-4 text-6xl" aria-hidden="true">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No keys found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or{' '}
                <button
                  onClick={() => {
                    setKeyTypeFilter('');
                    setCategoryFilter('');
                    setSearchQuery('');
                  }}
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  clear all filters
                </button>
              </p>
              {keys.some(k => k.isDemo) && (
                <Button asChild>
                  <Link href="/signup">Sign up for full access</Link>
                </Button>
              )}
            </motion.div>
          ) : keys.length > 0 ? (
            <motion.div
              key="grid"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12 sm:space-y-16"
            >
              {Object.entries(groupKeysBySituation(keys)).map(([group, groupKeys]) => {
                if (groupKeys.length === 0) return null;
                
                return (
                  <motion.section
                    key={group}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-h2 font-bold text-foreground flex-shrink-0">
                        {situationGroupLabels[group] || situationGroupLabels['other']}
                      </h2>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        {groupKeys.length} {groupKeys.length === 1 ? 'Key' : 'Keys'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {groupKeys.map((key, index) => {
                        const situation = getKeySituation(key.slug);
                        return (
                          <SituationKeyCard
                            key={key.id}
                            id={key.id}
                            slug={key.slug}
                            title={key.title}
                            description={key.description}
                            whenYouNeedThis={situation.whenYouNeedThis}
                            whatThisPrevents={situation.whatThisPrevents}
                            hasAccess={false}
                            keyType={key.key_type}
                            category={key.category}
                            index={index}
                          />
                        );
                      })}
                    </div>
                  </motion.section>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay: 0.2 }}
        className="mt-16 sm:mt-24"
      >
        <h2 className="text-h2 font-bold mb-8">Bundles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { type: 'starter', title: 'Starter Bundle', desc: 'Essential keys for getting started', href: '/marketplace/bundles?type=starter' },
            { type: 'operator', title: 'Operator Bundle', desc: 'Runbooks and operational keys', href: '/marketplace/bundles?type=operator' },
            { type: 'pro', title: 'Pro Tier', desc: 'All keys, unlimited access', href: '/marketplace/bundles?type=pro', featured: true },
          ].map((bundle, index) => (
            <motion.div
              key={bundle.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Link
                href={bundle.href}
                className={`block border rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
                  bundle.featured ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-primary/30' : 'bg-card border-border dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <h3 className="text-lg font-bold text-foreground mb-2">{bundle.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {bundle.desc}
                </p>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="text-base font-bold text-primary"
                >
                  View {bundle.type === 'pro' ? 'Tier' : 'Bundle'} →
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
