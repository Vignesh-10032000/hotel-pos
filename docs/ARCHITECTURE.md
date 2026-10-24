# Biryani POS — System Architecture & Integration Roadmap

## 1. Architectural Vision

Biryani POS is an offline-resilient, touch-optimized Point of Sale solution designed specifically for high-volume, rapid-turnaround biryani and quick-service restaurant (QSR) outlets.

The project follows a phased rollout strategy:

1. **Phase 1 (Current)**: Windows Browser Demo utilizing React 19, Vite, Tailwind CSS v4, and Dexie (IndexedDB) for local data persistence.
2. **Phase 2 (Future)**: Android Touchscreen POS Terminal deployment utilizing Capacitor, SQLite, and native thermal receipt printer bridges.
3. **Phase 3 (Future)**: Centralized cloud synchronization and management backend using Node.js, Express, TypeScript, and PostgreSQL with Drizzle ORM.

---

## 2. High-Level Architecture (Phase 1: Local Demo)

```mermaid
flowchart TD
    subgraph UI_Layer["Touchscreen UI Layer (React 19 + Tailwind v4)"]
        Nav["Top Bar & Session Info"]
        CatSidebar["Category Rail"]
        Grid["Product Grid & Variant Selectors"]
        Cart["Cart Ledger & Running Totals"]
        Keypad["Touch Numpad & Quick Actions"]
        Modal["Checkout & Split-Payment Modal"]
    end

    subgraph State_Domain["Domain & State Layer (Zustand + Pure TS)"]
        CartStore["Cart Store (Items, Discounts, Taxes)"]
        BillingEngine["Deterministic Billing Engine (Paise Math)"]
        GSTEngine["GST Engine (CGST 2.5% + SGST 2.5%)"]
        PaymentReconciler["Payment Reconciler (Cash / UPI / Split)"]
    end

    subgraph Persistence_Layer["Persistence Abstraction Layer"]
        RepoInterface["POSDataRepository (Interface)"]
        DexieRepo["DexiePOSRepository (IndexedDB)"]
    end

    subgraph Storage["Browser Storage (Dexie.js)"]
        T_Products[("products")]
        T_Orders[("orders")]
        T_Invoices[("invoices")]
        T_Settings[("settings")]
        T_SyncQueue[("syncQueue (Outbox)")]
    end

    UI_Layer --> State_Domain
    State_Domain --> Persistence_Layer
    RepoInterface -.-> DexieRepo
    DexieRepo --> Storage
```

---

## 3. Financial & Billing Domain Principles

### 3.1 Strict Integer Paise Representation

To eliminate floating-point arithmetic errors inherent in JavaScript IEEE-754 double-precision numbers, all monetary values are processed and stored strictly as **integers in paise**:

- ₹1.00 = 100 paise.
- ₹240.50 = 24050 paise.

```
Subtotal (Paise) = Σ (Item.unitPricePaise * Item.quantity)
Discount (Paise) = FlatDiscountPaise OR Round((SubtotalPaise * DiscountPercent) / 100)
TaxableAmount (Paise) = Subtotal - Discount
CGST (Paise) = Round((TaxableAmount * 2.5) / 100)
SGST (Paise) = Round((TaxableAmount * 2.5) / 100)
GrandTotal (Paise) = TaxableAmount + CGST + SGST
```

### 3.2 Immutability of Completed Invoices

Once an invoice is finalized:

- An immutable snapshot is persisted to the `invoices` table.
- Product price changes or catalog deletions never alter historical invoices.
- Invoices cannot be modified or silently dropped.

---

## 4. Why Python, Django, and KOT Are Excluded

| Excluded Component              | Rationale                                                                                                                                                                                                                                                                                                                                                                                                           |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Python / Django / Flask**     | POS terminals require ultra-low latency, instant touch feedback, offline reliability, and minimal resource footprints. Introducing a Python interpreter or Django server creates unnecessary overhead, complex local runtime packaging, and sync impedance mismatch. A unified TypeScript stack across the client, native shell (Capacitor), and eventual backend (Node.js) maximizes code sharing and type safety. |
| **KOT (Kitchen Order Tickets)** | The target business model is high-speed biryani counters where items are portioned and fulfilled directly from the front counter upon ordering. Kitchen routing queues and kitchen displays introduce operational latency and user complexity not needed for this workflow.                                                                                                                                         |

---

## 5. Future Integration Roadmap & Boundaries

```mermaid
flowchart LR
    subgraph Client_Evolution["POS Terminal Client"]
        ReactApp["React POS Core (UI + Domain)"]
        BrowserAdapter["Phase 1: Dexie (Browser IndexedDB)"]
        CapacitorAdapter["Phase 2: Capacitor + SQLite"]
    end

    subgraph Hardware_Peripherals["Native Peripherals (Phase 2)"]
        Printer["Android Thermal Receipt Printer (ESC/POS)"]
        Barcode["Hardware Barcode Scanner"]
    end

    subgraph Cloud_Backend["Central Server (Phase 3)"]
        NodeServer["Node.js + Express + TypeScript"]
        Drizzle["Drizzle ORM"]
        Postgres[("PostgreSQL Database")]
        AuthService["JWT & RBAC Security"]
    end

    ReactApp --> BrowserAdapter
    ReactApp -.-> CapacitorAdapter
    CapacitorAdapter --> Printer
    CapacitorAdapter --> Barcode
    CapacitorAdapter -.->|Sync Protocol| NodeServer
    NodeServer --> Drizzle --> Postgres
    NodeServer --> AuthService
```

### 5.1 Phase 2: Android Hardware Migration (Capacitor + SQLite)

- **Repository Swap**: Replace `DexiePOSRepository` with `CapacitorSQLiteRepository` implementing the identical `POSDataRepository` interface.
- **Thermal Printing**: Implement native ESC/POS thermal printing using USB/Bluetooth serial drivers or Android POS SDKs (Sunmi / IMin / Pax).
- **Physical Device Lockdown**: Configure Android Kiosk mode (device owner / pin-to-screen).

### 5.2 Phase 3: Cloud Synchronization & Central Backend

- **Backend Stack**: Node.js + Express + TypeScript + PostgreSQL + Drizzle ORM.
- **Offline Sync Protocol**: Terminals push unsynced items from `syncQueue` when network connectivity is established, utilizing vector clocks and idempotent transaction UUIDs to guarantee zero duplicate charges.
- **Production Payment Verification**: Server-side webhook verification for payment gateways (Razorpay / PineLabs / Paytm) with digital signature validation.
