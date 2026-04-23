import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import RobotMascot from './RobotMascot';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 6000; // 6 seconds
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300); // Small delay before transitioning
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
      </div>

      {/* Bouncing Mascot */}
      <motion.div
        animate={{ 
          y: [0, -40, 0],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-16"
      >
        <RobotMascot className="w-24 h-24 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8 font-sans font-bold text-sm tracking-[3px] uppercase text-white/60"
      >
        Loading AI Dome
      </motion.div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="h-full bg-white rounded-full"
          style={{
            width: `${progress}%`,
          }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* Progress percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 font-sans text-xs tracking-[2px] text-white/40"
      >
        {Math.round(progress)}%
      </motion.div>
    </motion.div>
  );
}
