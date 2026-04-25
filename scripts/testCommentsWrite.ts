import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
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

async function testCommentWrite() {
  console.log('🧪 Testing comment write functionality...\n');

  try {
    // Test 1: Create a test comment
    console.log('📝 Creating test comment...');
    const testComment = {
      courseId: 'test-course-id',
      userId: 'test-user-id',
      userName: 'Test User',
      userPhotoURL: 'https://via.placeholder.com/40',
      text: 'This is a test comment created at ' + new Date().toISOString(),
      timestamp: new Date(),
    };

    const docRef = await addDoc(collection(db, 'comments'), testComment);
    console.log('✅ Comment created with ID:', docRef.id);

    // Test 2: Read back the comment
    console.log('\n📖 Reading back comments for test course...');
    const commentsQuery = query(
      collection(db, 'comments'),
      where('courseId', '==', 'test-course-id'),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(commentsQuery);
    console.log('✅ Found', querySnapshot.docs.length, 'comments');

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log('\n📄 Comment:', {
        id: doc.id,
        userName: data.userName,
        text: data.text,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      });
    });

    // Test 3: Check all comments
    console.log('\n📊 Checking all comments in database...');
    const allCommentsSnapshot = await getDocs(collection(db, 'comments'));
    console.log('✅ Total comments in database:', allCommentsSnapshot.docs.length);

    // Group by courseId
    const commentsByCourse: Record<string, number> = {};
    allCommentsSnapshot.docs.forEach((doc) => {
      const courseId = doc.data().courseId;
      commentsByCourse[courseId] = (commentsByCourse[courseId] || 0) + 1;
    });

    console.log('\n📈 Comments by course:');
    Object.entries(commentsByCourse).forEach(([courseId, count]) => {
      console.log(`  ${courseId}: ${count} comments`);
    });

    console.log('\n✅ All tests passed!');
  } catch (error: any) {
    console.error('\n❌ Error during test:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    if (error.message?.includes('index')) {
      console.error('\n🔥 FIRESTORE INDEX REQUIRED!');
      console.error('The error message above should contain a link to create the index.');
      console.error('Click the link, then click "Create Index" in Firebase Console.');
    }
  }
}

testCommentWrite();
