import PaystackPop from '@paystack/inline-js';

/**
 * Interface for Paystack payment initialization options
 */
export interface PaystackPaymentOptions {
  email: string;
  amount: number; // Amount in smallest currency unit (e.g., kobo for NGN, cents for USD)
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackResponse) => void;
  onCancel: () => void;
}

/**
 * Interface for Paystack payment response
 */
export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  message?: string;
}

/**
 * Initialize and open Paystack payment popup
 * @param options - Payment configuration options
 * @throws Error if Paystack public key is not configured
 */
export function initializePaystackPayment(options: PaystackPaymentOptions): void {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error('Paystack public key is not configured. Please add VITE_PAYSTACK_PUBLIC_KEY to your environment variables.');
  }

  // Generate reference if not provided
  const reference = options.reference || `ps_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const popup = new PaystackPop();
  
  popup.newTransaction({
    key: publicKey,
    email: options.email,
    amount: options.amount,
    currency: options.currency || 'NGN',
    ref: reference,
    metadata: options.metadata,
    onSuccess: (transaction: any) => {
      options.onSuccess({
        reference: transaction.reference || reference,
        status: transaction.status || 'success',
        trans: transaction.trans || transaction.transaction || '',
        transaction: transaction.transaction || transaction.trans || '',
        trxref: transaction.trxref || transaction.reference || reference,
        message: transaction.message,
      });
    },
    onCancel: () => {
      options.onCancel();
    },
  });
}

/**
 * Calculate Paystack transaction fees for Nigerian transactions
 * Paystack charges 1.5% + NGN 100 for local Nigerian cards
 * @param amount - Amount in main currency unit (NGN)
 * @returns Transaction fee in main currency unit
 */
export function calculatePaystackFee(amount: number): number {
  // Paystack fee: 1.5% + NGN 100 (capped at NGN 2,000)
  const percentageFee = amount * 0.015;
  const flatFee = 100;
  const totalFee = percentageFee + flatFee;
  
  // Cap at NGN 2,000
  return Math.min(totalFee, 2000);
}

/**
 * Calculate total amount including Paystack fees
 * This ensures the merchant receives the full course price after fees
 * @param coursePrice - Original course price in main currency unit
 * @returns Object with breakdown of charges
 */
export function calculateTotalWithFees(coursePrice: number): {
  coursePrice: number;
  paystackFee: number;
  totalAmount: number;
} {
  // Calculate fee on the course price
  const paystackFee = calculatePaystackFee(coursePrice);
  
  // Total amount user pays = course price + fees
  const totalAmount = coursePrice + paystackFee;
  
  return {
    coursePrice: Math.round(coursePrice * 100) / 100, // Round to 2 decimal places
    paystackFee: Math.round(paystackFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

/**
 * Convert amount to smallest currency unit (kobo for NGN, cents for USD, etc.)
 * @param amount - Amount in main currency unit
 * @returns Amount in smallest currency unit
 */
export function convertToSmallestUnit(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert amount from smallest currency unit to main currency unit
 * @param amount - Amount in smallest currency unit
 * @returns Amount in main currency unit
 */
export function convertFromSmallestUnit(amount: number): number {
  return amount / 100;
}
