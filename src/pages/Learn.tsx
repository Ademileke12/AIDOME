import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { getCourses, type Course } from '../services/firestore';
import VideoPlayer from '../components/VideoPlayer';

export default function Learn() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
            
            <div className="py-8 sm:py-12 grid grid-cols-1 md:grid-cols-[80px_1fr_160px] lg:grid-cols-[100px_1fr_200px] gap-4 sm:gap-6 md:gap-8 items-start cursor-pointer hover:bg-white/[0.01] transition-colors p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-xl"
              onClick={() => setSelectedCourse(course)}
            >
              
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
                <div>
                  <span className={`inline-block px-2 sm:px-3 py-1 editable-label border rounded-full text-xs ${course.isFree ? 'border-white !text-white' : 'border-white/10 text-white/40'}`}>
                    {course.isFree ? 'Free' : 'Pro'}
                  </span>
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

      {/* Video Player Modal */}
      {selectedCourse && (
        <VideoPlayer 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
        />
      )}
    </div>
  );
}
