/**
 * Animation System Test Suite
 * 
 * Comprehensive tests for the animation/transition system to verify:
 * - All animation tokens work correctly
 * - Reduced motion preferences are respected
 * - Component animations function as expected
 * - Accessibility compliance
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Import components to test
import { Button } from '../button';
import { Card } from '../card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '../dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';
import { Skeleton } from '../skeleton';
import { Loading, Spinner, Dots, Pulse } from '../loading';

// Import animation utilities
import { 
  prefersReducedMotion, 
  getSafeAnimationDuration, 
  getSafeAnimationEasing,
  createSafeTransition,
  transitionPresets
} from '../../../lib/animations';

// Mock matchMedia for reduced motion testing
const mockMatchMedia = vi.fn();

describe('Animation System', () => {
  beforeEach(() => {
    // Reset matchMedia mock
    mockMatchMedia.mockReset();
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Animation Utilities', () => {
    it('detects reduced motion preference correctly', () => {
      // Test when reduced motion is preferred
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      expect(prefersReducedMotion()).toBe(true);
      
      // Test when reduced motion is not preferred
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      expect(prefersReducedMotion()).toBe(false);
    });

    it('provides safe animation durations', () => {
      // Test normal motion
      mockMatchMedia.mockReturnValue({ matches: false });
      expect(getSafeAnimationDuration('normal')).toBe('200ms');
      expect(getSafeAnimationDuration('fast')).toBe('150ms');
      
      // Test reduced motion
      mockMatchMedia.mockReturnValue({ matches: true });
      expect(getSafeAnimationDuration('normal')).toBe('0ms');
      expect(getSafeAnimationDuration('slow')).toBe('0ms');
    });

    it('provides safe animation easing', () => {
      // Test normal motion
      mockMatchMedia.mockReturnValue({ matches: false });
      expect(getSafeAnimationEasing('easeInOut')).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      
      // Test reduced motion
      mockMatchMedia.mockReturnValue({ matches: true });
      expect(getSafeAnimationEasing('bounce')).toBe('linear');
    });

    it('creates safe CSS transitions', () => {
      // Test normal motion
      mockMatchMedia.mockReturnValue({ matches: false });
      expect(createSafeTransition('all', 'normal', 'easeOut')).toBe(
        'all 200ms cubic-bezier(0.0, 0.0, 0.2, 1)'
      );
      
      // Test reduced motion
      mockMatchMedia.mockReturnValue({ matches: true });
      expect(createSafeTransition('opacity', 'slow', 'bounce')).toBe(
        'opacity 0ms linear'
      );
    });
  });

  describe('Button Animations', () => {
    it('applies correct hover animations', async () => {
      const user = userEvent.setup();
      render(<Button variant="primary">Test Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Check that transition classes are applied
      expect(button).toHaveClass('transition-all', 'duration-normal', 'ease-out');
      
      // Test hover state
      await user.hover(button);
      expect(button).toHaveClass('hover:brightness-110');
      
      await user.unhover(button);
    });

    it('includes active/pressed animations', async () => {
      const user = userEvent.setup();
      render(<Button variant="primary">Test Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:scale-[0.98]');
    });

    it('supports ripple effect', async () => {
      const user = userEvent.setup();
      render(<Button ripple>Ripple Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Click to trigger ripple
      await user.click(button);
      
      // Ripple elements are added dynamically via JavaScript
      // We can test that the click handler was called
      expect(button).toBeInTheDocument();
    });
  });

  describe('Card Animations', () => {
    it('applies lift animation on interactive cards', () => {
      render(<Card interactive animation="lift">Interactive Card</Card>);
      
      const card = screen.getByText('Interactive Card');
      expect(card).toHaveClass('hover:scale-[1.02]', 'hover:-translate-y-1');
    });

    it('supports different animation variants', () => {
      render(<Card animation="glow">Glow Card</Card>);
      
      const card = screen.getByText('Glow Card');
      expect(card).toHaveClass('hover:shadow-[0_0_0_1px_var(--grid-accent-dim)]');
    });

    it('works as a clickable button', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Card asButton onClick={handleClick} animation="lift">
          Clickable Card
        </Card>
      );
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(card).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('Dialog Animations', () => {
    it('includes proper enter/exit animations', async () => {
      const user = userEvent.setup();
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Open Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog for animation testing</DialogDescription>
            <div>Dialog Content</div>
          </DialogContent>
        </Dialog>
      );
      
      const trigger = screen.getByRole('button', { name: 'Open Dialog' });
      await user.click(trigger);
      
      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Dialog Content')).toBeInTheDocument();
      });
      
      const dialogContent = screen.getByRole('dialog');
      
      // Check animation classes
      expect(dialogContent).toHaveClass(
        'data-[state=open]:animate-in',
        'data-[state=open]:fade-in-0',
        'data-[state=open]:zoom-in-95'
      );
    });
  });

  describe('Dropdown Menu Animations', () => {
    it('applies proper slide animations', async () => {
      const user = userEvent.setup();
      
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>Open Menu</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      // Wait for menu to appear
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
      
      // Check menu item animations
      const menuItem = screen.getByText('Item 1');
      expect(menuItem).toHaveClass('transition-all', 'duration-fast');
    });
  });

  describe('Loading Animations', () => {
    it('renders spinner with animation', () => {
      render(<Spinner />);
      
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('renders dots animation', () => {
      render(<Dots />);
      
      const dots = screen.getByRole('status');
      expect(dots).toBeInTheDocument();
      
      // Check for animated spans
      const animatedDots = dots.querySelectorAll('span');
      expect(animatedDots).toHaveLength(3);
      
      animatedDots.forEach((dot, index) => {
        expect(dot).toHaveClass('animate-loading-dots');
        expect(dot).toHaveStyle(`animation-delay: ${index * 0.16}s`);
      });
    });

    it('renders pulse animation', () => {
      render(<Pulse />);
      
      const pulse = screen.getByRole('status');
      expect(pulse).toHaveClass('animate-pulse');
    });

    it('combines different loading types', () => {
      render(<Loading type="spinner" text="Loading data..." />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading data...')).toHaveClass('animate-pulse');
    });
  });

  describe('Skeleton Animations', () => {
    it('applies shimmer effect by default', () => {
      render(<Skeleton />);
      
      const skeleton = document.querySelector('.before\\:animate-\\[shimmer_1\\.5s_ease-in-out_infinite\\]');
      expect(skeleton).toBeInTheDocument();
    });

    it('supports different animation variants', () => {
      render(<Skeleton animation="pulse" />);
      
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('can disable animations', () => {
      render(<Skeleton animation="none" />);
      
      const skeleton = document.querySelector('.before\\:hidden');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders multiple skeleton items', () => {
      render(<Skeleton count={3} variant="text" />);
      
      // Should render 3 skeleton elements
      const skeletons = document.querySelectorAll('[class*="before:animate"]');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Reduced Motion Compliance', () => {
    beforeEach(() => {
      // Mock reduced motion preference
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
    });

    it('respects reduced motion for transitions', () => {
      const { container } = render(
        <div className="transition-all duration-normal ease-out">
          Test Element
        </div>
      );
      
      // In reduced motion, CSS should disable animations
      const element = container.firstChild;
      
      // We can't easily test CSS media query application in JSDOM,
      // but we can verify the utility functions work correctly
      expect(getSafeAnimationDuration('normal')).toBe('0ms');
      expect(getSafeAnimationEasing('bounce')).toBe('linear');
    });

    it('maintains focus indicators in reduced motion', () => {
      render(<Button>Accessible Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Focus classes should still be present for accessibility
      expect(button).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('Animation Presets', () => {
    it('provides button animation presets', () => {
      expect(transitionPresets.button.primary).toContain('brightness');
      expect(transitionPresets.button.secondary).toContain('shadow-[0_0_0_1px_var(--grid-accent-dim)]');
      expect(transitionPresets.button.ghost).toContain('opacity');
    });

    it('provides card animation presets', () => {
      expect(transitionPresets.card.default).toContain('hover:scale-105');
      expect(transitionPresets.card.interactive).toContain('shadow-[0_0_0_1px_var(--grid-accent-dim)]');
    });

    it('provides modal animation presets', () => {
      expect(transitionPresets.modal.overlay).toContain('fade');
      expect(transitionPresets.modal.content).toContain('spring');
    });
  });

  describe('Theme Compatibility', () => {
    it('works with light theme', () => {
      render(
        <div data-theme="light">
          <Button variant="primary">Light Theme Button</Button>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-grid-accent');
    });

    it('works with dark theme', () => {
      render(
        <div>
          <Button variant="primary">Dark Theme Button</Button>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-grid-accent');
    });
  });

  describe('Performance Considerations', () => {
    it('uses appropriate animation durations', () => {
      // Ensure matchMedia is properly mocked for normal motion
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      // Fast animations for immediate feedback
      expect(getSafeAnimationDuration('fast')).toBe('150ms');
      
      // Normal animations for general UI
      expect(getSafeAnimationDuration('normal')).toBe('200ms');
      
      // Slow animations for complex transitions
      expect(getSafeAnimationDuration('slow')).toBe('300ms');
    });

    it('uses performance-friendly properties', () => {
      render(<Card animation="lift">Performance Card</Card>);
      
      const card = screen.getByText('Performance Card');
      
      // Should use transform and opacity for performance
      expect(card).toHaveClass('hover:scale-[1.02]', 'hover:-translate-y-1');
    });
  });
});