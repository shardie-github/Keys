'use client';

import { motion } from 'framer-motion';
import { KeysLogo } from '@/components/Logo';

export function WelcomingHero() {
  return (
    <section className="max-w-4xl mx-auto mb-12 sm:mb-16 text-center" aria-labelledby="hero-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 sm:mb-12"
      >
        <KeysLogo size={80} animated={false} />
      </motion.div>

      <motion.h1
        id="hero-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="text-h1 font-bold text-foreground mb-6 sm:mb-8"
      >
        You&apos;re not behind.
        <br />
        <span className="text-primary">You already have the tools.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-body text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto"
      >
        KEYS helps you unlock practical capability from the tools you already use—without competing with them.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg max-w-xl mx-auto"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            <strong className="font-semibold text-primary">What KEYS is:</strong> Structured assets (notebooks, prompts, workflows) that unlock capability in Cursor, Jupyter, GitHub, Stripe, and more.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="font-semibold text-foreground">What KEYS isn&apos;t:</strong> A framework, an AI autopilot, or an execution engine. KEYS is the keyring—you own the tools.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
