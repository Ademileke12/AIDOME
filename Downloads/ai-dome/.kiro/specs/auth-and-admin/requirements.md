# Requirements Document

## Introduction

This specification defines the authentication and admin functionality for the AI Dome portfolio website. The feature introduces Google OAuth authentication, protected routes, an admin dashboard for content management, a video learning interface, and backend integration to replace static data with dynamic content storage.

## Glossary

- **System**: The AI Dome portfolio web application
- **User**: Any visitor to the AI Dome website
- **Admin_User**: A user with elevated privileges to manage content
- **Authentication_Service**: The Google OAuth authentication provider
- **Content_Database**: The persistent storage system for designs, cinematic images, and courses
- **Protected_Route**: A page that requires authentication to access
- **Session**: The authenticated state of a user persisting across page reloads
- **Gallery_Item**: A design item displayed in the Gallery page
- **Cinematic_Item**: A cinematic image displayed in the Cinematic Gallery page
- **Course**: A learning resource displayed in the Learn page
- **Video_Player**: The interface for displaying course video content
- **Navigation_Menu**: The top navigation bar containing links to different pages
- **Admin_Dashboard**: The interface for creating, editing, and deleting content

## Requirements

### Requirement 1: Google OAuth Authentication

**User Story:** As a user, I want to sign in with my Google account, so that I can access the AI Dome portfolio content securely.

#### Acceptance Criteria

1. WHEN a user visits the application without authentication, THE System SHALL redirect them to a Sign In page
2. WHEN a user clicks the Google Sign In button, THE System SHALL initiate the Google OAuth flow
3. WHEN the Authentication_Service successfully authenticates a user, THE System SHALL create a Session for that user
4. WHEN a Session is created, THE System SHALL store the user's authentication state in browser storage
5. WHEN a user returns to the application with a valid Session, THE System SHALL automatically authenticate them without requiring sign-in

### Requirement 2: Navigation Visibility Control

**User Story:** As a product owner, I want navigation links hidden until users authenticate, so that unauthenticated users cannot access protected content.

#### Acceptance Criteria

1. WHEN a user is not authenticated, THE Navigation_Menu SHALL hide all navigation links except the Sign In option
2. WHEN a user successfully authenticates, THE Navigation_Menu SHALL display all navigation links (Home, Gallery, Cinematic, Learn)
3. IF a user is an Admin_User, THEN THE Navigation_Menu SHALL additionally display the Admin link
4. WHEN a user signs out, THE Navigation_Menu SHALL immediately hide all navigation links except Sign In

### Requirement 3: Protected Route Access

**User Story:** As a security-conscious developer, I want all pages except Sign In to require authentication, so that content is protected from unauthorized access.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access any Protected_Route, THE System SHALL redirect them to the Sign In page
2. WHEN an unauthenticated user attempts to access the Sign In page, THE System SHALL allow access
3. WHEN a user successfully authenticates, THE System SHALL redirect them to the originally requested page
4. IF no specific page was requested, THEN THE System SHALL redirect authenticated users to the Home page
5. WHEN an authenticated user navigates to any Protected_Route, THE System SHALL allow access without redirection

### Requirement 4: Admin Dashboard - Gallery Management

**User Story:** As an Admin_User, I want to create, edit, and delete gallery items, so that I can manage the design portfolio content.

#### Acceptance Criteria

1. WHEN an Admin_User accesses the Admin_Dashboard, THE System SHALL display a list of all Gallery_Items
2. WHEN an Admin_User clicks "Create New Design", THE System SHALL display a form with fields: title, category, image URL, isPremium flag, and prompt
3. WHEN an Admin_User submits a valid Gallery_Item form, THE System SHALL save the item to the Content_Database and update the Gallery page immediately
4. WHEN an Admin_User clicks "Edit" on a Gallery_Item, THE System SHALL populate the form with existing data
5. WHEN an Admin_User saves edited Gallery_Item data, THE System SHALL update the Content_Database and reflect changes immediately
6. WHEN an Admin_User clicks "Delete" on a Gallery_Item, THE System SHALL remove it from the Content_Database and update the Gallery page immediately
7. WHEN an Admin_User attempts to submit an incomplete Gallery_Item form, THE System SHALL display validation errors

### Requirement 5: Admin Dashboard - Cinematic Management

**User Story:** As an Admin_User, I want to create, edit, and delete cinematic items, so that I can manage the cinematic gallery content.

#### Acceptance Criteria

1. WHEN an Admin_User accesses the Admin_Dashboard, THE System SHALL display a list of all Cinematic_Items
2. WHEN an Admin_User clicks "Create New Cinematic", THE System SHALL display a form with fields: title, image URL, prompt, colors array, and lighting description
3. WHEN an Admin_User submits a valid Cinematic_Item form, THE System SHALL save the item to the Content_Database and update the Cinematic Gallery page immediately
4. WHEN an Admin_User clicks "Edit" on a Cinematic_Item, THE System SHALL populate the form with existing data
5. WHEN an Admin_User saves edited Cinematic_Item data, THE System SHALL update the Content_Database and reflect changes immediately
6. WHEN an Admin_User clicks "Delete" on a Cinematic_Item, THE System SHALL remove it from the Content_Database and update the Cinematic Gallery page immediately
7. WHEN an Admin_User enters colors in the colors array field, THE System SHALL validate that each color is a valid hex color code

### Requirement 6: Admin Dashboard - Course Management

**User Story:** As an Admin_User, I want to create, edit, and delete courses, so that I can manage the learning content.

#### Acceptance Criteria

1. WHEN an Admin_User accesses the Admin_Dashboard, THE System SHALL display a list of all Courses
2. WHEN an Admin_User clicks "Create New Course", THE System SHALL display a form with fields: title, description, modules count, isFree flag, and video URL
3. WHEN an Admin_User submits a valid Course form, THE System SHALL save the item to the Content_Database and update the Learn page immediately
4. WHEN an Admin_User clicks "Edit" on a Course, THE System SHALL populate the form with existing data
5. WHEN an Admin_User saves edited Course data, THE System SHALL update the Content_Database and reflect changes immediately
6. WHEN an Admin_User clicks "Delete" on a Course, THE System SHALL remove it from the Content_Database and update the Learn page immediately
7. WHEN an Admin_User enters a video URL, THE System SHALL validate that the URL is properly formatted

### Requirement 7: Video Learning Interface

**User Story:** As a user, I want to watch course videos in an integrated player, so that I can learn without leaving the application.

#### Acceptance Criteria

1. WHEN a user clicks on a Course in the Learn page, THE System SHALL open the Video_Player interface
2. WHEN the Video_Player opens, THE System SHALL display the course video, title, description, and module count
3. WHEN the Video_Player is displayed, THE System SHALL maintain the dark theme and glassmorphism aesthetic
4. WHEN a user clicks close or back in the Video_Player, THE System SHALL return them to the Learn page
5. IF a Course has no video URL, THEN THE System SHALL display a message indicating video content is unavailable

### Requirement 8: Backend Integration and Data Persistence

**User Story:** As a developer, I want content stored in a database instead of static files, so that admin changes persist and the application is scalable.

#### Acceptance Criteria

1. WHEN the System starts, THE System SHALL connect to the Content_Database
2. WHEN the Gallery page loads, THE System SHALL fetch Gallery_Items from the Content_Database
3. WHEN the Cinematic Gallery page loads, THE System SHALL fetch Cinematic_Items from the Content_Database
4. WHEN the Learn page loads, THE System SHALL fetch Courses from the Content_Database
5. WHEN an Admin_User creates, updates, or deletes content, THE System SHALL persist changes to the Content_Database immediately
6. WHEN the Content_Database is unavailable, THE System SHALL display an error message to users
7. WHEN fetching data from the Content_Database, THE System SHALL implement loading states for better user experience

### Requirement 9: Admin Authorization

**User Story:** As a security-conscious developer, I want only authorized users to access the admin dashboard, so that content management is restricted to trusted individuals.

#### Acceptance Criteria

1. WHEN a user authenticates, THE System SHALL check if the user's email is in the authorized admin list
2. WHEN a non-Admin_User attempts to access the Admin_Dashboard, THE System SHALL redirect them to the Home page
3. WHEN an Admin_User accesses the Admin_Dashboard, THE System SHALL allow full access to all content management features
4. THE System SHALL store the admin email list in environment variables for security
5. WHEN the admin email list is updated, THE System SHALL require application restart to take effect

### Requirement 10: Session Management and Sign Out

**User Story:** As a user, I want to sign out of my account, so that I can protect my session on shared devices.

#### Acceptance Criteria

1. WHEN an authenticated user clicks the Sign Out button, THE System SHALL clear the user's Session
2. WHEN a Session is cleared, THE System SHALL remove authentication state from browser storage
3. WHEN a user signs out, THE System SHALL redirect them to the Sign In page
4. WHEN a Session expires, THE System SHALL automatically sign out the user and redirect to Sign In
5. WHEN a user signs out, THE Navigation_Menu SHALL immediately hide all navigation links except Sign In

### Requirement 11: UI Consistency and Aesthetics

**User Story:** As a designer, I want all new features to match the existing UI aesthetic, so that the application maintains visual consistency.

#### Acceptance Criteria

1. WHEN the Sign In page is displayed, THE System SHALL use the dark theme with glassmorphism design
2. WHEN the Admin_Dashboard is displayed, THE System SHALL use the same glassmorphism cards and typography as existing pages
3. WHEN the Video_Player is displayed, THE System SHALL use the dark theme and maintain the editorial aesthetic
4. WHEN forms are displayed in the Admin_Dashboard, THE System SHALL use consistent input styling with the rest of the application
5. WHEN animations occur in new features, THE System SHALL use motion/react with timing consistent with existing page transitions
