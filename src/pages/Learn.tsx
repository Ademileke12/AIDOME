import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, type Course, isTrialActive } from '../services/firestore';
import FreeTrialTimer from '../components/FreeTrialTimer';
import { useAuth } from '../contexts/AuthContext';

export default function Learn() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle course click - navigate to course page
  const handleCourseClick = (course: Course) => {
    if (!user) {
      setError('Please sign in to access courses');
      return;
    }

    // Navigate to the course page
    navigate(`/course/${course.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-white/60">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-[1200px] mx-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 sm:mb-24"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
          Curriculum <br/>
          <span className="font-serif italic font-light text-white/40">Memos</span>
        </h1>
      </motion.div>

      <div className="flex flex-col gap-6 sm:gap-8">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: i < 5 ? i * 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
          >
            {/* The line separator */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/[0.05] group-hover:bg-white/20 transition-colors duration-500" />
            
            <div className="py-8 sm:py-12 grid grid-cols-1 md:grid-cols-[200px_80px_1fr_160px] lg:grid-cols-[280px_100px_1fr_200px] gap-4 sm:gap-6 md:gap-8 items-start cursor-pointer hover:bg-white/[0.01] transition-colors p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-xl"
              onClick={() => handleCourseClick(course)}
            >
              
              {/* Thumbnail Image */}
              {course.thumbnail ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-colors">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Module Count */}
              <div className="editable-label pt-0 sm:pt-2 text-xs sm:text-sm">
                {String(course.modules).padStart(2, '0')} Mod.
              </div>
              
              {/* Content */}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-light tracking-tight group-hover:text-white transition-colors duration-300">
                  {course.title}
                </h2>
                <p className="mt-4 sm:mt-6 text-white/50 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl text-balance">
                  {course.description}
                </p>
              </div>

              {/* Action / Badge */}
              <div className="md:text-right pt-0 sm:pt-2 flex md:block flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-2 items-start md:items-end">
                  {/* Free Trial Timer */}
                  {course.freeTrialDays && course.freeTrialDays > 0 && isTrialActive(course) && (
                    <FreeTrialTimer course={course} />
                  )}
                  
                  {/* Course Status Badge */}
                  {course.isFree ? (
                    <span className="inline-block px-2 sm:px-3 py-1 editable-label border border-white !text-white rounded-full text-xs">
                      Free
                    </span>
                  ) : course.freeTrialDays && course.freeTrialDays > 0 && isTrialActive(course) ? (
                    <span className="inline-block px-2 sm:px-3 py-1 editable-label border border-blue-500/30 text-blue-300 rounded-full text-xs">
                      Free for {course.freeTrialDays} days
                    </span>
                  ) : course.priceAfterTrial && course.priceAfterTrial > 0 ? (
                    <span className="inline-block px-2 sm:px-3 py-1 editable-label border border-white/10 text-white/60 rounded-full text-xs">
                      {course.currency || 'USD'} {course.priceAfterTrial.toFixed(2)}
                    </span>
                  ) : (
                    <span className="inline-block px-2 sm:px-3 py-1 editable-label border border-white/10 text-white/40 rounded-full text-xs">
                      Pro
                    </span>
                  )}
                </div>
                <div className="md:mt-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="editable-label !text-white/60 text-xs sm:text-sm">
                    Enroll →
                  </span>
                </div>
              </div>
              
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
