import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCinematicById } from '../services/firestore';
import { CinematicImage } from '../data';

export default function CinematicDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<CinematicImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCinematic = async () => {
      if (!id) {
        setError('No cinematic ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCinematicById(id);
        if (data) {
          setItem(data);
        } else {
          setError('Image Blueprint Not Found');
        }
      } catch (err) {
        console.error('Error fetching cinematic:', err);
        setError('Failed to load cinematic');
      } finally {
        setLoading(false);
      }
    };

    fetchCinematic();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-theme border-t-theme-primary rounded-full animate-spin" />
          <p className="text-theme-secondary">Loading cinematic...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-theme-elevated flex items-center justify-center">
            <svg className="w-8 h-8 text-theme-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-theme-secondary text-lg mb-6">{error || 'Image Blueprint Not Found'}</p>
          <Link 
            to="/cinematic" 
            className="inline-flex items-center px-6 py-3 bg-theme-elevated hover:bg-theme-elevated border border-theme rounded-lg transition-colors editable-label"
          >
            ← Back to Cinematic Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
      <Link to="/cinematic" className="inline-flex items-center editable-label hover-theme-primary transition-colors mb-12">
        ← Back to Cinematic Archive
      </Link>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
        className="flex flex-col gap-12"
      >
        <div className="relative overflow-hidden editorial-card rounded-xl aspect-[21/9] w-full shadow-2xl">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover opacity-90" 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-theme pt-12">
          
          {/* Metadata Frame */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">
                {item.title}
              </h1>
              <div className="editable-label !text-theme-tertiary">Prompt Engineering Data</div>
            </div>
            
            <div className="flex flex-col gap-8">
               <div>
                 <span className="editable-label !text-[10px] !text-theme-tertiary mb-3 block">Color Palette Extraction</span>
                 <div className="flex gap-4">
                   {item.colors.map(c => (
                     <div 
                        key={c} 
                        className="w-10 h-10 rounded-full border border-theme shadow-lg flex items-center justify-center group relative" 
                        style={{ backgroundColor: c }}
                      >
                        <span className="absolute -bottom-6 text-[10px] bg-theme-surface px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-theme-secondary border border-theme">{c}</span>
                      </div>
                   ))}
                 </div>
               </div>
               <div>
                 <span className="editable-label !text-[10px] !text-theme-tertiary mb-2 block">Architectural Lighting Blueprint</span>
                 <p className="text-sm font-sans text-theme-secondary leading-relaxed text-balance">
                   {item.lighting}
                 </p>
               </div>
            </div>
          </div>
          
          {/* Prompt Detail */}
          <div className="lg:col-span-8">
            <div className="editorial-card p-8 lg:p-12 rounded-xl h-full font-serif italic text-2xl lg:text-3xl leading-relaxed text-theme-primary flex items-center">
              "{item.prompt}"
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
