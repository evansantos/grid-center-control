import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpawnForm } from '../spawn-form';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SpawnForm', () => {
  const mockAgents = [
    { id: 'agent1', emoji: '🤖', name: 'Test Agent 1' },
    { id: 'agent2', emoji: '🚀', name: 'Test Agent 2' },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  it('renders loading state initially', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SpawnForm />);
    
    // Should show loading skeletons
    expect(screen.getAllByTestId(/skeleton/i)).toHaveLength(5);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });
  });

  it('renders form with agents after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Check form fields are present
    expect(screen.getByLabelText('Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByLabelText('Task Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Timeout (seconds)')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    const user = userEvent.setup();
    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Try to submit without task
    const submitButton = screen.getByRole('button', { name: /spawn/i });
    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText('Please provide a task description')).toBeInTheDocument();
  });

  it('validates task length', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    const user = userEvent.setup();
    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Enter a task that's too short
    const taskInput = screen.getByLabelText('Task Description');
    await user.type(taskInput, 'short');

    const submitButton = screen.getByRole('button', { name: /spawn/i });
    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText('Task description must be at least 10 characters')).toBeInTheDocument();
  });

  it('validates timeout range', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    const user = userEvent.setup();
    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Set timeout too low
    const timeoutInput = screen.getByLabelText('Timeout (seconds)');
    await user.clear(timeoutInput);
    await user.type(timeoutInput, '20');

    // Enter valid task
    const taskInput = screen.getByLabelText('Task Description');
    await user.type(taskInput, 'This is a valid task description');

    const submitButton = screen.getByRole('button', { name: /spawn/i });
    await user.click(submitButton);

    // Should show validation error
    expect(screen.getByText('Timeout must be at least 30 seconds')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: mockAgents }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sessionKey: 'test-session-123',
          agentId: 'agent1',
          model: 'default',
          status: 'running',
          timestamp: '2024-01-01T00:00:00Z',
        }),
      } as Response);

    const user = userEvent.setup();
    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Fill out form
    const taskInput = screen.getByLabelText('Task Description');
    await user.type(taskInput, 'This is a valid task description for testing');

    const submitButton = screen.getByRole('button', { name: /spawn/i });
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('⏳ Spawning...')).toBeInTheDocument();

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('✅ Agent Spawned Successfully')).toBeInTheDocument();
    });

    // Should show result details
    expect(screen.getByText('test-session-123'.slice(-20))).toBeInTheDocument();
    expect(screen.getByText('agent1')).toBeInTheDocument();
    expect(screen.getByText('running')).toBeInTheDocument();
  });

  it('handles submission errors', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: mockAgents }),
      } as Response)
      .mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Fill out form
    const taskInput = screen.getByLabelText('Task Description');
    await user.type(taskInput, 'This is a valid task description for testing');

    const submitButton = screen.getByRole('button', { name: /spawn/i });
    await user.click(submitButton);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Failed to spawn agent. Please try again.')).toBeInTheDocument();
    });
  });

  it('stores and displays recent spawns', async () => {
    const recentSpawn = {
      sessionKey: 'old-session-456',
      agentId: 'agent2',
      model: 'opus',
      status: 'completed',
      timestamp: '2024-01-01T00:00:00Z',
    };

    // Pre-populate localStorage
    localStorage.setItem('grid-recent-spawns', JSON.stringify([recentSpawn]));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Should show recent spawns
    expect(screen.getByText('Recent Spawns')).toBeInTheDocument();
    expect(screen.getByText('agent2')).toBeInTheDocument();
    expect(screen.getByText('old-session-456'.slice(-12))).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    } as Response);

    render(<SpawnForm />);
    
    await waitFor(() => {
      expect(screen.getByText('🚀 Spawn Agent Session')).toBeInTheDocument();
    });

    // Tab through form elements
    const taskInput = screen.getByLabelText('Task Description');
    taskInput.focus();
    
    expect(document.activeElement).toBe(taskInput);

    // Use tab to navigate to timeout input
    fireEvent.keyDown(taskInput, { key: 'Tab' });
    const timeoutInput = screen.getByLabelText('Timeout (seconds)');
    expect(document.activeElement).toBe(timeoutInput);
  });
});