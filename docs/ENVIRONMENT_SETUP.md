# Biryani POS — Environment Setup & Tooling Audit Guide

## 1. Environment Audit Summary

An initial diagnostic audit was conducted on the development workstation to verify the toolchain readiness for the Windows-browser POS demo.

| Component            | Status  | Detected Version / Details       | Notes                                                          |
| :------------------- | :------ | :------------------------------- | :------------------------------------------------------------- |
| **Operating System** | Ready   | Windows 11 (Build 26200.0)       | PowerShell shell execution environment                         |
| **Node.js**          | Ready   | `v24.16.0` (LTS)                 | 64-bit runtime installed at `C:\Program Files\nodejs`          |
| **npm**              | Ready   | `11.13.0`                        | Bundled package manager                                        |
| **pnpm**             | Ready   | `12.15.0`                        | Installed in user profile (`AppData/Roaming/npm`)              |
| **Git**              | Ready   | `2.55.0.windows.5`               | Repository initialized on `master` branch                      |
| **Corepack**         | Audited | `0.35.0`                         | Administrative elevation required for symlink creation         |
| **Google Chrome**    | Ready   | Installed                        | `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`  |
| **Microsoft Edge**   | Ready   | Installed                        | `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` |
| **Antigravity IDE**  | Active  | Workspace: `adventurous-meitner` | Customizations in `.agents/` and root rule files               |

---

## 2. Package Manager Configuration

During initial setup, running `corepack enable` encountered Windows filesystem permission constraints (`EPERM` writing symlinks into `C:\Program Files\nodejs`).

**Resolution Applied**:

1. Verified user npm prefix: `C:\Users\ramas\AppData\Roaming\npm`, which is already registered in the user `$env:PATH`.
2. Installed `pnpm` globally in user scope via `npm install -g pnpm`.
3. Validated executable availability: `pnpm --version` -> `12.15.0`.
4. Consistent lockfile management: `pnpm-lock.yaml` is pinned and committed.

---

## 3. Dependency Compatibility Audit

All dependencies were audited for peer dependency compatibility with React 19 and TypeScript:

### Runtime Dependencies

- `react` (`^19.3.1`) & `react-dom` (`^19.3.1`): Latest React 19 stable foundation.
- `react-router-dom` (`^7.18.4`): Declarative routing for POS cashier/report screens.
- `tailwindcss` (`^4.3.3`) & `@tailwindcss/vite` (`^4.3.3`): Vite plugin-native Tailwind CSS v4.
- `lucide-react` (`^1.61.0`): Icon library; verified React 19 peer compatibility.
- `zustand` (`^5.0.16`): Minimalistic state management for cart and cashier sessions.
- `zod` (`^4.6.7`): Strict runtime schemas for product models and transactions.
- `dexie` (`^4.4.7`): High-performance IndexedDB wrapper with transaction safety.
- `recharts` (`^3.10.1`): Visualizations; Recharts 3 supports React 19 natively.

### Development Dependencies

- `typescript` (`~5.9.3`): Pinned to TypeScript 5.9.3 to satisfy `typescript-eslint` (`>=4.8.4 <6.1.0`).
- `vite` (`^8.3.5`) & `@vitejs/plugin-react` (`^6.1.2`): High-speed ESM development and build pipeline.
- `eslint` (`^9.20.0`) & `typescript-eslint` (`^8.24.0`): Flat config ESLint 9 setup.
- `prettier` (`^3.5.1`): Code formatting standard.
- `vitest` (`^5.0.5`) & `jsdom` (`^26.0.0`): Fast unit testing engine with DOM simulation.
- `@testing-library/react` (`^16.2.0`) & `@testing-library/jest-dom` (`^6.6.3`): Component testing utilities.
- `playwright` (`^1.50.1`) & `@playwright/test` (`^1.50.1`): End-to-end touchscreen testing.

---

## 4. Verification Check Log

Each of the following verification commands has been executed and confirmed working:

```bash
# Typecheck
pnpm run typecheck
# Result: Exit code 0 (Strict check passed)

# Linter
pnpm run lint
# Result: Exit code 0 (No warnings or errors)

# Unit Tests
pnpm run test
# Result: Exit code 0 (3/3 passed in 51ms)

# Production Build
pnpm run build
# Result: Exit code 0 (Transformed 1933 modules in 728ms, dist/ created)

# Playwright Test Suite
pnpm run test:e2e
# Result: Exit code 0 (2/2 passed: desktop chromium & pos-touchscreen)
```
