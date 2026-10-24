import { CartCalculationResult, CartItem, Product } from '../../types';
import { roundHalfUp, safePaise } from '../money/money';
import { calculateGstBreakdown } from '../tax/gst';

export interface DiscountConfig {
  type: 'PERCENTAGE' | 'FIXED_PAISE';
  value: number; // percentage (e.g. 10 for 10%) or paise (e.g. 5000 for ₹50.00)
}

/**
 * Creates a CartItem from a Product.
 */
export function createCartItem(product: Product, quantity = 1, notes?: string | undefined): CartItem {
  const safeQty = Math.max(1, Math.round(quantity));
  const lineSubtotalPaise = safePaise(product.pricePaise * safeQty);
  const tax = calculateGstBreakdown(lineSubtotalPaise, product.gstRate, false);

  return {
    productId: product.id,
    name: product.name,
    nameTa: product.nameTa,
    unitPricePaise: product.pricePaise,
    quantity: safeQty,
    gstRate: product.gstRate,
    discountPaise: 0,
    lineSubtotalPaise,
    lineGstPaise: tax.totalGstPaise,
    lineTotalPaise: lineSubtotalPaise + tax.totalGstPaise,
    image: product.image,
    notes,
  };
}

/**
 * Calculates complete cart financials with deterministic paise math.
 */
export function calculateCartTotals(
  items: CartItem[],
  discount?: DiscountConfig,
  enableGst = true
): CartCalculationResult {
  if (items.length === 0) {
    return {
      items: [],
      subtotalPaise: 0,
      discountPaise: 0,
      taxableAmountPaise: 0,
      gstRate: enableGst ? 5 : 0,
      totalGstPaise: 0,
      cgstPaise: 0,
      sgstPaise: 0,
      roundOffPaise: 0,
      grandTotalPaise: 0,
    };
  }

  // 1. Calculate line subtotals
  let grossSubtotalPaise = 0;
  const recalculatedItems: CartItem[] = items.map((item) => {
    const qty = Math.max(1, item.quantity);
    const lineSubtotal = safePaise(item.unitPricePaise * qty);
    grossSubtotalPaise += lineSubtotal;

    return {
      ...item,
      quantity: qty,
      lineSubtotalPaise: lineSubtotal,
    };
  });

  // 2. Calculate discount in paise
  let discountPaise = 0;
  if (discount && discount.value > 0) {
    if (discount.type === 'PERCENTAGE') {
      const pct = Math.min(100, Math.max(0, discount.value));
      discountPaise = roundHalfUp((grossSubtotalPaise * pct) / 100);
    } else {
      discountPaise = Math.min(grossSubtotalPaise, safePaise(discount.value));
    }
  }

  // 3. Taxable Subtotal
  const taxableAmountPaise = Math.max(0, grossSubtotalPaise - discountPaise);

  // 4. Calculate GST across items proportionally or by item rate
  let totalGstPaise = 0;
  let defaultRate = 5;

  if (enableGst && grossSubtotalPaise > 0) {
    // Apply discount proportionally to each line item before calculating tax
    recalculatedItems.forEach((item) => {
      defaultRate = item.gstRate;
      const itemRatio = item.lineSubtotalPaise / grossSubtotalPaise;
      const itemDiscountPaise = roundHalfUp(discountPaise * itemRatio);
      const itemTaxablePaise = Math.max(0, item.lineSubtotalPaise - itemDiscountPaise);
      const tax = calculateGstBreakdown(itemTaxablePaise, item.gstRate, false);

      item.discountPaise = itemDiscountPaise;
      item.lineGstPaise = tax.totalGstPaise;
      item.lineTotalPaise = itemTaxablePaise + tax.totalGstPaise;
      totalGstPaise += tax.totalGstPaise;
    });
  } else {
    recalculatedItems.forEach((item) => {
      item.discountPaise = 0;
      item.lineGstPaise = 0;
      item.lineTotalPaise = item.lineSubtotalPaise;
    });
    totalGstPaise = 0;
  }

  const cgstPaise = roundHalfUp(totalGstPaise / 2);
  const sgstPaise = totalGstPaise - cgstPaise;

  const rawGrandTotalPaise = taxableAmountPaise + totalGstPaise;
  // Round off to nearest rupee in paise if applicable (standard POS half-up to nearest rupee: optional or exact)
  const roundOffPaise = 0; // Keeping exact paise as per Biryani POS domain rules
  const grandTotalPaise = rawGrandTotalPaise + roundOffPaise;

  return {
    items: recalculatedItems,
    subtotalPaise: grossSubtotalPaise,
    discountPaise,
    taxableAmountPaise,
    gstRate: defaultRate,
    totalGstPaise,
    cgstPaise,
    sgstPaise,
    roundOffPaise,
    grandTotalPaise,
  };
}
