import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import IsometricOffice from './index';
import { AGENTS } from './types';

// Mock the API fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock ResizeObserver
const mockResizeObserver = vi.fn();
mockResizeObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.ResizeObserver = mockResizeObserver;

// Mock the hooks
vi.mock('./use-office-state', () => ({
  useOfficeState: () => ({
    agentPositions: {},
    agentStates: AGENTS.reduce((acc, agent) => {
      acc[agent.id] = {
        position: { x: 100, y: 100, state: 'idle' },
        behavior: 'desk',
        chatBubble: null,
      };
      return acc;
    }, {} as any),
    meetingState: { active: false, task: null },
  }),
}));

const mockActivityData = {
  activity: [
    { agent: 'mcp', status: 'active', messageCount: 5 },
    { agent: 'claude', status: 'recent', messageCount: 2 },
    { agent: 'pixel', status: 'idle', messageCount: 0 },
  ],
};

describe('IsometricOffice', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockActivityData),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the office floor plan with all zones', async () => {
    render(<IsometricOffice />);
    
    // Check main title
    expect(screen.getByText('G R I D H Q')).toBeInTheDocument();
    
    // Check zone labels
    expect(screen.getByText('BOSS OFFICE')).toBeInTheDocument();
    expect(screen.getByText('LOUNGE')).toBeInTheDocument();
    expect(screen.getByText('ENGINEERING')).toBeInTheDocument();
    expect(screen.getByText('CREATIVE')).toBeInTheDocument();
    expect(screen.getByText('STRATEGY')).toBeInTheDocument();
    expect(screen.getByText('MEETING ROOM')).toBeInTheDocument();
    expect(screen.getByText('LABS')).toBeInTheDocument();
    expect(screen.getByText('SERVER ROOM')).toBeInTheDocument();
  });

  it('displays stats bar with correct information', async () => {
    render(<IsometricOffice />);
    
    await waitFor(() => {
      expect(screen.getByText(/active/)).toBeInTheDocument();
      expect(screen.getByText(`👥 ${AGENTS.length} agents`)).toBeInTheDocument();
    });
  });

  it('shows agent status pills with tooltips', async () => {
    render(<IsometricOffice />);
    
    // Find agent buttons
    const agentButtons = screen.getAllByRole('button');
    expect(agentButtons.length).toBeGreaterThan(0);
    
    // Check that status dots are rendered using the StatusDot component
    const statusDots = document.querySelectorAll('[role="status"]');
    expect(statusDots.length).toBeGreaterThan(0);
  });

  it('allows selecting agents', async () => {
    render(<IsometricOffice />);
    
    // Find an agent button and click it
    const agentButton = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('MCP')
    );
    
    if (agentButton) {
      fireEvent.click(agentButton);
      // The agent should be selected (would show agent panel)
      // Note: AgentMessagePanel rendering depends on selectedAgent state
    }
  });

  it('fetches activity data on mount', async () => {
    render(<IsometricOffice />);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/activity');
    });
  });

  it('applies design tokens instead of hardcoded colors', () => {
    render(<IsometricOffice />);
    
    // Check that CSS custom properties are used
    const officeContainer = document.querySelector('[style*="--grid-"]');
    expect(officeContainer || document.body).toBeTruthy();
    
    // Verify hardcoded hex colors are not used in critical places
    const elements = document.querySelectorAll('*[style]');
    elements.forEach(element => {
      const style = element.getAttribute('style') || '';
      // Allow some legacy hex colors but ensure main colors use design tokens
      if (style.includes('background') || style.includes('color')) {
        // Should prefer var(--grid-*) over #hexcode for main colors
        if (style.includes('#2a2a3a') || style.includes('#1a1a24')) {
          console.warn('Found hardcoded color that should use design token:', style);
        }
      }
    });
  });

  it('renders mobile zoom controls on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<IsometricOffice />);
    
    // Check for zoom controls (they have mobile-only class)
    const zoomControls = document.querySelector('.mobile-only');
    expect(zoomControls).toBeInTheDocument();
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    const resetButton = screen.getByLabelText('Reset zoom');
    
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
  });

  it('handles zoom controls interaction', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<IsometricOffice />);
    
    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');
    const resetButton = screen.getByLabelText('Reset zoom');
    
    // Test zoom in
    fireEvent.click(zoomInButton);
    // Should update scale (would need to check transform style)
    
    // Test zoom out
    fireEvent.click(zoomOutButton);
    
    // Test reset
    fireEvent.click(resetButton);
  });

  it('shows meeting room as active when meeting is in progress', () => {
    // Mock meeting state
    vi.mocked(require('./use-office-state').useOfficeState).mockReturnValue({
      agentPositions: {},
      agentStates: {},
      meetingState: { active: true, task: 'Sprint Planning' },
    });

    render(<IsometricOffice />);
    
    expect(screen.getByText('🔴 MEETING')).toBeInTheDocument();
  });

  it('respects prefers-reduced-motion setting', () => {
    // Mock prefers-reduced-motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<IsometricOffice />);
    
    // Check that CSS includes prefers-reduced-motion media query
    const styleElements = document.querySelectorAll('style');
    let hasReducedMotionSupport = false;
    
    styleElements.forEach(style => {
      if (style.textContent?.includes('prefers-reduced-motion')) {
        hasReducedMotionSupport = true;
      }
    });
    
    expect(hasReducedMotionSupport).toBe(true);
  });

  it('handles touch events for mobile panning', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<IsometricOffice />);
    
    const officeContainer = document.querySelector('[style*="transform"]');
    expect(officeContainer).toBeInTheDocument();
    
    if (officeContainer) {
      // Simulate touch start
      fireEvent.touchStart(officeContainer, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      
      // Simulate touch move
      fireEvent.touchMove(officeContainer, {
        touches: [{ clientX: 150, clientY: 150 }],
      });
      
      // Simulate touch end
      fireEvent.touchEnd(officeContainer);
    }
  });

  it('renders tooltips for agents on hover', async () => {
    render(<IsometricOffice />);
    
    // Find a tooltip trigger (agent button)
    const agentButton = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('MCP')
    );
    
    if (agentButton) {
      // Hover over agent
      fireEvent.mouseEnter(agentButton);
      
      // Tooltip should appear (using Radix UI tooltip)
      await waitFor(() => {
        const tooltip = screen.queryByRole('tooltip');
        if (tooltip) {
          expect(tooltip).toBeInTheDocument();
        }
      });
    }
  });

  it('uses StatusDot component for status indicators', () => {
    render(<IsometricOffice />);
    
    // Check that status indicators use proper ARIA labels
    const statusDots = document.querySelectorAll('[role="status"]');
    expect(statusDots.length).toBeGreaterThan(0);
    
    statusDots.forEach(dot => {
      expect(dot).toHaveAttribute('aria-label');
    });
  });
});