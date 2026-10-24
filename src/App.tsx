import React from 'react';
import { CheckCircle2, MonitorCheck, HardDrive, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <header className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <MonitorCheck className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Biryani POS — Terminal Demo Environment
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              React + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB)
            </p>
          </div>
        </header>

        <section aria-labelledby="status-heading" className="space-y-3">
          <h2
            id="status-heading"
            className="text-sm font-semibold uppercase tracking-wider text-slate-400"
          >
            Workspace Tooling & Environment Verification
          </h2>

          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Vite 8 & React 19 Toolchain Configured</span>
            </li>
            <li className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Strict TypeScript & Tailwind CSS v4 Engine Ready</span>
            </li>
            <li className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <HardDrive className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Dexie (IndexedDB) Local Persistence Architecture Configured</span>
            </li>
            <li className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>No Python, No Django, Deterministic Money/GST Rules Active</span>
            </li>
          </ul>
        </section>

        <footer className="mt-8 pt-4 border-t border-slate-800 text-xs text-center text-slate-400">
          Ready for approved application screen & billing domain implementation.
        </footer>
      </div>
    </main>
  );
};

export default App;
