'use client';

import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import type { PointerEventHandler, RefObject } from 'react';
import type { MotionIntent } from './motion-context';
import { useMotion } from './motion-context';

export interface UseButtonMotionOptions {
  /** Overrides `MotionProvider` intent for this control only */
  intent?: MotionIntent;
  disabled?: boolean;
}

export interface ButtonMotionHandlers {
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onPointerUp?: PointerEventHandler<HTMLElement>;
  onPointerMove?: PointerEventHandler<HTMLElement>;
}

/**
 * Pointer-driven press / hover / (playful) magnetic motion for buttons.
 * GSAP stays inside `@id-components/motion`; core components call this hook only.
 */
export function useButtonMotion(
  ref: RefObject<HTMLElement | null>,
  options: UseButtonMotionOptions = {},
): { motionHandlers: ButtonMotionHandlers } {
  const { intent: ctxIntent, presets, reducedMotion } = useMotion();
  const isHovering = useRef(false);
  const isPressed = useRef(false);

  const disabled = options.disabled ?? false;
  const activeIntent = options.intent ?? ctxIntent;

  useEffect(() => {
    return () => {
      const el = ref.current;
      if (el) gsap.killTweensOf(el);
    };
  }, [ref]);

  const motionHandlers = useMemo((): ButtonMotionHandlers => {
    if (disabled || reducedMotion) {
      return {};
    }

    const onPointerEnter: PointerEventHandler<HTMLElement> = () => {
      const el = ref.current;
      if (!el) return;
      isHovering.current = true;
      const h = presets[activeIntent].hover;
      gsap.to(el, {
        scale: h.scale,
        duration: h.duration,
        ease: h.ease,
        transformOrigin: '50% 50%',
        overwrite: 'auto',
      });
    };

    const onPointerLeave: PointerEventHandler<HTMLElement> = () => {
      const el = ref.current;
      isHovering.current = false;
      isPressed.current = false;
      if (!el) return;
      const h = presets[activeIntent].hover;
      gsap.to(el, {
        scale: 1,
        x: 0,
        y: 0,
        duration: h.duration,
        ease: 'power2.out',
        transformOrigin: '50% 50%',
        overwrite: 'auto',
      });
    };

    const onPointerDown: PointerEventHandler<HTMLElement> = (e) => {
      if (e.button !== 0) return;
      const el = ref.current;
      if (!el) return;
      isPressed.current = true;
      const p = presets[activeIntent].press;
      gsap.to(el, {
        scale: p.scale,
        duration: p.duration,
        ease: p.ease,
        transformOrigin: '50% 50%',
        overwrite: 'auto',
      });
    };

    const onPointerUp: PointerEventHandler<HTMLElement> = () => {
      const el = ref.current;
      isPressed.current = false;
      if (!el) return;
      if (isHovering.current) {
        const h = presets[activeIntent].hover;
        gsap.to(el, {
          scale: h.scale,
          duration: h.duration,
          ease: h.ease,
          transformOrigin: '50% 50%',
          overwrite: 'auto',
        });
      } else {
        gsap.to(el, {
          scale: 1,
          x: 0,
          y: 0,
          duration: 0.14,
          ease: 'power2.out',
          transformOrigin: '50% 50%',
          overwrite: 'auto',
        });
      }
    };

    const onPointerMove: PointerEventHandler<HTMLElement> = (e) => {
      if (activeIntent !== 'playful' || !isHovering.current) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      const mag = 8;
      gsap.to(el, {
        x: Math.max(-1, Math.min(1, nx)) * mag,
        y: Math.max(-1, Math.min(1, ny)) * mag,
        duration: 0.24,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    return {
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onPointerMove,
    };
  }, [ref, disabled, reducedMotion, activeIntent, presets]);

  return { motionHandlers };
}
