# Payment Fees and Tax Calculation Guide

## Overview

The payment system now automatically calculates and includes Paystack transaction fees in the total amount charged to users. This ensures transparency and that the merchant receives the full course price after payment processing fees.

## Fee Structure

### Paystack Transaction Fees (Nigeria)

For Nigerian transactions using local cards:
- **Percentage Fee**: 1.5% of transaction amount
- **Flat Fee**: ₦100
- **Fee Cap**: Maximum of ₦2,000

**Formula**: `Fee = min((Amount × 0.015) + 100, 2000)`

### Examples

1. **Course Price: ₦10,000**
   - Percentage Fee: ₦10,000 × 1.5% = ₦150
   - Flat Fee: ₦100
   - Total Fee: ₦150 + ₦100 = ₦250
   - **Total Charged: ₦10,250**

2. **Course Price: ₦50,000**
   - Percentage Fee: ₦50,000 × 1.5% = ₦750
   - Flat Fee: ₦100
   - Total Fee: ₦750 + ₦100 = ₦850
   - **Total Charged: ₦50,850**

3. **Course Price: ₦200,000**
   - Percentage Fee: ₦200,000 × 1.5% = ₦3,000
   - Flat Fee: ₦100
   - Total Fee: ₦3,100 (capped at ₦2,000)
   - **Total Charged: ₦202,000**

## Implementation

### Functions Added

#### `calculatePaystackFee(amount: number): number`
Calculates the Paystack transaction fee for a given amount.

```typescript
const fee = calculatePaystackFee(10000); // Returns 250
```

#### `calculateTotalWithFees(coursePrice: number)`
Calculates the complete payment breakdown including fees.

```typescript
const breakdown = calculateTotalWithFees(10000);
// Returns:
// {
//   coursePrice: 10000,
//   paystackFee: 250,
//   totalAmount: 10250
// }
```

### Payment Flow

1. **User clicks "Pay with Paystack"**
   - System calculates total amount including fees
   - Displays breakdown to user

2. **Payment Modal Shows**
   - Course Price: Original price set by admin
   - Transaction Fee: Calculated Paystack fee
   - Total Amount: Sum of course price and fees

3. **Payment Processing**
   - User is charged the total amount
   - Paystack deducts their fee
   - Merchant receives the full course price

4. **Purchase Recording**
   - Total amount paid is stored in Firestore
   - Payment reference is saved for tracking

## User Experience

### Payment Modal Display

The payment modal now shows:
- **Course Price**: The base price of the course
- **Transaction Fee**: Paystack processing fee (with info tooltip)
- **Total Amount**: Final amount to be charged

### Transparency

- Users see the exact breakdown before payment
- Info tooltip explains the fee structure
- Blue info box clarifies that fees are included

## Admin Considerations

### Setting Course Prices

When setting course prices in the admin dashboard:
- Set the price you want to receive after fees
- The system automatically adds fees for the user
- Example: Set ₦10,000 → User pays ₦10,250 → You receive ₦10,000

### Price Display

- Course listings show the base price (without fees)
- Payment modal shows the total with fees
- This keeps pricing consistent across the platform

## Testing

### Test Scenarios

1. **Low Price Course (₦5,000)**
   - Fee: ₦175
   - Total: ₦5,175

2. **Medium Price Course (₦25,000)**
   - Fee: ₦475
   - Total: ₦25,475

3. **High Price Course (₦150,000)**
   - Fee: ₦2,000 (capped)
   - Total: ₦152,000

### Verification

To verify fee calculations:
```typescript
import { calculateTotalWithFees } from './services/paystack';

const breakdown = calculateTotalWithFees(yourCoursePrice);
console.log(breakdown);
```

## Notes

- Fees are calculated in real-time when payment modal opens
- All amounts are rounded to 2 decimal places
- Fee calculation is done client-side for immediate display
- Actual payment processing is handled securely by Paystack

## Future Enhancements

Potential additions:
- Support for international card fees (different rate structure)
- VAT calculation for applicable transactions
- Discount code support with fee recalculation
- Bulk purchase discounts

## Support

For questions about payment fees:
- Check Paystack documentation: https://paystack.com/pricing
- Review this guide for calculation details
- Contact support for specific scenarios
