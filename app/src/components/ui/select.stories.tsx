import type { Meta, StoryObj } from '@storybook/react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from './select';
import { useState } from 'react';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Dropdown select component built with Radix UI. Provides keyboard navigation, ARIA support, and consistent styling across the mission control interface.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic select with simple options
 */
export const Default: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a system..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="navigation">Navigation</SelectItem>
          <SelectItem value="propulsion">Propulsion</SelectItem>
          <SelectItem value="life-support">Life Support</SelectItem>
          <SelectItem value="communications">Communications</SelectItem>
          <SelectItem value="power">Power Management</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Select with grouped options and labels
 */
export const WithGroups: Story = {
  render: () => (
    <div className="w-[280px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select subsystem..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Critical Systems</SelectLabel>
            <SelectItem value="life-support-primary">Life Support - Primary</SelectItem>
            <SelectItem value="life-support-backup">Life Support - Backup</SelectItem>
            <SelectItem value="power-main">Power - Main Grid</SelectItem>
            <SelectItem value="power-aux">Power - Auxiliary</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Navigation & Control</SelectLabel>
            <SelectItem value="nav-stellar">Stellar Navigation</SelectItem>
            <SelectItem value="nav-inertial">Inertial Guidance</SelectItem>
            <SelectItem value="control-attitude">Attitude Control</SelectItem>
            <SelectItem value="control-orbital">Orbital Mechanics</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Communications</SelectLabel>
            <SelectItem value="comm-primary">Primary Comm Array</SelectItem>
            <SelectItem value="comm-emergency">Emergency Beacon</SelectItem>
            <SelectItem value="comm-data">Data Relay</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Select with error state
 */
export const WithError: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select>
        <SelectTrigger error="Please select a valid system">
          <SelectValue placeholder="Select system..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nav">Navigation</SelectItem>
          <SelectItem value="prop">Propulsion</SelectItem>
          <SelectItem value="life">Life Support</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Disabled select
 */
export const Disabled: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="System offline..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nav">Navigation</SelectItem>
          <SelectItem value="prop">Propulsion</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Select with disabled options
 */
export const WithDisabledOptions: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select system..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="navigation">Navigation</SelectItem>
          <SelectItem value="propulsion" disabled>Propulsion (Offline)</SelectItem>
          <SelectItem value="life-support">Life Support</SelectItem>
          <SelectItem value="communications" disabled>Communications (Maintenance)</SelectItem>
          <SelectItem value="power">Power Management</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Controlled select example
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');
    
    return (
      <div className="w-[240px] space-y-4">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority level..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">🔴 Critical</SelectItem>
            <SelectItem value="high">🟡 High</SelectItem>
            <SelectItem value="medium">🟢 Medium</SelectItem>
            <SelectItem value="low">⚪ Low</SelectItem>
          </SelectContent>
        </Select>
        {value && (
          <div className="text-xs text-grid-text-muted">
            Selected: <code className="font-mono">{value}</code>
          </div>
        )}
      </div>
    );
  },
};

/**
 * Select with long options
 */
export const LongOptions: Story = {
  render: () => (
    <div className="w-[320px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select mission protocol..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="protocol-alpha">Alpha Protocol - Standard Operations Procedures</SelectItem>
          <SelectItem value="protocol-beta">Beta Protocol - Emergency Response and Containment</SelectItem>
          <SelectItem value="protocol-gamma">Gamma Protocol - Deep Space Communications and Navigation</SelectItem>
          <SelectItem value="protocol-delta">Delta Protocol - Life Support Management and Resource Allocation</SelectItem>
          <SelectItem value="protocol-epsilon">Epsilon Protocol - Scientific Research and Data Collection</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * Multiple selects showcase
 */
export const MultipleSelects: Story = {
  render: () => (
    <div className="space-y-4 w-[280px]">
      <div>
        <label className="text-xs font-medium text-grid-text mb-2 block">
          Primary System
        </label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select primary..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nav">Navigation</SelectItem>
            <SelectItem value="prop">Propulsion</SelectItem>
            <SelectItem value="life">Life Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-xs font-medium text-grid-text mb-2 block">
          Backup System
        </label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select backup..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nav-backup">Navigation Backup</SelectItem>
            <SelectItem value="prop-backup">Propulsion Backup</SelectItem>
            <SelectItem value="life-backup">Life Support Backup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-grid-text mb-2 block">
          Alert Level
        </label>
        <Select>
          <SelectTrigger error="Selection required">
            <SelectValue placeholder="Select level..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="green">🟢 Green - Normal</SelectItem>
            <SelectItem value="yellow">🟡 Yellow - Caution</SelectItem>
            <SelectItem value="red">🔴 Red - Alert</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

/**
 * Form integration example
 */
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      system: '',
      priority: '',
      status: '',
    });

    return (
      <div className="w-[300px] p-4 border border-grid-border rounded-lg bg-grid-surface">
        <h3 className="text-sm font-medium text-grid-text mb-4">Mission Parameters</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Target System *
            </label>
            <Select value={formData.system} onValueChange={(value) => setFormData(prev => ({ ...prev, system: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select target system..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mars">Mars Orbit</SelectItem>
                <SelectItem value="jupiter">Jupiter System</SelectItem>
                <SelectItem value="saturn">Saturn Rings</SelectItem>
                <SelectItem value="asteroid">Asteroid Belt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Mission Priority
            </label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Set priority level..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alpha">Alpha - Critical</SelectItem>
                <SelectItem value="beta">Beta - High</SelectItem>
                <SelectItem value="gamma">Gamma - Standard</SelectItem>
                <SelectItem value="delta">Delta - Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Launch Status
            </label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready">🟢 Ready for Launch</SelectItem>
                <SelectItem value="prep">🟡 In Preparation</SelectItem>
                <SelectItem value="hold">🔴 On Hold</SelectItem>
                <SelectItem value="abort">⚫ Mission Aborted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {Object.values(formData).some(Boolean) && (
            <div className="mt-4 p-3 bg-grid-surface/50 rounded text-xs">
              <div className="text-grid-text-muted mb-2">Current Selection:</div>
              <pre className="text-grid-text font-mono">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  },
};