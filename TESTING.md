# Automated Testing Guide

This document describes the automated test suite for Kuku Smart and how to run tests.

## Test Structure

### Unit Tests (Vitest)

**Location:** `src/__tests__/`

#### `auth.test.ts`

Tests authentication utilities and functions:

- Normalization (username, admin ID, tenant code)
- Base64 encoding/decoding for salt storage
- Email validation
- Password recovery flow validation
- Input validation (minimum lengths)
- Authentication record structure

**Run:** `npm test`

**Coverage:**

- Utility functions for normalizing credentials
- Base64 salt handling for PBKDF2
- Email validation for password recovery
- Record structure validation

### End-to-End Tests (Playwright)

**Location:** `e2e/`

#### `auth.spec.ts`

Tests complete authentication workflows:

- Tenant account setup (new farm creation)
- Admin account setup (system administrator)
- Login with valid credentials
- Login failure with wrong password
- Password recovery via email verification
- Password visibility toggles (show/hide password)
- Input validation (minimum lengths, email format)
- Offline functionality and persistence

**Run:** `npm run test:e2e`

#### `features.spec.ts`

Tests core farm management features:

- **Farm Management:**
  - Dashboard displays metrics
  - Navigation between modules
  - Adding new batch/flock
- **Settings & Configuration:**
  - Access user account settings
  - Change password workflow
  - Farm profile settings
  - Logout functionality
- **Data Entry & Validation:**
  - Number field validation (reject non-numeric)
  - Date field formatting
  - Required field validation
- **UI Responsiveness:**
  - Mobile menu toggle
  - Tablet layout adaptation
  - Desktop layout responsiveness
- **Error Handling:**
  - Error messages on failed operations
  - Browser back button handling
  - Recovery from storage clear
  - Graceful offline behavior

## Running Tests

### Install Dependencies

```bash
npm install
```

### Unit Tests

Run unit tests once:

```bash
npm test
```

Watch mode (re-run on file changes):

```bash
npm test -- --watch
```

With coverage:

```bash
npm test -- --coverage
```

### End-to-End Tests

First, ensure the dev server runs (or tests will start it):

```bash
npm run dev
```

In a separate terminal, run E2E tests:

```bash
npm run test:e2e
```

UI mode (interactive test runner):

```bash
npx playwright test --ui
```

Debug mode:

```bash
npx playwright test --debug
```

Specific test file:

```bash
npx playwright test e2e/auth.spec.ts
```

Specific test:

```bash
npx playwright test -g "Tenant setup"
```

### All Tests

```bash
npm test && npm run test:e2e
```

## Test Execution

### Pre-requisites

- Node.js 22+
- npm packages installed: `npm install`
- Application builds successfully: `npm run build`

### Environment

- **Unit Tests:** Run in jsdom (simulated DOM)
- **E2E Tests:** Run in real browsers (Chromium, Firefox, WebKit)
- **Base URL:** `http://127.0.0.1:5173` (dev server)
- **Database:** IndexedDB (in-memory for testing)
- **Storage:** localStorage (cleared between tests)

### Test Reports

After E2E tests, view HTML report:

```bash
npx playwright show-report
```

## Test Coverage

### Authentication (High Priority)

- ✅ Tenant account creation with email
- ✅ Admin account creation with email
- ✅ Login with valid credentials
- ✅ Login failure with wrong password
- ✅ Password recovery via email
- ✅ Password visibility toggles
- ✅ Input validation (lengths, format)

### Farm Management (High Priority)

- ✅ Dashboard displays metrics
- ✅ Module navigation
- ✅ Batch/Flock creation
- ✅ Data entry and validation
- ✅ Settings access and changes

### Features (Medium Priority)

- ✅ Password change workflow
- ✅ Farm profile editing
- ✅ Logout functionality
- ✅ UI responsiveness (mobile, tablet, desktop)

### Data Integrity (Medium Priority)

- ✅ Offline functionality
- ✅ Session persistence
- ✅ Storage recovery
- ✅ Error handling

### Future Test Scenarios

- Remote sync validation
- Multi-tenant data isolation
- Module activation workflows
- SMS alert settings
- Paid module access control
- Real-time data updates
- Large dataset performance

## Debugging Tests

### View Test Execution

```bash
npx playwright test --debug
```

### Capture Screenshots

Add to test:

```typescript
await page.screenshot({ path: "screenshot.png" });
```

### Inspect Element

```bash
npx playwright test --ui
```

### Console Logs

```typescript
console.log(await page.textContent("body"));
```

### Page Error Logs

```typescript
page.on("console", (msg) => console.log(msg));
page.on("pageerror", (err) => console.log(err));
```

## Common Issues

### Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if dev server is running: `npm run dev`
- Ensure app loads at `http://127.0.0.1:5173`

### LocalStorage Not Persisting

- Check if tests run in isolated contexts
- Verify setup.ts mocks localStorage
- Clear browser cache between test suites

### Intermittent Failures

- Add explicit waits: `await page.waitForTimeout(500)`
- Use `toBeVisible({ timeout: 10000 })`
- Check async operations complete before assertions

### E2E Tests Don't Find Elements

- Run tests in UI mode to inspect DOM: `npx playwright test --ui`
- Verify selectors match actual HTML
- Check if elements load asynchronously

## CI/CD Integration

For GitHub Actions or other CI systems:

```yaml
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    CI: true
```

Set `retries: 2` in `playwright.config.ts` for CI environments.

## Best Practices

1. **Isolation:** Each test should be independent and not rely on previous test state
2. **Cleanup:** Use `beforeEach` to reset state (localStorage cleared)
3. **Waits:** Use explicit waits (`toBeVisible`) rather than arbitrary delays
4. **Selectors:** Prefer accessible selectors (text, labels, buttons)
5. **Data:** Use realistic test data (farm names, tenant codes, emails)
6. **Performance:** Run parallel tests when possible (Playwright default)
7. **Maintenance:** Update tests when UI changes
8. **Documentation:** Comment complex test scenarios

## Continuous Improvement

Track these metrics:

- Test pass rate (target: 100%)
- Test execution time (target: < 5 min for all)
- Code coverage (target: > 80%)
- New features covered by tests
- Bug escape rate (tests should catch regressions)

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)
- [PBKDF2 Security Best Practices](https://owasp.org/www-community/attacks/Dictionary_attack)
