'use client';

import { Button } from '@id-components/core';
import { MotionProvider } from '@id-components/motion';

export function ButtonDemosProfessional() {
  return (
    <MotionProvider intent="professional">
      <div className="idc-doc-demo not-prose mb-8 flex flex-wrap gap-3">
        <Button variant="primary">Save</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="destructive">Delete</Button>
      </div>
    </MotionProvider>
  );
}

export function ButtonDemosPlayful() {
  return (
    <MotionProvider intent="playful">
      <div className="idc-doc-demo not-prose mb-8 flex flex-wrap gap-3">
        <Button variant="primary">Bounce in</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </MotionProvider>
  );
}

export function ButtonDemosSizes() {
  return (
    <MotionProvider intent="professional">
      <div className="idc-doc-demo not-prose flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </MotionProvider>
  );
}
