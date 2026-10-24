# Biryani POS — Windows Browser Demo

A high-performance, touch-first Point of Sale (POS) system tailored for restaurant operations, starting with a persistent Windows-browser demo and architected for seamless transition to Android touchscreen POS hardware via Capacitor.

---

## 1. Project Summary & Status

- **Current Milestone**: Environment preparation and tooling audit complete.
- **Platform Phase 1**: Windows Browser Demo (Chrome / Edge).
- **Platform Phase 2 (Future)**: Android touchscreen POS terminal (Capacitor + SQLite + Android Thermal Printer SDK).
- **Architectural Philosophy**: Pure client-side offline-first architecture using Dexie (IndexedDB), strict TypeScript, and deterministic paise financial math.

---

## 2. Core Tech Stack

| Layer            | Technology                            | Purpose                                          |
| :--------------- | :------------------------------------ | :----------------------------------------------- |
| **Framework**    | React 19 + TypeScript                 | Component architecture & type-safe state         |
| **Build Tool**   | Vite 8 + `@vitejs/plugin-react`       | Ultra-fast HMR and bundling                      |
| **Styling**      | Tailwind CSS v4 (`@tailwindcss/vite`) | Touchscreen-first responsive layout              |
| **Local DB**     | Dexie.js (IndexedDB)                  | Local persistence for products, settings & sales |
| **State**        | Zustand                               | Lightweight, decoupled cart & terminal stores    |
| **Validation**   | Zod                                   | Runtime schema validation                        |
| **Icons**        | Lucide React                          | High-contrast touch UI icons                     |
| **Charts**       | Recharts 3                            | Daily sales & category performance visualization |
| **Unit Testing** | Vitest + React Testing Library        | Deterministic financial math & component tests   |
| **E2E Testing**  | Playwright                            | Touchscreen simulation and user flow automation  |

---

## 3. Quick Start

### Prerequisites

- **Node.js**: v24.x LTS (tested on v24.16.0)
- **Package Manager**: pnpm 12.x (`npm install -g pnpm`)
- **Browser**: Google Chrome or Microsoft Edge on Windows

### Setup & Execution Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Start Vite development server (http://127.0.0.1:5173)
pnpm run dev

# 3. Run typecheck (Strict TypeScript)
pnpm run typecheck

# 4. Run ESLint
pnpm run lint

# 5. Run Vitest unit tests
pnpm run test

# 6. Run Playwright end-to-end tests (touchscreen & chromium)
pnpm run test:e2e

# 7. Create production build
pnpm run build

# 8. Preview production build locally
pnpm run preview
```

---

## 4. Architectural Rules & Permanent Constraints

- **Strictly No Python / Django / Flask**: All current and future code is TypeScript/Node.js based.
- **No KOT / Kitchen Routing**: Kitchen order tickets and routing displays are strictly out of scope.
- **Deterministic Money / GST Math**: All calculations must use integer **paise** to avoid IEEE-754 floating-point errors.
- **Offline Data Safety**: Completed invoices and sales records must never be silently truncated or erased.
- **Zero-Trust Client Totals**: Client totals are re-calculated deterministically before persisting.
- **Transparent Mocking**: All simulated hardware, payment gateways, and demo adapters carry explicit `[DEMO / SIMULATED]` markers.

---

## 5. Documentation Map

- [Environment Setup Guide](file:///c:/Users/ramas/Documents/antigravity/adventurous-meitner/docs/ENVIRONMENT_SETUP.md)
- [System Architecture & Future Roadmap](file:///c:/Users/ramas/Documents/antigravity/adventurous-meitner/docs/ARCHITECTURE.md)
- [MCP Servers & Agent Skills Reference](file:///c:/Users/ramas/Documents/antigravity/adventurous-meitner/docs/MCP_AND_SKILLS.md)
- [Workspace Rules](file:///c:/Users/ramas/Documents/antigravity/adventurous-meitner/AGENTS.md)
