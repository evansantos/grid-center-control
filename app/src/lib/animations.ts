/**
 * Animation System - Design System Wave 4
 * 
 * Centralized animation tokens, utilities, and variants that respect
 * accessibility preferences and provide consistent motion design.
 */

import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Animation Duration Tokens
export const animationDuration = {
  instant: '0ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '750ms',
} as const;

// Animation Easing Tokens
export const animationEasing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Animation Scale Tokens
export const animationScale = {
  scaleDown: '0.95',
  scaleNormal: '1',
  scaleUp: '1.05',
  scaleLarge: '1.1',
} as const;

// Check for reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Utility to get safe animation duration (respects reduced motion)
export const getSafeAnimationDuration = (duration: keyof typeof animationDuration) => {
  return prefersReducedMotion() ? animationDuration.instant : animationDuration[duration];
};

// Utility to get safe animation easing (respects reduced motion)
export const getSafeAnimationEasing = (easing: keyof typeof animationEasing) => {
  return prefersReducedMotion() ? animationEasing.linear : animationEasing[easing];
};

// Transition Variants for common interactions
export const transitionVariants = cva('', {
  variants: {
    // Hover transitions
    hover: {
      none: '',
      lift: 'hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg',
      glow: 'hover:shadow-[0_0_0_1px_var(--grid-accent-dim)] hover:border-grid-accent/50',
      brightness: 'hover:brightness-110',
      opacity: 'hover:opacity-80',
    },
    // Focus transitions  
    focus: {
      none: '',
      ring: 'focus-visible:ring-2 focus-visible:ring-grid-accent focus-visible:ring-offset-2',
      glow: 'focus-visible:shadow-[0_0_0_2px_var(--grid-accent-glow)]',
      outline: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grid-accent',
    },
    // Active/pressed transitions
    active: {
      none: '',
      scale: 'active:scale-95',
      press: 'active:scale-98 active:brightness-90',
      bounce: 'active:animate-bounce-subtle',
    },
    // Loading states
    loading: {
      none: '',
      pulse: 'animate-pulse',
      spin: 'animate-spin',
      bounce: 'animate-bounce',
      shimmer: 'animate-shimmer',
    },
    // Entry/exit animations
    enter: {
      none: '',
      fade: 'animate-in fade-in duration-200',
      slide: 'animate-in slide-in-from-bottom-4 fade-in duration-300',
      scale: 'animate-in zoom-in-95 fade-in duration-200',
      spring: 'animate-in zoom-in-90 fade-in duration-300 animate-spring',
    },
    exit: {
      none: '',
      fade: 'animate-out fade-out duration-150',
      slide: 'animate-out slide-out-to-bottom-4 fade-out duration-200',
      scale: 'animate-out zoom-out-95 fade-out duration-150',
    },
  },
  defaultVariants: {
    hover: 'none',
    focus: 'ring',
    active: 'none',
    loading: 'none',
    enter: 'none',
    exit: 'none',
  },
});

export type TransitionVariantsProps = VariantProps<typeof transitionVariants>;

// Utility function to combine transition variants
export const createTransition = (variants: TransitionVariantsProps, className?: string) => {
  return cn(transitionVariants(variants), className);
};

// Pre-built transition combinations for common UI patterns
export const transitionPresets = {
  // Button interactions
  button: {
    primary: createTransition({
      hover: 'brightness',
      focus: 'ring',
      active: 'scale',
    }),
    secondary: createTransition({
      hover: 'glow',
      focus: 'ring', 
      active: 'press',
    }),
    ghost: createTransition({
      hover: 'opacity',
      focus: 'outline',
      active: 'scale',
    }),
  },
  
  // Card interactions
  card: {
    default: createTransition({
      hover: 'lift',
      focus: 'glow',
    }),
    interactive: createTransition({
      hover: 'glow',
      focus: 'ring',
      active: 'scale',
    }),
    subtle: createTransition({
      hover: 'glow',
    }),
  },
  
  // Modal/Dialog animations
  modal: {
    overlay: createTransition({
      enter: 'fade',
      exit: 'fade',
    }),
    content: createTransition({
      enter: 'spring',
      exit: 'scale',
    }),
  },
  
  // Dropdown/Menu animations
  dropdown: {
    content: createTransition({
      enter: 'slide',
      exit: 'slide',
    }),
  },
  
  // Loading states
  loading: {
    skeleton: createTransition({
      loading: 'shimmer',
    }),
    spinner: createTransition({
      loading: 'spin',
    }),
    pulse: createTransition({
      loading: 'pulse',
    }),
  },
};

// Animation class utilities that work with CSS variables
export const animationClasses = {
  // Duration classes
  'animate-fast': `transition-all duration-[var(--animation-fast,${animationDuration.fast})]`,
  'animate-normal': `transition-all duration-[var(--animation-normal,${animationDuration.normal})]`,
  'animate-slow': `transition-all duration-[var(--animation-slow,${animationDuration.slow})]`,
  
  // Easing classes
  'animate-ease-in': `ease-[var(--animation-ease-in,${animationEasing.easeIn})]`,
  'animate-ease-out': `ease-[var(--animation-ease-out,${animationEasing.easeOut})]`,
  'animate-ease-in-out': `ease-[var(--animation-ease-in-out,${animationEasing.easeInOut})]`,
  'animate-bounce-easing': `ease-[var(--animation-bounce,${animationEasing.bounce})]`,
  'animate-spring-easing': `ease-[var(--animation-spring,${animationEasing.spring})]`,
};

// Hook to manage animation preferences
export const useAnimationPreference = () => {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return { reducedMotion };
};

// React import for the hook
import * as React from 'react';

// Higher-order component that respects animation preferences
export const withAnimationPreference = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackProps?: Partial<P>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const { reducedMotion } = useAnimationPreference();
    
    const finalProps = reducedMotion && fallbackProps 
      ? { ...props, ...fallbackProps }
      : props;
      
    return React.createElement(Component as any, { ...finalProps, ref });
  });
  
  WrappedComponent.displayName = `withAnimationPreference(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Utility to create safe CSS transition strings
export const createSafeTransition = (
  property: string = 'all',
  duration: keyof typeof animationDuration = 'normal',
  easing: keyof typeof animationEasing = 'easeInOut'
) => {
  if (prefersReducedMotion()) {
    return `${property} 0ms linear`;
  }
  return `${property} ${animationDuration[duration]} ${animationEasing[easing]}`;
};

// Micro-interaction animations
export const microAnimations = {
  // Button press
  buttonPress: 'active:scale-[0.98] active:brightness-90 transition-all duration-75',
  
  // Gentle hover lift
  hoverLift: 'hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-out',
  
  // Focus glow
  focusGlow: 'focus-visible:shadow-[0_0_0_2px_var(--grid-accent-glow)] transition-shadow duration-150',
  
  // Ripple effect (for clickable elements)
  ripple: 'relative overflow-hidden before:absolute before:inset-0 before:bg-white before:opacity-0 before:scale-0 before:rounded-full before:transition-all before:duration-300 active:before:opacity-10 active:before:scale-100',
  
  // Status indicator pulse
  statusPulse: 'animate-pulse [animation-duration:2s]',
  
  // Typing indicator
  typing: 'animate-bounce [animation-delay:0ms,150ms,300ms] [animation-duration:600ms]',
};

export default {
  animationDuration,
  animationEasing,
  animationScale,
  transitionVariants,
  transitionPresets,
  createTransition,
  microAnimations,
  createSafeTransition,
  getSafeAnimationDuration,
  getSafeAnimationEasing,
  prefersReducedMotion,
  useAnimationPreference,
  withAnimationPreference,
};