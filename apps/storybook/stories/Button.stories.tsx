import { Button } from '@id-components/core';
import { MotionProvider } from '@id-components/motion';
import type { Meta, StoryObj } from '@storybook/react';

const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => (
      <MotionProvider intent={context.args.intent ?? 'playful'}>
        <Story />
      </MotionProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: variants,
    },
    size: {
      control: 'select',
      options: sizes,
    },
    intent: {
      control: 'select',
      options: ['playful', 'professional'],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const PlayfulPrimary: Story = {
  name: 'Playful / Primary',
  args: {
    variant: 'primary',
    size: 'md',
    intent: 'playful',
    children: 'Get started',
  },
};

export const PlayfulSecondary: Story = {
  name: 'Playful / Secondary',
  args: {
    variant: 'secondary',
    size: 'md',
    intent: 'playful',
    children: 'Learn more',
  },
};

export const PlayfulGhost: Story = {
  name: 'Playful / Ghost',
  args: {
    variant: 'ghost',
    size: 'md',
    intent: 'playful',
    children: 'Cancel',
  },
};

export const PlayfulDestructive: Story = {
  name: 'Playful / Destructive',
  args: {
    variant: 'destructive',
    size: 'md',
    intent: 'playful',
    children: 'Delete project',
  },
};

export const ProfessionalPrimary: Story = {
  name: 'Professional / Primary',
  args: {
    variant: 'primary',
    size: 'md',
    intent: 'professional',
    children: 'Save changes',
  },
};

export const ProfessionalSecondary: Story = {
  name: 'Professional / Secondary',
  args: {
    variant: 'secondary',
    size: 'md',
    intent: 'professional',
    children: 'Discard',
  },
};

export const ProfessionalGhost: Story = {
  name: 'Professional / Ghost',
  args: {
    variant: 'ghost',
    size: 'md',
    intent: 'professional',
    children: 'Skip',
  },
};

export const ProfessionalDestructive: Story = {
  name: 'Professional / Destructive',
  args: {
    variant: 'destructive',
    size: 'md',
    intent: 'professional',
    children: 'Remove',
  },
};

export const AllSizes: Story = {
  name: 'All sizes',
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
  args: {
    variant: 'primary',
    intent: 'playful',
  },
};

export const MatrixPlayful: Story = {
  name: 'Matrix — playful',
  render: () => (
    <MotionProvider intent="playful">
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-3">
            <span className="w-28 shrink-0 text-right font-mono text-xs text-neutral-500 capitalize">
              {variant}
            </span>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {variant} {size}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </MotionProvider>
  ),
};

export const MatrixProfessional: Story = {
  name: 'Matrix — professional',
  render: () => (
    <MotionProvider intent="professional">
      <div className="flex flex-col gap-6">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-3">
            <span className="w-28 shrink-0 text-right font-mono text-xs text-neutral-500 capitalize">
              {variant}
            </span>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {variant} {size}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </MotionProvider>
  ),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    intent: 'playful',
    disabled: true,
    children: 'Disabled',
  },
};
