'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

type LogoVariant = 'icon' | 'full' | 'text-lockup' | 'monochrome';
type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface KeysLogoV2Props extends VariantProps<typeof logoVariants> {
  size?: LogoSize | number;
  animated?: boolean;
  className?: string;
  variant?: LogoVariant;
}

const logoVariants = cva('inline-block', {
  variants: {
    variant: {
      icon: '',
      full: 'flex flex-col items-center gap-4',
      'text-lockup': 'flex items-center gap-4',
      monochrome: 'grayscale',
    },
  },
  defaultVariants: {
    variant: 'icon',
  },
});

const sizeMap: Record<LogoSize, number> = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 80,
  xl: 120,
  '2xl': 160,
};

/**
 * Technical Key-Ring Logo
 * 
 * A mechanical-styled logo featuring:
 * - Central engineered key-ring with crosshatch details
 * - Four tool-specific keys at cardinal directions (12, 3, 6, 9 o'clock)
 * - Tool icons integrated into key heads
 * - High-contrast, technical aesthetic
 * - Framer Motion "Key Unlock" animation pattern
 * 
 * @example
 * // Icon variant (compact)
 * <KeysLogoV2 size="lg" variant="icon" animated />
 * 
 * // Full logo with text
 * <KeysLogoV2 size="xl" variant="full" />
 * 
 * // Text lockup for horizontal layouts
 * <KeysLogoV2 variant="text-lockup" size="md" />
 * 
 * // Monochrome for contexts that need grayscale
 * <KeysLogoV2 variant="monochrome" />
 */
export function KeysLogoV2({
  size = 'md',
  animated = true,
  className = '',
  variant = 'icon',
}: KeysLogoV2Props) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const sizeValue = typeof size === 'number' ? size : sizeMap[size as LogoSize];
  // Only show animations after hydration is complete to avoid hydration mismatches
  const shouldAnimate = animated && isHydrated;

  // Animation variants for the "Key Unlock" pattern
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const ringVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1], // spring-like ease
      },
    },
  };

  const keyVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.1 * (i + 1),
      },
    }),
  };

  const iconVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.7,
        duration: 0.3,
      },
    },
  };

  // SVG Icon Mark (just the key-ring + 4 keys)
  const IconMark = () => (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'w-auto h-auto',
        variant === 'monochrome' && 'grayscale',
        className
      )}
    >
      <defs>
        <pattern id="crosshatch" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="currentColor" opacity="0.05" />
          <path d="M 0 0 l 8 8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
          <path d="M 8 0 l -8 8" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>

      {/* Central Mechanical Key-Ring */}
      <motion.g
        variants={ringVariants}
        initial={isHydrated ? 'hidden' : 'visible'}
        animate="visible"
      >
        {/* Outer ring with geometric precision */}
        <circle
          cx="70"
          cy="70"
          r="45"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          className="text-slate-900 dark:text-slate-100"
        />

        {/* Inner ring */}
        <circle
          cx="70"
          cy="70"
          r="37"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="text-slate-700 dark:text-slate-300"
          opacity="0.6"
        />

        {/* Crosshatch fill pattern for technical feel */}
        <circle
          cx="70"
          cy="70"
          r="41"
          fill="url(#crosshatch)"
          className="text-slate-900 dark:text-slate-100"
        />

        {/* Ring notches (gear-like details) - 8 notches for precision */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 70 + 45 * Math.cos(rad);
          const y1 = 70 + 45 * Math.sin(rad);
          const x2 = 70 + 51 * Math.cos(rad);
          const y2 = 70 + 51 * Math.sin(rad);
          return (
            <line
              key={`notch-${angle}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-slate-900 dark:text-slate-100"
            />
          );
        })}

        {/* Center hub */}
        <circle
          cx="70"
          cy="70"
          r="8"
          fill="currentColor"
          className="text-slate-900 dark:text-slate-100"
        />

        {/* Center accent */}
        <circle
          cx="70"
          cy="70"
          r="4"
          fill="currentColor"
          className="text-blue-500 dark:text-blue-400"
        />
      </motion.g>

      {/* KEY 1 - CURSOR (TOP) - Blue, Code Symbol */}
      <motion.g
        custom={0}
        variants={keyVariants}
        initial={isHydrated ? 'hidden' : 'visible'}
        animate="visible"
      >
        {/* Key shaft */}
        <rect
          x="64"
          y="16"
          width="12"
          height="32"
          rx="2"
          fill="currentColor"
          className="text-blue-600 dark:text-blue-400"
        />
        {/* Key head (rounded square) */}
        <rect
          x="60"
          y="10"
          width="20"
          height="20"
          rx="3"
          fill="currentColor"
          className="text-blue-600 dark:text-blue-400"
        />
        {/* Code symbol: < > inside */}
        <motion.g
          variants={iconVariants}
          initial={isHydrated ? 'hidden' : 'visible'}
          animate="visible"
        >
          <path
            d="M 64 15 L 68 19 L 64 23"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 76 15 L 72 19 L 76 23"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.g>

      {/* KEY 2 - JUPYTER (RIGHT) - Purple, Graph Symbol */}
      <motion.g
        custom={1}
        variants={shouldAnimate ? keyVariants : undefined}
        initial={shouldAnimate ? 'hidden' : undefined}
        animate={shouldAnimate ? 'visible' : undefined}
      >
        {/* Key shaft */}
        <rect
          x="92"
          y="64"
          width="32"
          height="12"
          rx="2"
          fill="currentColor"
          className="text-purple-600 dark:text-purple-400"
        />
        {/* Key head */}
        <rect
          x="110"
          y="60"
          width="20"
          height="20"
          rx="3"
          fill="currentColor"
          className="text-purple-600 dark:text-purple-400"
        />
        {/* Graph/analytics symbol: ascending bars */}
        <motion.g
          variants={shouldAnimate ? iconVariants : undefined}
          initial={shouldAnimate ? 'hidden' : undefined}
          animate={shouldAnimate ? 'visible' : undefined}
        >
          <rect x="114" y="72" width="2.5" height="4" fill="white" />
          <rect x="119" y="70" width="2.5" height="6" fill="white" />
          <rect x="124" y="68" width="2.5" height="8" fill="white" />
        </motion.g>
      </motion.g>

      {/* KEY 3 - GITHUB (BOTTOM) - Gray/Orange, Branch Symbol */}
      <motion.g
        custom={2}
        variants={shouldAnimate ? keyVariants : undefined}
        initial={shouldAnimate ? 'hidden' : undefined}
        animate={shouldAnimate ? 'visible' : undefined}
      >
        {/* Key shaft */}
        <rect
          x="64"
          y="92"
          width="12"
          height="32"
          rx="2"
          fill="currentColor"
          className="text-gray-700 dark:text-orange-400"
        />
        {/* Key head */}
        <rect
          x="60"
          y="110"
          width="20"
          height="20"
          rx="3"
          fill="currentColor"
          className="text-gray-700 dark:text-orange-400"
        />
        {/* Branch symbol: fork */}
        <motion.g
          variants={shouldAnimate ? iconVariants : undefined}
          initial={shouldAnimate ? 'hidden' : undefined}
          animate={shouldAnimate ? 'visible' : undefined}
        >
          <circle cx="70" cy="115" r="2" fill="white" />
          <line x1="70" y1="115" x2="68" y2="122" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="70" y1="115" x2="72" y2="122" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="68" cy="122" r="1.5" fill="white" />
          <circle cx="72" cy="122" r="1.5" fill="white" />
        </motion.g>
      </motion.g>

      {/* KEY 4 - STRIPE (LEFT) - Indigo, Payment Symbol */}
      <motion.g
        custom={3}
        variants={shouldAnimate ? keyVariants : undefined}
        initial={shouldAnimate ? 'hidden' : undefined}
        animate={shouldAnimate ? 'visible' : undefined}
      >
        {/* Key shaft */}
        <rect
          x="16"
          y="64"
          width="32"
          height="12"
          rx="2"
          fill="currentColor"
          className="text-indigo-600 dark:text-indigo-400"
        />
        {/* Key head */}
        <rect
          x="10"
          y="60"
          width="20"
          height="20"
          rx="3"
          fill="currentColor"
          className="text-indigo-600 dark:text-indigo-400"
        />
        {/* Payment symbol: dollar sign */}
        <motion.g
          variants={shouldAnimate ? iconVariants : undefined}
          initial={shouldAnimate ? 'hidden' : undefined}
          animate={shouldAnimate ? 'visible' : undefined}
        >
          <line x1="20" y1="65" x2="20" y2="75" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M 16 67 Q 20 65 24 67"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 16 73 Q 20 75 24 73"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </motion.g>
      </motion.g>
    </svg>
  );

  // Render based on variant
  if (variant === 'text-lockup') {
    return (
      <div className={logoVariants({ variant })}>
        <IconMark />
        <span className="text-h3 font-bold text-foreground tracking-tight">KEYS</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={logoVariants({ variant })}>
        <IconMark />
        <h2 className="text-h2 font-bold text-foreground tracking-tight">KEYS</h2>
      </div>
    );
  }

  // Default: icon variant
  return <IconMark />;
}
