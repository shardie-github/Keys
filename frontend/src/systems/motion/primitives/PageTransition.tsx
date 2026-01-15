/**
 * PageTransition
 * 
 * Wrapper for page/route transitions.
 * Use this in Next.js App Router layouts or page components.
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, type ReactNode } from 'react';
import { pageTransitionVariants } from '../variants';

export interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
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
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={pageTransitionVariants}
        initial="initial"
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
