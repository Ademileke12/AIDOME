# Course Payment Security - Setup Guide

## 🎯 Overview

This guide will walk you through setting up the complete security system for your course payment platform. Follow these steps in order to ensure maximum security.

## ✅ What You Already Have

Your system already includes:
- ✅ Firestore security rules
- ✅ Cloud Functions for payment verification
- ✅ Client-side access control
- ✅ Real-time trial monitoring
- ✅ Payment modal enforcement

## 🚀 Setup Steps

### Step 1: Configure Paystack Secret Key

The Cloud Functions need your Paystack secret key to verify payment webhooks.

```bash
# Set the Paystack secret key
firebase functions:config:set paystack.secret_key="YOUR_PAYSTACK_SECRET_KEY"

# Verify it was set correctly
firebase functions:config:get
```

**Where to find your Paystack secret key:**
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to Settings → API Keys & Webhooks
3. Copy your **Secret Key** (starts with `sk_`)
4. Use the **Test Secret Key** for testing, **Live Secret Key** for production

### Step 2: Deploy Firestore Security Rules

Deploy the security rules to protect your database.

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# This will deploy the rules from firestore.rules file
```

**Verify deployment:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Rules
4. Verify the rules are updated with the latest timestamp

### Step 3: Install Cloud Functions Dependencies

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 4: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:paystackWebhook
firebase deploy --only functions:getVideoUrl
firebase deploy --only functions:grantCourseAccess
firebase deploy --only functions:revokeCourseAccess
firebase deploy --only functions:logVideoAccess
```

**Expected output:**
```
✔  functions[paystackWebhook(us-central1)] Successful create operation.
✔  functions[getVideoUrl(us-central1)] Successful create operation.
✔  functions[grantCourseAccess(us-central1)] Successful create operation.
✔  functions[revokeCourseAccess(us-central1)] Successful create operation.
✔  functions[logVideoAccess(us-central1)] Successful create operation.
```

**Note the webhook URL** - You'll need it for the next step:
```
https://YOUR_PROJECT_ID.cloudfunctions.net/paystackWebhook
```

### Step 5: Configure Paystack Webhook

Configure Paystack to send payment notifications to your Cloud Function.

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to Settings → API Keys & Webhooks
3. Scroll to **Webhook URL** section
4. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_ID.cloudfunctions.net/paystackWebhook
   ```
5. Click **Save Changes**

**Test the webhook:**
1. In Paystack Dashboard, go to Webhooks section
2. Click **Test Webhook**
3. Check Cloud Function logs: `firebase functions:log`
4. Verify webhook was received and processed

### Step 6: Configure Admin Emails

Set up admin emails for access control.

**Option A: Environment Variables (Recommended)**

Update your `.env` file:
```env
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

**Option B: Firestore Rules**

Edit `firestore.rules` and add admin emails:
```javascript
function isAdmin() {
  return isAuthenticated() && 
         request.auth.token.email in [
           'samuelabudu21@gmail.com',
           'your-admin@example.com'
         ];
}
```

Then redeploy rules:
```bash
firebase deploy --only firestore:rules
```

**Option C: Cloud Functions**

Edit `functions/src/index.ts` and update the `isAdmin` function:
```typescript
function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = [
    'samuelabudu21@gmail.com',
    'your-admin@example.com'
  ];
  return adminEmails.includes(email);
}
```

Then redeploy functions:
```bash
cd functions
npm run build
firebase deploy --only functions
```

### Step 7: Test the Security System

#### Test 1: Trial Expiration

1. Create a test course with 1-minute trial:
   ```javascript
   {
     title: "Test Course",
     isFree: false,
     freeTrialMinutes: 1,
     freeTrialStartDate: new Date(),
     priceAfterTrial: 1000
   }
   ```

2. Access the course (should work)
3. Wait 1 minute
4. Verify access is revoked
5. Verify payment modal appears

#### Test 2: Payment Flow

1. Use Paystack test card:
   ```
   Card Number: 4084 0840 8408 4081
   CVV: 408
   Expiry: Any future date
   PIN: 0000
   OTP: 123456
   ```

2. Complete payment
3. Check Cloud Function logs:
   ```bash
   firebase functions:log --only paystackWebhook
   ```

4. Verify purchase record in Firestore:
   - Collection: `courseAccess`
   - Document ID: `{userId}_{courseId}`

5. Verify access is granted
6. Reload page and verify access persists

#### Test 3: Security Bypass Attempts

1. **LocalStorage Manipulation:**
   - Open DevTools → Application → Local Storage
   - Try to modify trial dates
   - Verify access is still blocked

2. **React State Manipulation:**
   - Open DevTools → Components
   - Try to set `hasAccess = true`
   - Verify video still doesn't load

3. **Direct Firestore Access:**
   - Try to read course data without access
   - Verify Firestore rules block access

### Step 8: Monitor Security

#### Set Up Logging

Monitor Cloud Function logs:
```bash
# View all logs
firebase functions:log

# View specific function logs
firebase functions:log --only paystackWebhook

# Stream logs in real-time
firebase functions:log --follow
```

#### Monitor Firestore

1. Go to Firebase Console → Firestore
2. Check `courseAccess` collection for purchases
3. Check `videoAccessLogs` collection for access attempts
4. Check `accessRevocations` collection for revoked access

#### Set Up Alerts (Optional)

Configure Firebase Alerts:
1. Go to Firebase Console → Alerts
2. Set up alerts for:
   - Function errors
   - High function execution time
   - Unusual access patterns

## 🔧 Troubleshooting

### Issue: Webhook Not Receiving Payments

**Symptoms:**
- Payment completes but access not granted
- No logs in Cloud Functions

**Solutions:**
1. Verify webhook URL in Paystack dashboard
2. Check Cloud Function is deployed:
   ```bash
   firebase functions:list
   ```
3. Test webhook manually in Paystack dashboard
4. Check Cloud Function logs for errors:
   ```bash
   firebase functions:log --only paystackWebhook
   ```

### Issue: Trial Not Expiring

**Symptoms:**
- Trial should expire but user still has access

**Solutions:**
1. Verify `freeTrialStartDate` is set in course document
2. Check trial duration values are correct
3. Verify Firestore rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Check client-side trial calculation in browser console

### Issue: Access Denied After Payment

**Symptoms:**
- Payment successful but user can't access course

**Solutions:**
1. Check `courseAccess` collection for purchase record
2. Verify document ID format: `{userId}_{courseId}`
3. Check Firestore rules allow read access
4. Verify user is signed in with correct account
5. Check Cloud Function logs for webhook processing errors

### Issue: Admin Functions Not Working

**Symptoms:**
- Can't grant/revoke access as admin

**Solutions:**
1. Verify your email is in admin list
2. Check you're signed in with admin account
3. Verify Cloud Functions are deployed
4. Check Cloud Function logs for permission errors

## 📊 Security Checklist

Before going live, verify:

- [ ] Paystack secret key configured
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Webhook URL configured in Paystack
- [ ] Admin emails configured
- [ ] Trial expiration tested
- [ ] Payment flow tested
- [ ] Security bypass attempts tested
- [ ] Monitoring set up
- [ ] Backup plan in place

## 🎯 Production Deployment

### Pre-Launch Checklist

1. **Switch to Live Keys:**
   ```bash
   # Update to live Paystack key
   firebase functions:config:set paystack.secret_key="sk_live_..."
   
   # Redeploy functions
   cd functions
   firebase deploy --only functions
   ```

2. **Update Webhook URL:**
   - Use live webhook URL in Paystack dashboard
   - Test with small real payment

3. **Enable Production Monitoring:**
   - Set up Firebase Alerts
   - Configure error notifications
   - Set up uptime monitoring

4. **Security Audit:**
   - Review all Firestore rules
   - Test all security measures
   - Verify admin access controls

### Post-Launch Monitoring

Monitor these metrics daily:
- Payment success rate
- Trial conversion rate
- Failed access attempts
- Cloud Function errors
- Unusual access patterns

## 📚 Additional Resources

- **Detailed Security Analysis:** `COURSE_SECURITY_IMPLEMENTATION.md`
- **Implementation Status:** `SECURITY_IMPLEMENTATION_SUMMARY.md`
- **Quick Reference:** `SECURITY_QUICK_REFERENCE.md`
- **Firestore Rules:** `firestore.rules`
- **Cloud Functions:** `functions/src/index.ts`

## 🆘 Getting Help

If you encounter issues:

1. Check Cloud Function logs: `firebase functions:log`
2. Review Firestore rules in Firebase Console
3. Test rules using Firestore Rules Simulator
4. Check Paystack webhook logs
5. Review video access logs in Firestore

## ✨ You're Done!

Your course payment security system is now fully configured and ready for production. The system provides enterprise-grade security with multiple layers of protection against unauthorized access.

**Key Security Features:**
- ✅ Server-side trial expiration (cannot be bypassed)
- ✅ Payment verification with webhook signatures
- ✅ Protected purchase records (admin-only write)
- ✅ Real-time access monitoring
- ✅ Comprehensive audit trail
- ✅ Admin access controls

Your paid courses are now secure! 🎉
