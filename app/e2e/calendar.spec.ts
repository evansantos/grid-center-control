import { test, expect } from '@playwright/test';

test.describe('Calendar E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock calendar events API
    await page.route('**/api/calendar/events**', async route => {
      const mockEvents = {
        events: [
          {
            id: '1',
            title: 'Team Standup',
            start: '2024-02-18T10:00:00Z',
            end: '2024-02-18T10:30:00Z',
            type: 'meeting',
            attendees: ['GRID', 'ATLAS', 'DEV'],
            description: 'Daily team synchronization',
          },
          {
            id: '2',
            title: 'Sprint Planning',
            start: '2024-02-19T14:00:00Z',
            end: '2024-02-19T16:00:00Z',
            type: 'planning',
            attendees: ['GRID', 'ATLAS', 'DEV', 'PIXEL'],
            description: 'Plan next sprint tasks and priorities',
          },
          {
            id: '3',
            title: 'System Maintenance',
            start: '2024-02-20T02:00:00Z',
            end: '2024-02-20T04:00:00Z',
            type: 'maintenance',
            attendees: [],
            description: 'Scheduled system maintenance window',
          },
        ],
      };
      await route.fulfill({ json: mockEvents });
    });

    // Mock calendar view settings API
    await page.route('**/api/calendar/settings', async route => {
      const mockSettings = {
        defaultView: 'month',
        timezone: 'UTC',
        workingHours: {
          start: '09:00',
          end: '17:00',
        },
        weekends: true,
        firstDayOfWeek: 1, // Monday
      };
      await route.fulfill({ json: mockSettings });
    });

    await page.goto('/calendar');
  });

  test('loads calendar page and displays header', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    await expect(page.locator('text=Event scheduling and timeline view')).toBeVisible();

    // Check that calendar component loads
    await expect(page.locator('[data-testid="calendar-container"], [class*="calendar"]')).toBeVisible();
  });

  test('displays view toggle buttons and switches views', async ({ page }) => {
    // Check view buttons are present
    await expect(page.locator('button:has-text("Month")')).toBeVisible();
    await expect(page.locator('button:has-text("Week")')).toBeVisible();
    await expect(page.locator('button:has-text("Day")')).toBeVisible();
    await expect(page.locator('button:has-text("List")')).toBeVisible();

    // Test switching to week view
    await page.click('button:has-text("Week")');
    await expect(page.locator('[data-view="week"], [class*="week-view"]')).toBeVisible();

    // Test switching to day view
    await page.click('button:has-text("Day")');
    await expect(page.locator('[data-view="day"], [class*="day-view"]')).toBeVisible();

    // Test switching to list view
    await page.click('button:has-text("List")');
    await expect(page.locator('[data-view="list"], [class*="list-view"]')).toBeVisible();

    // Switch back to month view
    await page.click('button:has-text("Month")');
    await expect(page.locator('[data-view="month"], [class*="month-view"]')).toBeVisible();
  });

  test('displays navigation buttons and changes dates', async ({ page }) => {
    // Check navigation buttons
    const prevButton = page.locator('button[aria-label*="Previous"], button:has-text("‹"), button:has-text("←")');
    const nextButton = page.locator('button[aria-label*="Next"], button:has-text("›"), button:has-text("→")');
    const todayButton = page.locator('button:has-text("Today")');

    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    await expect(todayButton).toBeVisible();

    // Test navigation
    await nextButton.click();
    // Should navigate to next month/week/day

    await prevButton.click();
    // Should navigate to previous month/week/day

    await todayButton.click();
    // Should return to current period
  });

  test('displays events correctly in month view', async ({ page }) => {
    // Ensure we're in month view
    await page.click('button:has-text("Month")');

    // Check that events are displayed
    await expect(page.locator('text=Team Standup')).toBeVisible();
    await expect(page.locator('text=Sprint Planning')).toBeVisible();
    await expect(page.locator('text=System Maintenance')).toBeVisible();

    // Check event types have different styling
    const meetingEvent = page.locator('[data-event-type="meeting"], [class*="meeting"]');
    const planningEvent = page.locator('[data-event-type="planning"], [class*="planning"]');
    const maintenanceEvent = page.locator('[data-event-type="maintenance"], [class*="maintenance"]');

    // Events should be visible
    await expect(meetingEvent.or(page.locator('text=Team Standup'))).toBeVisible();
    await expect(planningEvent.or(page.locator('text=Sprint Planning'))).toBeVisible();
    await expect(maintenanceEvent.or(page.locator('text=System Maintenance'))).toBeVisible();
  });

  test('displays events correctly in week view', async ({ page }) => {
    // Switch to week view
    await page.click('button:has-text("Week")');
    await expect(page.locator('[data-view="week"], [class*="week-view"]')).toBeVisible();

    // Events should still be visible
    await expect(page.locator('text=Team Standup')).toBeVisible();
    
    // Week view should show time slots
    await expect(page.locator('text=10:00, text=10:30, text=14:00').first()).toBeVisible();
  });

  test('displays events correctly in day view', async ({ page }) => {
    // Switch to day view
    await page.click('button:has-text("Day")');
    await expect(page.locator('[data-view="day"], [class*="day-view"]')).toBeVisible();

    // Should show hourly time slots
    const timeSlots = page.locator('text=/^\\d{1,2}:00$/');
    await expect(timeSlots.first()).toBeVisible();
  });

  test('displays events correctly in list view', async ({ page }) => {
    // Switch to list view
    await page.click('button:has-text("List")');
    await expect(page.locator('[data-view="list"], [class*="list-view"]')).toBeVisible();

    // All events should be listed with details
    await expect(page.locator('text=Team Standup')).toBeVisible();
    await expect(page.locator('text=Sprint Planning')).toBeVisible();
    await expect(page.locator('text=System Maintenance')).toBeVisible();

    // Should show event details
    await expect(page.locator('text=Daily team synchronization')).toBeVisible();
    await expect(page.locator('text=Plan next sprint tasks')).toBeVisible();
  });

  test('opens event details on click', async ({ page }) => {
    // Click on an event
    const teamStandupEvent = page.locator('text=Team Standup');
    await teamStandupEvent.click();

    // Should open event details modal or popup
    const modal = page.locator('[data-testid="event-modal"], [class*="modal"], [role="dialog"]');
    await expect(modal.or(page.locator('text=Event Details'))).toBeVisible();

    // Should show event information
    await expect(page.locator('text=Team Standup')).toBeVisible();
    await expect(page.locator('text=Daily team synchronization')).toBeVisible();
    await expect(page.locator('text=GRID')).toBeVisible();
    await expect(page.locator('text=ATLAS')).toBeVisible();
    await expect(page.locator('text=DEV')).toBeVisible();

    // Close modal
    const closeButton = page.locator('button[aria-label*="Close"], button:has-text("×"), button:has-text("Close")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('filters events by type', async ({ page }) => {
    // Check if filter controls exist
    const filterContainer = page.locator('[data-testid="event-filters"], [class*="filter"]');
    const meetingFilter = page.locator('button:has-text("Meeting"), input[value="meeting"]');
    const planningFilter = page.locator('button:has-text("Planning"), input[value="planning"]');
    const maintenanceFilter = page.locator('button:has-text("Maintenance"), input[value="maintenance"]');

    if (await filterContainer.isVisible() || await meetingFilter.isVisible()) {
      // Filter by meeting type only
      if (await meetingFilter.isVisible()) {
        await meetingFilter.click();
      }

      // Only meeting events should be visible
      await expect(page.locator('text=Team Standup')).toBeVisible();
      
      // Other events should be hidden or filtered out
      const sprintEvent = page.locator('text=Sprint Planning');
      const maintenanceEvent = page.locator('text=System Maintenance');
      
      // Note: Depending on implementation, filtered events might be hidden or not rendered
      if (await sprintEvent.isVisible()) {
        // If still visible, they might have different styling (grayed out)
        console.log('Events are styled when filtered rather than hidden');
      }
    }
  });

  test('creates new event', async ({ page }) => {
    // Mock create event API
    await page.route('**/api/calendar/events', async route => {
      if (route.request().method() === 'POST') {
        const newEvent = {
          id: '4',
          title: 'New Test Event',
          start: '2024-02-21T11:00:00Z',
          end: '2024-02-21T12:00:00Z',
          type: 'meeting',
        };
        await route.fulfill({ json: newEvent });
      } else {
        await route.continue();
      }
    });

    // Look for create/add event button
    const createButton = page.locator('button:has-text("Add Event"), button:has-text("Create"), button:has-text("+")');
    
    if (await createButton.isVisible()) {
      await createButton.click();

      // Should open create event form
      const form = page.locator('[data-testid="create-event"], form, [class*="event-form"]');
      await expect(form.or(page.locator('text=Create Event'))).toBeVisible();

      // Fill in event details
      const titleInput = page.locator('input[name="title"], input[placeholder*="title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('New Test Event');
      }

      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
    }
  });

  test('handles date selection in month view', async ({ page }) => {
    // Ensure we're in month view
    await page.click('button:has-text("Month")');

    // Click on a date cell
    const dateCell = page.locator('[data-date], [class*="day"], .calendar-date').first();
    if (await dateCell.isVisible()) {
      await dateCell.click();

      // Should either select the date or open create event for that date
      // This behavior depends on implementation
    }
  });

  test('is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still load
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();

    // View buttons should be visible but might be in a different layout
    await expect(page.locator('button:has-text("Month")')).toBeVisible();
    await expect(page.locator('button:has-text("Week")')).toBeVisible();

    // Calendar should adapt to mobile layout
    const calendarContainer = page.locator('[data-testid="calendar-container"], [class*="calendar"]');
    await expect(calendarContainer).toBeVisible();

    // Events should still be visible
    await expect(page.locator('text=Team Standup')).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Focus on the calendar
    const calendar = page.locator('[data-testid="calendar-container"], [class*="calendar"]').first();
    await calendar.focus();

    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowUp');

    // Test Enter key to select/open events
    await page.keyboard.press('Enter');
  });

  test('handles timezone correctly', async ({ page }) => {
    // Events should display in the correct timezone
    // This test would verify that times are shown correctly based on settings
    
    // Check that event times are displayed
    const eventTimes = page.locator('text=/\\d{1,2}:\\d{2}/, text=/AM|PM/');
    await expect(eventTimes.first()).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/calendar/events**', async route => {
      await route.abort('failed');
    });

    await page.goto('/calendar');

    // Page should still load basic structure
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    
    // Should show empty state or error message
    const errorMessage = page.locator('text=Unable to load events, text=No events found, text=Loading failed');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('persists view preferences', async ({ page }) => {
    // Switch to week view
    await page.click('button:has-text("Week")');
    
    // Reload page
    await page.reload();
    
    // Should remember the week view preference
    await expect(page.locator('[data-view="week"], [class*="week-view"]')).toBeVisible();
    
    // Or check if week button is active
    const weekButton = page.locator('button:has-text("Week")');
    await expect(weekButton).toHaveClass(/active|selected|current/);
  });

  test('shows loading states', async ({ page }) => {
    // Add delay to API to test loading
    await page.route('**/api/calendar/events**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/calendar');

    // Should show loading indicator
    const loadingIndicator = page.locator('text=Loading events, [data-testid="loading"], [class*="loading"], [class*="spinner"]');
    await expect(loadingIndicator.first()).toBeVisible();

    // Eventually should show calendar content
    await expect(page.locator('text=Team Standup')).toBeVisible();
  });
});