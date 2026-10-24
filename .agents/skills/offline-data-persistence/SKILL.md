---
name: offline-data-persistence
description: Governs Dexie and IndexedDB repository design, transaction safety, offline demo data retention, duplicate-checkout prevention, and clean boundaries for future SQLite/PostgreSQL sync.
---

# Offline Data Persistence Skill for Biryani POS

## Overview

This skill guides the implementation of local, offline-first data storage using Dexie.js (IndexedDB). It guarantees zero data loss for completed transactions and establishes adapter boundaries for future Capacitor SQLite and PostgreSQL synchronization.

## Core Directives

### 1. Dexie Database Architecture

- Define typed tables with Dexie:
  - `products`: Product catalog, categories, pricing (in paise), tax codes, stock levels.
  - `orders`: Active and completed orders with line items, timestamps, and status (`draft` | `completed` | `cancelled`).
  - `invoices`: Immutable completed sale snapshots.
  - `settings`: Store configuration, GST rates, terminal IDs, receipt header/footer.
  - `syncQueue`: Outbound change ledger for future server synchronization.

### 2. Transaction Safety & Concurrency

- Use Dexie transactions (`db.transaction('rw', [db.orders, db.invoices, db.products], async () => { ... })`) for checkout operations.
- Enforce idempotency: Each checkout operation must generate a deterministic client transaction ID (UUIDv4) to prevent double-billing on rapid repeated taps.
- Atomically decrement product stock when finalizing an invoice.

### 3. Data Protection & Cache Isolation

- **No Silent Drops**: Completed invoices and sales reports must NEVER be deleted during session logout, page refresh, or cache invalidation.
- **Explicit Reset Controls**: Implement a dedicated Developer / Demo Reset utility protected by confirmation dialogs, clearly separating temporary UI state resets from historical transaction purging.
- **Export / Backup**: Provide an IndexedDB JSON export/import mechanism for backup and test fixture hydration.

### 4. Future SQLite & Server Synchronization Boundary

- Decouple repository operations behind a generic interface:
  ```ts
  export interface POSDataRepository {
    getProducts(): Promise<Product[]>;
    saveInvoice(invoice: Invoice): Promise<string>;
    getInvoices(dateRange?: DateRange): Promise<Invoice[]>;
    getSettings(): Promise<StoreSettings>;
  }
  ```
- Implement `DexiePOSRepository` for the Windows browser demo.
- Ensure the interface remains 100% compatible with future `CapacitorSQLiteRepository` and Node.js/PostgreSQL client layers.
