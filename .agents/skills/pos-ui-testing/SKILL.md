---
name: pos-ui-testing
description: Directs end-to-end and component testing for Biryani POS using Vitest, React Testing Library, and Playwright, covering touchscreen gestures, financial math, split payments, and offline persistence.
---

# POS UI Testing Skill for Biryani POS

## Overview

This skill provides automated testing patterns and quality gates for Biryani POS across unit, component, integration, and E2E layers.

## Core Directives

### 1. Unit & Domain Testing (Vitest)

- Test all billing logic in isolation without DOM dependencies:
  - Cart addition, item removal, and quantity steppers.
  - Multi-tier discounts (percentage vs. flat amount).
  - Exact GST split calculations across diverse tax brackets (0%, 5%, 12%, 18%).
  - Half-up paise rounding boundary cases (e.g., .50 paise).
  - Split-payment total matching.

### 2. Component Testing (React Testing Library)

- Test UI components with user-centric queries (`getByRole`, `getByLabelText`, `getByText`).
- Verify keyboard and touch interactions using `@testing-library/user-event`.
- Assert that disabled states, loading spinners, and error alerts appear appropriately.
- Ensure all keypad clicks trigger corresponding cart updates.

### 3. End-to-End Touchscreen Testing (Playwright)

- Execute tests under simulated touch screen viewports:
  ```ts
  use: {
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  }
  ```
- Automate critical cashier user flows:
  - Select Category -> Tap Biryani Item -> Adjust Quantity -> Open Checkout Modal -> Select Split Payment (Cash + UPI) -> Confirm Checkout -> Verify Invoice Printed / Saved to Dexie.
- Verify IndexedDB persistence across browser page reloads:
  - Complete an order -> reload page -> verify order count and revenue report reflect the completed transaction.
- Check browser console logs during test runs to ensure zero unhandled rejections or error logs.

### 4. Continuous Verification Routine

Before submitting code or declaring a milestone complete, run:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run test:e2e
pnpm run build
```

Never skip failing tests or comment out assertions.
