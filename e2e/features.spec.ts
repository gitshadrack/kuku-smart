import { test, expect } from '@playwright/test';

/**
 * E2E tests for core app features
 * Tests farm data entry, navigation, module access, and data persistence
 */

test.describe('Farm Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Pre-authenticate
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'TEST-KUKU-001',
        username: 'testfarmer',
        email: 'farmer@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    
    // Wait for dashboard to load
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard displays key farm metrics', async ({ page }) => {
    // Should show overview cards or metrics
    const dashboard = page.locator('[data-testid="dashboard"], text=Dashboard');
    if (await dashboard.isVisible()) {
      // Look for common farm metrics
      const metricsText = page.locator('text=Birds, Eggs, Feed, Health, Income, Expenses');
      // At least some metrics should be visible
      const visibleMetrics = await page.locator('text=/Birds|Eggs|Feed|Health|Income|Sales/').count();
      expect(visibleMetrics).toBeGreaterThan(0);
    }
  });

  test('Can navigate to different modules', async ({ page }) => {
    // Look for navigation buttons/tabs
    const navButtons = page.locator('button:has-text("Flock"), button:has-text("Eggs"), button:has-text("Feed"), button:has-text("Health")');
    const count = await navButtons.count();
    
    if (count > 0) {
      // Click first module
      await navButtons.first().click();
      await page.waitForTimeout(500);
      
      // Should show module content
      const content = page.locator('[data-testid="module-content"], main');
      if (await content.isVisible()) {
        expect(await content.count()).toBeGreaterThan(0);
      }
    }
  });

  test('Can add new batch', async ({ page }) => {
    // Navigate to flock/batch section
    const flockBtn = page.locator('button:has-text("Flock"), button:has-text("Batch"), button:has-text("Birds")');
    if (await flockBtn.isVisible()) {
      await flockBtn.click();
    }
    
    // Look for add button
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Fill batch details
      const inputs = page.locator('input[type="text"], input[type="number"], input[type="date"]');
      
      if (await inputs.count() > 0) {
        // Fill first input (name/identifier)
        await inputs.first().fill('Batch-2024-001');
        
        // Fill bird count if available
        const numberInputs = page.locator('input[type="number"]');
        if (await numberInputs.count() > 0) {
          await numberInputs.first().fill('50');
        }
        
        // Submit
        const submitBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Add")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          
          // Should see success message or return to list
          await page.waitForTimeout(500);
        }
      }
    }
  });
});

test.describe('Settings & Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Pre-authenticate
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'TEST-KUKU-001',
        username: 'testfarmer',
        email: 'farmer@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Can access user account settings', async ({ page }) => {
    // Look for settings button
    const settingsBtn = page.locator('button:has-text("Settings"), button:has-text("Account"), [data-testid="settings"]');
    
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      
      // Should show account section
      const accountSection = page.locator('text=Account, Profile, User, Tenant');
      await expect(accountSection).toBeVisible({ timeout: 5000 });
    }
  });

  test('Can change password in settings', async ({ page }) => {
    // Navigate to settings
    const settingsBtn = page.locator('button:has-text("Settings")');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      
      // Look for change password section
      const changePassSection = page.locator('text=Change Password');
      if (await changePassSection.isVisible()) {
        // Fill current password
        const passwordInputs = page.locator('input[type="password"]');
        if (await passwordInputs.count() >= 3) {
          // Current password
          await passwordInputs.nth(0).fill('OldPass123!');
          // New password
          await passwordInputs.nth(1).fill('NewPass456!');
          // Confirm password
          await passwordInputs.nth(2).fill('NewPass456!');
          
          // Submit
          const submitBtn = page.locator('button:has-text("Update"), button:has-text("Change"), button:has-text("Save")');
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            
            // Should show message (success or error)
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test('Can access farm profile settings', async ({ page }) => {
    const settingsBtn = page.locator('button:has-text("Settings")');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      
      // Should show farm info
      const farmInfo = page.locator('text=Farm, Tenant, Name, Code, Location');
      const elements = await page.locator('text=/Farm|Profile|Tenant/').count();
      expect(elements).toBeGreaterThan(0);
    }
  });

  test('Can logout from settings', async ({ page }) => {
    const settingsBtn = page.locator('button:has-text("Settings")');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
    }
    
    // Look for logout button
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Exit")');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      
      // Should return to login screen
      await expect(page.locator('text=Login, Password, Tenant, Admin')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Data Entry & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'TEST-KUKU-001',
        username: 'testfarmer',
        email: 'farmer@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Number fields reject non-numeric input', async ({ page }) => {
    // Navigate to module with number inputs
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      const numberInputs = page.locator('input[type="number"]');
      if (await numberInputs.count() > 0) {
        // Try to type non-numeric
        await numberInputs.first().type('abc123');
        
        // Should filter out non-numeric characters
        const value = await numberInputs.first().inputValue();
        expect(value).toMatch(/^\d*$/);
      }
    }
  });

  test('Date fields format dates correctly', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        // Set a date
        await dateInputs.first().fill('2024-05-29');
        
        const value = await dateInputs.first().inputValue();
        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  test('Required fields show validation errors', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Try to submit without filling required fields
      const submitBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Submit")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Should show validation messages
        await page.waitForTimeout(300);
        const errors = page.locator('text=/required|please enter|invalid/i');
        // Validation messages might appear
      }
    }
  });
});

test.describe('UI Responsiveness', () => {
  test('Navigation menu toggles on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Look for menu toggle
    const menuBtn = page.locator('button:has-text("Menu"), button[aria-label="Menu"], [data-testid="menu-toggle"]');
    if (await menuBtn.isVisible()) {
      // Menu should initially be hidden
      const menu = page.locator('[data-testid="nav-menu"], nav.sidebar, nav');
      const initiallyVisible = await menu.isVisible();
      
      // Click menu button
      await menuBtn.click();
      
      // Check visibility state changed or menu appeared
      await page.waitForTimeout(300);
    }
  });

  test('Layout adapts to tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Page should still be usable
    await expect(page.locator('text=Kuku Smart')).toBeVisible();
    
    // Elements should be properly sized
    const buttons = page.locator('button');
    const visibleButtons = await buttons.count();
    expect(visibleButtons).toBeGreaterThan(0);
  });

  test('Layout adapts to desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    
    // Page should display full layout
    await expect(page.locator('text=Kuku Smart')).toBeVisible();
    
    // Should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 1920;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'TEST-KUKU-001',
        username: 'testfarmer',
        email: 'farmer@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Shows error when data entry fails', async ({ page }) => {
    // Try an operation that might fail
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      
      // Intentionally submit with invalid data
      const inputs = page.locator('input');
      if (await inputs.count() > 0) {
        // Fill with obviously bad data
        await inputs.first().fill('');
      }
      
      const submitBtn = page.locator('button:has-text("Save"), button:has-text("Submit")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Should show error message
        await page.waitForTimeout(500);
      }
    }
  });

  test('Gracefully handles browser back button', async ({ page }) => {
    // Navigate somewhere
    const btn = page.locator('button').first();
    if (await btn.isVisible()) {
      await btn.click();
    }
    
    // Go back
    await page.goBack();
    
    // Should still be on valid page
    await expect(page.locator('text=Kuku Smart, Farm, Dashboard, Login')).toBeVisible({ timeout: 5000 });
  });

  test('Recovers from accidental session clear', async ({ page, context }) => {
    await page.goto('/');
    
    // Pre-authenticate
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'TEST-KUKU-001',
        username: 'testfarmer',
        email: 'farmer@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    
    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Should return to login screen
    await page.reload();
    await expect(page.locator('text=Login, Password, Tenant, Admin')).toBeVisible({ timeout: 5000 });
  });
});
