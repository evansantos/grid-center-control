import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { NavBar } from './nav-bar';
import { useIsMobile } from '@/lib/useMediaQuery';
import { vi } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock media query hook
vi.mock('@/lib/useMediaQuery', () => ({
  useIsMobile: vi.fn(),
}));

// Mock theme and notification components
vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('@/components/notification-center', () => ({
  NotificationCenter: () => <div data-testid="notification-center">Notification Center</div>,
}));

// Mock Link component
vi.mock('next/link', () => {
  return { default: ({ href, children, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick} data-testid={`link-${href}`}>
      {children}
    </a>
  ) };
});

const mockedUsePathname = usePathname as ReturnType<typeof vi.fn>;
const mockedUseIsMobile = useIsMobile as ReturnType<typeof vi.fn>;

describe('NavBar', () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue('/');
    mockedUseIsMobile.mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Navigation', () => {
    it('renders all main navigation links', () => {
      render(<NavBar />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Office')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
    });

    it('renders all navigation groups', () => {
      render(<NavBar />);
      
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('highlights active links correctly', () => {
      mockedUsePathname.mockReturnValue('/office');
      render(<NavBar />);
      
      const officeLink = screen.getByTestId('link-/office');
      expect(officeLink).toHaveClass('text-grid-accent');
    });

    it('highlights active dropdown groups when child route is active', () => {
      mockedUsePathname.mockReturnValue('/analytics/performance');
      render(<NavBar />);
      
      const analyticsButton = screen.getByRole('button', { name: /analytics/i });
      expect(analyticsButton).toHaveClass('text-grid-accent');
    });

    it('opens and closes dropdown menus', async () => {
      render(<NavBar />);
      
      const toolsButton = screen.getByRole('button', { name: /tools/i });
      fireEvent.click(toolsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Spawn')).toBeInTheDocument();
        expect(screen.getByText('Logs')).toBeInTheDocument();
        expect(screen.getByText('Health')).toBeInTheDocument();
      });
    });

    it('renders logo with proper link', () => {
      render(<NavBar />);
      
      const logoLink = screen.getByTestId('link-/');
      expect(logoLink).toHaveTextContent('GRID');
    });

    it('renders search trigger button', () => {
      render(<NavBar />);
      
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('⌘K')).toBeInTheDocument();
    });

    it('triggers search on search button click', () => {
      const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
      render(<NavBar />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);
      
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'keydown',
          key: 'k',
          metaKey: true,
        })
      );
      
      dispatchEventSpy.mockRestore();
    });

    it('renders theme toggle and notification center', () => {
      render(<NavBar />);
      
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      mockedUseIsMobile.mockReturnValue(true);
    });

    it('shows hamburger menu button on mobile', () => {
      render(<NavBar />);
      
      const hamburgerButton = screen.getByText('☰');
      expect(hamburgerButton).toBeInTheDocument();
    });

    it('hides desktop navigation on mobile', () => {
      render(<NavBar />);
      
      const desktopNav = screen.queryByText('Dashboard');
      expect(desktopNav).not.toBeInTheDocument();
    });

    it('opens and closes mobile menu', () => {
      render(<NavBar />);
      
      const hamburgerButton = screen.getByText('☰');
      
      // Menu should be closed initially
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      
      // Open menu
      fireEvent.click(hamburgerButton);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('MAIN')).toBeInTheDocument(); // Group header
      
      // Close menu
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('closes mobile menu when a link is clicked', () => {
      render(<NavBar />);
      
      // Open menu
      const hamburgerButton = screen.getByText('☰');
      fireEvent.click(hamburgerButton);
      
      // Click a link
      const dashboardLink = screen.getByTestId('link-/');
      fireEvent.click(dashboardLink);
      
      // Menu should close
      expect(screen.queryByText('MAIN')).not.toBeInTheDocument();
    });

    it('shows all navigation groups in mobile menu', () => {
      render(<NavBar />);
      
      const hamburgerButton = screen.getByText('☰');
      fireEvent.click(hamburgerButton);
      
      expect(screen.getByText('MAIN')).toBeInTheDocument();
      expect(screen.getByText('ANALYTICS')).toBeInTheDocument();
      expect(screen.getByText('TOOLS')).toBeInTheDocument();
      expect(screen.getByText('SETTINGS')).toBeInTheDocument();
    });

    it('shows theme toggle and notification center in mobile menu', () => {
      render(<NavBar />);
      
      const hamburgerButton = screen.getByText('☰');
      fireEvent.click(hamburgerButton);
      
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('notification-center')).toBeInTheDocument();
    });
  });

  describe('Navigation State', () => {
    it('applies correct styling to active main links', () => {
      mockedUsePathname.mockReturnValue('/agents');
      render(<NavBar />);
      
      const agentsLink = screen.getByTestId('link-/agents');
      expect(agentsLink).toHaveClass('text-grid-accent');
    });

    it('applies correct styling to inactive main links', () => {
      mockedUsePathname.mockReturnValue('/');
      render(<NavBar />);
      
      const agentsLink = screen.getByTestId('link-/agents');
      expect(agentsLink).toHaveClass('text-grid-text-dim');
    });

    it('shows active state for dropdown items in mobile menu', () => {
      mockedUseIsMobile.mockReturnValue(true);
      mockedUsePathname.mockReturnValue('/spawn');
      render(<NavBar />);
      
      // Open mobile menu
      const hamburgerButton = screen.getByText('☰');
      fireEvent.click(hamburgerButton);
      
      const spawnLink = screen.getByTestId('link-/spawn');
      expect(spawnLink).toHaveClass('text-grid-accent');
    });
  });
});