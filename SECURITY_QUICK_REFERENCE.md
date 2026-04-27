# Course Payment Security - Quick Reference

## Security Layers Overview

### 🛡️ Layer 1: Firestore Security Rules (Server-Side)
**Location**: `firestore.rules`

**What it does**:
- Validates trial expiration server-side (can't be bypassed by changing system time)
- Restricts course access based on purchase records
- Prevents users from creating fake purchase records
- Protects comments (only accessible to users with course access)

**Key Functions**:
- `isTrialActive(course)` - Server-side trial validation
- `hasPurchasedCourse(userId, courseId)` - Checks purchase record
- `hasAccessToCourse(userId, courseId)` - Complete access validation

### 🔐 Layer 2: Cloud Functions (Payment Verification)
**Location**: `functions/src/index.ts`

**What it does**:
- Verifies Paystack webhook signatures (prevents fake payments)
- Creates purchase records only after confirmed payment
- Generates secure video URLs with access validation
- Provides admin functions for manual access management

**Key Functions**:
- `paystackWebhook` - Processes verified payments
- `getVideoUrl` - Generates secure video URLs
- `grantCourseAccess` - Admin function to grant access
- `revokeCourseAccess` - Admin function to revoke access

### 🎥 Layer 3: Video Protection
**Current**: Videos use public URLs (YouTube, Vimeo, etc.)
**Recommended**: Migrate to Firebase Storage with signed URLs

**Benefits of Firebase Storage**:
- Time-limited access URLs (expire after 1 hour)
- Access validation before URL generation
- Prevents URL sharing
- Better control over content

### 💳 Layer 4: Payment Flow Security
**How it works**:
1. User clicks "Pay Now"
2. Paystack payment modal opens
3. User completes payment
4. Paystack sends webhook to Cloud Function
5. Cloud Function verifies signature
6. Cloud Function creates purchase record
7. Frontend polls for purchase record
8. Access granted when record found

**Security measures**:
- Webhook signature verification
- Server-side purchase record creation
- No client-side access granting
- Audit trail of all payments

## Quick Commands

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Test Security Rules
```bash
npm run test:security
```

### View Function Logs
```bash
firebase functions:log
```

### Configure Paystack Key
```bash
firebase functions:config:set paystack.secret_key="YOUR_SECRET_KEY"
```

## Document Structure

### Course Document
```typescript
{
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  freeTrialDays?: number;
  freeTrialHours?: number;
  freeTrialMinutes?: number;
  freeTrialStartDate?: Date;
  priceAfterTrial?: number;
  currency?: string;
}
```

### Purchase Record (courseAccess)
```typescript
// Document ID: userId_courseId (composite key)
{
  userId: string;
  courseId: string;
  purchaseDate: Date;
  paymentReference: string;
  amount: number;
  currency: string;
  verified: boolean;
}
```

## Access Control Logic

### Free Course
```
isFree === true → Access Granted
```

### Trial Course
```
hasTrial && currentTime < trialExpiration → Access Granted
```

### Paid Course
```
purchaseRecord exists → Access Granted
```

### Combined Logic
```
isFree || isTrialActive || hasPurchase → Access Granted
```

## Security Checklist

### Before Deployment
- [ ] Firestore Security Rules deployed
- [ ] Cloud Functions deployed
- [ ] Paystack webhook configured
- [ ] Payment flow tested
- [ ] Trial expiration tested
- [ ] Security bypass attempts tested

### After Deployment
- [ ] Monitor Cloud Function logs
- [ ] Check Paystack webhook deliveries
- [ ] Review access logs
- [ ] Test with real payment
- [ ] Monitor for suspicious activity

## Common Issues & Solutions

### Issue: Webhook not receiving events
**Solution**: 
1. Check Paystack webhook URL
2. Verify Cloud Function is deployed
3. Check function logs for errors

### Issue: Trial not expiring
**Solution**:
1. Verify `freeTrialStartDate` is set
2. Check Firestore Security Rules
3. Review server time

### Issue: Payment verified but no access
**Solution**:
1. Check `courseAccess` collection
2. Verify document ID format: `userId_courseId`
3. Check function logs

### Issue: User can bypass payment
**Solution**:
1. Verify Firestore Security Rules are deployed
2. Check that purchase records are created by Cloud Functions only
3. Review access validation logic

## Testing Scenarios

### 1. Free Course Access
```
1. Create free course (isFree: true)
2. Sign in as user
3. Access course → Should work
```

### 2. Trial Access
```
1. Create course with 5-minute trial
2. Sign in as user
3. Access course → Should work
4. Wait 5 minutes
5. Try to access → Should show payment modal
```

### 3. Payment Flow
```
1. Create paid course
2. Sign in as user
3. Try to access → Payment modal appears
4. Complete payment
5. Wait for webhook
6. Access granted automatically
```

### 4. Security Bypass Attempts
```
1. Try to modify localStorage
2. Try to change system time
3. Try to access video URL directly
4. Try to create fake purchase record
All should fail ✅
```

## Monitoring Queries

### Check Recent Purchases
```javascript
db.collection('courseAccess')
  .orderBy('purchaseDate', 'desc')
  .limit(10)
  .get()
```

### Check User's Purchases
```javascript
db.collection('courseAccess')
  .where('userId', '==', 'USER_ID')
  .get()
```

### Check Course Purchases
```javascript
db.collection('courseAccess')
  .where('courseId', '==', 'COURSE_ID')
  .get()
```

### Check Video Access Logs
```javascript
db.collection('videoAccessLogs')
  .where('userId', '==', 'USER_ID')
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get()
```

## Admin Functions

### Grant Access Manually
```javascript
const grantAccess = firebase.functions().httpsCallable('grantCourseAccess');
await grantAccess({
  userId: 'USER_ID',
  courseId: 'COURSE_ID',
  reason: 'Promotional access'
});
```

### Revoke Access
```javascript
const revokeAccess = firebase.functions().httpsCallable('revokeCourseAccess');
await revokeAccess({
  userId: 'USER_ID',
  courseId: 'COURSE_ID',
  reason: 'Refund requested'
});
```

## Security Best Practices

1. ✅ **Always validate server-side** - Never trust client
2. ✅ **Use webhooks** - Verify payments server-side
3. ✅ **Log everything** - Monitor for suspicious activity
4. ✅ **Use signed URLs** - Prevent video URL sharing
5. ✅ **Implement rate limiting** - Prevent brute force
6. ✅ **Regular audits** - Review logs and test security
7. ✅ **Keep updated** - Patch vulnerabilities quickly
8. ✅ **HTTPS only** - Never use HTTP

## Support Resources

- **Firebase Console**: https://console.firebase.google.com
- **Paystack Dashboard**: https://dashboard.paystack.com
- **Security Rules Docs**: https://firebase.google.com/docs/rules
- **Cloud Functions Docs**: https://firebase.google.com/docs/functions
- **Paystack Webhooks**: https://paystack.com/docs/payments/webhooks

## Emergency Procedures

### If Security Breach Detected:
1. Immediately revoke all active tokens
2. Force re-authentication for all users
3. Investigate breach source
4. Patch vulnerability
5. Notify affected users
6. Document incident
7. Update security measures

### If Payment Issues:
1. Check Paystack webhook logs
2. Review Cloud Function logs
3. Verify webhook signature
4. Check purchase records
5. Contact Paystack support if needed

## Version History

- **v1.0** - Initial security implementation
  - Enhanced Firestore Security Rules
  - Cloud Functions for payment verification
  - Composite document IDs for efficient access checks
  - Server-side trial validation
  - Webhook signature verification
