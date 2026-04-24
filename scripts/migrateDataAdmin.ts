/**
 * Data Migration Script using Firebase Admin SDK
 * 
 * This script migrates data from src/data.ts to Firestore collections
 * using Firebase Admin SDK which bypasses security rules.
 * 
 * Usage:
 *   npx tsx scripts/migrateDataAdmin.ts
 * 
 * Prerequisites:
 *   - Firebase service account key JSON file
 *   - Environment variable FIREBASE_SERVICE_ACCOUNT_KEY set
 */

import 'dotenv/config';
import * as admin from 'firebase-admin';
import { designs, cinematicImages, courses } from '../src/data';

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!serviceAccount) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set');
  console.log('\nTo get your service account key:');
  console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the JSON file');
  console.log('4. Set environment variable: export FIREBASE_SERVICE_ACCOUNT_KEY=\'$(cat path/to/serviceAccountKey.json)\'');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateData() {
  console.log('🔧 Initializing Firebase Admin...');
  console.log('✅ Firebase Admin initialized successfully\n');

  console.log('📊 Starting data migration...\n');

  try {
    const batch = db.batch();
    let operationCount = 0;

    // Migrate designs
    console.log(`📝 Migrating ${designs.length} designs...`);
    for (const design of designs) {
      const docRef = db.collection('designs').doc();
      batch.set(docRef, design);
      operationCount++;
    }
    console.log(`✅ Queued ${designs.length} designs for migration\n`);

    // Migrate cinematic images
    console.log(`🎬 Migrating ${cinematicImages.length} cinematic images...`);
    for (const cinematic of cinematicImages) {
      const docRef = db.collection('cinematics').doc();
      batch.set(docRef, cinematic);
      operationCount++;
    }
    console.log(`✅ Queued ${cinematicImages.length} cinematic images for migration\n`);

    // Migrate courses (with videoUrl field)
    console.log(`📚 Migrating ${courses.length} courses...`);
    for (const course of courses) {
      const docRef = db.collection('courses').doc();
      batch.set(docRef, {
        ...course,
        videoUrl: course.videoUrl || '',
      });
      operationCount++;
    }
    console.log(`✅ Queued ${courses.length} courses for migration (with videoUrl field)\n`);

    // Commit the batch
    console.log(`💾 Committing ${operationCount} operations to Firestore...`);
    await batch.commit();

    console.log('\n✅ Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`   • ${designs.length} designs migrated`);
    console.log(`   • ${cinematicImages.length} cinematic images migrated`);
    console.log(`   • ${courses.length} courses migrated`);
    console.log(`   • Total: ${operationCount} documents`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  }
}

migrateData();
