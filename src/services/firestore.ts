import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DesignItem, CinematicImage } from '../data';

// Course interface with videoUrl field and monetization fields
export interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
  thumbnail?: string;
  freeTrialDays?: number;
  freeTrialHours?: number;
  freeTrialMinutes?: number;
  freeTrialStartDate?: Date;
  priceAfterTrial?: number;
  currency?: string;
}

// CourseAccess interface for tracking user purchases
export interface CourseAccess {
  id: string;
  userId: string;
  courseId: string;
  purchaseDate: Date;
  paymentReference: string;
  amount: number;
  currency: string;
}

// Comment interface for course comments
export interface Comment {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  text: string;
  timestamp: Date;
}

// Collection names
const COLLECTIONS = {
  DESIGNS: 'designs',
  CINEMATICS: 'cinematics',
  COURSES: 'courses',
  COURSE_ACCESS: 'courseAccess',
  COMMENTS: 'comments',
} as const;

// Helper function to convert Firestore document to typed object
function docToData<T>(doc: QueryDocumentSnapshot<DocumentData>): T {
  return { id: doc.id, ...doc.data() } as T;
}

/**
 * Calculate trial expiration timestamp
 * @param freeTrialStartDate - The date when the trial started
 * @param freeTrialDays - Number of days for the trial
 * @param freeTrialHours - Number of hours for the trial
 * @param freeTrialMinutes - Number of minutes for the trial
 * @returns Date object representing when the trial expires, or null if no trial
 */
export function calculateTrialExpiration(
  freeTrialStartDate?: any, 
  freeTrialDays?: number,
  freeTrialHours?: number,
  freeTrialMinutes?: number
): Date | null {
  // Check if any trial duration is set
  const hasTrial = (freeTrialDays && freeTrialDays > 0) || 
                   (freeTrialHours && freeTrialHours > 0) || 
                   (freeTrialMinutes && freeTrialMinutes > 0);
  
  if (!freeTrialStartDate || !hasTrial) {
    return null;
  }
  
  // Handle Firestore Timestamp objects
  let startDate: Date;
  if (typeof freeTrialStartDate === 'object' && 'toDate' in freeTrialStartDate) {
    startDate = freeTrialStartDate.toDate();
  } else if (freeTrialStartDate instanceof Date) {
    startDate = freeTrialStartDate;
  } else {
    startDate = new Date(freeTrialStartDate);
  }
  
  const expirationDate = new Date(startDate);
  
  // Add days, hours, and minutes
  if (freeTrialDays) {
    expirationDate.setDate(expirationDate.getDate() + freeTrialDays);
  }
  if (freeTrialHours) {
    expirationDate.setHours(expirationDate.getHours() + freeTrialHours);
  }
  if (freeTrialMinutes) {
    expirationDate.setMinutes(expirationDate.getMinutes() + freeTrialMinutes);
  }
  
  return expirationDate;
}

/**
 * Check if a course trial is currently active
 * @param course - The course to check
 * @returns true if trial is active, false otherwise
 */
export function isTrialActive(course: Course): boolean {
  // Check if any trial duration is set
  const hasTrial = (course.freeTrialDays && course.freeTrialDays > 0) || 
                   (course.freeTrialHours && course.freeTrialHours > 0) || 
                   (course.freeTrialMinutes && course.freeTrialMinutes > 0);
  
  if (!hasTrial) {
    return false;
  }
  
  // If trial duration exists but no start date, assume trial just started (legacy courses)
  let startDate = course.freeTrialStartDate;
  
  // Handle Firestore Timestamp objects
  if (startDate && typeof startDate === 'object' && 'toDate' in startDate) {
    startDate = (startDate as any).toDate();
  } else if (!startDate) {
    startDate = new Date();
  } else if (typeof startDate === 'string') {
    startDate = new Date(startDate);
  }
  
  const expirationDate = calculateTrialExpiration(
    startDate, 
    course.freeTrialDays, 
    course.freeTrialHours, 
    course.freeTrialMinutes
  );
  
  if (!expirationDate) {
    return false;
  }
  
  return new Date() < expirationDate;
}

// ============================================================================
// DESIGNS
// ============================================================================

/**
 * Fetch all design items from Firestore
 * @returns Promise resolving to array of DesignItem
 * @throws Error if Firestore operation fails
 */
export async function getDesigns(): Promise<DesignItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.DESIGNS));
    return querySnapshot.docs.map(doc => docToData<DesignItem>(doc));
  } catch (error) {
    console.error('Error fetching designs:', error);
    throw new Error('Failed to fetch designs from database');
  }
}

/**
 * Fetch a single design item by ID
 * @param id - The design document ID
 * @returns Promise resolving to DesignItem or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getDesignById(id: string): Promise<DesignItem | null> {
  try {
    const docRef = doc(db, COLLECTIONS.DESIGNS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DesignItem;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching design ${id}:`, error);
    throw new Error(`Failed to fetch design with ID ${id}`);
  }
}

/**
 * Create a new design item in Firestore
 * @param design - Design data without ID
 * @returns Promise resolving to the new document ID
 * @throws Error if Firestore operation fails
 */
export async function createDesign(design: Omit<DesignItem, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.DESIGNS), design);
    return docRef.id;
  } catch (error) {
    console.error('Error creating design:', error);
    throw new Error('Failed to create design in database');
  }
}

/**
 * Update an existing design item
 * @param id - The design document ID
 * @param design - Partial design data to update
 * @throws Error if Firestore operation fails
 */
export async function updateDesign(id: string, design: Partial<DesignItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.DESIGNS, id);
    // Remove id from update data if present
    const { id: _, ...updateData } = design as DesignItem;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating design ${id}:`, error);
    throw new Error(`Failed to update design with ID ${id}`);
  }
}

/**
 * Delete a design item from Firestore
 * @param id - The design document ID
 * @throws Error if Firestore operation fails
 */
export async function deleteDesign(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.DESIGNS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting design ${id}:`, error);
    throw new Error(`Failed to delete design with ID ${id}`);
  }
}

// ============================================================================
// CINEMATICS
// ============================================================================

/**
 * Fetch all cinematic images from Firestore
 * @returns Promise resolving to array of CinematicImage
 * @throws Error if Firestore operation fails
 */
export async function getCinematics(): Promise<CinematicImage[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CINEMATICS));
    return querySnapshot.docs.map(doc => docToData<CinematicImage>(doc));
  } catch (error) {
    console.error('Error fetching cinematics:', error);
    throw new Error('Failed to fetch cinematics from database');
  }
}

/**
 * Fetch a single cinematic image by ID
 * @param id - The cinematic document ID
 * @returns Promise resolving to CinematicImage or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getCinematicById(id: string): Promise<CinematicImage | null> {
  try {
    const docRef = doc(db, COLLECTIONS.CINEMATICS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CinematicImage;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching cinematic ${id}:`, error);
    throw new Error(`Failed to fetch cinematic with ID ${id}`);
  }
}

/**
 * Create a new cinematic image in Firestore
 * @param cinematic - Cinematic data without ID
 * @returns Promise resolving to the new document ID
 * @throws Error if Firestore operation fails
 */
export async function createCinematic(cinematic: Omit<CinematicImage, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.CINEMATICS), cinematic);
    return docRef.id;
  } catch (error) {
    console.error('Error creating cinematic:', error);
    throw new Error('Failed to create cinematic in database');
  }
}

/**
 * Update an existing cinematic image
 * @param id - The cinematic document ID
 * @param cinematic - Partial cinematic data to update
 * @throws Error if Firestore operation fails
 */
export async function updateCinematic(id: string, cinematic: Partial<CinematicImage>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CINEMATICS, id);
    // Remove id from update data if present
    const { id: _, ...updateData } = cinematic as CinematicImage;
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating cinematic ${id}:`, error);
    throw new Error(`Failed to update cinematic with ID ${id}`);
  }
}

/**
 * Delete a cinematic image from Firestore
 * @param id - The cinematic document ID
 * @throws Error if Firestore operation fails
 */
export async function deleteCinematic(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.CINEMATICS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting cinematic ${id}:`, error);
    throw new Error(`Failed to delete cinematic with ID ${id}`);
  }
}

// ============================================================================
// COURSES
// ============================================================================

/**
 * Fetch all courses from Firestore
 * @returns Promise resolving to array of Course
 * @throws Error if Firestore operation fails
 */
export async function getCourses(): Promise<Course[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return querySnapshot.docs.map(doc => docToData<Course>(doc));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses from database');
  }
}

/**
 * Fetch a single course by ID
 * @param id - The course document ID
 * @returns Promise resolving to Course or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Course;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw new Error(`Failed to fetch course with ID ${id}`);
  }
}

/**
 * Create a new course in Firestore
 * @param course - Course data without ID
 * @returns Promise resolving to the new document ID
 * @throws Error if Firestore operation fails
 */
export async function createCourse(course: Omit<Course, 'id'>): Promise<string> {
  try {
    // Calculate trial start date if any trial duration is set
    const courseData = { ...course };
    const hasTrial = (courseData.freeTrialDays && courseData.freeTrialDays > 0) || 
                     (courseData.freeTrialHours && courseData.freeTrialHours > 0) || 
                     (courseData.freeTrialMinutes && courseData.freeTrialMinutes > 0);
    
    if (hasTrial) {
      courseData.freeTrialStartDate = new Date();
    }
    
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), courseData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw new Error('Failed to create course in database');
  }
}

/**
 * Update an existing course
 * @param id - The course document ID
 * @param course - Partial course data to update
 * @throws Error if Firestore operation fails
 */
export async function updateCourse(id: string, course: Partial<Course>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    // Remove id from update data if present
    const { id: _, ...updateData } = course as Course;
    
    // If any trial duration is being updated and is greater than 0, set freeTrialStartDate to now
    const hasTrial = (updateData.freeTrialDays && updateData.freeTrialDays > 0) || 
                     (updateData.freeTrialHours && updateData.freeTrialHours > 0) || 
                     (updateData.freeTrialMinutes && updateData.freeTrialMinutes > 0);
    
    if (hasTrial) {
      updateData.freeTrialStartDate = new Date();
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating course ${id}:`, error);
    throw new Error(`Failed to update course with ID ${id}`);
  }
}

/**
 * Delete a course from Firestore
 * @param id - The course document ID
 * @throws Error if Firestore operation fails
 */
export async function deleteCourse(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    throw new Error(`Failed to delete course with ID ${id}`);
  }
}

// ============================================================================
// COURSE ACCESS
// ============================================================================

/**
 * Check if a user has purchased access to a specific course
 * @param userId - The user's ID
 * @param courseId - The course ID
 * @returns Promise resolving to true if user has access, false otherwise
 * @throws Error if Firestore operation fails
 */
export async function checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
  try {
    // Use composite document ID for efficient lookup: userId_courseId
    const accessId = `${userId}_${courseId}`;
    const docRef = doc(db, COLLECTIONS.COURSE_ACCESS, accessId);
    const docSnap = await getDoc(docRef);
    
    return docSnap.exists();
  } catch (error: any) {
    // Permission errors mean the document doesn't exist (user hasn't purchased)
    // This is expected behavior when checking access for unpurchased courses
    if (error?.code === 'permission-denied') {
      return false;
    }
    
    console.error(`Error checking course access for user ${userId} and course ${courseId}:`, error);
    throw new Error('Failed to check course access');
  }
}

/**
 * Record a course purchase in Firestore
 * @param purchase - Purchase data without ID
 * @returns Promise resolving to the composite document ID (userId_courseId)
 * @throws Error if Firestore operation fails
 */
export async function recordCoursePurchase(purchase: Omit<CourseAccess, 'id'>): Promise<string> {
  try {
    // Use composite document ID for efficient lookup and to prevent duplicates
    const accessId = `${purchase.userId}_${purchase.courseId}`;
    
    const purchaseData = {
      ...purchase,
      purchaseDate: purchase.purchaseDate || new Date(),
    };
    
    // Use set() instead of addDoc() to use custom document ID
    const docRef = doc(db, COLLECTIONS.COURSE_ACCESS, accessId);
    await setDoc(docRef, purchaseData);
    
    return accessId;
  } catch (error) {
    console.error('Error recording course purchase:', error);
    throw new Error('Failed to record course purchase in database');
  }
}

/**
 * Get all course purchases for a specific user
 * @param userId - The user's ID
 * @returns Promise resolving to array of CourseAccess
 * @throws Error if Firestore operation fails
 */
export async function getUserPurchases(userId: string): Promise<CourseAccess[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.COURSE_ACCESS));
    const allPurchases = querySnapshot.docs.map(doc => docToData<CourseAccess>(doc));
    
    // Filter purchases for this user
    return allPurchases.filter(purchase => purchase.userId === userId);
  } catch (error) {
    console.error(`Error fetching purchases for user ${userId}:`, error);
    throw new Error('Failed to fetch user purchases from database');
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Get all comments for a specific course with real-time listener
 * @param courseId - The course ID
 * @param callback - Callback function to receive comment updates
 * @returns Unsubscribe function to stop listening
 * @throws Error if Firestore operation fails
 */
export function getComments(courseId: string, callback: (comments: Comment[]) => void): Unsubscribe {
  try {
    const commentsQuery = query(
      collection(db, COLLECTIONS.COMMENTS),
      where('courseId', '==', courseId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(
      commentsQuery,
      (querySnapshot) => {
        const comments = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          } as Comment;
        });
        
        callback(comments);
      },
      (error) => {
        console.error(`Error in comments snapshot listener for course ${courseId}:`, error);
        
        // If it's an index error, provide helpful message
        if (error.message.includes('index')) {
          console.error('FIRESTORE INDEX REQUIRED! Create index at:', error.message);
        }
        
        // Call callback with empty array on error so UI doesn't break
        callback([]);
      }
    );
  } catch (error) {
    console.error(`Error setting up comments listener for course ${courseId}:`, error);
    throw new Error('Failed to set up comments listener');
  }
}

/**
 * Create a new comment in Firestore
 * @param comment - Comment data without ID
 * @returns Promise resolving to the new document ID
 * @throws Error if Firestore operation fails
 */
export async function createComment(comment: Omit<Comment, 'id'>): Promise<string> {
  try {
    const commentData = {
      ...comment,
      timestamp: comment.timestamp || new Date(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.COMMENTS), commentData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment in database');
  }
}

/**
 * Delete a comment from Firestore
 * @param commentId - The comment document ID
 * @throws Error if Firestore operation fails
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTIONS.COMMENTS, commentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw new Error(`Failed to delete comment with ID ${commentId}`);
  }
}
