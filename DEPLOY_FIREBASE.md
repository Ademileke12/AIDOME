# Deploy to Firebase Hosting - Fix Authentication

## Why This Is Needed
The authentication error happens because `ai-dome-d2561.firebaseapp.com` doesn't exist yet. Firebase uses this domain for OAuth redirects, so we need to deploy your app to Firebase Hosting.

## Steps to Deploy

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```
This will open a browser window for you to sign in with your Google account.

### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

This will:
- Upload your built app to Firebase Hosting
- Make `ai-dome-d2561.firebaseapp.com` accessible
- Fix the authentication redirect issue

### 4. Verify Deployment
After deployment completes, you should see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/ai-dome-d2561/overview
Hosting URL: https://ai-dome-d2561.firebaseapp.com
```

Visit the Hosting URL to verify it's working.

### 5. Test Authentication Locally
Now restart your local dev server:
```bash
npm run dev
```

Click "Sign In" - it should now work because the Firebase auth domain is accessible!

---

## What We've Already Done

✅ Created `firebase.json` - Firebase Hosting configuration
✅ Created `.firebaserc` - Links to your Firebase project
✅ Built your app (`npm run build`) - Created the `dist` folder

## What You Need to Do

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy: `firebase deploy --only hosting`
4. Test locally: `npm run dev` and click "Sign In"

---

## Alternative: Test Without Deployment

If you don't want to deploy yet, you can test authentication by temporarily using a different approach. However, deploying is the proper solution and only takes a few minutes.

## Troubleshooting

### "Firebase CLI not found"
Make sure you installed it globally:
```bash
npm install -g firebase-tools
```

### "Permission denied"
You may need to use sudo on Mac/Linux:
```bash
sudo npm install -g firebase-tools
```

### "Not logged in"
Run:
```bash
firebase login
```

### "Project not found"
The `.firebaserc` file should contain your project ID. It's already configured correctly.

---

## After Deployment

Once deployed, your authentication will work both:
- On Firebase Hosting: `https://ai-dome-d2561.firebaseapp.com`
- Locally: `http://localhost:3000`

The Firebase auth domain just needs to be accessible for OAuth redirects to work.
