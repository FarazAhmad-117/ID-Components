'use client';

import { MotionProvider } from '@id-components/motion';
import type { ReactNode } from 'react';

export function DocsProviders({ children }: { children: ReactNode }) {
  return <MotionProvider intent="professional">{children}</MotionProvider>;
}
