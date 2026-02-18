import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentMessagePanel } from './agent-message-panel';
import { AGENTS } from './types';

const mockAgent = AGENTS[0];

const mockMessages = [
  {
    role: 'user' as const,
    content: 'Hello, how are you?',
    timestamp: '2024-01-01T10:00:00Z',
  },
  {
    role: 'assistant' as const,
    content: 'I am doing well, thank you for asking! How can I help you today?',
    timestamp: '2024-01-01T10:01:00Z',
  },
  {
    role: 'system' as const,
    content: 'System message for testing',
    timestamp: '2024-01-01T10:02:00Z',
  },
];

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AgentMessagePanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        messages: mockMessages,
        sessions: 5,
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders agent panel with correct accessibility attributes', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'agent-panel-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'agent-panel-description');
    
    const title = screen.getByText(mockAgent.name);
    expect(title).toHaveAttribute('id', 'agent-panel-title');
  });

  it('fetches and displays messages on mount', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    expect(mockFetch).toHaveBeenCalledWith(`/api/agents/${mockAgent.id}/session`);
    
    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText(/I am doing well/)).toBeInTheDocument();
      expect(screen.getByText('System message for testing')).toBeInTheDocument();
    });
  });

  it('displays agent information in header', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
      expect(screen.getByText(/5 sessions/)).toBeInTheDocument();
      expect(screen.getByText(mockAgent.zone, { exact: false })).toBeInTheDocument();
    });
  });

  it('closes panel when close button is clicked', () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close agent panel');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes panel when Escape key is pressed', () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('filters messages by role', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });

    // Filter to show only user messages
    const userFilter = screen.getByRole('tab', { name: /user/i });
    fireEvent.click(userFilter);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.queryByText(/I am doing well/)).not.toBeInTheDocument();
    
    // Filter to show only assistant messages
    const assistantFilter = screen.getByRole('tab', { name: /assistant/i });
    fireEvent.click(assistantFilter);
    
    expect(screen.queryByText('Hello, how are you?')).not.toBeInTheDocument();
    expect(screen.getByText(/I am doing well/)).toBeInTheDocument();
  });

  it('shows message counts in filter buttons', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      const userFilter = screen.getByRole('tab', { name: /user/i });
      expect(userFilter).toHaveTextContent('1'); // 1 user message
      
      const assistantFilter = screen.getByRole('tab', { name: /assistant/i });
      expect(assistantFilter).toHaveTextContent('1'); // 1 assistant message
      
      const systemFilter = screen.getByRole('tab', { name: /system/i });
      expect(systemFilter).toHaveTextContent('1'); // 1 system message
    });
  });

  it('expands and collapses long messages', async () => {
    const longMessage = {
      role: 'assistant' as const,
      content: 'This is a very long message that should be truncated and show an expand button. '.repeat(10),
      timestamp: '2024-01-01T10:03:00Z',
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        messages: [longMessage],
        sessions: 1,
      }),
    });

    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/This is a very long message/)).toBeInTheDocument();
    });

    // Should show "More" button for long content
    const expandButton = screen.getByLabelText('Expand message');
    expect(expandButton).toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(expandButton);
    
    // Should now show "Less" button
    expect(screen.getByLabelText('Collapse message')).toBeInTheDocument();
  });

  it('uses StatusDot components for message types', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      const statusDots = document.querySelectorAll('[role="status"]');
      expect(statusDots.length).toBeGreaterThan(0);
      
      statusDots.forEach(dot => {
        expect(dot).toHaveAttribute('aria-label');
      });
    });
  });

  it('displays loading state initially', () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });

  it('displays empty state when no messages match filter', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        messages: [{ role: 'user', content: 'Test', timestamp: '2024-01-01T10:00:00Z' }],
        sessions: 1,
      }),
    });

    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    // Filter to show only system messages (should be empty)
    const systemFilter = screen.getByRole('tab', { name: /system/i });
    fireEvent.click(systemFilter);
    
    expect(screen.getByText('No messages found')).toBeInTheDocument();
    expect(screen.getByText('Try a different filter')).toBeInTheDocument();
  });

  it('uses design tokens instead of hardcoded colors', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    const dialog = screen.getByRole('dialog');
    const style = dialog.getAttribute('style') || '';
    
    // Should use CSS custom properties for background
    expect(style).toContain('var(--grid-');
  });

  it('formats timestamps correctly', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      // Should show formatted time (HH:MM)
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('10:01')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    // Should stop loading even on error
    await waitFor(() => {
      expect(screen.queryByText('Loading messages...')).not.toBeInTheDocument();
    });
  });

  it('shows correct message count in footer', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText(/3 messages • ESC to close/)).toBeInTheDocument();
    });

    // Filter to user messages only
    const userFilter = screen.getByRole('tab', { name: /user/i });
    fireEvent.click(userFilter);
    
    expect(screen.getByText(/1 messages • ESC to close/)).toBeInTheDocument();
  });

  it('auto-scrolls to bottom when messages change', async () => {
    const scrollSpy = vi.fn();
    
    // Mock scrollTop setter
    Object.defineProperty(HTMLDivElement.prototype, 'scrollTop', {
      set: scrollSpy,
      configurable: true,
    });

    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
    });
  });

  it('applies proper ARIA labels and roles', async () => {
    render(<AgentMessagePanel agent={mockAgent} onClose={mockOnClose} />);
    
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Message filters');
    
    const tabpanel = screen.getByRole('tabpanel');
    expect(tabpanel).toHaveAttribute('aria-labelledby', 'agent-panel-title');
    
    await waitFor(() => {
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(3); // One for each message
      
      articles.forEach((article, i) => {
        expect(article).toHaveAttribute('aria-labelledby', `message-${i}-header`);
      });
    });
  });
});