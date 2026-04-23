import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMagnetic, setIsMagnetic] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Fast spring for the main cursor to smooth out magnetic snaps while feeling instant normally
  const fastSpringConfig = { damping: 30, stiffness: 400, mass: 0.05 };
  const cursorXFast = useSpring(cursorX, fastSpringConfig);
  const cursorYFast = useSpring(cursorY, fastSpringConfig);

  // Slower trailing tail spring
  const slowSpringConfig = { damping: 20, stiffness: 150, mass: 0.2 };
  const cursorXSlow = useSpring(cursorX, slowSpringConfig);
  const cursorYSlow = useSpring(cursorY, slowSpringConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const magneticEl = target.closest('[data-magnetic]') as HTMLElement;

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Pulled toward the center 
        const pullX = (e.clientX - centerX) * 0.15; 
        const pullY = (e.clientY - centerY) * 0.15;
        
        cursorX.set(centerX + pullX);
        cursorY.set(centerY + pullY);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-magnetic]')) {
        setIsMagnetic(true);
        setIsHovered(true);
      } else if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovered(true);
        setIsMagnetic(false);
      } else {
        setIsHovered(false);
        setIsMagnetic(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* The main physical mouse SVG tracking immediate mouse location for aiming */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorXFast,
          y: cursorYFast,
          translateX: '-50%',
          translateY: '-10%', // Top edge of the mouse hits the coordinate
        }}
        animate={{
          scale: isMagnetic ? 1.2 : (isHovered ? 0.95 : 1),
          rotate: isHovered ? -5 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <svg 
          width="40" height="60" viewBox="0 0 40 60" 
          fill="none" xmlns="http://www.w3.org/2000/svg" 
          className="drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]"
        >
          {/* Main Body */}
          <rect x="2" y="2" width="36" height="56" rx="18" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2" className="backdrop-blur-sm" />
          
          {/* Vertical Separator */}
          <path d="M20 2 L20 22" stroke="white" strokeWidth="2" />
          
          {/* Horizontal Separator */}
          <path d="M2 22 L38 22" stroke="white" strokeWidth="2" />

          {/* Left Click indicator (glows on hover to emulate depressing button) */}
          <motion.path 
            d="M 2 20 A 16 16 0 0 1 18 3 H 20 V 22 H 2 Z" 
            animate={{ fill: isHovered ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0)" }}
            transition={{ duration: 0.15 }}
          />

          {/* Scroll Wheel */}
          <motion.rect 
            x="18" y="7" width="4" height="10" rx="2" fill="white"
            animate={{ 
              y: isHovered ? [0, -2, 0] : [0, 4, 0],
              opacity: isHovered ? 1 : 0.6
            }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* Trailing soft glow representing the 'tail' or laser tracking */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9998]"
        style={{
          x: cursorXSlow,
          y: cursorYSlow,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isMagnetic ? 2.5 : (isHovered ? 1.5 : 1),
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
