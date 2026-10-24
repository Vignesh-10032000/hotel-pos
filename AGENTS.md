# BIRYANI POS — PERMANENT WORKSPACE RULES & ARCHITECTURAL CONSTRAINTS

These project-level rules govern all development, architecture, testing, and tool execution in this workspace.

---

## 1. Core Technology Stack & Boundaries

- **UI & Application Framework**: React + TypeScript + Vite + Tailwind CSS only.
- **Strictly Prohibited**: No Python, no Django, no Flask, no backend scripting outside Node.js.
- **No KOT / Kitchen Routing**: Kitchen Order Tickets (KOT) and kitchen display/routing systems are explicitly excluded from this system. Do not add KOT models, tables, queues, or screens.
- **TypeScript Strictness**: Strict TypeScript compilation is enforced. Avoid `any` without exception. Use explicit types, discriminating unions, and Zod schemas for validation.

## 2. POS Billing Domain & Financial Math

- **Separation of Concerns**: Keep all cart calculations, discounts, taxes, and payment logic isolated from UI components in dedicated pure domain modules.
- **Deterministic Money / GST Calculations**:
  - Always store and calculate monetary amounts in **paise** (integers) to prevent floating-point inaccuracies.
  - Convert to rupees (`paise / 100`) strictly at presentation/formatting boundaries.
  - Rounding must follow standard deterministic half-up rounding at the line-item and bill totals.
- **Zero-Trust Client Totals**: Never treat client-calculated or UI-manipulated totals as authoritative production values; always re-verify calculations against domain rules.

## 3. UI/UX & Touchscreen Guidelines

- **Follow Approved Screenshot References**: Match layout, colors, typography, and component placement to approved reference mocks.
- **Preserve Established Layouts**: Maintain persistent navigation and split-pane POS layouts across route transitions.
- **Touchscreen First**:
  - Minimum tap target of 48×48px for all actionable buttons, keys, and inputs.
  - Disable native browser gesture conflicts (pull-to-refresh, pinch-to-zoom) via CSS touch-action rules.
  - Implement instant visual active/tap states for tactile feedback.

## 4. Offline Persistence & Data Safety

- **Dexie / IndexedDB**: Use Dexie.js for persistent local browser demo data (products, catalog, demo sales, store settings).
- **No Silent Transaction Deletion**: Never silently delete, truncate, or drop completed order/invoice records.
- **Cache Isolation**: Clearing local cache or reset operations must preserve historical transaction records and business configuration.
- **Idempotent Checkout**: Prevent duplicate checkouts and race conditions via transaction locks and state flags.

## 5. API & Mocking Transparency

- **No Fabricated Success**: Never fabricate or fake live API responses or payment confirmations.
- **Explicit Labeling**: All simulated hardware, offline transactions, UPI QR generation, card terminal responses, and demo sync adapters must be unambiguously labelled with a `[DEMO / SIMULATED]` badge in the UI and code comments.

## 6. Testing & Quality Assurance

- **Coverage for Financial Logic**: Write comprehensive Vitest unit tests for cart calculations, split-payments, GST calculations, and roundings before implementing UI screens.
- **Verification Routine**: Run `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` after all meaningful code changes.
- **Human In The Loop**: Ask for explicit confirmation before performing destructive operations, remote deployments, external paid API calls, or modifying global system configurations.
