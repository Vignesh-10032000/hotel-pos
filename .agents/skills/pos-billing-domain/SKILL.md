---
name: pos-billing-domain
description: Guides the design, implementation, and verification of deterministic POS cart math, GST calculations, split-payment settlement, and immutable invoice snapshot generation.
---

# POS Billing Domain Skill for Biryani POS

## Overview

This skill governs financial calculations, tax computation, discount processing, payment reconciliation, and invoice generation. Financial logic must remain completely decoupled from React UI components.

## Core Directives

### 1. Paise-Safe Monetary Arithmetic

- **Strict Integer Math**: Store, compute, and validate all monetary values in integer **paise** (1 INR = 100 paise).
- **No Floating-Point Operations**: Never calculate tax or discounts with direct floating-point rupee values.
  ```ts
  // Correct
  const gstPaise = Math.round((subtotalPaise * gstRatePercent) / 100);
  const totalPaise = subtotalPaise + gstPaise;

  // Incorrect (DO NOT USE)
  const gstRupees = subtotalRupees * 0.05;
  ```
- **Display Formatting**: Format to rupees only at the UI display layer:
  ```ts
  export const formatRupees = (paise: number): string => `₹${(paise / 100).toFixed(2)}`;
  ```

### 2. GST & Tax Engine

- Support configurable GST rates (e.g., 5% composite restaurant GST split into 2.5% CGST + 2.5% SGST).
- Line-item vs. Invoice-level GST calculation:
  - Calculate GST per line item using standard half-up rounding.
  - Sum individual line tax components or compute invoice aggregate deterministically.
- Retain detailed tax breakdowns (subtotal, CGST paise, SGST paise, round-off paise, grand total).

### 3. Payment Modes & Split-Payment Reconciliation

- Support standard POS payment modes: `CASH`, `UPI`, `CARD`, `SPLIT`.
- For split payments:
  - Maintain an array of payment tenders: `{ mode: PaymentMode; amountPaise: number; reference?: string }[]`.
  - Validate invariant: `sum(tenders.amountPaise) === invoice.totalPaise`.
  - For cash transactions, calculate `tenderedPaise` and `changeDuePaise`. Never allow negative change due.

### 4. Immutable Invoice Snapshots

- Once completed, an invoice must be stored as an immutable snapshot.
- Snapshot must freeze:
  - Product names, item unit price at time of sale, quantity.
  - Applied discounts (coupon code, percentage or fixed paise discount).
  - GST percentage and component breakdown.
  - Cashier ID / terminal ID and timestamp.
  - Unique sequential invoice number.

### 5. Mandatory Unit Testing

- Every billing rule, edge case (e.g., fractional rounding, 100% discount, zero item cart, split tender exact match) must have dedicated Vitest unit tests before merging.
