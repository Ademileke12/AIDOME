import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDesigns, getCourses, getCinematics } from '../services/firestore';
import { DesignItem, CinematicImage } from '../data';
import { Course } from '../services/firestore';

export default function Home() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  
  // State for fetched data
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cinematicImages, setCinematicImages] = useState<CinematicImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [designsData, coursesData, cinematicsData] = await Promise.all([
          getDesigns(),
          getCourses(),
          getCinematics()
        ]);
        setDesigns(designsData);
        setCourses(coursesData);
        setCinematicImages(cinematicsData);
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Overall container scroll for existing opacity logic
  const { scrollYProgress: pageScroll } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Specific hero scroll for accurate parallax
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(pageScroll, [0, 0.5], [1, 0]);
  
  // Parallax transform for the background image
  const bgImageY = useTransform(heroScroll, [0, 1], ["0%", "35%"]);
  // Subtle counter-parallax for the content for extra depth
  const contentY = useTransform(heroScroll, [0, 1], ["0%", "-15%"]);

  // Mix courses for the featured view (alternate free and paid roughly to get 7)
  const freeCourses = courses.filter(c => c.isFree);
  const paidCourses = courses.filter(c => !c.isFree);
  const mixedCourses = [];
  for(let i=0; i<4; i++) {
    if(freeCourses[i]) mixedCourses.push(freeCourses[i]);
    if(mixedCourses.length < 7 && paidCourses[i]) mixedCourses.push(paidCourses[i]);
  }

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden -mt-16 sm:mt-0">
        {/* Abstract 3D Background - Emulated with CSS and image */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 z-0 flex items-center justify-center"
        >
          {/* Main abstract focal point */}
          <div className="relative w-full h-full max-w-[1200px] max-h-[800px] flex items-center justify-center">
            {/* Soft volumetric glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[60vw] h-[95vw] sm:h-[60vw] max-w-[800px] max-h-[800px] bg-white/[0.03] rounded-full blur-[120px]" />
            
            {/* The abstract image acting as the 3D chrome/glass object */}
            <motion.img 
              style={{ y: bgImageY }}
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 0.6, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
              alt="Abstract 3D Shape"
              className="relative z-10 w-[95vw] sm:w-3/4 object-contain mix-blend-screen opacity-60"
            />
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div style={{ y: contentY }} className="relative z-10 text-center px-4 sm:px-6 mt-0 sm:mt-20">
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1] text-balance"
          >
            Design <br />
            <span className="font-serif italic font-light text-white/40">Without</span> <br />
            Compromise
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 sm:mt-8 editable-label max-w-sm mx-auto text-sm sm:text-base"
          >
            A curated gallery of premium, intentional web interfaces and components.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 sm:mt-12"
          >
            <Link 
              to="/gallery" 
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 glass-panel rounded-full text-xs font-medium tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-500"
            >
              Explore Gallery
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="editable-label !text-[9px] !text-white/30">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Featured Gallery */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-16 border-b border-white/[0.05] pb-6 sm:pb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight">
            Featured <span className="font-serif italic text-white/40">Works</span>
          </h2>
          <Link to="/gallery" className="editable-label !text-xs hover:text-white transition-colors">
            View All +
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading designs...</p>
            </div>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/40">No designs available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            {designs.slice(0, 4).map((design, i) => (
            <motion.div
              key={design.id}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <Link to={`/design/${design.id}`} className="block relative overflow-hidden editorial-card rounded-lg aspect-[4/3] mb-4 sm:mb-6">
                <img 
                  src={design.image} 
                  alt={design.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-lighten"
                />
                {/* Glow Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {design.isPremium ? (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 editorial-card px-2 sm:px-3 py-1 sm:py-1.5 rounded-full z-10">
                    <span className="editable-label !text-white text-xs">Premium</span>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/5 border border-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full z-10">
                    <span className="editable-label !text-white/60 text-xs">Free</span>
                  </div>
                )}
              </Link>
              <div className="flex justify-between items-start px-1">
                <div>
                  <motion.h3 
                    initial={{ y: 15, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                    className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight group-hover:text-white/80 transition-colors"
                  >
                    {design.title}
                  </motion.h3>
                  <p className="editable-label mt-2 text-xs sm:text-sm">{design.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* Featured Courses */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-16 border-b border-white/[0.05] pb-6 sm:pb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight">
            Featured <span className="font-serif italic text-white/40">Courses</span>
          </h2>
          <Link to="/learn" className="editable-label !text-xs hover:text-white transition-colors">
            View Syllabus +
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/40">No courses available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mixedCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="editorial-card rounded-xl group hover:border-white/20 transition-colors flex flex-col h-full overflow-hidden"
            >
              {/* Thumbnail Image */}
              {course.thumbnail ? (
                <div className="relative w-full aspect-video overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className={`absolute top-3 right-3 inline-block px-2 sm:px-3 py-0.5 sm:py-1 backdrop-blur-sm rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold ${course.isFree ? 'bg-white/10 border border-white/20 text-white' : 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-indigo-200 border border-indigo-400/50'}`}>
                    {course.isFree ? 'Free' : 'Premium'}
                  </span>
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-white/5 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className={`absolute top-3 right-3 inline-block px-2 sm:px-3 py-0.5 sm:py-1 backdrop-blur-sm rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold ${course.isFree ? 'bg-white/10 border border-white/20 text-white' : 'bg-gradient-to-r from-blue-600/40 to-indigo-600/40 text-indigo-200 border border-indigo-400/50'}`}>
                    {course.isFree ? 'Free' : 'Premium'}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="editable-label !text-white/40 text-xs sm:text-sm">
                    {String(course.modules).padStart(2, '0')} Modules
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-medium tracking-tight mb-2 sm:mb-3 group-hover:text-white/80 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed font-sans mb-6 sm:mb-8 flex-grow line-clamp-3">
                  {course.description}
                </p>
                <Link 
                  to="/learn" 
                  className="mt-auto inline-flex items-center text-xs font-medium tracking-widest uppercase text-white/40 group-hover:text-white transition-colors"
                >
                  Enroll Now <span className="ml-2">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* Cinematic Preview */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto border-t border-white/[0.05]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-16 border-b border-white/[0.05] pb-6 sm:pb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-tight">
            Cinematic <span className="font-serif italic text-white/40">Environments</span>
          </h2>
          <Link to="/cinematic" className="editable-label !text-xs hover:text-white transition-colors">
            Explore Archive +
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading cinematics...</p>
            </div>
          </div>
        ) : cinematicImages.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/40">No cinematics available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {cinematicImages.slice(0, 2).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/cinematic/${item.id}`} className="group block cursor-pointer">
                <div className="relative overflow-hidden editorial-card rounded-xl aspect-[21/9]">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center px-1 gap-2">
                  <h3 className="text-lg sm:text-xl font-medium tracking-tight group-hover:text-white/80 transition-colors">
                    {item.title}
                  </h3>
                  <span className="editable-label !text-xs !text-white/40 group-hover:!text-white transition-colors whitespace-nowrap">
                    View Data Blueprint →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}
