# Course Monetization Features - Summary

## Overview

This document summarizes the new course monetization features added to the auth-and-admin spec. These features extend the base authentication and admin system with payment processing, temporary free access, and user engagement tools.

## New Features

### 1. Temporary Free Access (Free Trials)

**Admin Capabilities:**
- Set number of days a course should be free
- Set price to charge after trial period ends
- Trial countdown starts automatically when admin sets free trial days
- Can update trial period at any time (recalculates from current time)

**User Experience:**
- See countdown timer showing days/hours/minutes remaining
- Get notified when trial is about to expire
- Receive notification when trial expires and payment is required
- Timer displays prominently on course cards and course page

**Technical Implementation:**
- `freeTrialDays` field on Course model
- `freeTrialStartDate` timestamp to calculate expiration
- `priceAfterTrial` and `currency` fields for post-trial pricing
- Real-time countdown component that updates every second
- Automatic status change when trial expires

### 2. Paystack Payment Integration

**Payment Flow:**
1. User clicks on paid course (or course with expired trial)
2. Payment modal appears with course details and price
3. User clicks "Pay with Paystack" button
4. Paystack payment popup opens
5. User completes payment
6. System records purchase in Firestore
7. User gains lifetime access to course

**Features:**
- Secure payment processing via Paystack
- Payment verification and recording
- Lifetime access after purchase
- Purchase history tracking per user
- Retry mechanism for failed payments

**Technical Implementation:**
- `@paystack/inline-js` package integration
- `courseAccess` Firestore collection to track purchases
- `checkCourseAccess()` function to verify user access
- `recordCoursePurchase()` function to save purchase data
- Environment variable for Paystack public key

### 3. Dedicated Course Page

**Features:**
- Full-page layout optimized for video viewing
- Larger video player with better controls
- "Open in YouTube" button for external viewing
- Course information display (title, description, modules)
- Comments section below video
- Payment integration (if course requires payment)
- Responsive design for all screen sizes

**Route:**
- `/course/:id` - dedicated page for each course

**Technical Implementation:**
- New `CoursePage` component
- Integration with VideoPlayer component
- Access control (checks if user can view)
- Payment modal integration
- Comments component integration

### 4. Comments System

**Features:**
- Users can comment on any course they have access to
- Real-time comment updates (no page reload needed)
- Display commenter name, photo, and timestamp
- Users can delete their own comments
- Chronological ordering (newest first)
- Empty state when no comments exist

**Technical Implementation:**
- `comments` Firestore collection
- Real-time Firestore listeners for instant updates
- Comment CRUD operations (create, read, delete)
- User authentication required to comment
- Relative timestamp display (e.g., "2 hours ago")

## Data Models

### Updated Course Model
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
  thumbnail?: string;
  // NEW FIELDS
  freeTrialDays?: number;
  freeTrialStartDate?: Date;
  priceAfterTrial?: number;
  currency?: string; // e.g., "NGN", "USD"
}
```

### New CourseAccess Model
```typescript
interface CourseAccess {
  userId: string;
  courseId: string;
  purchaseDate: Date;
  paymentReference: string;
  amount: number;
}
```

### New Comment Model
```typescript
interface Comment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  text: string;
  timestamp: Date;
}
```

## New Components

1. **FreeTrialTimer** - Displays countdown for course free trials
2. **PaymentModal** - Handles Paystack payment flow
3. **CoursePage** - Dedicated full-page course viewer
4. **Comments** - Comment display and management
5. **Notification** - Toast notifications for trial expiration

## New Firestore Collections

1. **courseAccess** - Tracks user course purchases
2. **comments** - Stores course comments

## Environment Variables

Add to `.env`:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

## Security Rules

### courseAccess Collection
- Users can read their own purchases
- Admins can read all purchases
- No direct writes (only through verified payment flow)

### comments Collection
- All authenticated users can read comments
- Authenticated users can create comments
- Users can only delete their own comments
- Validation for required fields

## Implementation Order

1. **Tasks 21** - Course monetization (free trials, pricing)
2. **Tasks 22** - Paystack payment integration
3. **Tasks 23** - Dedicated course page
4. **Tasks 24** - Comments system
5. **Tasks 25** - Security rules updates
6. **Tasks 26** - Trial expiration notifications
7. **Tasks 27** - Testing and polish
8. **Task 28** - Final verification

## Testing Considerations

- Use Paystack test keys during development
- Test free trial countdown accuracy
- Test payment flow with test cards
- Test comment real-time updates with multiple users
- Test access control (free, trial, paid, purchased)
- Test trial expiration and notifications
- Test external YouTube link functionality

## User Flows

### Flow 1: Free Trial Course
1. Admin sets course with 7-day free trial and $50 price
2. User sees "Free for 7 days" badge on course
3. User clicks course → opens course page
4. User watches video, sees countdown timer
5. After 7 days, timer expires
6. User sees payment modal when trying to access
7. User pays via Paystack
8. User gains lifetime access

### Flow 2: Commenting
1. User opens course page (must have access)
2. Scrolls to comments section
3. Types comment in input field
4. Clicks submit
5. Comment appears immediately
6. Other users see comment in real-time
7. User can delete their own comment

### Flow 3: External YouTube Viewing
1. User opens course with YouTube video
2. Sees "Open in YouTube" button
3. Clicks button
4. YouTube opens in new tab
5. User can watch on YouTube platform

## Performance Considerations

- Countdown timers update every second (optimize with requestAnimationFrame)
- Comments use real-time listeners (limit to recent 100 comments)
- Payment modal lazy loads Paystack script
- Course page lazy loads video player
- Implement pagination for comments if needed

## Future Enhancements (Not in Current Spec)

- Bulk discount codes
- Subscription model (monthly access)
- Course bundles
- Affiliate system
- Course ratings and reviews
- Video progress tracking
- Certificate generation
- Email notifications for trial expiration
- SMS notifications via Paystack
