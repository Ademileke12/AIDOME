# Course Security - Quick Reference

## ✅ Security Measures Already Implemented

### 1. Firestore Security Rules
**Location:** `firestore.rules`

**Protection:**
- ✅ Trial expiration calculated server-side using `request.time`
- ✅ Purchase verification through `courseAccess` collection
- ✅ Only admins can create purchase records
- ✅ Comments restricted to users with course access
- ✅ Purchase records cannot be updated/deleted (audit trail)

### 2. Cloud Functions
**Location:** `functions/src/index.ts`

**Functions:**
- ✅ `paystackWebhook` - Verifies payment and creates purchase records
- ✅ `getVideoUrl` - Generates secure video URLs with access validation
- ✅ `grantCourseAccess` - Admin function to manually grant access
- ✅ `revokeCourseAccess` - Admin function to revoke access
- ✅ `logVideoAccess` - Logs video access for monitoring

**Security Features:**
- ✅ Webhook signature verification
- ✅ Server-side access validation
- ✅ Admin-only functions
- ✅ Access logging for monitoring

### 3. Client-Side Protection
**Location:** `src/pages/CoursePage.tsx`

**Features:**
- ✅ Real-time trial expiration monitoring (every second)
- ✅ Purchase status verification before rendering content
- ✅ Payment modal enforcement for expired trials
- ✅ Video player conditional rendering
- ✅ Comments hidden without access

## 🔒 How It Works

### Payment Flow
```
1. User clicks "Purchase" → PaymentModal opens
2. User completes payment on Paystack
3. Paystack sends webhook to Cloud Function
4. Cloud Function verifies signature
5. Cloud Function creates courseAccess record
6. Client detects access and unlocks content
```

### Access Validation Flow
```
1. User visits course page
2. Client checks: isFree? → Grant access
3. Client checks: Trial active? → Grant access
4. Client checks: Purchase exists? → Grant access
5. If all fail → Show payment modal
```

### Trial Expiration Flow
```
1. Every second, client checks trial status
2. If trial expires while watching:
   - Check for purchase
   - If no purchase: Revoke access + Show payment modal
   - If purchased: Continue access
```

## 🛡️ Attack Vectors Mitigated

### ❌ LocalStorage Manipulation
**Attack:** User modifies localStorage to fake trial dates

**Defense:**
- All access decisions made server-side
- Trial expiration calculated using `request.time`
- Purchase records stored in protected collection

### ❌ Browser DevTools Manipulation
**Attack:** User modifies React state to show content

**Defense:**
- Firestore rules block data access without valid access
- Comments require course access verification
- Real-time access checks every second

### ❌ Payment Webhook Spoofing
**Attack:** Attacker sends fake payment confirmation

**Defense:**
- Webhook signature verification
- Only Cloud Functions can create purchase records
- Payment verification with Paystack API

### ❌ Direct Video URL Access
**Attack:** User copies video URL and accesses directly

**Current Status:** ⚠️ Partially vulnerable (URLs in Firestore)

**Mitigation:**
- Use `getVideoUrl` Cloud Function for access validation
- Move videos to Firebase Storage (recommended)
- Generate signed URLs with expiration

## 📋 Deployment Checklist

### 1. Configure Paystack Secret
```bash
firebase functions:config:set paystack.secret_key="YOUR_SECRET_KEY"
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 4. Configure Paystack Webhook
1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://YOUR_PROJECT.cloudfunctions.net/paystackWebhook`
3. Save webhook URL

### 5. Test Security
```bash
# Test Firestore rules
npm run test:security

# Test payment flow
# 1. Create test course with trial
# 2. Wait for trial to expire
# 3. Verify access is revoked
# 4. Complete test payment
# 5. Verify access is granted
```

## 🚨 Security Monitoring

### Metrics to Monitor
- Failed access attempts
- Trial conversion rate
- Payment success rate
- Suspicious access patterns
- Video URL direct access attempts

### Logs to Review
- Cloud Function logs: `firebase functions:log`
- Firestore audit logs
- Payment webhook logs
- Video access logs

## 🔧 Troubleshooting

### Issue: User can't access after payment
**Check:**
1. Verify webhook was received: `firebase functions:log`
2. Check courseAccess collection for purchase record
3. Verify userId and courseId match
4. Check Firestore rules are deployed

### Issue: Trial not expiring
**Check:**
1. Verify freeTrialStartDate is set
2. Check trial duration values
3. Verify Firestore rules are deployed
4. Check client-side trial calculation

### Issue: Payment webhook failing
**Check:**
1. Verify Paystack secret is configured
2. Check webhook signature verification
3. Review Cloud Function logs
4. Verify webhook URL in Paystack dashboard

## 📞 Support

- Firebase Console: https://console.firebase.google.com
- Paystack Dashboard: https://dashboard.paystack.com
- Cloud Functions Logs: `firebase functions:log`
- Firestore Rules Test: Firebase Console → Firestore → Rules → Simulator

## 🎯 Next Steps

### Immediate
- [x] Firestore security rules deployed
- [x] Cloud Functions deployed
- [x] Paystack webhook configured
- [ ] Test complete payment flow
- [ ] Monitor for security issues

### Short Term
- [ ] Move videos to Firebase Storage
- [ ] Implement signed URLs
- [ ] Add device fingerprinting
- [ ] Set up monitoring alerts

### Long Term
- [ ] Implement concurrent session detection
- [ ] Add IP-based access logging
- [ ] Set up automated security audits
- [ ] Implement rate limiting
