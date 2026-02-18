# Grid Dashboard 🚀

A comprehensive AI agent monitoring and management dashboard for OpenClaw/Claude agents. Grid Dashboard provides real-time insights into agent performance, session analytics, task management through Kanban boards, and a complete suite of administrative tools.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📸 Screenshots

*Screenshots will be added after initial setup and deployment.*

## ✨ Features

### 🤖 Agent Management
- **Real-time Agent Monitoring** - Live status tracking and performance metrics
- **Session Analytics** - Detailed session history with timeline visualization
- **Agent State Indicators** - Visual status indicators for active, idle, and error states
- **Bulk Agent Operations** - Manage multiple agents simultaneously
- **Agent Configuration** - Centralized agent settings and model management

### 📊 Analytics & Reporting
- **Performance Dashboard** - Comprehensive metrics and KPIs
- **Cost Analytics** - Token usage and cost tracking by model
- **Session Heatmaps** - Visual representation of agent activity patterns
- **ROI Analysis** - Return on investment calculations for AI operations
- **Timeline Analytics** - Historical data visualization and trends
- **Custom Reports** - Generate snapshots and detailed reports

### 📋 Task Management
- **Kanban Boards** - Drag-and-drop task organization
- **Workflow Management** - Define and track complex workflows
- **Task Distribution** - Intelligent task assignment and load balancing
- **Progress Tracking** - Real-time updates on task completion
- **Automation Rules** - Set up automated task handling

### 🔧 Administrative Tools
- **Health Monitoring** - System health checks and alerts
- **Error Dashboard** - Centralized error tracking and debugging
- **Log Search** - Advanced search capabilities across all logs
- **Settings Management** - Configurable system settings and preferences
- **Security & Audit** - Access control and audit trail functionality
- **Secrets Management** - Secure storage and rotation of sensitive data

### 🎨 Design System
- **Grid HQ Design System** - Comprehensive component library
- **Storybook Integration** - Interactive component documentation
- **Custom Themes** - Light/dark mode with customizable accents
- **Responsive Design** - Mobile-first, accessible interface
- **Accessibility** - WCAG AA compliant components

### 🏢 Office Integration
- **Living Office View** - Interactive office map with agent locations
- **Isometric Office** - 3D visualization of agent workspace
- **Zone Management** - Organize agents by office zones
- **Visitor Indicators** - Track external interactions

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.1.6](https://nextjs.org/) with App Router
- **Frontend:** [React 19.2.3](https://reactjs.org/) with TypeScript
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) with custom design system
- **Database:** [SQLite](https://www.sqlite.org/) with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/)
- **Component Variants:** [Class Variance Authority (CVA)](https://cva.style/docs)
- **Documentation:** [Storybook 10.2.10](https://storybook.js.org/)
- **Testing:** [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) + [Testing Library](https://testing-library.com/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
- **Development:** TypeScript, ESLint, PostCSS

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun package manager
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd grid/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Initialize the database:**
   ```bash
   npm run db:setup
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:run     # Run tests once
npm run test:e2e     # Run E2E tests

# Linting
npm run lint         # Run ESLint

# Storybook
npm run storybook           # Start Storybook dev server
npm run build-storybook     # Build Storybook

# Analysis
npm run analyze      # Bundle analyzer
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── agents/            # Agent management pages
│   ├── analytics/         # Analytics and reporting
│   ├── api/               # API endpoints (51+ routes)
│   │   ├── agents/        # Agent-related APIs
│   │   ├── analytics/     # Analytics APIs  
│   │   ├── kanban/        # Kanban board APIs
│   │   ├── settings/      # Settings management
│   │   └── ...           # Other API routes
│   ├── health/            # Health monitoring
│   ├── kanban/            # Task management
│   ├── settings/          # Configuration pages
│   └── ...               # Other pages
├── components/            # React components
│   ├── ui/               # Design system components
│   ├── charts/           # Data visualization
│   ├── widgets/          # Dashboard widgets
│   └── ...              # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
└── i18n/                # Internationalization
```

### Key Directories

- **`/app/api/`** - 50+ API endpoints for comprehensive backend functionality
- **`/components/ui/`** - Design system components with Storybook documentation
- **`/components/`** - Feature-rich components including office visualization
- **`/lib/`** - Database utilities, authentication, and helper functions

## 🎨 Design System

Grid Dashboard features a custom **Grid HQ Design System** built with:

- **Design Tokens** - Semantic color, typography, and spacing tokens
- **Component Library** - 30+ documented components in Storybook
- **Theme Support** - Light/dark themes with customizable accent colors
- **Accessibility** - WCAG AA compliant with 44px minimum touch targets
- **Responsive** - Mobile-first design with consistent breakpoints

### Design System Waves

The design system is organized into development waves:

- **Wave 1** - Core components (Button, Card, Input, etc.)
- **Wave 2** - Layout and navigation components
- **Wave 3** - Data visualization and complex interactions
- **Wave 4** - Advanced features and integrations

Access the component library at `/storybook-static/` or run `npm run storybook`.

## 🔌 API Routes

The dashboard includes 50+ API endpoints organized by feature:

### Core APIs
- **`/api/agents`** - Agent management and control
- **`/api/sessions`** - Session tracking and analytics
- **`/api/analytics`** - Performance metrics and reporting
- **`/api/kanban`** - Task management and workflows

### Monitoring & Health
- **`/api/health`** - System health checks
- **`/api/errors`** - Error tracking and debugging
- **`/api/logs`** - Log search and filtering
- **`/api/stream`** - Real-time data streaming

### Administrative
- **`/api/settings`** - Configuration management
- **`/api/alerts`** - Alert system configuration
- **`/api/cron`** - Scheduled task management
- **`/api/reports`** - Report generation

### Specialized
- **`/api/subagents`** - Subagent orchestration
- **`/api/fleet`** - Fleet management
- **`/api/office`** - Office layout and zones
- **`/api/calendar`** - Calendar integration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables in Vercel dashboard**
3. **Deploy with force-dynamic configuration:**

```javascript
// next.config.ts includes force-dynamic for database pages
export const dynamic = 'force-dynamic';
```

### Docker

```bash
# Build container
docker build -t grid-dashboard .

# Run container
docker run -p 3000:3000 grid-dashboard
```

### Self-hosted

```bash
# Build the application
npm run build

# Start the production server
npm start
```

**Note:** The application uses `force-dynamic` rendering for database-dependent pages to ensure real-time data accuracy.

## 🧪 Testing

Comprehensive testing setup with multiple frameworks:

```bash
# Unit & Integration Tests
npm run test         # Watch mode
npm run test:run     # Single run

# End-to-End Tests  
npm run test:e2e     # Run Playwright tests

# Component Testing
npm run storybook    # Visual testing via Storybook
```

### Testing Stack
- **Vitest** - Fast unit testing with HMR
- **Playwright** - Reliable E2E testing with multiple browsers
- **Testing Library** - Component testing utilities
- **Axe** - Automated accessibility testing
- **Storybook** - Visual regression testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation in `/storybook-static/`
- Review API documentation in the codebase

---

**Grid Dashboard** - Empowering AI agent management with comprehensive monitoring, analytics, and administrative tools. 🚀✨