import { useMotion } from '@id-components/motion';
import type { MotionIntent } from '@id-components/motion';
import { cn } from '@id-components/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import gsap from 'gsap';
import { forwardRef, useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent-600)] text-white hover:bg-[var(--color-accent-700)] focus-visible:ring-[var(--color-accent-500)]',
        secondary:
          'bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)] hover:bg-[var(--color-neutral-200)] focus-visible:ring-[var(--color-neutral-400)]',
        ghost:
          'bg-transparent text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)] focus-visible:ring-[var(--color-neutral-400)]',
      },
      size: {
        sm: 'h-8 rounded-[var(--radius-sm)] px-3 text-sm',
        md: 'h-10 rounded-[var(--radius-md)] px-4 text-sm',
        lg: 'h-12 rounded-[var(--radius-md)] px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  intent?: MotionIntent;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, intent: intentProp, asChild = false, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : 'button';
    const internalRef = useRef<HTMLButtonElement>(null);

    // Sync the forwarded ref so the parent can access the DOM node
    useEffect(() => {
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') {
        forwardedRef(internalRef.current);
      } else {
        forwardedRef.current = internalRef.current;
      }
    });

    const { intent: contextIntent, presets, reducedMotion } = useMotion();
    const activeIntent = intentProp ?? contextIntent;

    const handleMouseEnter = () => {
      if (reducedMotion || !internalRef.current) return;
      const p = presets[activeIntent].hover;
      gsap.to(internalRef.current, { scale: p.scale, duration: p.duration, ease: p.ease });
    };

    const handleMouseLeave = () => {
      if (reducedMotion || !internalRef.current) return;
      gsap.to(internalRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
    };

    const handleMouseDown = () => {
      if (reducedMotion || !internalRef.current) return;
      const p = presets[activeIntent].press;
      gsap.to(internalRef.current, { scale: p.scale, duration: p.duration, ease: p.ease });
    };

    const handleMouseUp = () => {
      if (reducedMotion || !internalRef.current) return;
      const p = presets[activeIntent].hover;
      gsap.to(internalRef.current, { scale: p.scale, duration: 0.15, ease: 'back.out(2)' });
    };

    return (
      <Comp
        ref={internalRef}
        className={cn(buttonVariants({ variant, size }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
