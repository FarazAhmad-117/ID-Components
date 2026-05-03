import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { DependencyList, RefObject } from 'react';

export type {
  MotionContextValue,
  MotionIntent,
  MotionPreset,
  MotionPresets,
} from './motion-context';
export { MotionProvider, motionPresets, useMotion } from './motion-context';
export type { MotionProviderProps } from './motion-context';

export { useButtonMotion } from './useButtonMotion';
export type { UseButtonMotionOptions } from './useButtonMotion';

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
