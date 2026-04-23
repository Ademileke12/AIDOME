# Database Setup Guide

## Problem
You're getting "Failed to create course in database" because the Firestore collections haven't been initialized yet.

## Solution: Run Data Migration

Follow these steps to set up your Firestore database:

### Step 1: Temporarily Update Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ai-dome-d2561`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the current rules with these TEMPORARY rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY - Allow all reads and writes for initial setup
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

### Step 2: Run the Migration Script

In your terminal, run:

```bash
npm run migrate
```

This will:
- Create the `designs`, `cinematics`, and `courses` collections
- Populate them with data from `src/data.ts`
- Add the `videoUrl` field to all courses

You should see output like:
```
🔧 Initializing Firebase...
✅ Firebase initialized successfully

📊 Starting data migration...

📝 Migrating X designs...
✅ Queued X designs for migration

🎬 Migrating X cinematic images...
✅ Queued X cinematic images for migration

📚 Migrating X courses...
✅ Queued X courses for migration

💾 Committing operations to Firestore...
✅ Batch commit successful!

🎉 Migration completed successfully!
```

### Step 3: Restore Secure Rules

After migration completes, go back to Firebase Console and replace the rules with these SECURE rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is an admin
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.email in [
               'samuelabudu21@gmail.com'
               // Add more admin emails here as needed
             ];
    }
    
    // Rules for designs collection
    match /designs/{designId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Rules for cinematics collection
    match /cinematics/{cinematicId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Rules for courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

Click **Publish**

### Step 4: Test Your Admin Dashboard

1. Start your dev server: `npm run dev`
2. Sign in with `samuelabudu21@gmail.com`
3. Navigate to the Admin Dashboard
4. Try creating, editing, or deleting content

Everything should work now!

---

## Alternative: Use Firebase Admin SDK (Advanced)

If you prefer not to temporarily open the security rules, you can use the Firebase Admin SDK which bypasses security rules. However, this requires:
- A service account key from Firebase
- Running the migration script with admin privileges
- More complex setup

For initial setup, the temporary rules approach above is simpler and safer.

---

## Troubleshooting

### Error: "Missing required environment variables"
- Check that your `.env` file exists
- Verify all Firebase variables are set correctly

### Error: "permission-denied"
- Make sure you've updated the security rules to allow writes
- Verify the rules are published in Firebase Console

### Error: "not-found"
- Ensure Firestore database is created in Firebase Console
- Go to Firestore Database and click "Create database" if needed

### Migration runs but data doesn't appear
- Check Firebase Console → Firestore Database
- Look for the `designs`, `cinematics`, and `courses` collections
- Verify documents are present in each collection

---

## What Gets Created

After migration, you'll have:

### designs collection
- All design items from `src/data.ts`
- Fields: title, category, image, isPremium, prompt

### cinematics collection
- All cinematic images from `src/data.ts`
- Fields: title, image, prompt, colors, lighting

### courses collection
- All courses from `src/data.ts`
- Fields: title, description, modules, isFree, videoUrl (empty initially)

---

## Next Steps

After successful migration:
1. ✅ Restore secure Firestore rules
2. ✅ Test admin CRUD operations
3. ✅ Add video URLs to courses
4. ✅ Test X (Twitter) video embeds
5. ✅ Deploy to production
