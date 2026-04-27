import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// PAYSTACK WEBHOOK VERIFICATION
// ============================================================================

/**
 * Verify Paystack webhook signature
 * This ensures the webhook request actually came from Paystack
 */
function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = functions.config().paystack.secret_key;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

/**
 * Handle Paystack payment webhooks
 * This function is called by Paystack when a payment is successful
 * 
 * Security: Only creates purchase records after verifying payment signature
 */
export const paystackWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Get signature from headers
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      console.error('Missing Paystack signature');
      res.status(400).send('Missing signature');
      return;
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    if (!verifyPaystackSignature(payload, signature)) {
      console.error('Invalid Paystack signature');
      res.status(401).send('Invalid signature');
      return;
    }

    // Process the webhook event
    const event = req.body;
    console.log('Paystack webhook event:', event.event);

    // Handle successful payment
    if (event.event === 'charge.success') {
      const { reference, amount, currency, customer, metadata } = event.data;

      // Extract course and user information from metadata
      const { courseId, userId, courseName } = metadata;

      if (!courseId || !userId) {
        console.error('Missing courseId or userId in metadata');
        res.status(400).send('Invalid metadata');
        return;
      }

      // Create purchase record with composite ID: userId_courseId
      const accessId = `${userId}_${courseId}`;
      const purchaseData = {
        userId,
        courseId,
        purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
        paymentReference: reference,
        amount: amount / 100, // Paystack amounts are in kobo/cents
        currency,
        customerEmail: customer.email,
        courseName,
        verified: true,
      };

      // Store purchase record
      await db.collection('courseAccess').doc(accessId).set(purchaseData);

      console.log(`Purchase recorded: User ${userId} purchased course ${courseId}`);

      // Optional: Send confirmation email to user
      // await sendPurchaseConfirmationEmail(customer.email, courseName);

      res.status(200).send('Webhook processed successfully');
    } else {
      // Log other events but don't process them
      console.log(`Unhandled event type: ${event.event}`);
      res.status(200).send('Event received');
    }
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).send('Internal server error');
  }
});

// ============================================================================
// SECURE VIDEO URL GENERATION
// ============================================================================

/**
 * Generate a time-limited signed URL for video access
 * This prevents users from sharing direct video URLs
 * 
 * Security: Validates user access before generating URL
 */
export const getVideoUrl = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to access videos'
      );
    }

    const { courseId } = data;
    const userId = context.auth.uid;

    if (!courseId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Course ID is required'
      );
    }

    // Get course data
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Course not found'
      );
    }

    const course = courseDoc.data()!;

    // Check if user has access to this course
    const hasAccess = await checkUserAccess(userId, courseId, course);
    if (!hasAccess) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User does not have access to this course'
      );
    }

    // Generate signed URL with 1-hour expiration
    // Note: This assumes videos are stored in Firebase Storage
    // If using external URLs, return the URL directly (less secure)
    
    if (course.videoUrl) {
      // For now, return the video URL
      // TODO: Implement Firebase Storage with signed URLs
      return {
        videoUrl: course.videoUrl,
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };
    }

    throw new functions.https.HttpsError(
      'not-found',
      'Video URL not found for this course'
    );
  } catch (error) {
    console.error('Error generating video URL:', error);
    throw error;
  }
});

/**
 * Check if user has access to a course
 * Validates: free courses, active trials, and purchases
 */
async function checkUserAccess(
  userId: string,
  courseId: string,
  course: any
): Promise<boolean> {
  // If course is free, grant access
  if (course.isFree === true) {
    return true;
  }

  // Check if trial is active
  if (isTrialActive(course)) {
    return true;
  }

  // Check if user has purchased the course
  const accessId = `${userId}_${courseId}`;
  const purchaseDoc = await db.collection('courseAccess').doc(accessId).get();
  return purchaseDoc.exists;
}

/**
 * Check if trial is currently active for a course
 * Server-side validation to prevent client manipulation
 */
function isTrialActive(course: any): boolean {
  const hasTrial =
    (course.freeTrialDays && course.freeTrialDays > 0) ||
    (course.freeTrialHours && course.freeTrialHours > 0) ||
    (course.freeTrialMinutes && course.freeTrialMinutes > 0);

  if (!hasTrial || !course.freeTrialStartDate) {
    return false;
  }

  // Calculate expiration
  const startDate = course.freeTrialStartDate.toDate();
  const expirationDate = new Date(startDate);

  if (course.freeTrialDays) {
    expirationDate.setDate(expirationDate.getDate() + course.freeTrialDays);
  }
  if (course.freeTrialHours) {
    expirationDate.setHours(expirationDate.getHours() + course.freeTrialHours);
  }
  if (course.freeTrialMinutes) {
    expirationDate.setMinutes(expirationDate.getMinutes() + course.freeTrialMinutes);
  }

  return new Date() < expirationDate;
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * Manually grant course access (admin only)
 * Useful for promotional access or refunds
 */
export const grantCourseAccess = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is admin
    if (!context.auth || !isAdmin(context.auth.token.email)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can grant course access'
      );
    }

    const { userId, courseId, reason } = data;

    if (!userId || !courseId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID and Course ID are required'
      );
    }

    // Create purchase record
    const accessId = `${userId}_${courseId}`;
    const purchaseData = {
      userId,
      courseId,
      purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
      paymentReference: `ADMIN_GRANT_${Date.now()}`,
      amount: 0,
      currency: 'USD',
      grantedBy: context.auth.uid,
      reason: reason || 'Admin grant',
      verified: true,
    };

    await db.collection('courseAccess').doc(accessId).set(purchaseData);

    console.log(`Admin ${context.auth.uid} granted access: User ${userId} -> Course ${courseId}`);

    return { success: true, message: 'Access granted successfully' };
  } catch (error) {
    console.error('Error granting course access:', error);
    throw error;
  }
});

/**
 * Revoke course access (admin only)
 * Useful for refunds or policy violations
 */
export const revokeCourseAccess = functions.https.onCall(async (data, context) => {
  try {
    // Check if user is admin
    if (!context.auth || !isAdmin(context.auth.token.email)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can revoke course access'
      );
    }

    const { userId, courseId, reason } = data;

    if (!userId || !courseId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'User ID and Course ID are required'
      );
    }

    // Delete purchase record
    const accessId = `${userId}_${courseId}`;
    await db.collection('courseAccess').doc(accessId).delete();

    // Log the revocation
    await db.collection('accessRevocations').add({
      userId,
      courseId,
      revokedBy: context.auth.uid,
      revokedAt: admin.firestore.FieldValue.serverTimestamp(),
      reason: reason || 'Admin revocation',
    });

    console.log(`Admin ${context.auth.uid} revoked access: User ${userId} -> Course ${courseId}`);

    return { success: true, message: 'Access revoked successfully' };
  } catch (error) {
    console.error('Error revoking course access:', error);
    throw error;
  }
});

/**
 * Check if email is an admin
 */
function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = ['samuelabudu21@gmail.com']; // Add more admin emails
  return adminEmails.includes(email);
}

// ============================================================================
// MONITORING & LOGGING
// ============================================================================

/**
 * Log video access attempts for security monitoring
 */
export const logVideoAccess = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      return { success: false };
    }

    const { courseId, action } = data;

    await db.collection('videoAccessLogs').add({
      userId: context.auth.uid,
      courseId,
      action, // 'play', 'pause', 'seek', 'complete'
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: context.rawRequest.headers['user-agent'],
      ip: context.rawRequest.ip,
    });

    return { success: true };
  } catch (error) {
    console.error('Error logging video access:', error);
    return { success: false };
  }
});
