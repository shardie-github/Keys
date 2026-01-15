'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      checked: {
        true: 'bg-primary text-primary-foreground',
        false: 'border-input bg-background',
      },
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        className={cn(checkboxVariants({ checked }), className)}
        {...props}
      />
    </div>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
