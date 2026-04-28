# Manual Testing Checklist - Authentication and Admin Feature

## Test Environment Setup
- Admin email configured: samuelabudu21@gmail.com
- Firebase project configured
- Application builds successfully
- TypeScript compilation passes

## Authentication Flow Testing

### Test 1: Unauthenticated User Access
Steps:
1. Open application in incognito window
2. Try to access /gallery, /cinematic, /learn, /admin directly

Expected: All protected routes redirect to /signin
Status: Pending Manual Test

### Test 2: Google Sign In Flow
Steps:
1. Navigate to /signin
2. Click "Sign in with Google"
3. Complete OAuth flow

Expected: Redirect to intended page, navigation shows all links
Status: Pending Manual Test

### Test 3: Session Persistence
Steps:
1. Sign in with Google
2. Refresh page
3. Close and reopen browser tab

Expected: User remains signed in
Status: Pending Manual Test

### Test 4: Sign Out Flow
Steps:
1. Sign in
2. Click "Sign Out"

Expected: User signed out, redirect to home, navigation hides links
Status: Pending Manual Test

## Admin Flow Testing

### Test 5: Admin Access
Steps:
1. Sign in with samuelabudu21@gmail.com
2. Check for Admin link in navigation
3. Navigate to /admin

Expected: Admin link visible, dashboard loads with three tabs
Status: Pending Manual Test

### Test 6: Non-Admin Access
Steps:
1. Sign in with different email
2. Try to access /admin

Expected: No Admin link, redirect to home if accessing directly
Status: Pending Manual Test

### Test 7-9: Design CRUD Operations
Create, Edit, Delete design items
Expected: Operations succeed, data persists, toasts appear
Status: Pending Manual Test

### Test 10-12: Cinematic CRUD Operations
Create, Edit, Delete cinematic items
Expected: Operations succeed, hex color validation works
Status: Pending Manual Test

### Test 13-15: Course CRUD Operations
Create, Edit, Delete course items
Expected: Operations succeed, URL validation works
Status: Pending Manual Test

## User Flow Testing

### Test 16-18: View Content Pages
View Gallery, Cinematic Gallery, Learn pages
Expected: Loading states, data from Firestore displays
Status: Pending Manual Test

### Test 19: Watch Course Video
Click course, play video, close player
Expected: Video player opens, plays, closes correctly
Status: Pending Manual Test

### Test 20: Course Without Video
Click course without video URL
Expected: Message displays "Video content unavailable"
Status: Pending Manual Test

## Error Scenario Testing

### Test 21-25: Error Handling
- Network failure during sign in
- Network failure during data fetch
- Invalid form inputs
- Invalid hex colors
- Invalid URLs

Expected: Appropriate error messages, graceful degradation
Status: Pending Manual Test

## Summary
Total Tests: 25
Completed: 0
Pending: 25

## Notes
- Test with multiple browsers and devices
- Check browser console for errors
- Verify Firestore data in Firebase Console
- Test keyboard navigation for accessibility
