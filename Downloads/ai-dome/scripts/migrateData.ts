/**
 * Data Migration Script
 * 
 * This script migrates data from src/data.ts to Firestore collections.
 * It uses batch writes for efficient bulk operations and adds the videoUrl field to courses.
 * 
 * Usage:
 *   npx tsx scripts/migrateData.ts
 * 
 * Prerequisites:
 *   - Firebase project configured with Firestore
 *   - Environment variables set in .env file
 *   - tsx package installed (npm install -D tsx)
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { designs, cinematicImages, courses } from '../src/data';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
function validateConfig() {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please ensure your .env file is properly configured.'
    );
  }
}

// Initialize Firebase
function initializeFirebase() {
  console.log('🔧 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('✅ Firebase initialized successfully\n');
  return db;
}

/**
 * Migrate data to Firestore using batch writes
 * Firestore batch writes are limited to 500 operations per batch
 */
async function migrateData() {
  try {
    // Validate environment variables
    validateConfig();

    // Initialize Firebase
    const db = initializeFirebase();

    console.log('📊 Starting data migration...\n');

    // Create a batch write
    const batch = writeBatch(db);
    let operationCount = 0;

    // Migrate designs
    console.log(`📝 Migrating ${designs.length} designs...`);
    designs.forEach((design) => {
      const { id, ...designData } = design;
      const docRef = doc(collection(db, 'designs'), id);
      batch.set(docRef, designData);
      operationCount++;
    });
    console.log(`✅ Queued ${designs.length} designs for migration\n`);

    // Migrate cinematics
    console.log(`🎬 Migrating ${cinematicImages.length} cinematic images...`);
    cinematicImages.forEach((cinematic) => {
      const { id, ...cinematicData } = cinematic;
      const docRef = doc(collection(db, 'cinematics'), id);
      batch.set(docRef, cinematicData);
      operationCount++;
    });
    console.log(`✅ Queued ${cinematicImages.length} cinematic images for migration\n`);

    // Migrate courses with videoUrl field
    console.log(`📚 Migrating ${courses.length} courses...`);
    courses.forEach((course) => {
      const { id, ...courseData } = course;
      // Add videoUrl field (empty string initially)
      const courseWithVideo = {
        ...courseData,
        videoUrl: '',
      };
      const docRef = doc(collection(db, 'courses'), id);
      batch.set(docRef, courseWithVideo);
      operationCount++;
    });
    console.log(`✅ Queued ${courses.length} courses for migration (with videoUrl field)\n`);

    // Check if we're within batch limits (500 operations max)
    if (operationCount > 500) {
      throw new Error(
        `Batch operation limit exceeded: ${operationCount} operations queued. ` +
        'Firestore batch writes are limited to 500 operations. ' +
        'Please split the migration into multiple batches.'
      );
    }

    // Commit the batch
    console.log(`💾 Committing ${operationCount} operations to Firestore...`);
    await batch.commit();
    console.log('✅ Batch commit successful!\n');

    // Summary
    console.log('🎉 Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   • Designs migrated: ${designs.length}`);
    console.log(`   • Cinematics migrated: ${cinematicImages.length}`);
    console.log(`   • Courses migrated: ${courses.length}`);
    console.log(`   • Total operations: ${operationCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      
      // Provide helpful error messages for common issues
      if (error.message.includes('Missing required environment variables')) {
        console.error('\n💡 Tip: Make sure your .env file exists and contains all required Firebase variables.');
      } else if (error.message.includes('permission-denied')) {
        console.error('\n💡 Tip: Check your Firestore security rules. You may need to temporarily allow writes.');
      } else if (error.message.includes('not-found')) {
        console.error('\n💡 Tip: Ensure your Firestore database is created in the Firebase Console.');
      }
    } else {
      console.error('An unknown error occurred:', error);
    }
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

// Run the migration
migrateData();
