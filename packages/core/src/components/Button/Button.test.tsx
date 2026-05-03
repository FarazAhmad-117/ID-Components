import { MotionProvider } from '@id-components/motion';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Button } from './Button';

function renderWithMotion(ui: ReactElement, intent: 'playful' | 'professional' = 'playful') {
  return render(<MotionProvider intent={intent}>{ui}</MotionProvider>);
}

describe('Button', () => {
  it('renders primary by default', () => {
    renderWithMotion(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders all variants', () => {
    const { rerender, unmount } = renderWithMotion(<Button variant="primary">A</Button>);
    expect(screen.getByRole('button', { name: 'A' })).toHaveClass('inline-flex');

    rerender(
      <MotionProvider intent="playful">
        <Button variant="secondary">B</Button>
      </MotionProvider>,
    );
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();

    rerender(
      <MotionProvider intent="playful">
        <Button variant="ghost">C</Button>
      </MotionProvider>,
    );
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();

    rerender(
      <MotionProvider intent="playful">
        <Button variant="destructive">D</Button>
      </MotionProvider>,
    );
    expect(screen.getByRole('button', { name: 'D' })).toBeInTheDocument();
    unmount();
  });

  it('handles click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithMotion(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates with keyboard (Space)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithMotion(<Button onClick={onClick}>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    btn.focus();
    expect(btn).toHaveFocus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalled();
  });

  it('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithMotion(
      <Button disabled onClick={onClick}>
        Off
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Off' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no axe violations for variants', async () => {
    const { container, rerender } = renderWithMotion(<Button variant="primary">P</Button>);
    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <MotionProvider intent="playful">
        <Button variant="destructive" size="lg">
          Delete
        </Button>
      </MotionProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
