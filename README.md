# Biryani POS — Windows Browser Demo

A high-performance, touch-first Point of Sale (POS) system tailored for restaurant operations. Built with React 19, strict TypeScript, Tailwind CSS v4, Zustand, and Dexie (IndexedDB), designed to run as a Windows-browser demo and architected for future transition to Android touchscreen POS hardware via Capacitor + SQLite + thermal printing SDKs.

---

## 1. Demo Credentials

The demo is equipped with pre-configured staff accounts and 1-click login buttons:

| Role            | Username  | Password / PIN | Permissions                                           |
| :-------------- | :-------- | :------------- | :---------------------------------------------------- |
| **Store Admin** | `admin`   | `1234`         | Full store management, tax settings, refunds, day close |
| **Cashier**     | `cashier` | `1111`         | Billing, order creation, receipt printing             |

---

## 2. Implemented Screens (Faithful to Approved Designs)

All 8 screens have been implemented matching the approved visual references, layout hierarchy, and color palettes:

1. **Login (`/login`)**:
   - BIRYANI POS branding & GSTIN display.
   - Username and PIN/password entry with show/hide password toggle.
   - Quick 1-click demo logins for Store Admin and Cashier.
   - Bilingual support toggle (`English` / `தமிழ்`).

2. **Dashboard (`/dashboard`)**:
   - Business Overview header with prominent red **Day Close Summary** action button.
   - Real-time metric cards: Today's Revenue (`₹12,450.00`, 48 transactions), This Week (`₹78,320.00`, 312 transactions), Orders Today (`48` orders, Avg bill: `₹259.38`).
   - Daily Revenue Trend chart with 7-day trend visualization.
   - Top-Selling Items list with progress bars, quantities sold, and revenue.
   - Recent Transactions table with order types, items, payment badges, and time.

3. **POS Terminal / Billing (`/pos`) — *Highest Priority***:
   - Category filtering: *All*, *Biryani*, *Starters*, *Rice*, *Combos*, *Drinks*, *Others*.
   - Food items grid with large 48x48px touch targets, photos, prices, and active cart badges.
   - Real-time cart ledger with item steppers (`−` / `+`), unit prices, line totals, and deletion.
   - Order types: Dine-in (with table selector), Takeaway, Parcel.
   - Deterministic paise financial math: Subtotal, 5% GST breakdown, Net total.
   - Adjustments: `% Discount` (capped to configured max) and `₹ Custom Amount`.
   - Split Payment engine: Allocations across GPay / UPI, Cash, and Card with live `Remaining: ₹0.00` verification.
   - Cash received and Change Due calculation.
   - Keyboard shortcuts: `F2` for New Bill, `F4` for Generate Bill.
   - Thermal receipt modal (80mm width format) with browser print and JSON download.

4. **Products Management (`/products`)**:
   - Search food items by English or Tamil name.
   - Category filter dropdown.
   - Product catalog table with photo, name, price, GST badge, and interactive active/inactive toggle switch.
   - Add & Edit Product sidebar form with validation, price in paise, GST selection (0%, 5%, 12%, 18%, 28%), and optional image upload with preview.

5. **Sales History (`/sales-history`)**:
   - Search by invoice number or item name.
   - Multi-criteria filtering: date range, order type, payment method.
   - 5 Summary metric cards: Total Bills, Total Revenue, Cash, GPay / UPI, Card.
   - Paginated transaction table with order type badges, payment badges, and status.
   - Actions: View complete bill, reprint receipt, export CSV, and owner PIN-authorized refund/void modal.

6. **Reports & Analytics (`/reports`)**:
   - Filter timeframes: 7 Days, 30 Days, 90 Days, Custom Range.
   - KPI cards: Total Revenue (`₹1,24,580.00`), Total Orders (`428`), Average Bill (`₹291.54`), GST Collected (`₹6,229.00` with CGST/SGST breakdown).
   - Revenue Trend chart (Daily / Weekly toggle).
   - Payment Breakdown donut chart: Cash (42%), GPay / UPI (39%), Card (15%), Split (4%).
   - Top-Selling Foods table and Order Type Summary bars.
   - Export to CSV, PDF, and Print actions.

7. **Settings (`/settings`)**:
   - 8 distinct sub-sections:
     - **Store Information**: Store name, logo, address, phone, GSTIN (`33AABCU9603R12X`), state.
     - **Billing & GST**: Tax toggles, inclusive/exclusive pricing, GST rates, invoice prefix & numbering preview.
     - **Receipt & Printing**: Thermal 80mm live preview, header/footer note, printer toggles, test print.
     - **Appearance**: English / தமிழ் toggle, Light / Dark mode toggle, currency format.
     - **Users & Security**: Staff accounts, roles, PIN configurations, auto-lock timeout.
     - **Data & Maintenance**: Safe Clear Cache (preserves sales/products), Backup Create/Restore, Reset Demo Data with confirmation modal.
     - **Offline & Sync**: Online sync badge, sync status, transparent simulation explanation.
     - **Business Preferences**: Default order type, payment method, max discount limit.

8. **Day Close Summary (`/day-close`)**:
   - Business date settlement and payment reconciliation.
   - Opening cash balance input, cash sales, UPI sales, card sales, and split payments.
   - Expected cash calculation: `Opening Cash + Cash Sales - Refunds`.
   - Cashier counted cash input with real-time cash variance indicator (green when balanced, red/amber when difference exists).
   - Locking session to prevent duplicate day closure, with printable Day Close Report.

---

## 3. Financial Domain & Security Rules

- **Paise-Safe Arithmetic**: All monetary calculations are performed in integer paise (`paiseToRupees(paise)` / `rupeesToPaise(rupees)`). Floating-point inaccuracies are strictly eliminated.
- **GST Tax Engine**: Deterministic half-up rounding for CGST and SGST splits, ensuring `CGST + SGST === totalGST` with zero penny discrepancy.
- **Offline Data Safety**: Dexie IndexedDB transactions guarantee that completing orders updates catalog stock and stores immutable sales snapshots.
- **Cache Isolation**: The **Clear Cache** option clears temporary session cache without dropping completed invoices or business configurations.
- **Transparent Mocking**: All simulated hardware, payment integrations, and sync states are explicitly badged with `[DEMO / SIMULATED]`.

---

## 4. Quick Start & Execution

### Prerequisites
- Node.js v20+ or v24+
- pnpm 10+ / 12+

```bash
# 1. Install dependencies
pnpm install

# 2. Start Vite development server
pnpm run dev

# 3. Run typecheck (Strict TypeScript)
pnpm run typecheck

# 4. Run ESLint
pnpm run lint

# 5. Run Vitest unit & integration tests
pnpm run test

# 6. Run Playwright end-to-end tests (touchscreen & chromium)
pnpm run test:e2e

# 7. Production build
pnpm run build
```

---

## 5. Verification Status

| Gate | Tool | Status |
| :--- | :--- | :--- |
| **Linting** | ESLint | ✅ Passed (0 errors, 0 warnings) |
| **Type Checking** | TypeScript (`tsc --noEmit` & `tsc -b`) | ✅ Passed (Strict mode, 0 errors) |
| **Unit & Integration** | Vitest (24 tests) | ✅ Passed (100% pass rate) |
| **E2E Automation** | Playwright (6 tests across Desktop Chrome & 1024x768 Touchscreen) | ✅ Passed (100% pass rate) |
| **Production Build** | Vite Bundler | ✅ Passed (Optimized static bundle) |
