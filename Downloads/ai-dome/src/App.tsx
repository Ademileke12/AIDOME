/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import GrainOverlay from './components/GrainOverlay';
import ToastContainer from './components/ToastContainer';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Learn from './pages/Learn';
import DesignDetail from './pages/DesignDetail';
import CinematicGallery from './pages/CinematicGallery';
import CinematicDetail from './pages/CinematicDetail';
import AdminDashboard from './pages/AdminDashboard';
import SignIn from './pages/SignIn';

// Wrapper for animated routes
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path="/cinematic" element={<ProtectedRoute><CinematicGallery /></ProtectedRoute>} />
        <Route path="/cinematic/:id" element={<ProtectedRoute><CinematicDetail /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/design/:id" element={<ProtectedRoute><DesignDetail /></ProtectedRoute>} />
        
        {/* Admin route - requires authentication and admin privileges */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

// Wrapper component to access toast context
function AppContent() {
  const { toasts, removeToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      
      {!isLoading && (
        <Router>
          <div className="relative antialiased selection:bg-white/20">
            <CustomCursor />
            <GrainOverlay />
            <Navigation />
            <ToastContainer toasts={toasts} onClose={removeToast} />
            
            <main>
              <AnimatedRoutes />
            </main>
            
            <Footer />
          </div>
        </Router>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

