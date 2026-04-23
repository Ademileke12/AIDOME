import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { DesignItem, CinematicImage } from '../data';

// Course interface with videoUrl field
export interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
  thumbnail?: string;
}

// Collection names
const COLLECTIONS = {
  DESIGNS: 'designs',
  CINEMATICS: 'cinematics',
  COURSES: 'courses',
} as const;

// Helper function to convert Firestore document to typed object
function docToData<T>(doc: QueryDocumentSnapshot<DocumentData>): T {
  return { id: doc.id, ...doc.data() } as T;
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
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), course);
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
