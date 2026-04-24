import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, checkCourseAccess, isTrialActive, type Course } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import PaymentModal from '../components/PaymentModal';
import FreeTrialTimer from '../components/FreeTrialTimer';
import Comments from '../components/Comments';

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const fetchCourseAndCheckAccess = async () => {
      if (!id) {
        setError('Course ID is missing');
        setLoading(false);
        return;
      }

      if (!user) {
        setError('Please sign in to access courses');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch course data
        const courseData = await getCourseById(id);
        
        if (!courseData) {
          setError('Course not found');
          setLoading(false);
          return;
        }

        setCourse(courseData);

        // Check if user has access to this course
        // Access is granted if:
        // 1. Course is free
        // 2. Course has active free trial
        // 3. User has purchased the course
        
        console.log('🔍 Course access check:', {
          title: courseData.title,
          isFree: courseData.isFree,
          freeTrialDays: courseData.freeTrialDays,
          freeTrialStartDate: courseData.freeTrialStartDate,
          hasStartDate: !!courseData.freeTrialStartDate
        });
        
        if (courseData.isFree) {
          console.log('✅ Course is free - granting access');
          setHasAccess(true);
          setShowPaymentModal(false);
        } else if (courseData.freeTrialDays && courseData.freeTrialDays > 0) {
          // If trial days exist but no start date, assume trial starts now
          if (!courseData.freeTrialStartDate) {
            console.log('⚠️ Trial days exist but no start date - setting to now');
            courseData.freeTrialStartDate = new Date();
          }
          
          // Check if trial is active
          const trialActive = isTrialActive(courseData);
          console.log('🔍 Trial active check:', trialActive);
          
          if (trialActive) {
            console.log('✅ Trial is active - granting access');
            setHasAccess(true);
            setShowPaymentModal(false);
          } else {
            console.log('❌ Trial expired - checking purchase');
            // Trial has expired, check if user purchased
            const purchased = await checkCourseAccess(user.uid, courseData.id);
            setHasAccess(purchased);
            setShowPaymentModal(!purchased);
          }
        } else {
          console.log('💰 No trial - checking purchase');
          // No trial, check if user has purchased
          const purchased = await checkCourseAccess(user.uid, courseData.id);
          setHasAccess(purchased);
          
          // If no access, show payment modal
          if (!purchased) {
            setShowPaymentModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndCheckAccess();
  }, [id, user]);

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setHasAccess(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/learn');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/60">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Course not found'}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleBack}
        className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
      >
        <svg 
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Courses
      </motion.button>

      {/* Course header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 sm:mb-12"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] mb-4 sm:mb-6">
              {course.title}
            </h1>
            <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl whitespace-pre-line">
              {course.description}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 items-start sm:items-end">
            {/* Module count */}
            <span className="editable-label text-sm">
              {String(course.modules).padStart(2, '0')} Modules
            </span>
            
            {/* Free trial timer */}
            {course.freeTrialDays && course.freeTrialDays > 0 && isTrialActive(course) && (
              <FreeTrialTimer course={course} />
            )}
            
            {/* Course status badge */}
            {course.isFree ? (
              <span className="inline-block px-3 py-1 editable-label border border-white !text-white rounded-full text-xs">
                Free
              </span>
            ) : course.freeTrialDays && course.freeTrialDays > 0 && isTrialActive(course) ? (
              <span className="inline-block px-3 py-1 editable-label border border-blue-500/30 text-blue-300 rounded-full text-xs">
                Free Trial Active
              </span>
            ) : course.priceAfterTrial && course.priceAfterTrial > 0 ? (
              <span className="inline-block px-3 py-1 editable-label border border-white/10 text-white/60 rounded-full text-xs">
                {course.currency || 'USD'} {course.priceAfterTrial.toFixed(2)}
              </span>
            ) : (
              <span className="inline-block px-3 py-1 editable-label border border-white/10 text-white/40 rounded-full text-xs">
                Pro
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Video player section - only show if user has access */}
      {hasAccess && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <VideoPlayer 
            course={course} 
            showExternalLink={true}
            embedded={true}
          />
        </motion.div>
      )}

      {/* Comments section - only show if user has access */}
      {hasAccess && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Comments courseId={course.id} />
        </motion.div>
      )}

      {/* Payment modal */}
      {showPaymentModal && course && (
        <PaymentModal
          course={course}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
