import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { useState } from 'react';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Multi-line text input component with consistent styling, error states, and size variants. Built for mission-critical text entry and communications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant affecting height and padding',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown when empty',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display below the textarea',
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of visible text lines (overrides size variants)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default textarea with medium size
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter mission notes...',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Small size textarea
 */
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Brief status update...',
  },
  render: (args) => (
    <div className="w-[300px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Large size textarea
 */
export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Detailed mission report...',
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Size comparison
 */
export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-6 w-[400px]">
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-2">Small</h3>
        <Textarea size="sm" placeholder="Small textarea for quick notes..." />
      </div>
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-2">Medium (Default)</h3>
        <Textarea size="md" placeholder="Medium textarea for standard input..." />
      </div>
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-2">Large</h3>
        <Textarea size="lg" placeholder="Large textarea for detailed content..." />
      </div>
    </div>
  ),
};

/**
 * Textarea with error state
 */
export const WithError: Story = {
  args: {
    placeholder: 'Enter mission objectives...',
    error: 'Mission objectives cannot be empty',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Disabled textarea
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'This textarea is disabled and cannot be edited.',
  },
  render: (args) => (
    <div className="w-[400px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Textarea with initial content
 */
export const WithContent: Story = {
  args: {
    defaultValue: `Mission Log: Sol 47

Weather conditions: Clear, minimal dust
Temperature: -82°C to 12°C
Wind speed: 3.2 m/s

Today's objectives completed:
✓ Soil sample collection at Waypoint Charlie
✓ Atmospheric readings recorded
✓ Equipment maintenance check

Notes: Discovered unusual rock formation approximately 150m northeast of current position. Recommend investigation during next EVA.

Next sol priorities:
- Investigate rock formation
- Continue geological survey
- Equipment diagnostics`,
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
};

/**
 * Controlled textarea with character counter
 */
export const WithCharacterCount: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 280;
    
    return (
      <div className="w-[400px] space-y-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter status update (280 chars max)..."
          size="md"
        />
        <div className="flex justify-between items-center text-xs">
          <span className={`${value.length > maxLength ? 'text-grid-error' : 'text-grid-text-muted'}`}>
            {value.length}/{maxLength} characters
          </span>
          {value.length > maxLength && (
            <span className="text-grid-error">Character limit exceeded</span>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Form integration example
 */
export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      subject: '',
      description: '',
      notes: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.subject.trim()) {
        newErrors.subject = 'Subject is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (formData.description.length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
      
      setErrors(newErrors);
    };

    return (
      <div className="w-[500px] p-4 border border-grid-border rounded-lg bg-grid-surface">
        <h3 className="text-sm font-medium text-grid-text mb-4">Mission Report Form</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Subject *
            </label>
            <Textarea
              size="sm"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief subject line..."
              error={errors.subject}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Detailed Description *
            </label>
            <Textarea
              size="md"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Provide detailed description of the situation, findings, or observations..."
              error={errors.description}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-grid-text mb-1 block">
              Additional Notes
            </label>
            <Textarea
              size="lg"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes, recommendations, or follow-up actions..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90 text-sm font-medium"
          >
            Submit Report
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Communication interface example
 */
export const CommunicationInterface: Story = {
  render: () => {
    const [message, setMessage] = useState('');
    
    return (
      <div className="w-[600px] border border-grid-border rounded-lg bg-grid-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-grid-text">Mission Control Communication</h3>
          <div className="flex items-center gap-2 text-xs text-grid-text-muted">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Connected
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-32 bg-grid-background rounded border p-3 overflow-y-auto text-xs">
            <div className="text-grid-text-muted mb-1">12:34:21 | MISSION_CTRL:</div>
            <div className="text-grid-text mb-3">Status report requested for current EVA operations.</div>
            
            <div className="text-grid-text-muted mb-1">12:36:45 | FIELD_OPS:</div>
            <div className="text-grid-text mb-3">EVA proceeding nominally. Sample collection 75% complete.</div>
            
            <div className="text-grid-text-muted mb-1">12:38:12 | MISSION_CTRL:</div>
            <div className="text-grid-text">Copy that. Weather update: Storm front approaching in T-2 hours.</div>
          </div>
          
          <div>
            <Textarea
              size="sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message to Mission Control..."
              className="font-mono"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="text-xs text-grid-text-muted">
                Priority: NORMAL | Channel: PRIMARY | Encryption: ACTIVE
              </div>
              <button 
                className="px-3 py-1 bg-grid-accent text-white rounded text-xs font-medium hover:bg-grid-accent/90"
                disabled={!message.trim()}
              >
                Transmit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Custom rows override
 */
export const CustomRows: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-2">2 Rows</h3>
        <Textarea rows={2} placeholder="Compact textarea with 2 rows..." />
      </div>
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-2">8 Rows</h3>
        <Textarea rows={8} placeholder="Extended textarea with 8 rows for longer content..." />
      </div>
    </div>
  ),
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    placeholder: 'Enter mission data...',
    size: 'md',
    disabled: false,
    error: '',
  },
  render: (args) => (
    <div className="w-[500px]">
      <Textarea {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use the controls below to experiment with different textarea configurations and states.',
      },
    },
  },
};