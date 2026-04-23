# Firestore Security Rules Guide

## Overview

This document explains the Firestore security rules implemented for the AI Dome application and how to deploy and test them.

## Security Rules Summary

The security rules enforce the following access control:

### Read Access
- **Requirement**: User must be authenticated
- **Applies to**: All collections (designs, cinematics, courses)
- **Rule**: `allow read: if isAuthenticated()`

### Write Access
- **Requirement**: User must be authenticated AND be an admin
- **Applies to**: All collections (designs, cinematics, courses)
- **Rule**: `allow write: if isAdmin()`

### Admin Verification
Admin status is determined by checking if the authenticated user's email is in the predefined admin list in the security rules.

## Deploying Security Rules to Production

### Step 1: Update Admin Emails
Before deploying, update the admin email list in `firestore.rules`:

```javascript
function isAdmin() {
  return isAuthenticated() && 
         request.auth.token.email in [
           'admin@example.com',
           'your-actual-admin@email.com'
           // Add more admin emails here
         ];
}
```

### Step 2: Deploy Rules to Firebase
Run the following command to deploy the security rules:

```bash
firebase deploy --only firestore:rules
```

### Step 3: Verify Deployment
1. Open Firebase Console: https://console.firebase.google.com
2. Navigate to your project
3. Go to Firestore Database → Rules
4. Verify the rules are updated with the correct timestamp

## Testing Security Rules Locally

### Option 1: Using Firebase Emulator (Recommended)

#### Install Firebase Tools (if not already installed)
```bash
npm install -g firebase-tools
```

#### Start the Emulator
```bash
firebase emulators:start
```

This will start:
- Firestore Emulator on port 8080
- Emulator UI on port 4000

#### Access Emulator UI
Open http://localhost:4000 in your browser to:
- View Firestore data
- Test security rules
- Monitor requests

#### Test Rules in Emulator
1. Navigate to the Firestore tab in the Emulator UI
2. Click on "Rules" to see the active rules
3. Use the "Rules Playground" to test different scenarios:
   - Test read access with authenticated user
   - Test write access with admin user
   - Test write access with non-admin user (should fail)

### Option 2: Using Firebase Console Rules Playground

1. Open Firebase Console: https://console.firebase.google.com
2. Navigate to Firestore Database → Rules
3. Click "Rules Playground" tab
4. Select a collection (e.g., `designs`)
5. Choose operation type (read/write)
6. Set authentication state
7. Run simulation

## Testing Scenarios

### Scenario 1: Authenticated User Reading Data ✅
```
Collection: designs
Operation: get
Auth: Authenticated user (any email)
Expected: Allow
```

### Scenario 2: Unauthenticated User Reading Data ❌
```
Collection: designs
Operation: get
Auth: None
Expected: Deny
```

### Scenario 3: Admin User Writing Data ✅
```
Collection: designs
Operation: create/update/delete
Auth: Authenticated user (admin email)
Expected: Allow
```

### Scenario 4: Non-Admin User Writing Data ❌
```
Collection: designs
Operation: create/update/delete
Auth: Authenticated user (non-admin email)
Expected: Deny
```

## Updating the App to Use Emulator

To test with the emulator locally, update `src/config/firebase.ts`:

```typescript
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// ... existing code ...

const db = getFirestore(app);

// Connect to emulator in development
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { auth, db };
```

## Security Best Practices

### 1. Never Trust Client-Side Checks
The `isAdmin` check in `AuthContext.tsx` is for UI purposes only. The security rules provide the actual enforcement.

### 2. Keep Admin List Updated
Regularly review and update the admin email list in the security rules.

### 3. Use Environment-Specific Rules
Consider using different rules for development and production environments.

### 4. Monitor Access Logs
Regularly check Firebase Console for unauthorized access attempts.

### 5. Test Before Deploying
Always test rules in the emulator or rules playground before deploying to production.

## Troubleshooting

### Issue: Rules not updating after deployment
**Solution**: Clear browser cache and refresh Firebase Console

### Issue: Emulator not starting
**Solution**: 
- Check if ports 8080 and 4000 are available
- Run `firebase emulators:start --only firestore`

### Issue: Permission denied errors in production
**Solution**:
- Verify user is authenticated
- Check if admin email is correctly listed in rules
- Check Firebase Console logs for detailed error messages

### Issue: Rules work in emulator but not in production
**Solution**:
- Ensure rules are deployed: `firebase deploy --only firestore:rules`
- Verify deployment in Firebase Console

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
