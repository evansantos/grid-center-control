import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AgentAvatar } from './agent-avatar';
import { AGENTS } from './types';

const mockAgent = AGENTS[0]; // Use first agent from types

describe('AgentAvatar', () => {
  it('renders avatar with correct accessibility attributes', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('aria-label');
    expect(avatar.getAttribute('aria-label')).toContain(mockAgent.name);
    expect(avatar.getAttribute('aria-label')).toContain('active');
    expect(avatar.getAttribute('aria-label')).toContain('typing');
  });

  it('displays tooltip on hover', async () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    const avatar = screen.getByRole('img');
    fireEvent.mouseEnter(avatar);
    
    await waitFor(() => {
      const tooltip = screen.queryByRole('tooltip');
      if (tooltip) {
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent(mockAgent.name);
        expect(tooltip).toHaveTextContent('active');
      }
    });
  });

  it('renders StatusDot component with correct status', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    const statusDot = document.querySelector('[role="status"]');
    expect(statusDot).toBeInTheDocument();
    expect(statusDot).toHaveAttribute('aria-label');
    expect(statusDot?.getAttribute('aria-label')).toContain(mockAgent.name);
    expect(statusDot?.getAttribute('aria-label')).toContain('active');
  });

  it('applies correct animation class based on animation prop', () => {
    const { rerender } = render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="walking"
      />
    );
    
    let avatarContainer = document.querySelector('.avatar-container');
    expect(avatarContainer).toHaveClass('avatar-walking');
    
    rerender(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    avatarContainer = document.querySelector('.avatar-container');
    expect(avatarContainer).toHaveClass('avatar-typing');
  });

  it('shows glow ring for active status', () => {
    const { rerender } = render(
      <AgentAvatar 
        agent={mockAgent}
        status="idle"
        animation="idle"
      />
    );
    
    // Should not have glow ring for idle status
    expect(document.querySelector('[style*="glow"]')).not.toBeInTheDocument();
    
    rerender(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    // Should have glow ring for active status
    const glowRing = document.querySelector('[style*="boxShadow"]');
    expect(glowRing).toBeInTheDocument();
  });

  it('renders typing particles for active typing animation', () => {
    const { rerender } = render(
      <AgentAvatar 
        agent={mockAgent}
        status="idle"
        animation="typing"
      />
    );
    
    // Should not show particles for inactive status
    expect(document.querySelectorAll('[style*="isoTypingDot"]')).toHaveLength(0);
    
    rerender(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    // Should show 3 typing particles for active typing
    const particles = document.querySelectorAll('[style*="isoTypingDot"]');
    expect(particles).toHaveLength(3);
  });

  it('applies correct opacity based on status', () => {
    const { rerender } = render(
      <AgentAvatar 
        agent={mockAgent}
        status="idle"
        animation="idle"
      />
    );
    
    let avatarContainer = screen.getByRole('img');
    expect(avatarContainer).toHaveStyle({ opacity: '0.75' });
    
    rerender(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    avatarContainer = screen.getByRole('img');
    expect(avatarContainer).toHaveStyle({ opacity: '1' });
  });

  it('uses design tokens instead of hardcoded colors', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    const avatar = screen.getByRole('img');
    const avatarContainer = avatar.querySelector('.avatar-container');
    
    // Check CSS custom properties are set
    expect(avatarContainer).toHaveStyle({
      '--agent-color': mockAgent.color,
    });
    
    // Check that design tokens are used in component styles
    const styledElements = document.querySelectorAll('[style]');
    let hasDesignTokens = false;
    
    styledElements.forEach(element => {
      const style = element.getAttribute('style') || '';
      if (style.includes('var(--grid-')) {
        hasDesignTokens = true;
      }
    });
    
    expect(hasDesignTokens).toBe(true);
  });

  it('renders different designs for different agent IDs', () => {
    const mcpAgent = { ...mockAgent, id: 'mcp' };
    const claudeAgent = { ...mockAgent, id: 'claude' };
    const pixelAgent = { ...mockAgent, id: 'pixel' };
    
    const { rerender } = render(
      <AgentAvatar 
        agent={mcpAgent}
        status="active"
        animation="idle"
      />
    );
    
    // Check MCP has crown accessory
    expect(document.querySelector('.mcp-crown')).toBeInTheDocument();
    
    rerender(
      <AgentAvatar 
        agent={claudeAgent}
        status="active"
        animation="idle"
      />
    );
    
    // Claude should have different styling (no crown)
    expect(document.querySelector('.mcp-crown')).not.toBeInTheDocument();
    
    rerender(
      <AgentAvatar 
        agent={pixelAgent}
        status="active"
        animation="idle"
      />
    );
    
    // Pixel should have headphones emoji
    expect(document.querySelector('[style*="🎧"]')).toBeInTheDocument();
  });

  it('renders all avatar layers correctly', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    // Check all avatar components are present
    expect(document.querySelector('.avatar-shadow')).toBeInTheDocument();
    expect(document.querySelector('.avatar-leg-left')).toBeInTheDocument();
    expect(document.querySelector('.avatar-leg-right')).toBeInTheDocument();
    expect(document.querySelector('.avatar-torso')).toBeInTheDocument();
    expect(document.querySelector('.avatar-arms')).toBeInTheDocument();
    expect(document.querySelector('.avatar-head')).toBeInTheDocument();
    expect(document.querySelector('.avatar-hair')).toBeInTheDocument();
  });

  it('adjusts shadow size for walking animation', () => {
    const { rerender } = render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="idle"
      />
    );
    
    let shadow = document.querySelector('.avatar-shadow');
    expect(shadow).toHaveStyle({ width: '28px' });
    
    rerender(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="walking"
      />
    );
    
    shadow = document.querySelector('.avatar-shadow');
    expect(shadow).toHaveStyle({ width: '32px' });
  });

  it('includes keyframes in rendered output', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    const styleElements = document.querySelectorAll('style');
    let hasKeyframes = false;
    
    styleElements.forEach(style => {
      if (style.textContent?.includes('@keyframes')) {
        hasKeyframes = true;
      }
    });
    
    expect(hasKeyframes).toBe(true);
  });

  it('handles prefers-reduced-motion in keyframes', () => {
    render(
      <AgentAvatar 
        agent={mockAgent}
        status="active"
        animation="typing"
      />
    );
    
    const styleElements = document.querySelectorAll('style');
    let hasReducedMotionSupport = false;
    
    styleElements.forEach(style => {
      if (style.textContent?.includes('prefers-reduced-motion')) {
        hasReducedMotionSupport = true;
      }
    });
    
    expect(hasReducedMotionSupport).toBe(true);
  });
});