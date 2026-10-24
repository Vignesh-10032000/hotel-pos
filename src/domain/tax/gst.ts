import { roundHalfUp, safePaise } from '../money/money';

export interface TaxCalculationResult {
  taxableAmountPaise: number;
  totalGstPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  effectiveRate: number;
}

/**
 * Calculates GST components for a given taxable amount in paise and a GST percentage rate.
 * CGST and SGST are split evenly with integer remainder protection:
 * CGST = roundHalfUp(totalGst / 2)
 * SGST = totalGst - CGST
 * (Guarantees: CGST + SGST === totalGst)
 */
export function calculateGstBreakdown(
  taxablePaise: number,
  gstRatePercent: number,
  isInclusive = false
): TaxCalculationResult {
  const safeTaxable = safePaise(taxablePaise);
  if (gstRatePercent <= 0 || safeTaxable === 0) {
    return {
      taxableAmountPaise: safeTaxable,
      totalGstPaise: 0,
      cgstPaise: 0,
      sgstPaise: 0,
      effectiveRate: 0,
    };
  }

  let baseTaxablePaise: number;
  let gstPaise: number;

  if (isInclusive) {
    // When price is inclusive of GST:
    // Base Taxable = Price * 100 / (100 + Rate)
    baseTaxablePaise = roundHalfUp((safeTaxable * 100) / (100 + gstRatePercent));
    gstPaise = safeTaxable - baseTaxablePaise;
  } else {
    // When price is exclusive of GST:
    baseTaxablePaise = safeTaxable;
    gstPaise = roundHalfUp((safeTaxable * gstRatePercent) / 100);
  }

  const cgstPaise = roundHalfUp(gstPaise / 2);
  const sgstPaise = gstPaise - cgstPaise;

  return {
    taxableAmountPaise: baseTaxablePaise,
    totalGstPaise: gstPaise,
    cgstPaise,
    sgstPaise,
    effectiveRate: gstRatePercent,
  };
}

/**
 * Validates configured GST rates. Supported official slabs: 0%, 5%, 12%, 18%, 28%
 */
export const STANDARD_GST_RATES = [0, 5, 12, 18, 28] as const;

export function isValidGstRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= 0 && rate <= 100;
}
