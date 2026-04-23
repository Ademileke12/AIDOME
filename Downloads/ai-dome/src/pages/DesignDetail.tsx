import { motion, AnimatePresence } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDesignById } from '../services/firestore';
import { DesignItem } from '../data';

export default function DesignDetail() {
  const { id } = useParams<{ id: string }>();
  const [design, setDesign] = useState<DesignItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Payment states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchDesign = async () => {
      if (!id) {
        setError('No design ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getDesignById(id);
        if (data) {
          setDesign(data);
        } else {
          setError('Design not found');
        }
      } catch (err) {
        console.error('Error fetching design:', err);
        setError('Failed to load design');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id]);

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock processing delay for the payment
    setTimeout(() => {
      setIsProcessing(false);
      setIsUnlocked(true);
      setShowPayment(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading design...</p>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-sans text-white/60 mb-6">{error || 'Design not found'}</h1>
          <Link 
            to="/gallery" 
            className="inline-flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors editable-label"
          >
            ← Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <Link to="/gallery" className="inline-flex items-center editable-label hover:text-white transition-colors mb-12">
          ← Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Col - Details */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="editorial-h1 text-4xl lg:text-6xl"
              >
                {design.title}
              </motion.h1>
              <div className="flex items-center gap-4 mt-6 flex-wrap">
                <span className="editable-label">
                  {design.category}
                </span>
                {design.isPremium ? (
                  <span className="bg-white text-black px-2 py-0.5 rounded editable-label !text-black flex items-center justify-center">
                    Premium
                  </span>
                ) : (
                  <span className="bg-white/5 border border-white/10 text-white/80 px-2 py-0.5 rounded editable-label flex items-center justify-center">
                    Free
                  </span>
                )}
                
                <div className="flex items-center gap-1.5 editable-label text-white/60 pl-2 border-l border-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>{(parseInt(design.id.replace(/\D/g, '')) * 142 + 87).toLocaleString()} downloads</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-6 editorial-card rounded-xl"
            >
              <h3 className="editable-label mb-4">Prompt Generation</h3>
              <p className="text-sm text-balance text-white/70 leading-relaxed font-sans">
                "{design.prompt}"
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {design.isPremium && !isUnlocked ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayment(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full editable-label tracking-wide transition-colors flex items-center justify-center gap-2"
                  type="button"
                >
                  <span className="font-sans font-bold">Unlock Asset — ₦12,500</span>
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#e5e5e5' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-4 bg-white text-black rounded-full editable-label !text-black transition-colors"
                  type="button"
                >
                  Download Asset
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Col - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8"
          >
            <div className="editorial-card rounded-lg overflow-hidden relative">
               <img 
                src={design.image}
                alt={design.title}
                className="w-full h-auto object-cover opacity-90 mix-blend-lighten"
              />
              {/* Gloss reflection effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            </div>
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0a0a0a] border border-white/[0.05] p-8 md:p-12 max-w-lg w-full shadow-2xl relative"
            >
              <h2 className="text-3xl font-light tracking-tight mb-4">
                Confirm <span className="font-serif italic text-white/40">Download</span>
              </h2>
              <p className="font-sans text-sm text-white/60 leading-relaxed mb-10">
                You are about to download the high-fidelity UI assets and prompt blueprints for <strong className="text-white font-medium">{design.title}</strong>. Are you sure you want to proceed?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-3 editable-label hover:text-white transition-colors text-center"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowConfirm(false);
                    // Add actual download logic here if needed
                  }}
                  className="px-8 py-3 bg-white text-black rounded-full editable-label !text-black hover:bg-white/80 transition-colors text-center"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#111111] border border-white/[0.08] p-8 max-w-md w-full shadow-2xl rounded-2xl relative overflow-hidden"
            >
              {/* Payment Loading State Overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-[#111111]/90 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"
                    />
                    <p className="font-sans text-sm text-white/80">Processing secure payment...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                  <p className="font-sans text-xs text-white/50 uppercase tracking-wider mb-1">Total Amount</p>
                  <h2 className="text-3xl font-sans font-medium">₦12,500</h2>
                </div>
                <button onClick={() => setShowPayment(false)} className="text-white/40 hover:text-white transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/50 px-1">Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-white/50 px-1">Card Information</label>
                  <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/5 border-b border-white/10 px-4 py-3 font-sans text-sm focus:outline-none" />
                    <div className="flex bg-white/5">
                      <input type="text" placeholder="MM/YY" className="w-1/2 border-r border-white/10 bg-transparent px-4 py-3 font-sans text-sm focus:outline-none" />
                      <input type="text" placeholder="CVC" className="w-1/2 bg-transparent px-4 py-3 font-sans text-sm focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handlePayment}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-sans font-bold transition-colors"
              >
                Pay ₦12,500
              </button>
              
              <div className="mt-6 flex justify-center items-center gap-2 text-white/30 text-xs font-sans">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Secured by MockPay
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
