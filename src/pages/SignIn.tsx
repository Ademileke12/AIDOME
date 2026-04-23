import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect to intended page after successful sign in
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background abstract glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] sm:w-[60vw] h-[80vw] sm:h-[60vw] max-w-[600px] max-h-[600px] bg-white/[0.02] rounded-full blur-[100px] sm:blur-[120px]" />
      
      {/* Sign In Card */}
      <motion.div
        initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel rounded-xl sm:rounded-2xl p-8 sm:p-12 backdrop-blur-xl">
          {/* AI Dome Branding */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
              AI <span className="font-serif italic font-light text-white/40">Dome</span>
            </h1>
            <p className="editable-label !text-white/40 text-sm sm:text-base">
              Premium Design Portfolio
            </p>
          </motion.div>

          {/* Sign In Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-4 bg-white text-black rounded-full font-medium text-sm tracking-wide hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  {/* Google Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <p className="text-sm text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 sm:mt-8 text-center text-xs text-white/30 leading-relaxed px-2"
          >
            By signing in, you agree to access premium design resources and curated content.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
