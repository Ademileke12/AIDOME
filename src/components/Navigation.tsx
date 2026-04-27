import { motion } from 'motion/react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RobotMascot from './RobotMascot';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const { user, isAdmin, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    console.log('🔵 Sign in button clicked');
    try {
      console.log('🔵 Calling signInWithGoogle...');
      await signInWithGoogle();
      console.log('🔵 signInWithGoogle completed - should redirect now');
    } catch (error: any) {
      console.error('🔴 Error signing in:', error);
      console.error('🔴 Error code:', error.code);
      console.error('🔴 Error message:', error.message);
      // Only show alert for non-user-cancelled errors
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Failed to sign in: ${error.message}\nError code: ${error.code}`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.nav 
      aria-label="Main navigation"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-3 sm:gap-8 max-w-[95vw] overflow-x-auto"
    >
      <div className="font-sans font-bold text-xs sm:text-sm tracking-[2px] sm:tracking-[3px] uppercase flex items-center pr-3 sm:pr-4 border-r border-theme whitespace-nowrap">
        <RobotMascot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
        AI dome
      </div>
      
      <ul className="flex items-center gap-3 sm:gap-6">
        {/* Home link - always visible */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => 
              `relative font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase transition-colors duration-300 whitespace-nowrap ${
                isActive ? 'text-theme-primary' : 'text-theme-secondary hover-theme-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                Home
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-[1px] bg-theme-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        </li>

        {/* Show other links only when user is authenticated */}
        {user && (
          <>
            <li>
              <NavLink
                to="/gallery"
                className={({ isActive }) => 
                  `relative font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase transition-colors duration-300 whitespace-nowrap ${
                    isActive ? 'text-theme-primary' : 'text-theme-secondary hover-theme-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Gallery
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-[1px] bg-theme-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/cinematic"
                className={({ isActive }) => 
                  `relative font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase transition-colors duration-300 whitespace-nowrap ${
                    isActive ? 'text-theme-primary' : 'text-theme-secondary hover-theme-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Cinematic
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-[1px] bg-theme-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/learn"
                className={({ isActive }) => 
                  `relative font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase transition-colors duration-300 whitespace-nowrap ${
                    isActive ? 'text-theme-primary' : 'text-theme-secondary hover-theme-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    Learn
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 left-0 right-0 h-[1px] bg-theme-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          </>
        )}
        
        {/* Show Admin link only for admin users */}
        {isAdmin && (
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) => 
                `relative font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase transition-colors duration-300 whitespace-nowrap ${
                  isActive ? 'text-theme-primary' : 'text-theme-secondary hover-theme-primary'
                }`
              }
              >
              {({ isActive }) => (
                <>
                  Admin
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-[1px] bg-theme-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        )}

        {/* Auth buttons */}
        <li className="pl-3 sm:pl-4 border-l border-theme flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-theme overflow-hidden shadow-sm">
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/24'} 
                  alt={user.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleSignOut}
                aria-label="Sign out of your account"
                className="font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-theme-secondary hover:text-theme-primary transition-colors duration-300 whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              aria-label="Sign in with Google"
              className="font-sans font-semibold text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-theme-secondary hover:text-theme-primary transition-colors duration-300 whitespace-nowrap"
            >
              Sign In
            </button>
          )}
        </li>
      </ul>
    </motion.nav>
  );
}
