/**
 * Strict Money Math Module
 * Enforces integer paise calculations to prevent floating point inaccuracies.
 */

/**
 * Deterministic standard half-up rounding for numbers.
 */
export function roundHalfUp(value: number): number {
  if (value < 0) {
    return -Math.round(Math.abs(value));
  }
  return Math.floor(value + 0.5);
}

/**
 * Converts integer paise to decimal rupees.
 * Strictly used for display/formatting or non-calculation boundaries.
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Converts decimal rupees (e.g. from user input) to integer paise.
 * Uses half-up rounding to prevent precision errors like 180.00 * 100 = 17999.999999999996.
 */
export function rupeesToPaise(rupees: number): number {
  if (isNaN(rupees) || !isFinite(rupees)) {
    return 0;
  }
  return roundHalfUp(rupees * 100);
}

/**
 * Validates and ensures an integer non-negative paise amount.
 */
export function safePaise(paise: number): number {
  if (isNaN(paise) || !isFinite(paise) || paise < 0) {
    return 0;
  }
  return Math.round(paise);
}

/**
 * Formats integer paise into Indian Rupee presentation format.
 * Examples:
 *   1245000 -> "₹12,450.00"
 *   18000   -> "₹180.00"
 *   65100   -> "₹651.00"
 */
export function formatRupees(paise: number, options?: { prefix?: boolean; forceDecimals?: boolean }): string {
  const prefix = options?.prefix !== false ? '₹' : '';
  const forceDecimals = options?.forceDecimals !== false;
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);

  const rupees = absPaise / 100;

  // Format with Indian numbering format (e.g., 1,24,580.00)
  const parts = rupees.toFixed(2).split('.');
  let integerPart = parts[0] ?? '0';
  const decimalPart = parts[1] ?? '00';

  // Indian numbering: last 3 digits, then groups of 2 digits
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const sign = isNegative ? '-' : '';
  if (!forceDecimals && decimalPart === '00') {
    return `${sign}${prefix}${integerPart}`;
  }

  return `${sign}${prefix}${integerPart}.${decimalPart}`;
}
