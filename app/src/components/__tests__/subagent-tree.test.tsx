import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubagentTree } from '../subagent-tree';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SubagentTree', () => {
  const mockAgents = [
    {
      sessionKey: 'main-session-123',
      agentId: 'main-agent',
      status: 'running' as const,
      parentSession: null,
      task: 'Main coordination task',
      runtime: 150,
      startedAt: '2024-01-01T00:00:00Z',
      children: [
        {
          sessionKey: 'sub-session-456',
          agentId: 'sub-agent-1',
          status: 'completed' as const,
          parentSession: 'main-session-123',
          task: 'Process data files',
          runtime: 45,
          startedAt: '2024-01-01T00:01:00Z',
          children: [],
        },
        {
          sessionKey: 'sub-session-789',
          agentId: 'sub-agent-2',
          status: 'error' as const,
          parentSession: 'main-session-123',
          task: 'Generate reports',
          runtime: 30,
          startedAt: '2024-01-01T00:02:00Z',
          children: [],
        },
      ],
    },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SubagentTree />);
    
    // Should show loading skeletons
    expect(screen.getByText('↻ Refresh')).toBeInTheDocument();
    expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(5);
  });

  it('renders empty state when no agents', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: [] }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('No Active Sub-Agents')).toBeInTheDocument();
    });

    expect(screen.getByText('Sub-agents will appear here when they are spawned')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('renders agent hierarchy correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('1 Active Agent')).toBeInTheDocument();
    });

    // Check main agent is displayed
    expect(screen.getByText('main-agent')).toBeInTheDocument();
    expect(screen.getByText('Main coordination task')).toBeInTheDocument();
    
    // Check sub-agents are displayed
    expect(screen.getByText('sub-agent-1')).toBeInTheDocument();
    expect(screen.getByText('sub-agent-2')).toBeInTheDocument();
    expect(screen.getByText('Process data files')).toBeInTheDocument();
    expect(screen.getByText('Generate reports')).toBeInTheDocument();
  });

  it('displays correct status badges', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('formats runtime correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('2m 30s')).toBeInTheDocument(); // 150 seconds
      expect(screen.getByText('45s')).toBeInTheDocument(); // 45 seconds
      expect(screen.getByText('30s')).toBeInTheDocument(); // 30 seconds
    });
  });

  it('supports expand/collapse functionality', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    const user = userEvent.setup();
    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('main-agent')).toBeInTheDocument();
    });

    // Initially expanded, should see sub-agents
    expect(screen.getByText('sub-agent-1')).toBeInTheDocument();
    expect(screen.getByText('sub-agent-2')).toBeInTheDocument();

    // Click collapse button
    const collapseButton = screen.getByRole('button', { name: /▼/i });
    await user.click(collapseButton);

    // Sub-agents should be hidden (though they might still be in DOM but not visible)
    const expandButton = await screen.findByRole('button', { name: /▶/i });
    expect(expandButton).toBeInTheDocument();
  });

  it('handles steering functionality', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: mockAgents }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    const user = userEvent.setup();
    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('main-agent')).toBeInTheDocument();
    });

    // Hover over an agent card to show actions
    const agentCard = screen.getByText('main-agent').closest('[role="tree"]')?.querySelector('div');
    if (agentCard) {
      fireEvent.mouseEnter(agentCard);
    }

    // Click steer button
    const steerButton = screen.getByRole('button', { name: /steer/i });
    await user.click(steerButton);

    // Should show steering input
    const steerInput = screen.getByPlaceholderText('Enter steering message...');
    expect(steerInput).toBeInTheDocument();

    // Type steering message
    await user.type(steerInput, 'Please prioritize task A');

    // Submit steering message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Should call the steer API
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subagents/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: 'main-session-123',
          message: 'Please prioritize task A',
        }),
      });
    });
  });

  it('handles kill confirmation flow', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: mockAgents }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

    const user = userEvent.setup();
    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('main-agent')).toBeInTheDocument();
    });

    // Hover over an agent card to show actions
    const agentCard = screen.getByText('main-agent').closest('[role="tree"]')?.querySelector('div');
    if (agentCard) {
      fireEvent.mouseEnter(agentCard);
    }

    // Click kill button
    const killButton = screen.getByRole('button', { name: /kill/i });
    await user.click(killButton);

    // Should show confirmation dialog
    expect(screen.getByText('Are you sure you want to kill this agent?')).toBeInTheDocument();

    // Confirm kill
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Should call the kill API
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subagents/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey: 'main-session-123',
        }),
      });
    });
  });

  it('supports keyboard navigation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('main-agent')).toBeInTheDocument();
    });

    // Test Ctrl+R for refresh
    fireEvent.keyDown(document, { key: 'r', ctrlKey: true });

    // Should trigger another fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('auto-refreshes every 15 seconds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SubagentTree />);
    
    // Initial fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 15 seconds
    jest.advanceTimersByTime(15000);

    // Should trigger auto-refresh
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<SubagentTree />);
    
    // Should still render, but show empty state or error handling
    await waitFor(() => {
      // Component should handle error gracefully
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });

  it('shows proper agent count in header', async () => {
    const multipleAgents = [
      ...mockAgents,
      {
        sessionKey: 'another-session-999',
        agentId: 'another-agent',
        status: 'running' as const,
        parentSession: null,
        task: 'Another task',
        runtime: 60,
        startedAt: '2024-01-01T01:00:00Z',
        children: [],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: multipleAgents }),
    } as Response);

    render(<SubagentTree />);
    
    await waitFor(() => {
      expect(screen.getByText('2 Active Agents')).toBeInTheDocument();
    });
  });
});