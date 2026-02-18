import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { KanbanBoard } from './client';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock @dnd-kit components to avoid complex setup
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCorners: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((arr, from, to) => {
    const result = [...arr];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);
    return result;
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

const mockKanbanData = {
  columns: {
    pending: [
      {
        id: '1',
        title: 'Design System Migration',
        agent: 'GRID',
        priority: 'high',
        status: 'pending',
      },
      {
        id: '2', 
        title: 'Analytics Dashboard',
        agent: 'ATLAS',
        priority: 'medium',
        status: 'pending',
      },
    ],
    in_progress: [
      {
        id: '3',
        title: 'Bug Fixes',
        agent: 'DEV',
        priority: 'critical',
        status: 'in_progress',
      },
    ],
    review: [],
    done: [
      {
        id: '4',
        title: 'Documentation Update',
        agent: 'PIXEL',
        priority: 'low',
        status: 'done',
      },
    ],
  },
};

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockKanbanData),
    });
  });

  it('renders loading state initially', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('Loading board…')).toBeInTheDocument();
  });

  it('renders kanban board with columns after loading', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByText('▥ KANBAN')).toBeInTheDocument();
    });

    // Check columns are rendered
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders tasks in correct columns', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByText('Design System Migration')).toBeInTheDocument();
    });

    // Check tasks are in their columns
    expect(screen.getByText('Design System Migration')).toBeInTheDocument();
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bug Fixes')).toBeInTheDocument();
    expect(screen.getByText('Documentation Update')).toBeInTheDocument();
  });

  it('displays correct task counts in column headers', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Pending count
    });

    // Use getAllByText and check that we have the right badges
    const badges = screen.getAllByText('1');
    expect(badges.length).toBeGreaterThan(0); // In Progress count exists
    expect(screen.getByText('0')).toBeInTheDocument(); // Review count
  });

  it('renders agent initials and colors correctly', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      // Look for GRID agent initial
      const gridInitial = screen.getByText('G');
      expect(gridInitial).toBeInTheDocument();
      expect(gridInitial.closest('span')).toHaveAttribute('title', 'GRID');
    });
  });

  it('renders priority badges with correct variants', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      // The CSS uppercase transform may not work in tests, so check for the original case
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('critical')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(<KanbanBoard />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);
    expect(mockReload).toHaveBeenCalledOnce();
  });

  it('handles API fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<KanbanBoard />);

    await waitFor(() => {
      // Should still render the basic structure even with error
      expect(screen.getByText('▥ KANBAN')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[kanban] fetch error',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('supports keyboard navigation on task cards', async () => {
    const user = userEvent.setup();
    
    render(<KanbanBoard />);

    await waitFor(() => {
      const taskCard = screen.getByText('Design System Migration').closest('[tabindex="0"]');
      expect(taskCard).toBeInTheDocument();
    });

    const taskCard = screen.getByText('Design System Migration').closest('[tabindex="0"]')!;
    
    // Focus the task card
    taskCard.focus();
    expect(taskCard).toHaveFocus();

    // Test keyboard interaction
    await user.keyboard('{Enter}');
    // The Enter key should be prevented but not cause errors
    expect(taskCard).toHaveFocus();
  });

  it('has proper accessibility attributes', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      // Check for aria labels on main regions
      expect(screen.getByRole('application', { name: 'Kanban board' })).toBeInTheDocument();
    });

    // Check column regions
    const pendingRegion = screen.getByRole('region', { name: /Pending column/ });
    expect(pendingRegion).toBeInTheDocument();

    const progressRegion = screen.getByRole('region', { name: /In Progress column/ });
    expect(progressRegion).toBeInTheDocument();
  });

  it('renders tasks as list items with proper labels', async () => {
    render(<KanbanBoard />);

    await waitFor(() => {
      const taskItem = screen.getByRole('listitem', { 
        name: /Task: Design System Migration, assigned to GRID, priority: high/
      });
      expect(taskItem).toBeInTheDocument();
    });
  });
});