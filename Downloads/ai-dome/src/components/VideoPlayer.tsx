import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Course } from '../services/firestore';

interface VideoPlayerProps {
  course: Course;
  onClose: () => void;
}

export default function VideoPlayer({ course, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Detect video URL type
  const getVideoType = (url: string): 'youtube' | 'vimeo' | 'twitter' | 'direct' | 'unknown' => {
    if (!url) return 'unknown';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    }
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return 'direct';
    }
    return 'unknown';
  };

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Extract video ID from Vimeo URL
  const getVimeoId = (url: string): string | null => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  // Extract tweet ID from Twitter/X URL
  const getTwitterId = (url: string): string | null => {
    // Matches both twitter.com and x.com URLs
    // Examples: 
    // https://twitter.com/username/status/1234567890
    // https://x.com/username/status/1234567890
    // https://x.com/i/broadcasts/1OwGWeQZDemxQ
    
    // Check for broadcast/live stream URLs
    const broadcastRegExp = /(?:twitter\.com|x\.com)\/i\/broadcasts\/([a-zA-Z0-9]+)/;
    const broadcastMatch = url.match(broadcastRegExp);
    if (broadcastMatch) {
      return broadcastMatch[1]; // Return broadcast ID
    }
    
    // Check for regular status URLs
    const statusRegExp = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
    const statusMatch = url.match(statusRegExp);
    return statusMatch ? statusMatch[1] : null;
  };

  // Get embed URL based on video type
  const getEmbedUrl = (): string | null => {
    if (!course.videoUrl) return null;
    
    const videoType = getVideoType(course.videoUrl);
    
    if (videoType === 'youtube') {
      const videoId = getYouTubeId(course.videoUrl);
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0` : null;
    }
    
    if (videoType === 'vimeo') {
      const videoId = getVimeoId(course.videoUrl);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    if (videoType === 'twitter') {
      // For Twitter/X, we'll show the full page in an iframe
      // This works better than the embed widget for broadcasts
      return course.videoUrl;
    }
    
    return null;
  };

  const videoType = course.videoUrl ? getVideoType(course.videoUrl) : 'unknown';
  const embedUrl = getEmbedUrl();

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Pause video when closing
  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8"
        onClick={handleClose}
      >
        {/* Glassmorphism backdrop */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

        {/* Content container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:-top-12 sm:right-0 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors duration-200 z-10 bg-black/50 sm:bg-transparent rounded-full"
            aria-label="Close video player"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Video player card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg sm:rounded-2xl overflow-hidden shadow-2xl">
            {/* Video container */}
            <div className="relative w-full aspect-video bg-black">
              {!course.videoUrl ? (
                // No video URL message
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-white/20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/60 text-base sm:text-lg">Video content unavailable</p>
                    <p className="text-white/40 text-xs sm:text-sm mt-2">
                      This course doesn't have a video URL yet
                    </p>
                  </div>
                </div>
              ) : videoType === 'direct' ? (
                // HTML5 video player for direct video files
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  src={course.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : videoType === 'twitter' && embedUrl ? (
                // Twitter/X content in iframe with fallback
                <div className="relative w-full h-full bg-black">
                  <iframe
                    ref={iframeRef}
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={course.title}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                  
                  {/* Overlay with "Open in X" button */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass-panel rounded-lg p-4">
                      <p className="text-white/80 text-sm mb-3 text-center">
                        Having trouble viewing? X content may require signing in.
                      </p>
                      <a
                        href={course.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors text-center text-sm"
                      >
                        Open in X (Twitter) →
                      </a>
                    </div>
                  </div>
                </div>
              ) : embedUrl ? (
                // iframe for YouTube/Vimeo
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={course.title}
                />
              ) : (
                // Invalid video URL
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-white/20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-white/60 text-base sm:text-lg">Invalid video URL</p>
                    <p className="text-white/40 text-xs sm:text-sm mt-2">
                      The video URL format is not supported
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Course information */}
            <div className="p-4 sm:p-6 md:p-10">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white">
                  {course.title}
                </h2>
                <span className="editable-label whitespace-nowrap sm:pt-2 text-xs sm:text-sm">
                  {String(course.modules).padStart(2, '0')} Modules
                </span>
              </div>
              
              <p className="text-white/60 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Course badge */}
              <div className="mt-4 sm:mt-6">
                <span
                  className={`inline-block px-3 py-1 editable-label border rounded-full text-xs sm:text-sm ${
                    course.isFree
                      ? 'border-white !text-white'
                      : 'border-white/10 text-white/40'
                  }`}
                >
                  {course.isFree ? 'Free' : 'Pro'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
