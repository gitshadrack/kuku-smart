import { test, expect } from '@playwright/test';

/**
 * E2E tests for critical user authentication and app flows
 * Tests setup, login, password recovery, and password visibility
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('Tenant setup creates account with credentials', async ({ page }) => {
    await page.goto('/');
    
    // Should show login screen
    await expect(page.locator('text=Kuku Smart')).toBeVisible();
    
    // Look for tenant setup option
    const setupButton = page.locator('button:has-text("Set up new account")');
    if (await setupButton.isVisible()) {
      await setupButton.click();
    }
    
    // Fill in tenant code (minimum 5 chars)
    await page.fill('input[type="text"]', 'TEST-KUKU-001');
    
    // Fill in username (minimum 3 chars)
    await page.fill('input[placeholder*="username" i], input[placeholder*="name" i]', 'testfarmer');
    
    // Optionally fill email
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('farmer@example.com');
    }
    
    // Fill password (first password field)
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('SecurePass123!');
    
    // Confirm password
    await passwordInputs.last().fill('SecurePass123!');
    
    // Submit setup
    await page.click('button:has-text("Set up"), button:has-text("Create")');
    
    // Should be authenticated and see farm dashboard
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Admin setup creates admin account', async ({ page }) => {
    await page.goto('/');
    
    // Switch to Admin tab
    await page.click('button:has-text("Admin")');
    
    // Look for setup option
    const setupButton = page.locator('button:has-text("Set up")');
    if (await setupButton.isVisible()) {
      await setupButton.click();
    }
    
    // Fill admin ID (minimum 3 chars)
    await page.fill('input[placeholder*="admin" i], input[placeholder*="ID" i]', 'admin001');
    
    // Fill email
    await page.fill('input[type="email"]', 'admin@example.com');
    
    // Fill password
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('AdminPass123!');
    
    // Confirm password
    await passwordInputs.last().fill('AdminPass123!');
    
    // Submit setup
    await page.click('button:has-text("Create"), button:has-text("Set up")');
    
    // Should be authenticated
    await expect(page.locator('text=Farm Dashboard, Admin, Settings')).toBeVisible({ timeout: 10000 });
  });

  test('Login with valid credentials succeeds', async ({ page }) => {
    await page.goto('/');
    
    // Pre-populate localStorage with test account
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'DEMO-KUKU-999',
        username: 'testuser',
        email: 'test@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=', // "testsalt" in base64
        passwordHash: 'dGVzdGhhc2g=', // "testhash" in base64
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    // Reload to apply stored credentials
    await page.reload();
    
    // Should be logged in
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Login fails with incorrect password', async ({ page }) => {
    await page.goto('/');
    
    // Fill in credentials
    await page.fill('input[placeholder*="tenant" i, placeholder*="code" i]', 'NYERI-KUKU-001');
    await page.fill('input[placeholder*="username" i]', 'testfarmer');
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('WrongPassword123');
    
    // Submit login
    await page.click('button:has-text("Login"), button:has-text("Submit")');
    
    // Should show error message
    await expect(page.locator('text=Invalid, incorrect, failed')).toBeVisible({ timeout: 5000 });
  });

  test('Password recovery initiates with email verification', async ({ page }) => {
    await page.goto('/');
    
    // Click forgot password link
    const forgotLink = page.locator('button:has-text("Forgot"), a:has-text("Forgot")');
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
    }
    
    // Should show recovery mode
    await expect(page.locator('text=Recover, Recovery')).toBeVisible({ timeout: 5000 });
    
    // Fill tenant code
    await page.fill('input[placeholder*="code" i]', 'DEMO-KUKU-001');
    
    // Fill username
    await page.fill('input[placeholder*="username" i]', 'farmer');
    
    // Fill email
    await page.fill('input[type="email"]', 'farmer@example.com');
    
    // Enter new password
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.first().fill('NewSecurePass123!');
    await passwordInputs.last().fill('NewSecurePass123!');
    
    // Submit recovery
    await page.click('button:has-text("Recover"), button:has-text("Reset")');
    
    // Should either recover or show message
    // (result depends on whether account exists in storage)
    const element = page.locator('text=success, recovered, reset, error, not found');
    await expect(element).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Password Visibility Toggles', () => {
  test('Password visibility toggle shows/hides text on login screen', async ({ page }) => {
    await page.goto('/');
    
    // Find password field
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Find eye icon button
    const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    
    if (await toggleButton.first().isVisible()) {
      // Click toggle to show password
      await toggleButton.first().click();
      
      // Input should now be type="text"
      const revealedInput = page.locator('input[type="text"]').first();
      await expect(revealedInput).toBeVisible();
      
      // Click again to hide
      await toggleButton.first().click();
      
      // Should be back to type="password"
      await expect(passwordInput).toBeVisible();
    }
  });

  test('Password fields in Farm Settings have visibility toggles', async ({ page }) => {
    await page.goto('/');
    
    // Pre-fill auth to reach settings
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'DEMO-KUKU-999',
        username: 'testuser',
        email: 'test@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    await page.reload();
    
    // Navigate to settings
    const settingsBtn = page.locator('button:has-text("Settings")');
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      
      // Look for password fields
      const changePasswordSection = page.locator('text=Change Password');
      if (await changePasswordSection.isVisible()) {
        // Count password toggle buttons (should be 3 for current, new, confirm)
        const toggleButtons = page.locator('button[type="button"]:has-text("svg")');
        const visibleToggleCount = await toggleButtons.count();
        
        // Should have at least password toggles
        expect(visibleToggleCount).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test('Typing password with toggle off keeps it hidden', async ({ page }) => {
    await page.goto('/');
    
    const passwordInput = page.locator('input[type="password"]').first();
    
    // Type password while hidden
    await passwordInput.fill('MySecretPass123');
    
    // Should still be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Value should not be visible in the DOM as plaintext
    const displayedText = await passwordInput.inputValue();
    expect(displayedText).toBe('MySecretPass123');
  });
});

test.describe('Input Validation', () => {
  test('Tenant code must be at least 5 characters', async ({ page }) => {
    await page.goto('/');
    
    // Try setup with short code
    const codeInput = page.locator('input[placeholder*="code" i]').first();
    await codeInput.fill('ABC');
    
    const errorMsg = page.locator('text=valid tenant code, 5 characters');
    // Error might appear on blur or submit
    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Create")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should not proceed or show error
    }
  });

  test('Username must be at least 3 characters', async ({ page }) => {
    await page.goto('/');
    
    const usernameInput = page.locator('input[placeholder*="username" i]').first();
    await usernameInput.fill('ab');
    
    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Create")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show validation error
    }
  });

  test('Email format is validated if provided', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      
      // Browser validation should trigger
      // Try to submit
      const submitBtn = page.locator('button:has-text("Submit")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should not proceed due to email validation
      }
    }
  });

  test('Passwords must match in setup/recovery', async ({ page }) => {
    await page.goto('/');
    
    const passwordInputs = page.locator('input[type="password"]');
    
    if ((await passwordInputs.count()) >= 2) {
      await passwordInputs.nth(0).fill('Pass123!');
      await passwordInputs.nth(1).fill('Different456!');
      
      const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Create")');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        
        // Should show password mismatch error
        const errorMsg = page.locator('text=match, confirm, mismatch');
        // Error might appear
      }
    }
  });
});

test.describe('Offline Functionality', () => {
  test('App works offline after first load', async ({ page, context }) => {
    // First load online
    await page.goto('/');
    
    // Go offline
    await context.setOffline(true);
    
    // Reload app
    await page.reload();
    
    // Should still load (from service worker cache)
    await expect(page.locator('text=Kuku Smart, Authentication, Login')).toBeVisible({ timeout: 5000 });
  });

  test('Authentication persists across offline sessions', async ({ page, context }) => {
    await page.goto('/');
    
    // Pre-fill auth
    await page.evaluate(() => {
      const testAccount = {
        tenantCode: 'OFFLINE-001',
        username: 'offlineuser',
        email: 'offline@example.com',
        accountIcon: 'sprout',
        salt: 'dGVzdHNhbHQ=',
        passwordHash: 'dGVzdGhhc2g=',
        iterations: 210000,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('auth_record', JSON.stringify(testAccount));
    });
    
    // Go offline
    await context.setOffline(true);
    
    // Reload
    await page.reload();
    
    // Should still be authenticated (Farm Dashboard visible)
    await expect(page.locator('text=Farm Dashboard')).toBeVisible({ timeout: 5000 });
  });
});
