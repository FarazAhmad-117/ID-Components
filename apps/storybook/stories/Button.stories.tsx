import { Button } from '@id-components/core';
import { MotionProvider } from '@id-components/motion';
import type { Meta, StoryObj } from '@storybook/react';

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
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
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

export const AllSizes: Story = {
  name: 'All sizes',
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    intent: 'playful',
    disabled: true,
    children: 'Disabled',
  },
};
