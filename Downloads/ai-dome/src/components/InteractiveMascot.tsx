import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';

export default function InteractiveMascot({ className = "w-32 h-32" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid, organic eye movement
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  // Map the max detection distance (400px) to SVG coordinate bounds (±4 units max)
  const eyeOffsetX = useTransform(smoothX, [-400, 400], [-5, 5]);
  const eyeOffsetY = useTransform(smoothY, [-400, 400], [-2.5, 2.5]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate exact center of the mascot on screen
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      const dist = Math.sqrt(distX * distX + distY * distY);
      const maxDist = 500; // Detection radius in pixels
      
      // If mouse is within range, look at it. Otherwise, return eyes to center (0,0)
      if (dist < maxDist) {
        mouseX.set(distX);
        mouseY.set(distY);
      } else {
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <motion.div 
        className="w-full h-full"
        animate={{ y: [0, -6, 0] }} // Larger floating effect for the big version
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
        >
          {/* Outer Squircle */}
          <rect 
            x="3" 
            y="3" 
            width="18" 
            height="18" 
            rx="6" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          />
          
          {/* Interactive Eyes Group mapping to mouse offset */}
          <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
            {/* Blinking Animation Layer */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.85, 0.88, 0.91, 1] }}
              style={{ transformOrigin: "12px 12px" }}
            >
              <rect x="8.5" y="9" width="2" height="6" rx="1" fill="currentColor" />
              <rect x="13.5" y="9" width="2" height="6" rx="1" fill="currentColor" />
            </motion.g>
          </motion.g>

        </svg>
      </motion.div>
    </div>
  );
}
