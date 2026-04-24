import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Course, calculateTrialExpiration } from '../services/firestore';

interface FreeTrialTimerProps {
  course: Course;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function FreeTrialTimer({ course }: FreeTrialTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = (): TimeRemaining | null => {
      const expirationDate = calculateTrialExpiration(
        course.freeTrialStartDate,
        course.freeTrialDays
      );

      if (!expirationDate) {
        return null;
      }

      const now = new Date().getTime();
      const expiration = expirationDate.getTime();
      const total = expiration - now;

      if (total <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        };
      }

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        total,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [course.freeTrialStartDate, course.freeTrialDays]);

  if (!timeRemaining || timeRemaining.total <= 0) {
    return null;
  }

  // Check if less than 24 hours remain
  const isWarning = timeRemaining.total < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${
        isWarning
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      }`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-xs font-medium">
        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
        {timeRemaining.hours}h {timeRemaining.minutes}m
        {timeRemaining.days === 0 && ` ${timeRemaining.seconds}s`}
      </span>
    </motion.div>
  );
}
