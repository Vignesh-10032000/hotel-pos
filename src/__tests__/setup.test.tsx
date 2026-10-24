import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import App from '../App';

describe('Workspace Environment Verification', () => {
  it('renders Biryani POS brand heading and sidebar', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getAllByText(/BIRYANI POS/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/GSTIN: 33AABCU9603R12X/i)).toBeInTheDocument();
  });

  it('validates touch-friendly layout container exists', async () => {
    let containerElement: HTMLElement;
    await act(async () => {
      const { container } = render(<App />);
      containerElement = container;
    });
    const mainElement = containerElement!.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('verifies deterministic math helper works in test runner', () => {
    const subtotalPaise = 25000; // Rs. 250.00
    const gstRatePercent = 5;
    const gstPaise = Math.round((subtotalPaise * gstRatePercent) / 100);
    const totalPaise = subtotalPaise + gstPaise;

    expect(gstPaise).toBe(1250); // Rs. 12.50
    expect(totalPaise).toBe(26250); // Rs. 262.50
  });
});
