# Biryani POS — MCP Servers & Agent Skills Audit

## 1. Model Context Protocol (MCP) Audit

### 1.1 Detected Machine MCP Servers

An audit of the workstation's MCP registration directory (`C:\Users\ramas\.gemini\antigravity\mcp`) identified the following active MCP servers:

- `accessibility`
- `chrome-devtools`
- `cloudinary-mcp`
- `code-guard`
- `context7`
- `cybersecurity_cyber-code-guard`
- `cybersecurity_cyber-virustotal`
- `data-agent-kit`
- `data-agent-kit-plugin_dak-notebook`
- `flutter_dart-mcp-server`
- `gemini-api_gemini-api-docs`
- `github`
- `hugeicons`
- `iconify`
- `inspo-mcp`
- `memory`
- `notebooks`
- `playwright`
- `rea`
- `refero-mcp`
- `shadcn`
- `shadcn-ui-mcp`
- `socket-security`
- `ui-skills`
- `virustotal`

---

### 1.2 Evaluation for Initial POS Demo

| Integration                        | Classification          | Rationale & Recommendation                                                                                                                                      |
| :--------------------------------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Playwright Browser MCP**         | Optional / Not Required | Local `pnpm run test:e2e` via Playwright CLI executes directly inside the Node test runner, avoiding extra browser MCP session overhead.                        |
| **Google Developer Knowledge MCP** | Recommended (Phase 2)   | Highly valuable during Android/Capacitor hardware integration for querying official Google/Android platform documentation. Not needed for Phase 1 Windows demo. |
| **GitHub MCP**                     | Recommended (Optional)  | Useful only if the user requests remote GitHub repository synchronization, pull requests, or issue tracking.                                                    |
| **PostgreSQL / DB MCP**            | Prohibited for Demo     | The demo is client-side only (IndexedDB). No live database servers are used.                                                                                    |
| **Payment Gateway MCP**            | Prohibited for Demo     | Payments in Phase 1 are simulated locally with transparent `[DEMO]` badges.                                                                                     |
| **GST Filing API / WhatsApp MCP**  | Prohibited for Demo     | No live government tax filings or messaging APIs are integrated during initial demo.                                                                            |
| **Android / Thermal Printer MCP**  | Deferred (Phase 2)      | Hardware inspection and native printer bridge development occur in Phase 2.                                                                                     |

### Explicit MCP Status Declaration

> **No external MCP required for initial demo.**
> All operations, data persistence, and testing are fully self-contained using the local Vite, Dexie, Vitest, and Playwright toolchain.

---

### 1.3 Security & Guardrails

- **Zero Inventions**: Never invent MCP server names, endpoints, or authentication parameters.
- **Credential Protection**: Never hardcode API keys, access tokens, or private secrets in workspace files.
- **Read-Only / Authorization Boundaries**: No modifications to machine-level or global MCP configurations (`~/.gemini/config/`) without explicit user consent.

---

## 2. Project-Specific Workspace Skills

Four custom agent skills have been created in the workspace under `.agents/skills/`:

### Skill 1: `react-typescript-ui`

- **Location**: `.agents/skills/react-typescript-ui/SKILL.md`
- **Focus**: Screenshot-matched UI construction, touch-first ergonomics (48×48px targets, `touch-action` rules, active feedback states), responsive split-pane POS layouts, Tailwind CSS v4 design tokens, and strict TypeScript components.

### Skill 2: `pos-billing-domain`

- **Location**: `.agents/skills/pos-billing-domain/SKILL.md`
- **Focus**: Deterministic integer paise arithmetic, tax engine (CGST 2.5% + SGST 2.5%), multi-mode tender and split-payment validation, immutable invoice snapshot generation, and complete decoupling of business rules from React UI.

### Skill 3: `offline-data-persistence`

- **Location**: `.agents/skills/offline-data-persistence/SKILL.md`
- **Focus**: Dexie.js (IndexedDB) schema modeling, atomic transactions, duplicate-checkout prevention via transaction UUIDs, zero data loss protections for completed sales, and clean repository interfaces for future SQLite migration.

### Skill 4: `pos-ui-testing`

- **Location**: `.agents/skills/pos-ui-testing/SKILL.md`
- **Focus**: Automated quality gates using Vitest unit tests for financial algorithms, React Testing Library component tests, and Playwright E2E tests simulating real touchscreen POS viewports.
