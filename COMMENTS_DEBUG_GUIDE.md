# Comments Not Displaying - Debug Guide

## Issue
User comments are not displaying under course videos on the CoursePage.

## Possible Causes

### 1. **User doesn't have access to the course**
The comments section is only rendered when `hasAccess === true`. Check:
- Is the course free? (`isFree: true`)
- Does the course have an active free trial?
- Has the user purchased the course?

**Debug Steps:**
1. Open browser console
2. Look for log: `🎬 Rendering Comments component for courseId:`
3. If you see: `⚠️ Comments hidden - User does not have access` - the user needs access first

### 2. **Firestore Index Missing**
The comments query uses `orderBy('timestamp', 'desc')` which requires a composite index.

**Symptoms:**
- Console error: `The query requires an index`
- Error message contains a link to create the index

**Fix:**
1. Check browser console for error with link
2. Click the link to auto-create the index in Firebase Console
3. Wait 1-2 minutes for index to build
4. Refresh the page

**Manual Index Creation:**
1. Go to Firebase Console → Firestore → Indexes
2. Create composite index:
   - Collection: `comments`
   - Fields: 
     - `courseId` (Ascending)
     - `timestamp` (Descending)
   - Query scope: Collection

### 3. **No Comments Exist Yet**
If no comments have been posted, you'll see:
> "No comments yet. Be the first to comment!"

**Test by posting a comment:**
1. Ensure you're signed in
2. Type a comment in the text area
3. Click "Post Comment"
4. Check console for success/error messages

### 4. **Firestore Security Rules**
Comments require authentication to read.

**Check:**
```javascript
// In firestore.rules
match /comments/{commentId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && 
                   request.resource.data.userId == request.auth.uid;
  allow delete: if isAuthenticated() && 
                   resource.data.userId == request.auth.uid;
}
```

**Verify:**
1. User is signed in (check top-right of nav bar)
2. Security rules are deployed to Firebase

### 5. **Real-time Listener Not Working**
The comments use Firestore's real-time listener (`onSnapshot`).

**Debug Steps:**
1. Open browser console
2. Look for: `🔍 Setting up comments listener for course: [courseId]`
3. Look for: `📦 Received snapshot with X documents`
4. Look for: `✅ Processed comments: [array]`

**If you see errors:**
- `❌ Error in comments snapshot listener` - Check the error details
- `🔥 FIRESTORE INDEX REQUIRED!` - Create the index (see #2 above)

## Quick Diagnostic Checklist

Run through these checks in order:

1. ✅ **Is user signed in?**
   - Check nav bar for user photo/name
   - If not, sign in with Google

2. ✅ **Does user have course access?**
   - Check console for: `✅ Course is free - granting access` OR
   - `✅ Trial is active - granting access` OR
   - `✅ User has purchased course`
   - If you see `⚠️ Comments hidden` message, user needs access

3. ✅ **Is Comments component rendering?**
   - Check console for: `🎬 Rendering Comments component for courseId:`
   - If not present, user doesn't have access

4. ✅ **Is the listener set up?**
   - Check console for: `🔍 Setting up comments listener for course:`
   - If not present, component didn't mount

5. ✅ **Are comments being fetched?**
   - Check console for: `📦 Received snapshot with X documents`
   - If X = 0, no comments exist yet (post one to test)
   - If error, check for index requirement

6. ✅ **Are comments being processed?**
   - Check console for: `✅ Processed comments: [...]`
   - Should show array of comment objects

## Testing Steps

### Test 1: Post a New Comment
1. Navigate to a course page
2. Ensure you have access (see video player)
3. Scroll to comments section
4. Type "Test comment" in the text area
5. Click "Post Comment"
6. Check console for: `Comment posted successfully`
7. Comment should appear immediately

### Test 2: Verify Real-time Updates
1. Open course page in two browser windows
2. Post a comment in window 1
3. Comment should appear in window 2 automatically (within 1-2 seconds)

### Test 3: Delete Comment
1. Find your own comment (has "Delete" button)
2. Click "Delete"
3. Comment should disappear immediately
4. Check console for: `Comment deleted successfully`

## Common Solutions

### Solution 1: Grant Course Access
If user doesn't have access, either:
- Make the course free: Set `isFree: true` in admin dashboard
- Start a free trial: Set `freeTrialDays` to a number > 0
- Purchase the course: Use the payment modal

### Solution 2: Create Firestore Index
1. Open browser console
2. Look for error with Firebase Console link
3. Click the link
4. Click "Create Index"
5. Wait 1-2 minutes
6. Refresh the page

### Solution 3: Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Solution 4: Check Firebase Console
1. Go to Firebase Console → Firestore
2. Navigate to `comments` collection
3. Verify documents exist
4. Check document structure matches:
   ```
   {
     courseId: string
     userId: string
     userName: string
     userPhotoURL: string
     text: string
     timestamp: Timestamp
   }
   ```

## Still Not Working?

If comments still don't display after trying all solutions:

1. **Check browser console** for any red errors
2. **Check Firebase Console** → Firestore → Usage tab for errors
3. **Verify environment variables** in `.env` file
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
5. **Try incognito mode** to rule out extension conflicts

## Console Log Reference

Expected console logs when everything works:

```
🔍 Course access check: { title: "...", isFree: true, ... }
✅ Course is free - granting access
🎬 Rendering Comments component for courseId: c1
🔍 Setting up comments listener for course: c1
📦 Received snapshot with 3 documents
📄 Comment doc: abc123 { courseId: "c1", text: "Great course!", ... }
📄 Comment doc: def456 { courseId: "c1", text: "Very helpful", ... }
📄 Comment doc: ghi789 { courseId: "c1", text: "Thanks!", ... }
✅ Processed comments: [{ id: "abc123", ... }, { id: "def456", ... }, { id: "ghi789", ... }]
```

## Need More Help?

If you're still stuck, provide:
1. Screenshot of browser console
2. Screenshot of Firebase Console → Firestore → comments collection
3. Course ID you're testing with
4. Whether user is signed in and has access
