---
description: Permanent workspace rules and architectural constraints for Biryani POS
always_on: true
---

# Biryani POS Permanent Workspace Rules

- **UI & Application**: React + TypeScript + Vite + Tailwind CSS only.
- **Strict TypeScript**: Never use `any`. Use discriminating unions and Zod validation.
- **Prohibitions**: No Python, No Django, No Flask, No KOT (Kitchen Order Tickets) or kitchen routing.
- **Visuals**: Follow approved screenshot references. Maintain persistent POS layouts.
- **Architecture**: Keep billing logic strictly decoupled from UI components.
- **Financial Arithmetic**: Deterministic integer paise math for all money and GST calculations. Never trust client-calculated totals as authoritative.
- **Data Persistence**: Dexie (IndexedDB) for local data. Never silently delete completed transactions. Cache clearing must preserve historical orders.
- **Integration**: Transparently label all mocked payments and simulated hardware. Never fabricate API success.
- **Testing**: Vitest unit tests for financial logic. Playwright for touch/E2E testing.
- **Workflows**: Run lint, typecheck, tests, and build after changes. Ask before destructive operations.
