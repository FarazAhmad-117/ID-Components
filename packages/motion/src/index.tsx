import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { createContext, useContext, useMemo } from 'react';
import type { DependencyList, ReactNode, RefObject } from 'react';

export type MotionIntent = 'playful' | 'professional';

export interface MotionPreset {
  entry: { duration: number; ease: string; y: number; opacity: number };
  exit: { duration: number; ease: string; y: number; opacity: number };
  hover: { duration: number; ease: string; scale: number };
  press: { duration: number; ease: string; scale: number };
}

export interface MotionPresets {
  playful: MotionPreset;
  professional: MotionPreset;
}

export interface MotionContextValue {
  intent: MotionIntent;
  presets: MotionPresets;
  reducedMotion: boolean;
}

const motionPresets: MotionPresets = {
  playful: {
    entry: { duration: 0.5, ease: 'back.out(1.7)', y: 20, opacity: 0 },
    exit: { duration: 0.3, ease: 'back.in(1.7)', y: -10, opacity: 0 },
    hover: { duration: 0.25, ease: 'elastic.out(1, 0.5)', scale: 1.05 },
    press: { duration: 0.1, ease: 'power2.out', scale: 0.95 },
  },
  professional: {
    entry: { duration: 0.3, ease: 'power2.out', y: 8, opacity: 0 },
    exit: { duration: 0.2, ease: 'power2.in', y: -4, opacity: 0 },
    hover: { duration: 0.2, ease: 'power1.out', scale: 1.02 },
    press: { duration: 0.08, ease: 'power2.out', scale: 0.97 },
  },
};

const MotionContext = createContext<MotionContextValue | null>(null);

export interface MotionProviderProps {
  intent?: MotionIntent;
  children: ReactNode;
}

export function MotionProvider({ intent = 'playful', children }: MotionProviderProps) {
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const value = useMemo<MotionContextValue>(
    () => ({ intent, presets: motionPresets, reducedMotion }),
    [intent, reducedMotion],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

MotionProvider.displayName = 'MotionProvider';

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotion must be used within a MotionProvider');
  return ctx;
}

export function useTimeline(
  scope: RefObject<Element | null>,
  callback: (tl: gsap.core.Timeline) => void,
  deps: DependencyList = [],
) {
  useGSAP(
    () => {
      const tl = gsap.timeline();
      callback(tl);
      return () => {
        tl.kill();
      };
    },
    { scope: scope as RefObject<Element>, dependencies: [...deps] },
  );
}
