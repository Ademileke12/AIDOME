# Quick Firebase Setup Guide

## Step 1: Create Firebase Project (if not done)

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: `ai-dome` (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Web App

1. In Firebase Console, click the web icon `</>` to add a web app
2. Enter app nickname: "AI Dome Web"
3. Click "Register app"
4. **Copy the config values** - you'll need these for `.env`

## Step 3: Enable Google Authentication

1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Google" in the providers list
5. Toggle "Enable" to ON
6. Select your email as support email
7. Click "Save"

## Step 4: Create Firestore Database

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (closest to you)
5. Click "Enable"

## Step 5: Update .env File

Replace the values in your `.env` file with the actual values from Step 2:

```env
VITE_FIREBASE_API_KEY="your_actual_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_actual_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_actual_sender_id"
VITE_FIREBASE_APP_ID="your_actual_app_id"
VITE_ADMIN_EMAILS="your_email@gmail.com"
```

## Step 6: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 7: Test Authentication

1. Open http://localhost:3000
2. Click "Sign In" in navbar
3. Google popup should appear
4. Sign in with your Google account
5. You should be authenticated!

## Troubleshooting

### Error: auth/configuration-not-found
- Make sure Google Authentication is enabled in Firebase Console
- Restart your dev server after enabling

### Error: auth/unauthorized-domain
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add `localhost` to the list

### Error: auth/popup-blocked
- Allow popups in your browser for localhost

## Next Steps

After authentication works:

1. Run the migration script to populate Firestore:
   ```bash
   npm run migrate
   ```

2. Test the pages:
   - Gallery should load designs from Firestore
   - Cinematic should load cinematics from Firestore
   - Learn should load courses from Firestore

3. Add your email to `VITE_ADMIN_EMAILS` to access admin dashboard
