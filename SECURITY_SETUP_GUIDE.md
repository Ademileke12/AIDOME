# Course Payment Security - Setup Guide

## Overview
This guide walks you through setting up comprehensive security for your course payment system to prevent unauthorized access and payment bypass attempts.

## Prerequisites
- Firebase project set up
- Paystack account with API keys
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Deploy Enhanced Firestore Security Rules

### 1.1 Review the Rules
The enhanced `firestore.rules` file includes:
- Server-side trial expiration validation
- Purchase verification before granting access
- Protected comment access (only for users with course access)
- Audit trail protection (purchase records can't be modified)

### 1.2 Deploy the Rules
```bash
firebase deploy --only firestore:rules
```

### 1.3 Test the Rules
```bash
# Run the security rules test script
npm run test:security
```

## Step 2: Set Up Cloud Functions

### 2.1 Initialize Functions (if not already done)
```bash
firebase init functions
# Select TypeScript
# Install dependencies
```

### 2.2 Install Dependencies
```bash
cd functions
npm install
```

### 2.3 Configure Paystack Secret Key
```bash
firebase functions:config:set paystack.secret_key="YOUR_PAYSTACK_SECRET_KEY"
```

To get your Paystack secret key:
1. Log in to your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your Secret Key (starts with `sk_`)

### 2.4 Deploy Cloud Functions
```bash
# From project root
firebase deploy --only functions
```

This will deploy:
- `paystackWebhook` - Verifies and processes payment webhooks
- `getVideoUrl` - Generates secure video URLs with access validation
- `grantCourseAccess` - Admin function to manually grant access
- `revokeCourseAccess` - Admin function to revoke access
- `logVideoAccess` - Logs video viewing for security monitoring

## Step 3: Configure Paystack Webhooks

### 3.1 Get Your Cloud Function URL
After deploying, you'll see URLs like:
```
https://us-central1-YOUR-PROJECT.cloudfunctions.net/paystackWebhook
```

### 3.2 Add Webhook to Paystack
1. Log in to Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Click "Add Webhook URL"
4. Enter your Cloud Function URL
5. Save

### 3.3 Test the Webhook
Paystack provides a webhook testing tool in the dashboard. Test with a `charge.success` event.

## Step 4: Update Frontend Code

### 4.1 Update Payment Success Handler
The payment modal should wait for webhook confirmation instead of immediately granting access.

```typescript
// In PaymentModal.tsx
const handlePaymentSuccess = async (reference: string) => {
  // Show loading state
  setVerifying(true);
  
  // Poll for purchase record (created by webhook)
  const maxAttempts = 30; // 30 seconds
  for (let i = 0; i < maxAttempts; i++) {
    const hasAccess = await checkCourseAccess(user.uid, course.id);
    if (hasAccess) {
      onSuccess();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Timeout - show error
  showError('Payment verification taking longer than expected. Please refresh the page.');
};
```

### 4.2 Update Course Access Check
Ensure the frontend respects the server-side access validation:

```typescript
// In CoursePage.tsx
useEffect(() => {
  const checkAccess = async () => {
    if (!user || !course) return;
    
    // Check access via Firestore (respects security rules)
    const hasAccess = await checkCourseAccess(user.uid, course.id);
    setHasAccess(hasAccess);
    
    if (!hasAccess && !course.isFree && !isTrialActive(course)) {
      setShowPaymentModal(true);
    }
  };
  
  checkAccess();
}, [user, course]);
```

## Step 5: Secure Video Delivery (Optional but Recommended)

### 5.1 Migrate Videos to Firebase Storage
Instead of storing public video URLs, upload videos to Firebase Storage:

```bash
# Upload videos to Firebase Storage
firebase storage:upload video.mp4 /courses/course-id/video.mp4
```

### 5.2 Update Storage Security Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{courseId}/{allPaths=**} {
      // Only allow read if user has access to the course
      allow read: if request.auth != null && 
                     firestore.exists(/databases/(default)/documents/courseAccess/$(request.auth.uid + '_' + courseId));
    }
  }
}
```

### 5.3 Generate Signed URLs
Update the `getVideoUrl` Cloud Function to generate signed URLs:

```typescript
// In functions/src/index.ts
const bucket = admin.storage().bucket();
const file = bucket.file(`courses/${courseId}/video.mp4`);

const [url] = await file.getSignedUrl({
  action: 'read',
  expires: Date.now() + 3600000, // 1 hour
});

return { videoUrl: url, expiresAt: Date.now() + 3600000 };
```

## Step 6: Testing

### 6.1 Test Free Course Access
1. Create a free course
2. Sign in as a regular user
3. Verify you can access the video

### 6.2 Test Trial Access
1. Create a course with a 5-minute trial
2. Sign in as a regular user
3. Verify you can access during trial
4. Wait 5 minutes
5. Verify access is denied after trial expires

### 6.3 Test Payment Flow
1. Create a paid course
2. Sign in as a regular user
3. Attempt to access (should show payment modal)
4. Complete payment with Paystack test card
5. Verify webhook is received
6. Verify access is granted

### 6.4 Test Security Bypass Attempts
1. Try to modify localStorage to fake payment
2. Try to modify system time to extend trial
3. Try to access video URL directly
4. Try to create fake purchase record in Firestore
5. All attempts should fail

## Step 7: Monitoring

### 7.1 Set Up Logging
Monitor Cloud Function logs:
```bash
firebase functions:log
```

### 7.2 Create Alerts
Set up Firebase Alerts for:
- Failed payment verifications
- Unusual access patterns
- Multiple failed access attempts

### 7.3 Review Access Logs
Regularly review the `videoAccessLogs` collection for suspicious activity.

## Step 8: Production Checklist

Before going live, ensure:

- [ ] Firestore Security Rules deployed
- [ ] Cloud Functions deployed
- [ ] Paystack webhook configured and tested
- [ ] Payment flow tested end-to-end
- [ ] Trial expiration tested
- [ ] Security bypass attempts tested and blocked
- [ ] Error handling implemented
- [ ] Monitoring and alerts configured
- [ ] Backup and recovery plan in place
- [ ] Documentation updated

## Troubleshooting

### Webhook Not Receiving Events
- Check Paystack webhook URL is correct
- Verify Cloud Function is deployed
- Check Cloud Function logs for errors
- Test webhook from Paystack dashboard

### Trial Not Expiring
- Verify `freeTrialStartDate` is set in Firestore
- Check server time vs. client time
- Review Firestore Security Rules logs

### Payment Verified But No Access
- Check `courseAccess` collection for purchase record
- Verify document ID format: `userId_courseId`
- Check Cloud Function logs for errors
- Verify Firestore Security Rules allow read access

### Videos Not Loading
- Check video URL is valid
- Verify user has access (check `courseAccess`)
- Review browser console for errors
- Check Firebase Storage rules if using Storage

## Security Best Practices

1. **Never trust client-side validation** - Always validate on server
2. **Use webhooks for payment verification** - Don't trust client payment status
3. **Implement rate limiting** - Prevent brute force attempts
4. **Log all access attempts** - Monitor for suspicious activity
5. **Use signed URLs for videos** - Prevent URL sharing
6. **Regular security audits** - Review logs and test security
7. **Keep dependencies updated** - Patch security vulnerabilities
8. **Implement HTTPS only** - Never use HTTP for sensitive data

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review Paystack webhook logs
3. Check browser console for errors
4. Review this documentation
5. Contact support if needed

## Next Steps

After completing this setup:
1. Test thoroughly in development
2. Deploy to staging environment
3. Conduct security audit
4. Deploy to production
5. Monitor for first 48 hours
6. Gather user feedback
7. Iterate and improve

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Paystack Webhook Documentation](https://paystack.com/docs/payments/webhooks)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Storage Security](https://firebase.google.com/docs/storage/security)
- [OWASP Security Guidelines](https://owasp.org/)
