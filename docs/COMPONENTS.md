# Component API Documentation

A comprehensive guide to all UI components in the Grid Design System.

## Overview

All components follow these principles:

- **Accessibility First**: WCAG 2.1 AA compliance with proper ARIA attributes and keyboard navigation
- **Design Tokens**: Consistent theming using CSS custom properties
- **TypeScript**: Full type safety with proper interfaces and variant types
- **Flexible**: Composable components with `className` override support
- **Touch-Friendly**: Minimum 44px touch targets on mobile devices

## Design Tokens

Components use the Grid Design System tokens:

```css
/* Colors */
--grid-accent           /* Primary brand color */
--grid-bg              /* Background */
--grid-surface         /* Card/elevated surfaces */
--grid-border          /* Default borders */
--grid-text            /* Primary text */
--grid-text-dim        /* Secondary text */
--grid-text-muted      /* Tertiary text */
--grid-error           /* Error states */
--grid-success         /* Success states */
--grid-warning         /* Warning states */
--grid-info            /* Info states */
```

---

## Button

Primary interactive element for user actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `className` | `string` | `undefined` | Additional CSS classes |
| All standard `button` HTML attributes | | | Native button props |

### Usage

```tsx
import { Button } from '@/components/ui'

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With custom styling
<Button className="w-full" variant="secondary">
  Full Width Button
</Button>

// Loading state
<Button disabled>
  Loading...
</Button>
```

### Do's and Don'ts

✅ **Do:**
- Use `primary` for main actions (save, submit, next)
- Use `secondary` for less important actions (cancel, back)
- Use `ghost` for subtle actions (close, dismiss)
- Use `danger` for destructive actions (delete, remove)
- Provide clear, action-oriented labels
- Use `disabled` state during loading

❌ **Don't:**
- Use multiple primary buttons in the same context
- Make buttons too small (under 44px touch target)
- Use generic labels like "OK" or "Click here"

### Accessibility

- Automatic focus management with `focus-visible:outline`
- ARIA attributes inherited from native `button`
- Keyboard navigation support (Enter/Space)
- Disabled state prevents interaction and focus

---

## Input

Text input component with validation support.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'search'` | `'default'` | Input style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `error` | `string` | `undefined` | Error message to display |
| `className` | `string` | `undefined` | Additional CSS classes |
| All standard `input` HTML attributes | | | Native input props |

### Usage

```tsx
import { Input } from '@/components/ui'

// Basic usage
<Input placeholder="Enter your name" />

// With error state
<Input 
  error="This field is required" 
  placeholder="Email address"
/>

// Search variant with icon
<Input 
  variant="search" 
  placeholder="Search..."
/>

// Sizes
<Input size="sm" placeholder="Small input" />
<Input size="lg" placeholder="Large input" />

// Form integration
<form onSubmit={handleSubmit}>
  <Input 
    type="email"
    name="email"
    required
    placeholder="email@example.com"
  />
</form>
```

### Do's and Don'ts

✅ **Do:**
- Provide clear, descriptive placeholders
- Show error messages below the input
- Use appropriate input types (email, password, tel, etc.)
- Include labels for accessibility

❌ **Don't:**
- Use placeholder text as the only label
- Make inputs too narrow for expected content
- Show errors before user interaction

### Accessibility

- Proper focus management with visible focus indicators
- Error messages linked via `aria-describedby`
- Compatible with screen readers
- Keyboard navigation support

---

## Card

Container component for grouping related content.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'accent' \| 'glass'` | `'default'` | Visual style variant |
| `className` | `string` | `undefined` | Additional CSS classes |
| All standard `div` HTML attributes | | | Native div props |

### Sub-components

- `CardHeader` - Header section with padding
- `CardTitle` - Semantic heading element
- `CardDescription` - Secondary description text
- `CardContent` - Main content area
- `CardFooter` - Footer section with actions

### Usage

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui'

// Basic card structure
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      Optional description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="accent">Highlighted card</Card>
<Card variant="glass">Glass morphism effect</Card>

// Custom styling
<Card className="max-w-md mx-auto">
  Centered card with max width
</Card>
```

### Do's and Don'ts

✅ **Do:**
- Use cards to group related information
- Maintain consistent padding and spacing
- Include hover effects for interactive cards
- Use semantic heading levels in CardTitle

❌ **Don't:**
- Nest cards too deeply
- Make cards too narrow on mobile
- Use cards for single pieces of information

### Accessibility

- Proper heading hierarchy with CardTitle
- Focus management for interactive cards
- Screen reader friendly structure

---

## Badge

Small status indicator for labeling and categorization.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'outline'` | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant |
| `className` | `string` | `undefined` | Additional CSS classes |
| All standard `span` HTML attributes | | | Native span props |

### Usage

```tsx
import { Badge } from '@/components/ui'

// Basic usage
<Badge>Default</Badge>

// Status variants
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">Info</Badge>

// Outline style
<Badge variant="outline">Outline</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
```

### Do's and Don'ts

✅ **Do:**
- Use semantic color variants for status
- Keep text short and descriptive
- Use consistent terminology across the app

❌ **Don't:**
- Use badges for long text
- Mix different badge styles inconsistently
- Use badges for primary actions

---

## Select

Dropdown selection component built on Radix UI.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `error` | `string` | `undefined` | Error message for SelectTrigger |
| All Radix Select props | | | Full Radix UI Select API |

### Sub-components

- `Select` - Root component
- `SelectTrigger` - Clickable trigger button
- `SelectValue` - Selected value display
- `SelectContent` - Dropdown content container
- `SelectItem` - Individual option item
- `SelectLabel` - Group label
- `SelectSeparator` - Visual separator

### Usage

```tsx
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui'

// Basic usage
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// With error state
<Select>
  <SelectTrigger error="Please select an option">
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
  </SelectContent>
</Select>

// Controlled usage
const [value, setValue] = useState('')

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="item1">Item 1</SelectItem>
    <SelectItem value="item2">Item 2</SelectItem>
  </SelectContent>
</Select>
```

### Do's and Don'ts

✅ **Do:**
- Use descriptive placeholders
- Group related options with SelectLabel
- Show error states clearly
- Keep option text concise

❌ **Don't:**
- Use select for fewer than 4 options (use radio buttons)
- Make dropdowns too narrow for content
- Use generic placeholders like "Select..."

### Accessibility

- Full keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader announcements
- Proper ARIA labeling
- Focus management

---

## Textarea

Multi-line text input component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `error` | `string` | `undefined` | Error message to display |
| `className` | `string` | `undefined` | Additional CSS classes |
| All standard `textarea` HTML attributes | | | Native textarea props |

### Usage

```tsx
import { Textarea } from '@/components/ui'

// Basic usage
<Textarea placeholder="Enter your message..." />

// With error
<Textarea 
  error="Message is required"
  placeholder="Tell us more..."
/>

// Sizes
<Textarea size="sm" placeholder="Small textarea" />
<Textarea size="lg" placeholder="Large textarea" />

// Controlled
const [message, setMessage] = useState('')

<Textarea 
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Type your message..."
/>
```

### Do's and Don'ts

✅ **Do:**
- Set appropriate minimum heights
- Allow vertical resizing by default
- Provide clear placeholder text
- Show character counts for limited inputs

❌ **Don't:**
- Make textareas too small for expected content
- Prevent resizing unless necessary
- Use textareas for single-line input

---

## Dialog

Modal dialog component built on Radix UI.

### Sub-components

- `Dialog` - Root component
- `DialogTrigger` - Trigger element
- `DialogContent` - Modal content container
- `DialogHeader` - Header section
- `DialogTitle` - Modal title
- `DialogDescription` - Modal description
- `DialogFooter` - Footer with actions
- `DialogClose` - Close trigger

### Usage

```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui'
import { Button } from '@/components/ui'

// Basic dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmation</DialogTitle>
      <DialogDescription>
        Are you sure you want to continue?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Controlled dialog
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Do's and Don'ts

✅ **Do:**
- Always include DialogTitle for accessibility
- Use DialogDescription for additional context
- Provide clear action buttons in DialogFooter
- Handle focus management properly

❌ **Don't:**
- Nest dialogs (use single level)
- Make dialogs too large on mobile
- Use dialogs for non-critical information

### Accessibility

- Focus trap within modal
- Escape key to close
- Click outside to close
- Proper ARIA labeling
- Focus restoration on close

---

## Table

Data table component with responsive design.

### Sub-components

- `Table` - Root table with responsive wrapper
- `TableHeader` - Table header section
- `TableBody` - Table body section
- `TableRow` - Table row
- `TableHead` - Header cell with optional sorting
- `TableCell` - Data cell

### Props

#### TableHead
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortable` | `boolean` | `false` | Show sort indicator |
| `sortDirection` | `'asc' \| 'desc'` | `undefined` | Current sort direction |

### Usage

```tsx
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui'

// Basic table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>

// With sorting
<TableHead 
  sortable 
  sortDirection="asc"
  onClick={() => handleSort('name')}
>
  Name
</TableHead>
```

### Do's and Don'ts

✅ **Do:**
- Use semantic table markup
- Provide table headers for all columns
- Make tables horizontally scrollable on mobile
- Use consistent data formatting

❌ **Don't:**
- Use tables for layout
- Make column widths too narrow
- Forget responsive considerations

### Accessibility

- Proper table semantics
- Header associations
- Keyboard navigation
- Screen reader support

---

## Tooltip

Contextual popup information built on Radix UI.

### Sub-components

- `TooltipProvider` - Context provider
- `Tooltip` - Root component
- `TooltipTrigger` - Trigger element
- `TooltipContent` - Tooltip content

### Usage

```tsx
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui'
import { Button } from '@/components/ui'

// Basic tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Helpful tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Custom positioning
<TooltipContent side="right" sideOffset={10}>
  Tooltip on the right
</TooltipContent>
```

### Do's and Don'ts

✅ **Do:**
- Keep tooltip text concise
- Use tooltips for additional context
- Ensure tooltips don't cover important content
- Make tooltips keyboard accessible

❌ **Don't:**
- Use tooltips for critical information
- Make tooltip text too long
- Use tooltips on mobile (poor UX)

---

## Skeleton

Loading state placeholder component with various shapes and sizes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circle' \| 'card' \| 'table-row'` | `'text'` | Shape variant |
| `count` | `number` | `1` | Number of skeleton elements to render |
| `className` | `string` | `undefined` | Additional CSS classes |

### Usage

```tsx
import { Skeleton } from '@/components/ui'

// Basic text skeleton
<Skeleton />

// Different variants
<Skeleton variant="text" />
<Skeleton variant="circle" />
<Skeleton variant="card" />
<Skeleton variant="table-row" />

// Multiple skeletons
<Skeleton count={3} />

// Custom styling
<Skeleton className="h-8 w-32" variant="text" />
```

### Do's and Don'ts

✅ **Do:**
- Use during data loading states
- Match skeleton dimensions to actual content
- Use count for multiple similar items

❌ **Don't:**
- Leave skeletons visible too long
- Use for static placeholder content

---

## StatCard

Statistical information display component with trend indicators.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Visual style variant |
| `trend` | `'up' \| 'down' \| 'neutral'` | `'neutral'` | Trend direction |
| `icon` | `string` | `undefined` | Icon to display |
| `label` | `string` | **required** | Descriptive label |
| `value` | `string \| number` | **required** | Main value to display |
| `change` | `string` | `undefined` | Change indicator text |
| `changeType` | `'increase' \| 'decrease' \| 'neutral'` | `'neutral'` | Type of change |

### Usage

```tsx
import { StatCard } from '@/components/ui'

// Basic stat card
<StatCard 
  label="Total Users" 
  value="1,234" 
/>

// With change indicator
<StatCard 
  label="Revenue" 
  value="$12,345" 
  change="+12.5%" 
  changeType="increase" 
/>

// With icon and variant
<StatCard 
  variant="success"
  icon="📈" 
  label="Growth Rate" 
  value="23%" 
  change="+5.2%" 
  changeType="increase" 
/>
```

### Do's and Don'ts

✅ **Do:**
- Use meaningful labels and units
- Show trends with appropriate colors
- Keep values concise

❌ **Don't:**
- Show too many decimal places
- Use unclear change indicators

---

## PageHeader

Page-level header component with title, description, and actions.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | **required** | Main page title |
| `description` | `string` | `undefined` | Optional description |
| `icon` | `string` | `undefined` | Optional icon |
| `actions` | `React.ReactNode` | `undefined` | Action buttons/components |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |

### Usage

```tsx
import { PageHeader } from '@/components/ui'
import { Button } from '@/components/ui'

// Basic page header
<PageHeader title="Settings" />

// With description and actions
<PageHeader 
  title="User Management"
  description="Manage user accounts and permissions"
  actions={
    <Button variant="primary">Add User</Button>
  }
/>

// With icon
<PageHeader 
  title="Dashboard"
  description="Overview of key metrics"
  icon="📊"
/>
```

---

## DropdownMenu

Context menu component built on Radix UI. Provides rich dropdown interactions.

### Sub-components

- `DropdownMenu` - Root component
- `DropdownMenuTrigger` - Trigger element
- `DropdownMenuContent` - Menu content container
- `DropdownMenuItem` - Individual menu item
- `DropdownMenuLabel` - Section label
- `DropdownMenuSeparator` - Visual separator
- Additional Radix primitives available

### Usage

```tsx
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui'

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="secondary">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Duplicate</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## Toast

Notification component built on Radix UI for temporary messages.

### Sub-components

- `ToastProvider` - Context provider
- `Toast` - Root toast component  
- `ToastTitle` - Toast title
- `ToastDescription` - Toast description
- `ToastAction` - Action button
- `Toaster` - Toast container/viewport

### Usage

```tsx
import { 
  ToastProvider, 
  Toast, 
  ToastTitle, 
  ToastDescription,
  Toaster
} from '@/components/ui'

// Setup provider at app root
<ToastProvider>
  <App />
  <Toaster />
</ToastProvider>

// Use in components (typically with a toast hook)
<Toast>
  <ToastTitle>Success!</ToastTitle>
  <ToastDescription>
    Your changes have been saved.
  </ToastDescription>
</Toast>
```

---

## StatusDot

Visual status indicator component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'active' \| 'idle' \| 'error' \| 'busy' \| 'offline'` | **required** | Status to display |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `aria-label` | `string` | Auto-generated | Accessible label |
| `className` | `string` | `undefined` | Additional CSS classes |

### Usage

```tsx
import { StatusDot } from '@/components/ui'

// Basic usage
<StatusDot status="active" />
<StatusDot status="error" />
<StatusDot status="offline" />

// Different sizes
<StatusDot status="active" size="sm" />
<StatusDot status="busy" size="lg" />

// Custom labels
<StatusDot 
  status="active" 
  aria-label="User is currently online"
/>
```

### Do's and Don'ts

✅ **Do:**
- Use consistent status meanings across app
- Provide aria-label for screen readers
- Consider animation performance

❌ **Don't:**
- Use too many animated status dots at once
- Use unclear status mappings

---

## Separator

Visual divider component built on Radix UI.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Separator direction |
| `decorative` | `boolean` | `true` | Whether separator is decorative |
| `className` | `string` | `undefined` | Additional CSS classes |

### Usage

```tsx
import { Separator } from '@/components/ui'

// Horizontal separator (default)
<div>
  <p>Section 1</p>
  <Separator />
  <p>Section 2</p>
</div>

// Vertical separator
<div className="flex items-center gap-4">
  <span>Item 1</span>
  <Separator orientation="vertical" className="h-4" />
  <span>Item 2</span>
</div>
```

---

## Form Components

For form handling, combine components with your preferred form library:

```tsx
// Example with React Hook Form
import { useForm } from 'react-hook-form'
import { Button, Input, Select, Textarea } from '@/components/ui'

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input 
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
        placeholder="Full name"
      />
      
      <Textarea 
        {...register('message')}
        placeholder="Your message"
      />
      
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

## TypeScript Integration

All components export their prop types for TypeScript integration:

```tsx
import type { ButtonProps, InputProps, CardProps } from '@/components/ui'

// Use in custom components
interface CustomButtonProps extends ButtonProps {
  customProp?: string
}

const CustomButton: React.FC<CustomButtonProps> = (props) => {
  // Implementation
}
```

---

## Migration Guide

### From Previous Components

If migrating from older component versions:

1. **Import Changes**: Update imports to use barrel exports
2. **Prop Changes**: Review prop names and types
3. **Styling**: Replace custom CSS with design tokens
4. **Accessibility**: Ensure new ARIA attributes are supported

### Breaking Changes

- Size prop values may have changed (check individual components)
- Some variant names have been standardized
- CSS class names follow new naming conventions

---

## Best Practices

### General Guidelines

1. **Import from Barrel**: Use `@/components/ui` for all imports
2. **Use TypeScript**: Leverage full type safety
3. **Follow Variants**: Use predefined variants before custom styling
4. **Accessibility First**: Test with keyboard and screen readers
5. **Performance**: Lazy load heavy components when possible

### Styling

```tsx
// ✅ Good - Use design tokens
<Button className="w-full mt-4" />

// ✅ Good - Extend with CSS variables
<Card style={{ '--card-border-radius': '12px' }} />

// ❌ Avoid - Hard-coded values
<Button style={{ backgroundColor: '#ff0000' }} />
```

### Composition

```tsx
// ✅ Good - Compose related components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Avoid - Breaking semantic structure
<div className="card-like">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

---

For questions or contributions, see the project documentation or open an issue.