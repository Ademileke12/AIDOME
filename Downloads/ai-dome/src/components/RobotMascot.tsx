import { motion } from 'motion/react';

export default function RobotMascot({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      animate={{ y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
      >
        {/* Outer Squircle */}
        <motion.rect 
          x="3" 
          y="3" 
          width="18" 
          height="18" 
          rx="6" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Animated Eyes */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.85, 0.88, 0.91, 1] }}
          style={{ transformOrigin: "12px 12px" }}
        >
          <rect x="8.5" y="9" width="2" height="6" rx="1" fill="currentColor" />
          <rect x="13.5" y="9" width="2" height="6" rx="1" fill="currentColor" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
