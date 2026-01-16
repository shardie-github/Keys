/**
 * PageTransition
 *
 * Wrapper for page/route transitions.
 * Use this in Next.js App Router layouts or page components.
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, useEffect, useState } from 'react';
import { pageTransitionVariants } from '../variants';

export interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  (
    {
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      setIsHydrated(true);
    }, []);

    return (
      <motion.div
        ref={ref}
        className={className}
        variants={pageTransitionVariants}
        initial={isHydrated ? 'initial' : 'animate'}
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = 'PageTransition';
