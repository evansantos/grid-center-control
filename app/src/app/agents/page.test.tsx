import { render, screen, waitFor } from '@testing-library/react';
import AgentsPage from './page';
import { vi } from 'vitest';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockAgents = [
  {
    id: 'test-agent',
    name: 'Test Agent',
    emoji: '🤖',
    role: 'Testing Assistant',
    model: 'claude-3',
    activeSessions: [
      {
        sessionKey: 'session1',
        updatedAt: new Date().toISOString(),
        messageCount: 5
      }
    ]
  },
  {
    id: 'idle-agent',
    name: 'Idle Agent',
    emoji: '😴',
    role: 'Idle Helper',
    model: 'gpt-4',
    activeSessions: [
      {
        sessionKey: 'session2',
        updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        messageCount: 2
      }
    ]
  }
];

describe('AgentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state with Skeleton components', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ agents: mockAgents })
      }), 100))
    );

    render(<AgentsPage />);
    
    // Check loading state is displayed
    expect(screen.getByText('Scanning agents…')).toBeInTheDocument();
    
    // Should use Skeleton components for loading (check for skeleton classes)
    const skeletonElement = document.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('should render error state with Card component', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load agents: Network error/)).toBeInTheDocument();
    });
  });

  it('should render agents with Card components and Grid token classes', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    const { container } = render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
      expect(screen.getByText('Idle Agent')).toBeInTheDocument();
    });

    // Agent cards should use Card component classes
    const cardElements = container.querySelectorAll('.bg-grid-surface, .border-grid-border');
    expect(cardElements.length).toBeGreaterThan(0);
  });

  it('should use StatusDot component for agent status', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    const { container } = render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });

    // Should use StatusDot component classes
    const statusDots = container.querySelectorAll('.bg-grid-success, .bg-grid-warning, .rounded-full');
    expect(statusDots.length).toBeGreaterThan(0);
  });

  it('should use Button component for Configure links', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    render(<AgentsPage />);
    
    await waitFor(() => {
      const configureLinks = screen.getAllByText('Configure');
      expect(configureLinks.length).toBe(2);
      
      // Check that they have proper href
      configureLinks.forEach((link, index) => {
        const expectedHref = `/agents/${mockAgents[index].id}/config`;
        expect(link.closest('a')).toHaveAttribute('href', expectedHref);
      });
    });
  });

  it('should not have inline styles with Grid CSS variables', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    const { container } = render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Agent')).toBeInTheDocument();
    });

    // Check that no element uses inline styles with var(--grid-*)
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      const style = element.getAttribute('style');
      if (style) {
        expect(style).not.toMatch(/var\(--grid-/);
      }
    });
  });

  it('should use Grid token classes for text styling', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    const { container } = render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Agents')).toBeInTheDocument();
    });

    // Header should use Grid token classes
    expect(container.querySelector('.text-grid-text')).toBeInTheDocument();
    expect(container.querySelector('.text-grid-text-muted')).toBeInTheDocument();
  });

  it('should render empty state correctly', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: [] })
    });

    render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No agents found in/)).toBeInTheDocument();
    });
  });

  it('should correctly determine agent status', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ agents: mockAgents })
    });

    render(<AgentsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument(); // Test Agent (recent activity)
      expect(screen.getByText('Idle')).toBeInTheDocument(); // Idle Agent (old activity)
    });
  });
});