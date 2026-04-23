import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCinematics } from '../services/firestore';
import { CinematicImage } from '../data';

export default function CinematicGallery() {
  const [cinematics, setCinematics] = useState<CinematicImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCinematics() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCinematics();
        setCinematics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cinematics');
        console.error('Error loading cinematics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCinematics();
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
        className="mb-8 sm:mb-12 border-b border-white/[0.05] pb-6 sm:pb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
            Cinematic <span className="font-serif italic font-light text-white/40">AI</span>
          </h1>
          <p className="editable-label mt-4 sm:mt-6 max-w-md text-sm sm:text-base">
            An archive of prompt engineering, architectural lighting blueprints, and computational typography.
          </p>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="editorial-card px-8 py-6 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="editable-label">Loading cinematics...</p>
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
                <p className="text-lg font-medium text-white mb-2">Failed to load cinematics</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 gap-y-12 sm:gap-y-16">
        {!loading && !error && cinematics.map((item, i) => (
          <motion.div 
            key={item.id} 
            initial={{ y: 30, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            viewport={{ once: true, margin: "-50px" }} 
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={`/cinematic/${item.id}`} className="group block cursor-pointer">
              <div className="relative overflow-hidden editorial-card rounded-lg sm:rounded-xl aspect-[21/9]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
    </div>
  );
}
