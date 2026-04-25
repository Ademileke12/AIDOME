# QUICK FIX: Comments Not Showing

## The Problem
Users can post comments on free courses, but the comments don't appear after posting.

## The Cause
**Missing Firestore Index** - The comments query requires a composite index that hasn't been created yet.

## The Fix (Choose ONE method)

### Method 1: Automatic (Easiest - 2 minutes)
1. Open your app in browser
2. Open browser console (Press F12)
3. Navigate to any course page
4. Look for this error:
   ```
   The query requires an index. You can create it here: https://console.firebase.google.com/...
   ```
5. **Click the link** in the error
6. Click "Create Index" button
7. Wait 1-2 minutes
8. Refresh your app
9. ✅ Comments should now appear!

### Method 2: Firebase CLI (If you have it installed)
```bash
firebase deploy --only firestore:indexes
```
Wait 1-2 minutes, then refresh your app.

### Method 3: Manual (If link doesn't appear)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Firestore Database → Indexes tab
4. Click "Create Index"
5. Set:
   - Collection: `comments`
   - Field 1: `courseId` (Ascending)
   - Field 2: `timestamp` (Descending)
6. Click "Create"
7. Wait 1-2 minutes
8. Refresh your app

## How to Verify It's Fixed

After creating the index, open browser console and you should see:
```
🔍 Setting up comments listener for course: c1
📦 Received snapshot with 3 documents
✅ Processed comments: [...]
```

Comments will now be visible on the page!

## Why This Happened

Firestore requires indexes for queries that filter AND sort by different fields. Our query:
- Filters by `courseId`
- Sorts by `timestamp`

This is normal Firestore behavior, not a bug. You only need to create the index once.

## Still Not Working?

If comments still don't show after creating the index:
1. Wait 5 minutes (large datasets take longer)
2. Check Firebase Console → Indexes → Status should be "Enabled"
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache

---

**TL;DR**: Click the error link in browser console to create the index, wait 2 minutes, refresh. Done!
