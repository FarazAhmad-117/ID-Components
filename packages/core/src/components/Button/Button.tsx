'use client';

import { type MotionIntent, useButtonMotion } from '@id-components/motion';
import { cn } from '@id-components/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import {
  type ComponentPropsWithoutRef,
  type MutableRefObject,
  type PointerEventHandler,
  type Ref,
  forwardRef,
  useMemo,
  useRef,
} from 'react';

const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2 font-medium select-none whitespace-nowrap',
    'transition-[color,background-color,border-color,box-shadow,filter] duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'border border-transparent text-white',
          '[text-shadow:none]',
          'bg-[var(--color-accent-600)]',
          'shadow-[inset_0_1px_0_rgb(255_255_255_/_28%)_0_1px_2px_rgb(15_23_42_/_14%)]',
          'hover:bg-[var(--color-accent-700)]',
          'hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_34%)_0_8px_28px_-6px_rgb(37_99_235_/_40%)]',
          'active:bg-[var(--color-accent-800)]',
          'active:shadow-[inset_0_1px_0_rgb(255_255_255_/_20%)_0_1px_2px_rgb(15_23_42_/_16%)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-50)] dark:focus-visible:ring-offset-[var(--color-neutral-950)]',
          'dark:bg-[var(--color-accent-500)] dark:hover:bg-[var(--color-accent-600)] dark:active:bg-[var(--color-accent-700)]',
          'overflow-hidden',
          'before:pointer-events-none before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
          'before:opacity-0 before:transition-opacity before:duration-[var(--duration-base)]',
          'hover:before:opacity-60',
        ].join(' '),
        secondary: [
          'border border-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] text-[var(--color-neutral-900)]',
          'shadow-[inset_0_1px_0_rgb(255_255_255_/_90%)]',
          'hover:border-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-200)]',
          'active:bg-[var(--color-neutral-200)] active:border-[var(--color-neutral-400)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-50)] dark:focus-visible:ring-offset-[var(--color-neutral-950)]',
          'dark:border-[var(--color-neutral-500)] dark:bg-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]',
          'dark:shadow-[inset_0_1px_0_rgb(255_255_255_/_10%)] dark:hover:border-[var(--color-neutral-400)] dark:hover:bg-[var(--color-neutral-800)] dark:active:bg-[var(--color-neutral-800)]',
        ].join(' '),
        ghost: [
          'border border-[var(--color-neutral-300)] bg-transparent text-[var(--color-neutral-800)]',
          'shadow-none',
          'hover:border-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-neutral-950)]',
          'active:bg-[var(--color-neutral-200)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-50)] dark:focus-visible:ring-offset-[var(--color-neutral-950)]',
          'dark:border-[var(--color-neutral-600)] dark:text-[var(--color-neutral-200)]',
          'dark:hover:border-[var(--color-neutral-500)] dark:hover:bg-[var(--color-neutral-800)] dark:hover:text-white',
          'dark:active:bg-[var(--color-neutral-800)]',
        ].join(' '),
        destructive: [
          'border border-transparent text-[var(--color-danger-foreground)]',
          '[text-shadow:none]',
          'bg-[var(--color-danger-600)]',
          'shadow-[inset_0_1px_0_rgb(255_255_255_/_22%)_0_2px_6px_-2px_rgb(127_29_29_/_35%)]',
          'hover:bg-[var(--color-danger-500)]',
          'hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_26%)_0_8px_24px_-4px_rgb(220_38_38_/_45%)]',
          'active:bg-[var(--color-danger-700)]',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-danger-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-neutral-50)] dark:focus-visible:ring-offset-[var(--color-neutral-950)]',
          'dark:bg-[var(--color-danger-600)] dark:hover:bg-[var(--color-danger-500)] dark:active:bg-[var(--color-danger-700)]',
        ].join(' '),
      },
      size: {
        sm: 'h-8 gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs',
        md: 'h-10 gap-2 rounded-[var(--radius-md)] px-4 text-sm',
        lg: 'h-12 gap-2 rounded-[var(--radius-md)] px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    intent?: MotionIntent;
  };

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (ref == null) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as MutableRefObject<T | null>).current = node;
    }
  };
}

function composePointer<E extends HTMLElement>(
  a?: PointerEventHandler<E>,
  b?: PointerEventHandler<E>,
): PointerEventHandler<E> | undefined {
  if (!a) return b;
  if (!b) return a;
  return (e) => {
    a(e);
    b(e);
  };
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      intent: intentProp,
      asChild = false,
      disabled,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerMove,
      type = 'button',
      ...props
    },
    forwardedRef,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const internalRef = useRef<HTMLButtonElement>(null);
    const composedRef = useMemo(() => composeRefs(forwardedRef, internalRef), [forwardedRef]);

    const motionOptions = useMemo(
      () => ({
        ...(intentProp !== undefined ? { intent: intentProp } : {}),
        disabled: Boolean(disabled),
      }),
      [intentProp, disabled],
    );

    const { motionHandlers } = useButtonMotion(internalRef, motionOptions);

    const pointerEnter = composePointer(motionHandlers.onPointerEnter, onPointerEnter);
    const pointerLeave = composePointer(motionHandlers.onPointerLeave, onPointerLeave);
    const pointerDown = composePointer(motionHandlers.onPointerDown, onPointerDown);
    const pointerUp = composePointer(motionHandlers.onPointerUp, onPointerUp);
    const pointerMove = composePointer(motionHandlers.onPointerMove, onPointerMove);

    return (
      <Comp
        ref={composedRef as Ref<HTMLButtonElement>}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled}
        data-disabled={disabled ? '' : undefined}
        aria-disabled={disabled ? true : undefined}
        onPointerEnter={pointerEnter}
        onPointerLeave={pointerLeave}
        onPointerDown={pointerDown}
        onPointerUp={pointerUp}
        onPointerMove={pointerMove}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
