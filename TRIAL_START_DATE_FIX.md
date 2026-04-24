# Free Trial Start Date Fix

## Problem
Courses with free trial days set but no `freeTrialStartDate` were being treated as premium courses, showing the payment modal immediately instead of granting trial access.

## Root Cause
1. When setting `freeTrialDays` in the admin form, the `freeTrialStartDate` was not being automatically set
2. The access check logic required BOTH `freeTrialDays > 0` AND `freeTrialStartDate` to exist
3. Legacy courses created before this fix had trial days but no start date

## Solution

### 1. Auto-set Trial Start Date in Admin Form
**File**: `src/components/admin/ContentForm.tsx`

When an admin sets `freeTrialDays` > 0:
- Automatically sets `freeTrialStartDate` to the current date/time
- If `freeTrialDays` is set to 0, clears the `freeTrialStartDate`

```typescript
// If setting freeTrialDays > 0 and no freeTrialStartDate exists, set it to now
if (name === 'freeTrialDays' && value > 0 && !prev.freeTrialStartDate) {
  updated.freeTrialStartDate = new Date();
}
```

### 2. Fallback for Legacy Courses
**File**: `src/pages/CoursePage.tsx`

When checking course access:
- If a course has `freeTrialDays > 0` but no `freeTrialStartDate`, assumes the trial starts now
- This handles legacy courses created before the fix

```typescript
// If trial days exist but no start date, assume trial starts now
if (!courseData.freeTrialStartDate) {
  courseData.freeTrialStartDate = new Date();
}
```

### 3. Updated isTrialActive Function
**File**: `src/services/firestore.ts`

The `isTrialActive()` function now:
- Returns `false` if no trial days are set
- Uses current date as fallback if `freeTrialStartDate` is missing
- Calculates expiration based on start date + trial days

```typescript
// If trial days exist but no start date, assume trial just started (legacy courses)
const startDate = course.freeTrialStartDate || new Date();
```

### 4. Added Debug Logging
**File**: `src/pages/CoursePage.tsx`

Console logs help debug access issues:
- Shows course title, isFree status, trial days, and start date
- Logs each decision point (free, trial active, trial expired, no trial)
- Helps identify why access was granted or denied

## How to Fix Existing Courses

### Option 1: Re-save in Admin (Recommended)
1. Go to Admin Dashboard → Courses tab
2. Click "Edit" on the course
3. The form will automatically set `freeTrialStartDate` to now
4. Click "Save"

### Option 2: Automatic Fix
- When a user clicks on the course, the system will automatically set the start date
- The trial will begin from that moment

### Option 3: Manual Firestore Update
If you need to set a specific start date:
1. Open Firebase Console
2. Go to Firestore Database
3. Find the course document in the `courses` collection
4. Add/update the `freeTrialStartDate` field with a timestamp

## Testing

### Test New Course with Trial
1. As admin, create a new course
2. Set `freeTrialDays` to 7
3. Set `priceAfterTrial` to a price (e.g., 5000)
4. Save the course
5. As a regular user, click on the course
6. **Expected**: Video should play immediately, trial timer should show

### Test Legacy Course
1. Find a course that has `freeTrialDays` but no `freeTrialStartDate` in Firestore
2. As a regular user, click on the course
3. **Expected**: Video should play immediately, trial timer should show
4. Check browser console for debug logs

### Test Trial Expiration
1. In Firestore, manually set `freeTrialStartDate` to 8 days ago for a course with 7-day trial
2. As a regular user, click on the course
3. **Expected**: Payment modal should appear

## Files Modified
1. `src/components/admin/ContentForm.tsx` - Auto-set trial start date
2. `src/pages/CoursePage.tsx` - Fallback for missing start date + debug logs
3. `src/services/firestore.ts` - Updated `isTrialActive()` function

## Debug Console Logs

When you open a course, check the browser console for logs like:

```
🔍 Course access check: {
  title: "How I Make High-End Flyers with AI",
  isFree: false,
  freeTrialDays: 7,
  freeTrialStartDate: Date,
  hasStartDate: true
}
✅ Trial is active - granting access
```

Or if there's an issue:

```
🔍 Course access check: {
  title: "Course Name",
  isFree: false,
  freeTrialDays: 7,
  freeTrialStartDate: undefined,
  hasStartDate: false
}
⚠️ Trial days exist but no start date - setting to now
✅ Trial is active - granting access
```

## Important Notes

1. **Trial starts when you save the form** - The trial countdown begins from the moment you save the course with trial days set
2. **Changing trial days resets the timer** - If you edit a course and change `freeTrialDays`, the start date remains the same (doesn't reset)
3. **Setting trial days to 0** - Clears the trial start date and makes the course premium (requires payment)
4. **Free courses** - If `isFree` is checked, trial settings are ignored

## Next Steps

After this fix, all new courses with trials will work correctly. For existing courses:
- Either re-save them in the admin panel
- Or they will auto-fix when users first access them
