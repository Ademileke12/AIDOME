/**
 * Test script to verify comments functionality
 * Run with: npx tsx scripts/testComments.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
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

async function testCommentsQuery() {
  console.log('🔍 Testing comments query...\n');

  try {
    // Test 1: Get all comments (no filter)
    console.log('Test 1: Fetching all comments...');
    const allCommentsSnapshot = await getDocs(collection(db, 'comments'));
    console.log(`✅ Found ${allCommentsSnapshot.docs.length} total comments\n`);
    
    if (allCommentsSnapshot.docs.length > 0) {
      console.log('Sample comment:');
      const sampleDoc = allCommentsSnapshot.docs[0];
      console.log(JSON.stringify({ id: sampleDoc.id, ...sampleDoc.data() }, null, 2));
      console.log('');
    }

    // Test 2: Get comments for a specific course (with orderBy)
    console.log('Test 2: Fetching comments with courseId filter and orderBy...');
    
    // Get a courseId from the first comment if available
    if (allCommentsSnapshot.docs.length > 0) {
      const firstComment = allCommentsSnapshot.docs[0].data();
      const testCourseId = firstComment.courseId;
      
      console.log(`Testing with courseId: ${testCourseId}`);
      
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('courseId', '==', testCourseId),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(commentsQuery);
        console.log(`✅ Query successful! Found ${querySnapshot.docs.length} comments for course ${testCourseId}\n`);
        
        querySnapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`Comment ${index + 1}:`);
          console.log(`  ID: ${doc.id}`);
          console.log(`  User: ${data.userName}`);
          console.log(`  Text: ${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}`);
          console.log(`  Timestamp: ${data.timestamp?.toDate?.() || data.timestamp}`);
          console.log('');
        });
      } catch (error: any) {
        console.error('❌ Query failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('index')) {
          console.error('\n🔥 FIRESTORE INDEX REQUIRED!');
          console.error('The query requires a composite index.');
          console.error('\nTo fix this:');
          console.error('1. Look for a link in the error message above');
          console.error('2. Click the link to create the index automatically');
          console.error('3. Or manually create an index in Firebase Console:');
          console.error('   - Collection: comments');
          console.error('   - Fields: courseId (Ascending), timestamp (Descending)');
          console.error('   - Query scope: Collection');
        }
      }
    } else {
      console.log('⚠️ No comments found in database. Cannot test query.');
      console.log('Create a comment first by:');
      console.log('1. Sign in to the app');
      console.log('2. Navigate to a course page');
      console.log('3. Post a comment');
    }

    // Test 3: List all courses to help with testing
    console.log('\nTest 3: Listing available courses...');
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    console.log(`Found ${coursesSnapshot.docs.length} courses:\n`);
    
    coursesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title} (ID: ${doc.id})`);
      console.log(`   Free: ${data.isFree ? 'Yes' : 'No'}`);
      if (data.freeTrialDays) {
        console.log(`   Free Trial: ${data.freeTrialDays} days`);
      }
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }

  process.exit(0);
}

// Run the test
testCommentsQuery();
