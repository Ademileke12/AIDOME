# Free Trial Duration Update - Hours & Minutes Support

## Overview
Updated the free trial system to support hours and minutes in addition to days, allowing for more flexible trial periods.

## Changes Made

### 1. Data Model Updates (`src/services/firestore.ts`)
- Added `freeTrialHours?: number` to Course interface
- Added `freeTrialMinutes?: number` to Course interface
- Updated `calculateTrialExpiration()` to accept and calculate with days, hours, and minutes
- Updated `isTrialActive()` to check for any trial duration (days, hours, or minutes)
- Updated `createCourse()` and `updateCourse()` to set trial start date if any duration is provided

### 2. Admin Form Updates (`src/components/admin/ContentForm.tsx`)
- Replaced single "Free Trial Days" input with 3-column grid:
  - Days (0-∞)
  - Hours (0-23)
  - Minutes (0-59)
- Updated form initialization to include new fields
- Updated `handleChange()` to handle all three duration fields
- Updated trial info display to show complete duration breakdown

### 3. Timer Component Updates (`src/components/FreeTrialTimer.tsx`)
- Updated to pass all three duration parameters to calculation function
- Added hours and minutes to useEffect dependencies

### 4. Access Control Updates (`src/pages/CoursePage.tsx`)
- Updated access logic to check for ANY trial duration (days, hours, or minutes)
- Fixed bug where courses with only hours or minutes wouldn't grant access
- Now properly checks: `hasTrialDuration = days > 0 OR hours > 0 OR minutes > 0`

### 5. Display Updates (`src/pages/Learn.tsx`)
- Updated badge display to show "Free Trial" for any active trial
- Updated timer display to show for courses with hours or minutes only
- Updated expiration notification logic to handle all duration types

### 6. Payment System (Previous Update)
- Automatic Paystack fee calculation (1.5% + ₦100, capped at ₦2,000)
- Price breakdown showing course price + transaction fees
- Total amount includes all fees automatically

## How It Works

### Trial Duration Examples:
- **7 days, 0 hours, 0 minutes** = 7-day trial
- **0 days, 12 hours, 0 minutes** = 12-hour trial
- **0 days, 0 hours, 30 minutes** = 30-minute trial
- **1 day, 6 hours, 30 minutes** = 1 day, 6 hours, 30 minutes trial

### Access Logic:
1. **Free Course**: Always accessible
2. **Active Trial**: Accessible if current time < expiration time
3. **Expired Trial**: Requires payment
4. **No Trial**: Requires payment

### Trial Expiration Calculation:
```typescript
expirationDate = startDate + days + hours + minutes
```

### User Experience:
- Users see "Free Trial" badge during active trial period
- Countdown timer shows remaining time (days, hours, minutes, seconds)
- After trial expires, payment modal appears
- Notification sent when trial expires for accessed courses

## Testing Checklist

- [ ] Create course with only days (e.g., 7 days)
- [ ] Create course with only hours (e.g., 12 hours)
- [ ] Create course with only minutes (e.g., 30 minutes)
- [ ] Create course with mixed duration (e.g., 1 day, 6 hours, 30 minutes)
- [ ] Verify timer displays correctly for all duration types
- [ ] Verify access granted during active trial
- [ ] Verify payment required after trial expires
- [ ] Verify expiration notifications work
- [ ] Verify payment includes transaction fees

## Database Fields

Courses now have these trial-related fields:
```typescript
{
  freeTrialDays?: number;      // 0-∞
  freeTrialHours?: number;     // 0-23
  freeTrialMinutes?: number;   // 0-59
  freeTrialStartDate?: Date;   // Auto-set when trial duration > 0
  priceAfterTrial?: number;    // Price after trial expires
  currency?: string;           // Currency code (USD, NGN, etc.)
}
```

## Notes

- All three duration fields are optional
- If all are 0 or undefined, no trial is active
- Trial starts automatically when admin saves the form with any duration > 0
- Timer updates every second for accurate countdown
- Access checks happen on every page load
- Payment fees are automatically calculated and included in total
