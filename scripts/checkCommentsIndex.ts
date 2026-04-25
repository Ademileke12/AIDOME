/**
 * Check if the comments index exists and is working
 * Run with: npx tsx scripts/checkCommentsIndex.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs, limit } from 'firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkIndex() {
  console.log('🔍 Checking if comments index exists...\n');

  try {
    // First, get a sample courseId
    const allCommentsSnapshot = await getDocs(collection(db, 'comments'));
    
    if (allCommentsSnapshot.empty) {
      console.log('⚠️  No comments found in database.');
      console.log('   Create a comment first to test the index.\n');
      process.exit(0);
    }

    const sampleCourseId = allCommentsSnapshot.docs[0].data().courseId;
    console.log(`📝 Testing with courseId: ${sampleCourseId}\n`);

    // Try the query that requires the index
    console.log('🔄 Attempting query with index...');
    const commentsQuery = query(
      collection(db, 'comments'),
      where('courseId', '==', sampleCourseId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const querySnapshot = await getDocs(commentsQuery);
    
    console.log('✅ SUCCESS! Index exists and is working!\n');
    console.log(`   Found ${querySnapshot.size} comment(s) for course ${sampleCourseId}`);
    console.log('   Comments will display correctly in your app.\n');

  } catch (error: any) {
    console.log('❌ FAILED! Index is missing or not working.\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('index')) {
      console.log('\n🔥 ACTION REQUIRED: Create the Firestore index\n');
      console.log('Method 1 (Easiest):');
      console.log('  1. Open your app in browser');
      console.log('  2. Open console (F12)');
      console.log('  3. Navigate to a course page');
      console.log('  4. Click the error link to create index\n');
      
      console.log('Method 2 (Firebase CLI):');
      console.log('  Run: firebase deploy --only firestore:indexes\n');
      
      console.log('Method 3 (Manual):');
      console.log('  1. Go to Firebase Console → Firestore → Indexes');
      console.log('  2. Create index:');
      console.log('     - Collection: comments');
      console.log('     - Field 1: courseId (Ascending)');
      console.log('     - Field 2: timestamp (Descending)\n');
    }
  }

  process.exit(0);
}

// Run the check
checkIndex();
