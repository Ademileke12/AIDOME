# Paystack Integration Guide

## Overview

This guide provides step-by-step instructions for integrating Paystack payment processing into the AI Dome course platform.

## Prerequisites

1. Paystack account (sign up at https://paystack.com)
2. Verified business information
3. Test and live API keys from Paystack dashboard

## Setup Steps

### 1. Install Paystack Package

```bash
npm install @paystack/inline-js
```

### 2. Add Environment Variables

Add to `.env`:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

For production, use live key:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### 3. Create Paystack Service

Create `src/services/paystack.ts`:

```typescript
import { PaystackPop } from '@paystack/inline-js';

interface PaymentConfig {
  email: string;
  amount: number; // in kobo (multiply by 100)
  currency: string;
  ref: string;
  onSuccess: (reference: any) => void;
  onCancel: () => void;
}

export const initializePayment = (config: PaymentConfig) => {
  const paystack = new PaystackPop();
  
  paystack.newTransaction({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo
    currency: config.currency,
    ref: config.ref,
    onSuccess: (transaction) => {
      config.onSuccess(transaction);
    },
    onCancel: () => {
      config.onCancel();
    },
  });
};

export const generatePaymentReference = () => {
  return `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

### 4. Payment Flow Implementation

```typescript
// In PaymentModal component
import { initializePayment, generatePaymentReference } from '../services/paystack';
import { recordCoursePurchase } from '../services/firestore';

const handlePayment = () => {
  const reference = generatePaymentReference();
  
  initializePayment({
    email: user.email,
    amount: course.priceAfterTrial || 0,
    currency: course.currency || 'NGN',
    ref: reference,
    onSuccess: async (transaction) => {
      // Record purchase in Firestore
      await recordCoursePurchase({
        userId: user.uid,
        courseId: course.id,
        purchaseDate: new Date(),
        paymentReference: transaction.reference,
        amount: course.priceAfterTrial || 0,
      });
      
      // Show success message
      toast.success('Payment successful! You now have lifetime access.');
      
      // Close modal and grant access
      onSuccess();
    },
    onCancel: () => {
      toast.info('Payment cancelled');
    },
  });
};
```

## Currency Support

Paystack supports multiple currencies:
- NGN (Nigerian Naira) - default
- USD (US Dollar)
- GHS (Ghanaian Cedi)
- ZAR (South African Rand)
- KES (Kenyan Shilling)

## Amount Formatting

Paystack expects amounts in the smallest currency unit:
- NGN: kobo (1 Naira = 100 kobo)
- USD: cents (1 Dollar = 100 cents)

Always multiply by 100 before sending to Paystack:
```typescript
amount: course.priceAfterTrial * 100
```

## Test Cards

Use these test cards during development:

### Successful Payment
- Card: 4084 0840 8408 4081
- CVV: 408
- Expiry: Any future date
- PIN: 0000
- OTP: 123456

### Failed Payment
- Card: 5060 6666 6666 6666 4
- CVV: 123
- Expiry: Any future date

### Insufficient Funds
- Card: 5060 6666 6666 6666 6
- CVV: 123
- Expiry: Any future date

## Payment Verification

For production, implement server-side verification:

```typescript
// Backend endpoint (optional but recommended)
app.post('/verify-payment', async (req, res) => {
  const { reference } = req.body;
  
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (data.data.status === 'success') {
    // Payment verified, grant access
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});
```

## Error Handling

Common errors and solutions:

### 1. Invalid Public Key
```
Error: Invalid public key
```
**Solution:** Check that VITE_PAYSTACK_PUBLIC_KEY is set correctly in .env

### 2. Amount Too Small
```
Error: Amount must be at least 100
```
**Solution:** Ensure amount is at least 1.00 (100 kobo/cents)

### 3. Invalid Email
```
Error: Invalid email address
```
**Solution:** Validate user email before initializing payment

### 4. Network Error
```
Error: Network request failed
```
**Solution:** Check internet connection, retry payment

## Security Best Practices

1. **Never expose secret key** - Only use public key in frontend
2. **Verify payments server-side** - Don't trust client-side verification alone
3. **Use HTTPS** - Always use secure connections in production
4. **Validate amounts** - Check amounts match on server before granting access
5. **Store references** - Keep payment references for dispute resolution
6. **Implement webhooks** - Use Paystack webhooks for real-time payment updates

## Webhooks (Optional but Recommended)

Set up webhooks in Paystack dashboard to receive payment notifications:

```typescript
// Backend webhook endpoint
app.post('/paystack-webhook', async (req, res) => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      // Payment successful, grant access
      await grantCourseAccess(event.data);
    }
    
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});
```

## Testing Checklist

- [ ] Test successful payment with test card
- [ ] Test failed payment scenario
- [ ] Test payment cancellation
- [ ] Test amount formatting (kobo/cents conversion)
- [ ] Test different currencies
- [ ] Test payment reference generation
- [ ] Test purchase recording in Firestore
- [ ] Test access grant after payment
- [ ] Test duplicate payment prevention
- [ ] Test error handling and user feedback

## Production Checklist

- [ ] Replace test key with live key
- [ ] Implement server-side payment verification
- [ ] Set up webhooks in Paystack dashboard
- [ ] Test with real card (small amount)
- [ ] Implement refund handling
- [ ] Set up payment monitoring/alerts
- [ ] Add payment receipt generation
- [ ] Implement customer support for payment issues
- [ ] Test in production environment
- [ ] Monitor first few transactions closely

## Support Resources

- Paystack Documentation: https://paystack.com/docs
- Paystack API Reference: https://paystack.com/docs/api
- Paystack Support: support@paystack.com
- Paystack Status: https://status.paystack.com

## Common Issues

### Issue: Payment popup blocked by browser
**Solution:** Ensure payment is triggered by user action (button click), not automatically

### Issue: Payment succeeds but access not granted
**Solution:** Check Firestore security rules, verify purchase recording logic

### Issue: Multiple payments for same course
**Solution:** Check if user already has access before showing payment modal

### Issue: Currency mismatch
**Solution:** Ensure currency in Paystack matches currency stored in course data

## Example Implementation

See `src/components/PaymentModal.tsx` for complete implementation example.

## Next Steps

After implementing Paystack:
1. Test thoroughly with test cards
2. Implement purchase history page
3. Add receipt generation
4. Set up email notifications
5. Implement refund handling
6. Add analytics tracking
7. Monitor payment success rates
