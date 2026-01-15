'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SituationTile {
  id: string;
  situation: string;
  description: string;
  icon: string;
  route: string;
  filters?: Record<string, string>;
  gradient?: string;
}

const situations: SituationTile[] = [
  {
    id: 'responsible-breaking',
    situation: "I'm responsible for something breaking",
    description: 'Find Keys that help you respond calmly and systematically when things go wrong.',
    icon: '🛡️',
    route: '/marketplace',
    filters: { situation: 'incident-response', category: 'runbook' },
    gradient: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
  },
  {
    id: 'ship-faster',
    situation: 'I want to ship faster without messing things up',
    description: 'Discover Keys that help you move quickly while maintaining quality and avoiding common pitfalls.',
    icon: '⚡',
    route: '/marketplace',
    filters: { situation: 'shipping', category: 'workflow' },
    gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
  },
  {
    id: 'inherited-system',
    situation: "I inherited a system I don't fully trust",
    description: "Get Keys that help you understand, document, and safely modify systems you didn't build.",
    icon: '🔍',
    route: '/marketplace',
    filters: { situation: 'understanding', category: 'documentation' },
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
  },
  {
    id: 'only-understander',
    situation: "I don't want to be the only one who understands this",
    description: 'Find Keys that help you share knowledge and reduce single points of failure.',
    icon: '👥',
    route: '/marketplace',
    filters: { situation: 'knowledge-sharing', category: 'documentation' },
    gradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
  },
];

export function SituationEntryTiles() {
  const [isHydrated, setIsHydrated] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="max-w-5xl mx-auto mb-16 sm:mb-24" aria-labelledby="situation-heading">
      <h2 id="situation-heading" className="sr-only">
        Choose your situation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {situations.map((situation, index) => {
          const href = `${situation.route}?${new URLSearchParams(situation.filters).toString()}`;
          
          return (
            <motion.div
              key={situation.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.1, duration: 0.5 }}
            >
              <Link 
                href={href} 
                className="block h-full group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-lg"
              >
                <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-2 focus-within:ring-2 focus-within:ring-primary border border-border bg-gradient-to-br ${situation.gradient}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl sm:text-6xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                        {situation.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors">
                          {situation.situation}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                      {situation.description}
                    </CardDescription>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                      onClick={(e) => {
                        // Let the link handle navigation
                        e.preventDefault();
                      }}
                    >
                      Explore Keys
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
