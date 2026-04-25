import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDesigns } from '../services/firestore';
import { DesignItem } from '../data';
import SEO from '../components/SEO';

type FilterType = 'All' | 'Premium' | 'Free';

export default function Gallery() {
  const [filter, setFilter] = useState<FilterType>('All');
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDesigns() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDesigns();
        setDesigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load designs');
        console.error('Error loading designs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDesigns();
  }, []);
  
  const filteredDesigns = designs.filter(d => {
    if (filter === 'Premium') return d.isPremium;
    if (filter === 'Free') return !d.isPremium;
    return true;
  });

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
      <SEO
        title="Design Gallery - Premium Web Interfaces & UI Components"
        description="Explore our curated collection of premium web design interfaces, UI components, and design patterns. Free and premium templates for modern web projects."
        keywords={[
          'web design gallery',
          'UI components',
          'design patterns',
          'premium templates',
          'web interfaces',
          'design inspiration',
          'UI design',
          'modern web design'
        ]}
        type="website"
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 sm:mb-12 border-b border-white/[0.05] pb-6 sm:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
            The <span className="font-serif italic font-light text-white/40">Archive</span>
          </h1>
          <p className="editable-label mt-4 sm:mt-6 max-w-md text-sm sm:text-base">
            A definitive collection of design patterns, interfaces, and visual systems.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4 sm:gap-6 pb-2">
          {['All', 'Premium', 'Free'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as FilterType)}
              className={`editable-label transition-colors duration-300 relative text-sm sm:text-base ${filter === f ? '!text-white' : 'hover:text-white/80'}`}
            >
              {f}
              {filter === f && (
                <motion.div
                  layoutId="gallery-filter"
                  className="absolute -bottom-2 left-0 right-0 h-[1px] bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="editorial-card px-8 py-6 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="editable-label">Loading designs...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-24">
          <div className="editorial-card px-8 py-6 rounded-lg border border-red-500/20">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">Failed to load designs</p>
                <p className="editable-label">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors editable-label"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div 
        layout
        className="grid grid-cols-1 select-none sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 gap-y-12 sm:gap-y-16"
      >
        <AnimatePresence mode='popLayout'>
          {!loading && !error && filteredDesigns.map((design, i) => (
            <motion.div
              layout
              key={design.id}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              exit={{ y: 20, opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.1 }}
              className="group"
            >
              <Link to={`/design/${design.id}`} className="block relative overflow-hidden editorial-card rounded-lg aspect-square mb-4 sm:mb-6">
                <img 
                  src={design.image} 
                  alt={design.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-lighten"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {design.isPremium ? (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 editorial-card px-2 sm:px-3 py-1 sm:py-1.5 rounded-full z-10 transition-transform group-hover:scale-105">
                    <span className="editable-label !text-white text-xs">Premium</span>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/5 border border-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full z-10 transition-transform group-hover:scale-105">
                    <span className="editable-label !text-white/60 text-xs">Free</span>
                  </div>
                )}
              </Link>
              <div className="flex justify-between items-start px-1 sm:px-2">
                <div>
                  <motion.h3 
                    layout="position"
                    className="text-base sm:text-lg font-medium tracking-tight group-hover:text-white/80 transition-colors"
                  >
                    {design.title}
                  </motion.h3>
                  <motion.p layout="position" className="editable-label mt-2 text-xs sm:text-sm">{design.category}</motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
