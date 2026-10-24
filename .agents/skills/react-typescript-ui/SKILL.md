---
name: react-typescript-ui
description: Guides the implementation of high-fidelity, touch-first React 19 and TypeScript interfaces with Tailwind CSS v4 for the Biryani POS system, matching approved visual references.
---

# React TypeScript UI Skill for Biryani POS

## Overview

This skill guides the construction of touch-optimized, screenshot-faithful POS interfaces in React 19, TypeScript, and Tailwind CSS v4.

## Core Directives

### 1. Visual Fidelity & Screenshot Alignment

- Replicate the layout, proportions, colors, typography, and spacing from approved screenshot references.
- Preserve the persistent POS layout (Category sidebar / Item grid / Cart ledger / Action keypad).
- Maintain high contrast for bright cashier terminal environments.

### 2. Touch-First Ergonomics

- **Minimum Tap Targets**: 48×48px for all touch interactions (keypad buttons, item cards, quantity steppers, payment options).
- **Gesture Protection**: Enforce `touch-action: pan-x pan-y;` and `user-select: none;` on interactive frames to prevent accidental double-tap zooming or text selection.
- **Visual Feedback**: Immediate active states (`active:scale-95 active:bg-slate-700 transition-transform`) to provide tactile confirmation on touch terminals.

### 3. Component Architecture & Reusability

- Separate presentational components (`ItemCard`, `CartLineItem`, `KeypadButton`, `ReceiptModal`) from stateful containers.
- Co-locate component-specific sub-elements while keeping domain logic in dedicated stores or hooks.
- Use Lucide icons consistently with explicit sizing (`w-5 h-5`) and semantic meaning.

### 4. Accessibility (a11y) & Semantic Markup

- Use semantic HTML: `<button>`, `<dialog>`, `<section>`, `<nav>`, `<aside>`, `<header>`, `<table>`.
- Include `aria-label` on icon-only buttons (e.g., delete item, quick quantity buttons).
- Ensure focus rings are accessible for keyboard barcode scanner navigation.

### 5. Strict TypeScript Practices

- Define props interfaces explicitly using `interface` or `type`.
- Forbid `any`. Use generics for reusable list/grid containers.
- Discriminate component variants with string literal unions (e.g., `variant: 'primary' | 'secondary' | 'danger' | 'ghost'`).
