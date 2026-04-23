# Firebase Hosting Fix

## Problem
The error `ai-dome-d2561.firebaseapp.com refused to connect` means Firebase Hosting is not enabled for your project.

## Solution: Enable Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```

When prompted:
- Select your existing project: `ai-dome-d2561`
- What do you want to use as your public directory? **dist**
- Configure as a single-page app? **Yes**
- Set up automatic builds and deploys with GitHub? **No**

### Step 4: Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Step 5: Verify
After deployment, visit: https://ai-dome-d2561.firebaseapp.com

It should now load properly!

### Step 6: Restart Dev Server
```bash
npm run dev
```

Now try signing in again - it should work!

---

## Alternative: Quick Test Without Hosting

If you want to test authentication immediately without setting up hosting, you can temporarily use a workaround by checking if Google Sign-In is properly configured in Firebase Console:

1. Go to: https://console.firebase.google.com/project/ai-dome-d2561/authentication/providers
2. Make sure "Google" is **Enabled**
3. Make sure your support email is selected

The hosting domain is used by Firebase for OAuth redirects, so it needs to be accessible.
