# Design Document: Authentication and Admin Functionality

## Overview

This design implements a comprehensive authentication and content management system for the AI Dome portfolio website. The solution uses Firebase Authentication for Google OAuth, Firestore for content storage, and React Context for state management. The design maintains the existing glassmorphism aesthetic while adding secure authentication, protected routes, and a full-featured admin dashboard.

The architecture follows a clear separation of concerns:
- **Authentication Layer**: Firebase Auth handles OAuth and session management
- **Data Layer**: Firestore provides real-time content storage and synchronization
- **Presentation Layer**: React components with Context API for global state
- **Authorization Layer**: Environment-based admin email verification

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Application                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AuthContext (Global State)               │  │
│  │  - User authentication state                          │  │
│  │  - Admin status                                       │  │
│  │  - Sign in/out methods                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │                                                         │  │
│  ▼                         ▼                              ▼  │
│ ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│ │ Public Routes│  │ Protected Routes │  │ Admin Routes │  │
│ │  - SignIn    │  │  - Home          │  │  - Dashboard │  │
│ └──────────────┘  │  - Gallery       │  └──────────────┘  │
│                   │  - Cinematic     │                     │
│                   │  - Learn         │                     │
│                   └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase Services                       │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │  Firebase Auth       │    │     Firestore DB         │  │
│  │  - Google OAuth      │    │  - designs collection    │  │
│  │  - Session mgmt      │    │  - cinematics collection │  │
│  │  - Token refresh     │    │  - courses collection    │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Navigation (conditionally renders links)
│       ├── Routes
│       │   ├── SignIn (public)
│       │   ├── ProtectedRoute wrapper
│       │   │   ├── Home
│       │   │   ├── Gallery
│       │   │   ├── CinematicGallery
│       │   │   ├── Learn
│       │   │   │   └── VideoPlayer (modal)
│       │   │   └── AdminRoute wrapper
│       │   │       └── AdminDashboard
│       │   │           ├── DesignManager
│       │   │           ├── CinematicManager
│       │   │           └── CourseManager
│       └── Footer
```

## Components and Interfaces

### 1. Authentication Context

**Purpose**: Provide global authentication state and methods throughout the application.

**Interface**:
```typescript
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}
```

**Implementation Details**:
- Uses React Context API for state management
- Wraps the entire application at the root level
- Listens to Firebase Auth state changes via `onAuthStateChanged`
- Checks admin status by comparing user email against `VITE_ADMIN_EMAILS` environment variable
- Persists authentication state automatically through Firebase SDK
- Provides loading state during initial auth check

### 2. Firebase Configuration

**Purpose**: Initialize and configure Firebase services.

**Configuration**:
```typescript
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
```

**Environment Variables**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_ADMIN_EMAILS` (comma-separated list)
- `VITE_PAYSTACK_PUBLIC_KEY` (NEW - for payment integration)

### 3. Protected Route Component

**Purpose**: Wrap routes that require authentication.

**Interface**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Behavior**:
- Checks authentication state from AuthContext
- Shows loading spinner while auth state is being determined
- Redirects to `/signin` if user is not authenticated
- Stores intended destination in location state for post-login redirect
- Renders children if user is authenticated

### 4. Admin Route Component

**Purpose**: Wrap routes that require admin privileges.

**Interface**:
```typescript
interface AdminRouteProps {
  children: React.ReactNode;
}
```

**Behavior**:
- Extends ProtectedRoute functionality
- Additionally checks `isAdmin` flag from AuthContext
- Redirects to `/` (Home) if user is not an admin
- Renders children only if user is authenticated AND is an admin

### 5. Sign In Page

**Purpose**: Provide Google OAuth authentication interface.

**UI Elements**:
- Centered glassmorphism card
- AI Dome logo/branding
- "Sign in with Google" button with Google icon
- Subtle animation on mount (fade in + slide up)
- Error message display for failed authentication

**Behavior**:
- Calls `signInWithGoogle()` from AuthContext
- Handles OAuth popup/redirect flow
- Displays loading state during authentication
- Redirects to intended page or Home after successful sign-in
- Shows error message if authentication fails

### 6. Updated Navigation Component

**Purpose**: Conditionally render navigation links based on auth state.

**Changes from Current**:
- Import and use AuthContext
- Hide all links when `user` is null
- Show Home, Gallery, Cinematic, Learn when `user` exists
- Show Admin link when `isAdmin` is true
- Add Sign Out button when authenticated
- Maintain existing glassmorphism styling and animations

**Interface**:
```typescript
interface NavLink {
  name: string;
  path: string;
  adminOnly?: boolean;
}
```

### 7. Admin Dashboard

**Purpose**: Provide content management interface for admin users.

**Layout**:
- Tab-based interface with three sections: Designs, Cinematics, Courses
- Each tab shows a table/grid of existing items
- "Create New" button at the top of each section
- Edit and Delete buttons for each item
- Modal/slide-over for create/edit forms

**UI Components**:
- `AdminDashboard`: Main container with tab navigation
- `DesignManager`: Manages Gallery_Items
- `CinematicManager`: Manages Cinematic_Items
- `CourseManager`: Manages Courses
- `ContentForm`: Reusable form component for create/edit
- `ContentTable`: Reusable table component for listing items

### 8. Content Form Component

**Purpose**: Reusable form for creating and editing content.

**Interface**:
```typescript
interface ContentFormProps {
  type: 'design' | 'cinematic' | 'course';
  initialData?: DesignItem | CinematicImage | Course;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}
```

**Form Fields by Type**:

**Design**:
- Title (text input)
- Category (text input)
- Image URL (text input with preview)
- Is Premium (checkbox)
- Prompt (textarea)

**Cinematic**:
- Title (text input)
- Image URL (text input with preview)
- Prompt (textarea)
- Colors (dynamic array input for hex codes)
- Lighting Description (textarea)

**Course**:
- Title (text input)
- Description (textarea)
- Modules Count (number input)
- Is Free (checkbox)
- Video URL (text input)

**Validation**:
- All text fields: required, min length 3
- URLs: valid URL format
- Colors: valid hex color format (#RRGGBB)
- Modules: positive integer

### 9. Dedicated Course Page Component

**Purpose**: Display course video with full details, comments, and payment options.

**Interface**:
```typescript
interface CoursePageProps {
  courseId: string;
}
```

**UI Elements**:
- Large video player (YouTube embed or HTML5)
- "Open in YouTube" button for external viewing
- Course title, description, and module count
- Free trial countdown timer (if applicable)
- Payment button (if course requires payment and user hasn't purchased)
- Comments section below video
- Comment input field for authenticated users
- Glassmorphism cards for all sections

**Behavior**:
- Checks if user has purchased course or if free trial is active
- Shows payment modal if course requires payment
- Loads and displays comments in real-time
- Allows users to post and delete their own comments
- Updates countdown timer every second

### 10. Payment Modal Component

**Purpose**: Handle Paystack payment flow for course purchases.

**Interface**:
```typescript
interface PaymentModalProps {
  course: Course;
  onSuccess: () => void;
  onClose: () => void;
}
```

**UI Elements**:
- Glassmorphism modal overlay
- Course title and price display
- "Pay with Paystack" button
- Payment processing indicator
- Success/error messages

**Behavior**:
- Initializes Paystack payment with course price
- Handles payment success callback
- Records purchase in Firestore
- Grants user access to course
- Closes modal on success or cancellation

### 11. Comments Component

**Purpose**: Display and manage course comments.

**Interface**:
```typescript
interface CommentsProps {
  courseId: string;
}
```

**UI Elements**:
- List of comments with user info and timestamps
- Comment input textarea
- Submit button
- Delete button (for user's own comments)
- Empty state message

**Behavior**:
- Fetches comments from Firestore in real-time
- Allows authenticated users to post comments
- Allows users to delete their own comments
- Displays relative timestamps (e.g., "2 hours ago")
- Auto-scrolls to new comments

### 12. Free Trial Timer Component

**Purpose**: Display countdown for course free trial period.

**Interface**:
```typescript
interface FreeTrialTimerProps {
  course: Course;
}
```

**UI Elements**:
- Countdown display (days, hours, minutes)
- Warning message as trial nears end
- Glassmorphism badge styling

**Behavior**:
- Calculates time remaining from freeTrialStartDate and freeTrialDays
- Updates every second
- Shows different styling when < 24 hours remain
- Hides when trial expires

**Purpose**: Display course videos in an integrated player.

**Interface**:
```typescript
interface VideoPlayerProps {
  course: Course;
  onClose: () => void;
}
```

**UI Elements**:
- Full-screen overlay with glassmorphism backdrop
- Video player (iframe for YouTube/Vimeo or HTML5 video)
- Course title and description below video
- Module count display
- Close button (X icon)
- Smooth enter/exit animations

**Behavior**:
- Opens as modal when course is clicked
- Supports YouTube, Vimeo, and direct video URLs
- Pauses video when closed
- Maintains aspect ratio (16:9)
- Responsive design for mobile

### 13. Video Player Component

**Purpose**: Display course videos in an integrated player (now used within course page).

**Interface**:
```typescript
interface VideoPlayerProps {
  course: Course;
  showExternalLink?: boolean;
}
```

**UI Elements**:
- Video player (iframe for YouTube/Vimeo or HTML5 video)
- "Open in YouTube" button (if YouTube video)
- Video controls
- Responsive aspect ratio (16:9)

**Behavior**:
- Detects video URL type (YouTube, Vimeo, direct)
- Renders appropriate player
- Provides external link for YouTube videos
- Maintains aspect ratio across devices

### 14. Firestore Service Layer

**Purpose**: Abstract database operations for content management.

**Interface**:
```typescript
interface FirestoreService {
  // Designs
  getDesigns(): Promise<DesignItem[]>;
  getDesignById(id: string): Promise<DesignItem | null>;
  createDesign(design: Omit<DesignItem, 'id'>): Promise<string>;
  updateDesign(id: string, design: Partial<DesignItem>): Promise<void>;
  deleteDesign(id: string): Promise<void>;
  
  // Cinematics
  getCinematics(): Promise<CinematicImage[]>;
  getCinematicById(id: string): Promise<CinematicImage | null>;
  createCinematic(cinematic: Omit<CinematicImage, 'id'>): Promise<string>;
  updateCinematic(id: string, cinematic: Partial<CinematicImage>): Promise<void>;
  deleteCinematic(id: string): Promise<void>;
  
  // Courses
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  createCourse(course: Omit<Course, 'id'>): Promise<string>;
  updateCourse(id: string, course: Partial<Course>): Promise<void>;
  deleteCourse(id: string): Promise<void>;
  
  // Course Access (NEW)
  checkCourseAccess(userId: string, courseId: string): Promise<boolean>;
  recordCoursePurchase(purchase: Omit<CourseAccess, 'id'>): Promise<string>;
  getUserPurchases(userId: string): Promise<CourseAccess[]>;
  
  // Comments (NEW)
  getComments(courseId: string): Promise<Comment[]>;
  createComment(comment: Omit<Comment, 'id'>): Promise<string>;
  deleteComment(commentId: string): Promise<void>;
}
```

**Firestore Collections**:
- `designs`: Gallery items
- `cinematics`: Cinematic images
- `courses`: Learning courses
- `courseAccess`: User course purchases (NEW)
- `comments`: Course comments (NEW)

**Document Structure**:
Documents match the existing TypeScript interfaces from `data.ts`, with Firestore auto-generating IDs.

## Data Models

### Existing Models (from data.ts)

These models remain unchanged:

```typescript
interface DesignItem {
  id: string;
  title: string;
  category: string;
  image: string;
  isPremium: boolean;
  prompt: string;
}

interface CinematicImage {
  id: string;
  title: string;
  image: string;
  prompt: string;
  colors: string[];
  lighting: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
  // NEW FIELDS for monetization
  freeTrialDays?: number;
  freeTrialStartDate?: Date;
  priceAfterTrial?: number;
  currency?: string;
  thumbnail?: string;
}

interface CourseAccess {
  userId: string;
  courseId: string;
  purchaseDate: Date;
  paymentReference: string;
  amount: number;
}

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

### New Models

```typescript
interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AdminConfig {
  adminEmails: string[];
}
```

### Data Migration

**Initial Setup**:
1. Create Firestore collections: `designs`, `cinematics`, `courses`
2. Run migration script to populate Firestore with data from `data.ts`
3. Update pages to fetch from Firestore instead of importing from `data.ts`
4. Keep `data.ts` as backup/reference

**Migration Script**:
```typescript
// scripts/migrateData.ts
async function migrateData() {
  const batch = writeBatch(db);
  
  designs.forEach(design => {
    const ref = doc(collection(db, 'designs'));
    batch.set(ref, design);
  });
  
  cinematicImages.forEach(cinematic => {
    const ref = doc(collection(db, 'cinematics'));
    batch.set(ref, cinematic);
  });
  
  courses.forEach(course => {
    const ref = doc(collection(db, 'courses'));
    batch.set(ref, { ...course, videoUrl: '' });
  });
  
  await batch.commit();
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies:

**Redundant Properties**:
- 3.1 is redundant with 1.1 (both test unauthenticated redirect to sign in)
- 10.5 is redundant with 2.4 (both test navigation hiding after sign out)
- 8.5 is redundant with 4.3, 4.5, 4.6, 5.3, 5.5, 5.6, 6.3, 6.5, 6.6 (all test persistence)

**Combined Properties**:
- 4.1, 5.1, 6.1 can be combined into one property about admin dashboard displaying all content
- 8.2, 8.3, 8.4 can be combined into one property about pages fetching their respective data
- CRUD operations (4.3-4.6, 5.3-5.6, 6.3-6.6) follow the same pattern and can be tested with a generic CRUD property

After reflection, we have approximately 25 unique, non-redundant properties to implement.

### Correctness Properties

**Property 1: Unauthenticated users are redirected to sign in**
*For any* protected route, when an unauthenticated user attempts to access it, the system should redirect them to the sign in page.
**Validates: Requirements 1.1, 3.1**

**Property 2: Authentication creates session**
*For any* user, when they successfully authenticate with Google OAuth, the system should create a session with their user information (uid, email, displayName, photoURL).
**Validates: Requirements 1.3**

**Property 3: Session persistence across page reloads**
*For any* authenticated user, when the page is reloaded, the user should remain authenticated without requiring sign-in again.
**Validates: Requirements 1.5**

**Property 4: Navigation visibility for unauthenticated users**
*For any* unauthenticated user, the navigation menu should only display the Sign In option and hide all other links.
**Validates: Requirements 2.1**

**Property 5: Navigation visibility for authenticated users**
*For any* authenticated non-admin user, the navigation menu should display Home, Gallery, Cinematic, and Learn links.
**Validates: Requirements 2.2**

**Property 6: Admin link visibility**
*For any* user, the Admin link in the navigation should be visible if and only if the user is authenticated AND their email is in the admin list.
**Validates: Requirements 2.3**

**Property 7: Navigation updates after sign out**
*For any* authenticated user, when they sign out, the navigation menu should immediately hide all links except Sign In.
**Validates: Requirements 2.4, 10.5**

**Property 8: Post-authentication redirect to intended page**
*For any* protected route, when an unauthenticated user attempts to access it, gets redirected to sign in, and then authenticates, they should be redirected to the originally requested route.
**Validates: Requirements 3.3**

**Property 9: Authenticated users access protected routes**
*For any* protected route and any authenticated user, the user should be able to access the route without redirection.
**Validates: Requirements 3.5**

**Property 10: Admin dashboard displays all content**
*For any* admin user accessing the admin dashboard, the system should display all items from all three content types (designs, cinematics, courses).
**Validates: Requirements 4.1, 5.1, 6.1**

**Property 11: Content creation persists to database**
*For any* content type (design, cinematic, or course) and any valid content data, when an admin creates new content, the system should persist it to Firestore and the content should appear in the respective page immediately.
**Validates: Requirements 4.3, 5.3, 6.3**

**Property 12: Edit form pre-population**
*For any* existing content item, when an admin clicks edit, the form should be pre-populated with all existing field values matching the item's current data.
**Validates: Requirements 4.4, 5.4, 6.4**

**Property 13: Content updates persist to database**
*For any* content item and any valid updated data, when an admin saves edits, the system should update Firestore and the changes should be reflected in the respective page immediately.
**Validates: Requirements 4.5, 5.5, 6.5**

**Property 14: Content deletion removes from database**
*For any* content item, when an admin deletes it, the system should remove it from Firestore and it should no longer appear in the respective page.
**Validates: Requirements 4.6, 5.6, 6.6**

**Property 15: Form validation displays errors**
*For any* content form with invalid or incomplete data, when an admin attempts to submit it, the system should display validation error messages and prevent submission.
**Validates: Requirements 4.7**

**Property 16: Hex color validation**
*For any* color value entered in the cinematic colors array field, the system should validate that it matches the hex color format (#RRGGBB or #RGB) and display an error for invalid formats.
**Validates: Requirements 5.7**

**Property 17: URL validation**
*For any* URL field (image URL or video URL), the system should validate that the input is a properly formatted URL and display an error for invalid formats.
**Validates: Requirements 6.7**

**Property 18: Video player displays all course information**
*For any* course, when the video player opens, it should display the course video, title, description, and module count.
**Validates: Requirements 7.2**

**Property 19: Pages fetch data from Firestore**
*For any* content page (Gallery, Cinematic Gallery, Learn), when the page loads, the system should fetch the respective content from Firestore.
**Validates: Requirements 8.2, 8.3, 8.4**

**Property 20: Database error handling**
*For any* Firestore operation, when the database is unavailable or returns an error, the system should display an appropriate error message to the user.
**Validates: Requirements 8.6**

**Property 21: Loading states during data fetching**
*For any* data fetching operation, the system should display a loading indicator while the operation is in progress.
**Validates: Requirements 8.7**

**Property 22: Admin authorization check**
*For any* authenticated user, the system should set the isAdmin flag to true if and only if the user's email is in the VITE_ADMIN_EMAILS environment variable.
**Validates: Requirements 9.1**

**Property 23: Non-admin users cannot access admin routes**
*For any* non-admin user (including unauthenticated users), when they attempt to access the admin dashboard, the system should redirect them to the home page.
**Validates: Requirements 9.2**

**Property 24: Sign out clears session**
*For any* authenticated user, when they click sign out, the system should clear their session and set the user state to null.
**Validates: Requirements 10.1**

**Property 25: Sign out redirects to sign in page**
*For any* authenticated user, when they sign out, the system should redirect them to the sign in page.
**Validates: Requirements 10.3**

**Property 26: Session expiration handling**
*For any* user with an expired session, the system should automatically sign them out and redirect to the sign in page.
**Validates: Requirements 10.4**

## Error Handling

### Authentication Errors

**Google OAuth Failures**:
- Network errors during OAuth flow
- User cancels OAuth popup
- Invalid Firebase configuration
- Token refresh failures

**Handling Strategy**:
- Display user-friendly error messages on Sign In page
- Log detailed errors to console for debugging
- Provide retry mechanism
- Clear any partial authentication state

### Database Errors

**Firestore Operation Failures**:
- Network connectivity issues
- Permission denied errors
- Document not found errors
- Write conflicts

**Handling Strategy**:
- Display toast notifications for operation failures
- Implement retry logic with exponential backoff
- Show loading states during operations
- Gracefully degrade to cached data when possible
- Log errors for monitoring

### Form Validation Errors

**Invalid Input**:
- Empty required fields
- Invalid URL formats
- Invalid hex color codes
- Invalid number ranges

**Handling Strategy**:
- Real-time validation as user types
- Clear error messages next to invalid fields
- Prevent form submission until all errors resolved
- Highlight invalid fields with red borders

### Route Protection Errors

**Unauthorized Access**:
- Non-admin accessing admin routes
- Unauthenticated user accessing protected routes
- Session expiration during navigation

**Handling Strategy**:
- Silent redirects to appropriate pages
- Preserve intended destination for post-login redirect
- Display brief notification explaining redirect
- Clear navigation state after redirect

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific authentication flows (Google OAuth popup, sign out)
- Individual form submissions with known data
- Specific error scenarios (network failure, invalid credentials)
- Component rendering with specific props
- Integration between Firebase and React components

**Property-Based Tests** focus on:
- Route protection across all routes
- Form validation across all possible invalid inputs
- CRUD operations across all content types
- Navigation visibility across all authentication states
- Admin authorization across all user emails

### Property-Based Testing Configuration

**Library**: Use `@fast-check/vitest` for property-based testing in the React/TypeScript environment.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with format: **Feature: auth-and-admin, Property {number}: {property_text}**
- Use custom arbitraries for generating test data (users, content items, routes)

**Example Property Test Structure**:
```typescript
// Feature: auth-and-admin, Property 1: Unauthenticated users are redirected to sign in
test.prop([fc.constantFrom('/gallery', '/cinematic', '/learn', '/admin')])(
  'unauthenticated users redirected to sign in for any protected route',
  (route) => {
    // Test implementation
  }
);
```

### Test Coverage Goals

**Authentication Layer**: 90%+ coverage
- AuthContext provider and hooks
- Sign in/out flows
- Session persistence
- Admin authorization

**Route Protection**: 100% coverage
- ProtectedRoute component
- AdminRoute component
- Redirect logic

**Admin Dashboard**: 85%+ coverage
- CRUD operations for all content types
- Form validation
- Firestore integration

**UI Components**: 80%+ coverage
- Navigation conditional rendering
- Video player
- Content forms
- Error displays

### Testing Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **@fast-check/vitest**: Property-based testing
- **Firebase Emulator**: Local Firestore testing
- **MSW (Mock Service Worker)**: API mocking

### Integration Testing

**Firebase Integration**:
- Use Firebase Emulator Suite for local testing
- Test actual Firestore operations without hitting production
- Verify authentication flows with emulated auth

**End-to-End Flows**:
- Complete authentication flow (sign in → access content → sign out)
- Complete admin flow (sign in → create content → edit → delete)
- Complete user flow (sign in → view content → watch video)

## Implementation Notes

### Firebase Setup

1. Create Firebase project in Firebase Console
2. Enable Google Authentication provider
3. Create Firestore database
4. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all authenticated users
    match /{collection}/{document} {
      allow read: if request.auth != null;
    }
    
    // Allow write access only to admin users
    match /{collection}/{document} {
      allow write: if request.auth != null && 
        request.auth.token.email in [
          // Admin emails from environment
        ];
    }
  }
}
```

### Environment Variables

Create `.env` file with:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Performance Considerations

**Firestore Queries**:
- Use Firestore caching to reduce reads
- Implement pagination for large collections
- Use Firestore indexes for complex queries

**Authentication**:
- Firebase SDK handles token refresh automatically
- Implement loading states to prevent UI flicker
- Cache user data in Context to avoid repeated checks

**Real-time Updates**:
- Consider using Firestore real-time listeners for admin dashboard
- Implement optimistic UI updates for better UX
- Debounce form inputs to reduce validation calls

### Security Considerations

**Admin Authorization**:
- Never trust client-side admin checks alone
- Implement Firestore security rules to enforce server-side authorization
- Validate admin status on every sensitive operation

**Data Validation**:
- Validate all inputs on client and server (Firestore rules)
- Sanitize user inputs to prevent XSS
- Use TypeScript for type safety

**Authentication**:
- Use Firebase Auth's built-in security features
- Implement CSRF protection
- Set appropriate session timeouts

### Accessibility

**Keyboard Navigation**:
- All interactive elements must be keyboard accessible
- Implement proper focus management in modals
- Use semantic HTML elements

**Screen Readers**:
- Add ARIA labels to all interactive elements
- Announce dynamic content changes
- Provide text alternatives for icons

**Visual**:
- Maintain sufficient color contrast (WCAG AA)
- Provide focus indicators
- Support browser zoom up to 200%

### Migration Strategy

**Phase 1: Setup**
- Set up Firebase project and configuration
- Implement authentication without route protection
- Test authentication flow

**Phase 2: Route Protection**
- Implement ProtectedRoute and AdminRoute
- Update App.tsx with route wrappers
- Test route protection

**Phase 3: Data Migration**
- Create Firestore collections
- Run migration script to populate from data.ts
- Update pages to fetch from Firestore
- Test data fetching

**Phase 4: Admin Dashboard**
- Implement admin dashboard UI
- Implement CRUD operations
- Test admin functionality

**Phase 5: Video Player**
- Implement video player component
- Add video URLs to courses
- Test video playback

**Phase 6: Polish**
- Add loading states
- Improve error handling
- Add animations
- Accessibility audit
