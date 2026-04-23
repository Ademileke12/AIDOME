# Firebase Setup Guide

This guide walks you through setting up Firebase for the AI Dome portfolio website authentication and content management system.

## Prerequisites

- A Google account
- Access to the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "ai-dome-portfolio")
4. (Optional) Enable Google Analytics if desired
5. Click "Create project" and wait for it to be created
6. Click "Continue" when the project is ready

## Step 2: Register Your Web App

1. In the Firebase Console, click the web icon (</>) to add a web app
2. Enter an app nickname (e.g., "AI Dome Web App")
3. Check "Also set up Firebase Hosting" if you plan to use Firebase Hosting
4. Click "Register app"
5. Copy the Firebase configuration values - you'll need these for your `.env` file:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
6. Click "Continue to console"

## Step 3: Enable Google Authentication

1. In the Firebase Console, navigate to "Authentication" in the left sidebar
2. Click "Get started" if this is your first time
3. Click on the "Sign-in method" tab
4. Click on "Google" in the providers list
5. Toggle the "Enable" switch to ON
6. Select a support email from the dropdown (your Google account email)
7. Click "Save"

## Step 4: Create Firestore Database

1. In the Firebase Console, navigate to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (we'll add security rules later)
4. Select a Cloud Firestore location (choose one closest to your users)
5. Click "Enable"
6. Wait for the database to be created

## Step 5: Create Firestore Collections

Once your Firestore database is created, you need to create three collections:

### Create "designs" Collection
1. Click "Start collection"
2. Enter collection ID: `designs`
3. Click "Next"
4. For the first document, you can add a placeholder or skip (we'll populate via migration script)
5. Click "Save"

### Create "cinematics" Collection
1. Click "Start collection"
2. Enter collection ID: `cinematics`
3. Click "Next"
4. Add a placeholder document or skip
5. Click "Save"

### Create "courses" Collection
1. Click "Start collection"
2. Enter collection ID: `courses`
3. Click "Next"
4. Add a placeholder document or skip
5. Click "Save"

## Step 6: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY="your_actual_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_actual_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_actual_sender_id"
VITE_FIREBASE_APP_ID="your_actual_app_id"
VITE_ADMIN_EMAILS="your_admin_email@gmail.com"
```

3. Update `VITE_ADMIN_EMAILS` with the email address(es) that should have admin access
   - Use comma-separated values for multiple admins: `"admin1@gmail.com,admin2@gmail.com"`

## Step 7: Set Up Firestore Security Rules (Later)

For now, we're using test mode which allows all reads and writes. In a later task, we'll configure proper security rules that:
- Allow read access to all authenticated users
- Allow write access only to admin users

The security rules will be configured in Task 17 of the implementation plan.

## Step 8: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any Firebase initialization errors
3. If everything is configured correctly, you should see no Firebase-related errors

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Double-check that your `VITE_FIREBASE_API_KEY` is correct
- Make sure there are no extra spaces or quotes in the `.env` file

### "Firebase: Error (auth/project-not-found)"
- Verify your `VITE_FIREBASE_PROJECT_ID` matches your Firebase project
- Check that the project exists in the Firebase Console

### "Missing or insufficient permissions"
- Make sure Firestore is in test mode for development
- Check that the collections are created correctly

### Environment variables not loading
- Make sure the `.env` file is in the project root
- Restart your development server after changing `.env` values
- Vite requires the `VITE_` prefix for environment variables to be exposed to the client

## Next Steps

After completing this setup:
1. The Firebase SDK is installed and configured
2. Google Authentication is enabled
3. Firestore database is created with the required collections
4. Environment variables are configured

You're now ready to proceed with Task 2: Implementing the Authentication Context and Google OAuth flow.

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Cloud Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
