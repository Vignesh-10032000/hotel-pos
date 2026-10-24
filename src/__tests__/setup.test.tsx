import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Workspace Environment Verification', () => {
  it('renders environment verification heading', () => {
    render(<App />);
    expect(
      screen.getByText(/Biryani POS — Terminal Demo Environment/i)
    ).toBeInTheDocument();
  });

  it('validates touch-friendly layout container exists', () => {
    const { container } = render(<App />);
    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('verifies deterministic math helper works in test runner', () => {
    // Basic test ensuring paise arithmetic can be executed accurately
    const subtotalPaise = 25000; // Rs. 250.00
    const gstRatePercent = 5;
    const gstPaise = Math.round((subtotalPaise * gstRatePercent) / 100);
    const totalPaise = subtotalPaise + gstPaise;

    expect(gstPaise).toBe(1250); // Rs. 12.50
    expect(totalPaise).toBe(26250); // Rs. 262.50
  });
});
