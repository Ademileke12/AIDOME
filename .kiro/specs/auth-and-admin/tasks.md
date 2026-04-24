# Implementation Plan: Authentication and Admin Functionality

## Overview

This implementation plan breaks down the authentication and admin feature into incremental, testable steps. Each task builds on previous work, starting with Firebase setup, then authentication, route protection, data migration, admin dashboard, and finally the video player. The plan includes property-based tests and unit tests as sub-tasks to ensure correctness at each stage.

## Tasks

- [x] 1. Set up Firebase configuration and environment
  - Create Firebase project in Firebase Console
  - Enable Google Authentication provider
  - Create Firestore database with collections: designs, cinematics, courses
  - Add Firebase SDK dependencies to package.json
  - Create src/config/firebase.ts with Firebase initialization
  - Create .env file with all required Firebase environment variables
  - _Requirements: 8.1_

- [ ] 2. Implement Authentication Context and Google OAuth
  - [x] 2.1 Create AuthContext with user state management
    - Create src/contexts/AuthContext.tsx
    - Implement AuthProvider component with user, isAdmin, loading states
    - Implement signInWithGoogle() using Firebase Auth popup
    - Implement signOut() using Firebase Auth
    - Listen to onAuthStateChanged for session persistence
    - Check admin status by comparing email against VITE_ADMIN_EMAILS
    - _Requirements: 1.2, 1.3, 1.5, 9.1_
  
  - [ ]* 2.2 Write property test for authentication session creation
    - **Property 2: Authentication creates session**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.3 Write property test for session persistence
    - **Property 3: Session persistence across page reloads**
    - **Validates: Requirements 1.5**
  
  - [ ]* 2.4 Write property test for admin authorization
    - **Property 22: Admin authorization check**
    - **Validates: Requirements 9.1**

- [ ] 3. Create Sign In page
  - [x] 3.1 Implement Sign In page component
    - Create src/pages/SignIn.tsx
    - Add glassmorphism card with AI Dome branding
    - Add "Sign in with Google" button with Google icon
    - Implement click handler calling signInWithGoogle()
    - Add error message display for failed authentication
    - Add loading state during authentication
    - Use motion/react for fade-in animation
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 3.2 Write unit test for Sign In page rendering
    - Test button renders correctly
    - Test error message display
    - Test loading state
    - _Requirements: 1.1, 1.2_

- [ ] 4. Implement route protection
  - [x] 4.1 Create ProtectedRoute component
    - Create src/components/ProtectedRoute.tsx
    - Check authentication state from AuthContext
    - Show loading spinner while auth state is being determined
    - Redirect to /signin if user is not authenticated
    - Store intended destination in location state
    - Render children if user is authenticated
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 4.2 Create AdminRoute component
    - Create src/components/AdminRoute.tsx
    - Extend ProtectedRoute functionality
    - Additionally check isAdmin flag from AuthContext
    - Redirect to / if user is not an admin
    - Render children only if user is authenticated AND is admin
    - _Requirements: 9.2_
  
  - [x] 4.3 Update App.tsx with route protection
    - Wrap AuthProvider around Router
    - Add /signin route (public)
    - Wrap existing routes (Home, Gallery, Cinematic, Learn) with ProtectedRoute
    - Add /admin route wrapped with AdminRoute
    - Implement post-login redirect to intended page
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  
  - [ ]* 4.4 Write property test for unauthenticated redirect
    - **Property 1: Unauthenticated users are redirected to sign in**
    - **Validates: Requirements 1.1, 3.1**
  
  - [ ]* 4.5 Write property test for post-authentication redirect
    - **Property 8: Post-authentication redirect to intended page**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.6 Write property test for authenticated access
    - **Property 9: Authenticated users access protected routes**
    - **Validates: Requirements 3.5**
  
  - [ ]* 4.7 Write property test for non-admin redirect
    - **Property 23: Non-admin users cannot access admin routes**
    - **Validates: Requirements 9.2**

- [x] 5. Checkpoint - Ensure authentication and routing work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update Navigation component with conditional rendering
  - [x] 6.1 Modify Navigation component for auth-based visibility
    - Import and use AuthContext
    - Hide all links when user is null, show only Sign In
    - Show Home, Gallery, Cinematic, Learn when user exists
    - Show Admin link when isAdmin is true
    - Add Sign Out button when authenticated
    - Maintain existing glassmorphism styling and animations
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 6.2 Write property test for navigation visibility (unauthenticated)
    - **Property 4: Navigation visibility for unauthenticated users**
    - **Validates: Requirements 2.1**
  
  - [ ]* 6.3 Write property test for navigation visibility (authenticated)
    - **Property 5: Navigation visibility for authenticated users**
    - **Validates: Requirements 2.2**
  
  - [ ]* 6.4 Write property test for admin link visibility
    - **Property 6: Admin link visibility**
    - **Validates: Requirements 2.3**
  
  - [ ]* 6.5 Write property test for navigation after sign out
    - **Property 7: Navigation updates after sign out**
    - **Validates: Requirements 2.4, 10.5**
  
  - [ ]* 6.6 Write property test for sign out functionality
    - **Property 24: Sign out clears session**
    - **Property 25: Sign out redirects to sign in page**
    - **Validates: Requirements 10.1, 10.3**

- [ ] 7. Create Firestore service layer
  - [x] 7.1 Implement Firestore service for all content types
    - Create src/services/firestore.ts
    - Implement getDesigns(), getDesignById(), createDesign(), updateDesign(), deleteDesign()
    - Implement getCinematics(), getCinematicById(), createCinematic(), updateCinematic(), deleteCinematic()
    - Implement getCourses(), getCourseById(), createCourse(), updateCourse(), deleteCourse()
    - Add error handling for all operations
    - Add TypeScript types for all functions
    - _Requirements: 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 7.2 Write property test for CRUD operations
    - **Property 11: Content creation persists to database**
    - **Property 13: Content updates persist to database**
    - **Property 14: Content deletion removes from database**
    - **Validates: Requirements 4.3, 4.5, 4.6, 5.3, 5.5, 5.6, 6.3, 6.5, 6.6**
  
  - [ ]* 7.3 Write property test for data fetching
    - **Property 19: Pages fetch data from Firestore**
    - **Validates: Requirements 8.2, 8.3, 8.4**
  
  - [ ]* 7.4 Write property test for database error handling
    - **Property 20: Database error handling**
    - **Validates: Requirements 8.6**

- [ ] 8. Create data migration script
  - [x] 8.1 Implement migration script to populate Firestore
    - Create scripts/migrateData.ts
    - Import data from src/data.ts
    - Use Firestore batch writes to populate collections
    - Add videoUrl field to courses (empty string initially)
    - Add error handling and logging
    - _Requirements: 8.1_
  
  - [ ]* 8.2 Write unit test for migration script
    - Test batch write operations
    - Test error handling
    - _Requirements: 8.1_

- [ ] 9. Update existing pages to fetch from Firestore
  - [x] 9.1 Update Gallery page to use Firestore
    - Import Firestore service
    - Replace static data import with getDesigns() call
    - Add loading state while fetching
    - Add error handling and error message display
    - _Requirements: 8.2, 8.7_
  
  - [x] 9.2 Update CinematicGallery page to use Firestore
    - Import Firestore service
    - Replace static data import with getCinematics() call
    - Add loading state while fetching
    - Add error handling and error message display
    - _Requirements: 8.3, 8.7_
  
  - [x] 9.3 Update Learn page to use Firestore
    - Import Firestore service
    - Replace static data import with getCourses() call
    - Add loading state while fetching
    - Add error handling and error message display
    - _Requirements: 8.4, 8.7_
  
  - [ ]* 9.4 Write property test for loading states
    - **Property 21: Loading states during data fetching**
    - **Validates: Requirements 8.7**

- [x] 10. Checkpoint - Ensure data migration and fetching work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create reusable content form component
  - [x] 11.1 Implement ContentForm component
    - Create src/components/admin/ContentForm.tsx
    - Accept type prop: 'design' | 'cinematic' | 'course'
    - Accept initialData prop for edit mode
    - Accept onSubmit and onCancel callbacks
    - Render appropriate fields based on type
    - Implement real-time validation for all fields
    - Add image preview for image URL fields
    - Use glassmorphism styling consistent with app
    - _Requirements: 4.2, 4.7, 5.2, 5.7, 6.2, 6.7_
  
  - [ ]* 11.2 Write property test for form validation
    - **Property 15: Form validation displays errors**
    - **Validates: Requirements 4.7**
  
  - [ ]* 11.3 Write property test for hex color validation
    - **Property 16: Hex color validation**
    - **Validates: Requirements 5.7**
  
  - [ ]* 11.4 Write property test for URL validation
    - **Property 17: URL validation**
    - **Validates: Requirements 6.7**
  
  - [ ]* 11.5 Write unit test for form pre-population
    - Test form fields are populated with initialData
    - _Requirements: 4.4, 5.4, 6.4_

- [x] 12. Create content table component
  - [x] 12.1 Implement ContentTable component
    - Create src/components/admin/ContentTable.tsx
    - Accept items array and type prop
    - Render table with appropriate columns based on type
    - Add Edit and Delete buttons for each row
    - Add "Create New" button at top
    - Use glassmorphism styling for table
    - _Requirements: 4.1, 5.1, 6.1_
  
  - [ ]* 12.2 Write unit test for ContentTable rendering
    - Test table renders all items
    - Test Edit and Delete buttons are present
    - _Requirements: 4.1, 5.1, 6.1_

- [x] 13. Implement Admin Dashboard with content managers
  - [x] 13.1 Create AdminDashboard page with tab navigation
    - Create src/pages/AdminDashboard.tsx
    - Implement tab navigation for Designs, Cinematics, Courses
    - Use glassmorphism styling for tabs
    - _Requirements: 4.1, 5.1, 6.1_
  
  - [x] 13.2 Implement DesignManager component
    - Create src/components/admin/DesignManager.tsx
    - Fetch designs using Firestore service
    - Render ContentTable with designs
    - Implement create modal with ContentForm
    - Implement edit modal with ContentForm
    - Implement delete confirmation dialog
    - Handle all CRUD operations with loading and error states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 13.3 Implement CinematicManager component
    - Create src/components/admin/CinematicManager.tsx
    - Fetch cinematics using Firestore service
    - Render ContentTable with cinematics
    - Implement create modal with ContentForm
    - Implement edit modal with ContentForm
    - Implement delete confirmation dialog
    - Handle all CRUD operations with loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [x] 13.4 Implement CourseManager component
    - Create src/components/admin/CourseManager.tsx
    - Fetch courses using Firestore service
    - Render ContentTable with courses
    - Implement create modal with ContentForm
    - Implement edit modal with ContentForm
    - Implement delete con
    firmation dialog
    - Handle all CRUD operations with loading and error states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [ ]* 13.5 Write property test for admin dashboard content display
    - **Property 10: Admin dashboard displays all content**
    - **Validates: Requirements 4.1, 5.1, 6.1**
  
  - [ ]* 13.6 Write property test for edit form pre-population
    - **Property 12: Edit form pre-population**
    - **Validates: Requirements 4.4, 5.4, 6.4**

- [ ] 14. Checkpoint - Ensure admin dashboard CRUD operations work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement Video Player component
  - [x] 15.1 Create VideoPlayer component
    - Create src/components/VideoPlayer.tsx
    - Accept course prop and onClose callback
    - Render full-screen overlay with glassmorphism backdrop
    - Detect video URL type (YouTube, Vimeo, direct)
    - Render appropriate player (iframe or HTML5 video)
    - Display course title, description, and module count
    - Add close button with X icon
    - Implement smooth enter/exit animations with motion/react
    - Pause video when closed
    - Handle missing video URL with appropriate message
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [ ]* 15.2 Write property test for video player content display
    - **Property 18: Video player displays all course information**
    - **Validates: Requirements 7.2**
  
  - [ ]* 15.3 Write unit test for missing video URL handling
    - Test message displays when videoUrl is empty
    - _Requirements: 7.5_

- [x] 16. Update Learn page to open Video Player
  - [x] 16.1 Add video player integration to Learn page
    - Import VideoPlayer component
    - Add state for selected course
    - Add click handler to course cards
    - Render VideoPlayer when course is selected
    - Pass onClose handler to clear selected course
    - _Requirements: 7.1, 7.4_
  
  - [ ]* 16.2 Write unit test for video player opening
    - Test clicking course opens video player
    - Test closing video player returns to Learn page
    - _Requirements: 7.1, 7.4_

- [x] 17. Add Firestore security rules
  - [x] 17.1 Configure Firestore security rules
    - Open Firebase Console
    - Navigate to Firestore security rules
    - Add rules allowing read for authenticated users
    - Add rules allowing write only for admin users
    - Test rules with Firebase Emulator
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 17.2 Write integration test for security rules
    - Test non-admin cannot write to Firestore
    - Test admin can write to Firestore
    - _Requirements: 9.1, 9.2_

- [x] 18. Add loading states and error handling polish
  - [x] 18.1 Implement toast notification system
    - Create src/components/Toast.tsx
    - Add success, error, and info toast variants
    - Use glassmorphism styling
    - Add auto-dismiss after 3 seconds
    - _Requirements: 8.6_
  
  - [x] 18.2 Add toast notifications to all CRUD operations
    - Show success toast after create, update, delete
    - Show error toast on operation failures
    - _Requirements: 8.6_
  
  - [x] 18.3 Add loading spinners to all async operations
    - Add spinner component with glassmorphism styling
    - Show spinner during authentication
    - Show spinner during data fetching
    - Show spinner during CRUD operations
    - _Requirements: 8.7_

- [x] 19. Final checkpoint and integration testing
  - [x] 19.1 Run all tests and ensure they pass
    - Run unit tests
    - Run property-based tests
    - Fix any failing tests
  
  - [x] 19.2 Manual testing of complete flows
    - Test complete authentication flow (sign in → access content → sign out)
    - Test complete admin flow (sign in → create content → edit → delete)
    - Test complete user flow (sign in → view content → watch video)
    - Test error scenarios (network failures, invalid inputs)
  
  - [x] 19.3 Accessibility audit
    - Test keyboard navigation
    - Test screen reader compatibility
    - Test color contrast
    - Fix any accessibility issues

- [ ] 20. Final checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Implement course monetization features
  - [x] 21.1 Update Course interface and Firestore service
    - Add freeTrialDays, freeTrialStartDate, priceAfterTrial, currency, thumbnail fields to Course interface
    - Update createCourse and updateCourse to handle new fields
    - Add logic to calculate trial expiration timestamp
    - _Requirements: 11.1, 11.2, 11.7_
  
  - [x] 21.2 Update CourseManager admin form
    - Add input fields for free trial days, price after trial, and currency
    - Add logic to set freeTrialStartDate when freeTrialDays is set
    - Add validation for price and currency fields
    - Display current trial status and expiration date
    - _Requirements: 11.1, 11.2_
  
  - [x] 21.3 Create FreeTrialTimer component
    - Create src/components/FreeTrialTimer.tsx
    - Calculate time remaining from freeTrialStartDate and freeTrialDays
    - Update countdown every second
    - Display days, hours, minutes remaining
    - Show warning styling when < 24 hours remain
    - Use glassmorphism badge styling
    - _Requirements: 11.3, 11.4_
  
  - [x] 21.4 Update Learn page to show trial timers
    - Import and use FreeTrialTimer component
    - Display timer on courses with active free trials
    - Show "Free for X days" badge on trial courses
    - Show price badge on paid courses
    - _Requirements: 11.3, 11.5_

- [x] 22. Implement Paystack payment integration
  - [x] 22.1 Set up Paystack configuration
    - Add VITE_PAYSTACK_PUBLIC_KEY to environment variables
    - Install @paystack/inline-js package
    - Create src/services/paystack.ts with payment initialization logic
    - _Requirements: 12.2, 12.7_
  
  - [x] 22.2 Create CourseAccess Firestore collection and service
    - Add courseAccess collection to Firestore
    - Implement checkCourseAccess(userId, courseId) function
    - Implement recordCoursePurchase(purchase) function
    - Implement getUserPurchases(userId) function
    - _Requirements: 12.3, 12.4_
  
  - [x] 22.3 Create PaymentModal component
    - Create src/components/PaymentModal.tsx
    - Display course title and price
    - Add "Pay with Paystack" button
    - Initialize Paystack payment on button click
    - Handle payment success callback
    - Record purchase in Firestore on success
    - Display success/error messages
    - Use glassmorphism styling
    - _Requirements: 12.1, 12.2, 12.3, 12.6_
  
  - [x] 22.4 Update Learn page to check course access
    - Check if user has purchased course before opening
    - Show PaymentModal if course requires payment and user hasn't purchased
    - Allow access if course is free, in trial period, or user has purchased
    - _Requirements: 12.4, 12.5_

- [x] 23. Create dedicated course page
  - [x] 23.1 Create CoursePage component
    - Create src/pages/CoursePage.tsx
    - Add route /course/:id to App.tsx
    - Fetch course data by ID from Firestore
    - Check user's access to course (free trial, purchased, or requires payment)
    - Display PaymentModal if payment required
    - Use glassmorphism styling for all sections
    - _Requirements: 13.1, 13.2, 13.7_
  
  - [x] 23.2 Integrate video player in course page
    - Import and use VideoPlayer component
    - Display video in larger format optimized for viewing
    - Add "Open in YouTube" button for YouTube videos
    - Add external link options for other video platforms
    - Display course title, description, and module count
    - _Requirements: 13.3, 13.4, 13.5_
  
  - [x] 23.3 Update Learn page to navigate to course page
    - Change course click handler to navigate to /course/:id
    - Remove old VideoPlayer modal logic
    - Maintain existing animations and styling
    - _Requirements: 13.1_

- [x] 24. Implement comments system
  - [x] 24.1 Create Comments Firestore collection and service
    - Add comments collection to Firestore
    - Implement getComments(courseId) function with real-time listener
    - Implement createComment(comment) function
    - Implement deleteComment(commentId) function
    - _Requirements: 14.3, 14.6, 14.7_
  
  - [x] 24.2 Create Comments component
    - Create src/components/Comments.tsx
    - Display list of comments with user info and timestamps
    - Show relative timestamps (e.g., "2 hours ago")
    - Add comment input textarea for authenticated users
    - Add submit button
    - Add delete button for user's own comments
    - Display empty state message when no comments
    - Use glassmorphism styling
    - _Requirements: 14.1, 14.2, 14.5, 14.8_
  
  - [x] 24.3 Integrate comments in course page
    - Import and use Comments component
    - Display below video player
    - Handle real-time comment updates
    - Auto-scroll to new comments
    - _Requirements: 13.6, 14.4_
  
  - [x] 24.4 Write unit tests for comments functionality
    - Test comment submission
    - Test comment deletion
    - Test real-time updates
    - Test empty state display
    - _Requirements: 14.1-14.8_

- [x] 25. Update Firestore security rules for new collections
  - [x] 25.1 Add security rules for courseAccess collection
    - Allow users to read their own purchases
    - Allow admin to read all purchases
    - Prevent users from writing directly (only through Cloud Functions or admin)
    - _Requirements: 12.3_
  
  - [x] 25.2 Add security rules for comments collection
    - Allow authenticated users to read all comments
    - Allow authenticated users to create comments
    - Allow users to delete only their own comments
    - Validate comment structure and required fields
    - _Requirements: 14.3, 14.6, 14.7_

- [x] 26. Add notifications for trial expiration
  - [x] 26.1 Create notification system
    - Create src/components/Notification.tsx for toast notifications
    - Add notification context or use existing toast system
    - _Requirements: 11.6_
  
  - [x] 26.2 Implement trial expiration notifications
    - Check for expired trials when user visits Learn page
    - Show notification if user accessed course during trial and it has now expired
    - Store notification dismissal state to avoid repeated notifications
    - _Requirements: 11.6_

- [-] 27. Final testing and polish
  - [x] 27.1 Test payment flow end-to-end
    - Test Paystack payment with test keys
    - Verify purchase is recorded in Firestore
    - Verify user gains access after purchase
    - Test payment failure scenarios
    - _Requirements: 12.1-12.6_
  
  - [x] 27.2 Test free trial functionality
    - Test trial countdown timer accuracy
    - Test trial expiration and automatic status change
    - Test notifications for expired trials
    - _Requirements: 11.2-11.6_
  
  - [x] 27.3 Test comments system
    - Test comment posting and deletion
    - Test real-time updates across multiple users
    - Test comment display with user info
    - _Requirements: 14.1-14.8_
  
  - [x] 27.4 Test course page functionality
    - Test navigation to course page
    - Test video playback
    - Test external YouTube link
    - Test responsive design
    - _Requirements: 13.1-13.7_

- [ ] 28. Final checkpoint - Verify all new features work correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples, edge cases, and integration points
- Firebase Emulator should be used for local testing to avoid hitting production
- All new components should maintain the existing glassmorphism aesthetic and dark theme
- Use motion/react for all animations to maintain consistency with existing pages
- Paystack test keys should be used during development (get from Paystack dashboard)
- Course monetization features (tasks 21-28) extend the base authentication and admin system
- Comments use real-time Firestore listeners for instant updates across users
- Free trial timers update every second and should be optimized to avoid performance issues
