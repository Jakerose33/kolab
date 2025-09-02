# Kolab E2E Test Suite

This comprehensive Playwright test suite ensures all critical flows on https://ko-lab.com.au work with zero error boundaries, no console/page errors, and all CTAs function properly on desktop & mobile.

## Test Structure

### Hardening Fixtures (`tests/fixtures/hardening.ts`)
All tests use hardened fixtures that automatically fail on:
- React ErrorBoundary content (strings like "something went wrong", "retry")
- Unhandled JavaScript errors
- Console errors
- Network request failures (excluding known analytics endpoints)

### Test Files

1. **`nav-smoke.spec.ts`** - Navigation smoke tests
   - Verifies all main routes load without errors
   - Checks Report Issue button visibility on all pages

2. **`events-linking.spec.ts`** - Event navigation and detail pages
   - Event cards link to detail pages correctly
   - Booking CTA is visible on event detail pages

3. **`booking-cta.spec.ts`** - Booking CTA behavior
   - Guest users: redirected to sign-in with `next` parameter
   - Authenticated users: navigate to booking flow

4. **`error-reporting.spec.ts`** - Error reporting system
   - Report Issue button functionality
   - Form submission works correctly
   - Auto-capture functionality (when applicable)

5. **`auth-flows.spec.ts`** - Authentication flows
   - Sign-in redirects to home page
   - Forgot password shows success state
   - Sign-up form accessibility
   - Sign-out functionality

6. **`a11y.spec.ts`** - Accessibility testing
   - Axe accessibility scans on all main routes
   - Keyboard navigation verification
   - Screen reader landmark presence

7. **`events-flow.spec.ts`** - Complete event flow testing (existing, now hardened)

## Environment Setup

### Required Environment Variables
```bash
E2E_EMAIL="your-test-email@example.com"
E2E_PASSWORD="your-test-password"
```

### Base URL Configuration
- **Production**: `https://ko-lab.com.au` (default)
- **Local development**: `http://localhost:5173`

## Running Tests

### Production Environment
```bash
# Run all tests against production
E2E_EMAIL="jakerose800@gmail.com" \
E2E_PASSWORD="Easylife@33" \
npx playwright test

# Run specific test file
npx playwright test tests/nav-smoke.spec.ts

# Run with UI mode
npx playwright test --ui
```

### Local Development
```bash
# Run against local development server
BASE_URL="http://localhost:5173" \
E2E_EMAIL="jakerose800@gmail.com" \
E2E_PASSWORD="Easylife@33" \
npx playwright test

# Start dev server and run tests
npm run dev &
npx playwright test
```

### Test Reports
```bash
# Open HTML report
npx playwright show-report

# Generate trace for debugging
npx playwright test --trace on
```

## Browser Coverage

- **Desktop Chrome** - Primary desktop testing
- **Mobile Safari** - Mobile responsive testing

## Acceptance Criteria

✅ All specs pass on Desktop Chrome & Mobile Safari  
✅ HTML report & videos generated as artifacts  
✅ No ErrorBoundary text appears on happy paths  
✅ No console errors or request failures detected by hardening fixture  
✅ Booking CTA visible on event detail pages & behaves correctly for guest/authenticated users  
✅ Report Issue button accessible on all routes  
✅ Authentication flows work end-to-end  
✅ Accessibility standards met across all pages  

## Test Data

For rate-limited flows (forgot password), tests use plus-alias emails:
`jakerose800+<timestamp>@gmail.com`

## Debugging Failed Tests

When tests fail:
1. Check the HTML report for screenshots and videos
2. Review console logs in the failure output
3. Use `--trace on` flag to capture detailed execution traces
4. Verify test environment variables are set correctly
5. Check if the application is running (for local tests)

## CI/CD Integration

Tests are configured to:
- Run with retries on CI (2 retries)
- Generate GitHub Actions annotations
- Upload artifacts (HTML report, videos, traces)
- Fail builds on any test failures