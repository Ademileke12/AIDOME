import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import FreeTrialTimer from '../components/FreeTrialTimer';
import { Course } from '../services/firestore';

// Mock the firestore module
vi.mock('../services/firestore', async () => {
  const actual = await vi.importActual('../services/firestore');
  return {
    ...actual,
    calculateTrialExpiration: (startDate: Date | undefined, days: number | undefined) => {
      if (!startDate || !days || days <= 0) return null;
      const expiration = new Date(startDate);
      expiration.setDate(expiration.getDate() + days);
      return expiration;
    },
  };
});

describe('Free Trial Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('27.2 Test free trial functionality', () => {
    it('should display countdown timer for active trial', () => {
      const now = new Date();
      const trialStartDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 7,
        freeTrialStartDate: trialStartDate,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      render(<FreeTrialTimer course={course} />);

      // Should show days remaining (6 days since 1 day has passed)
      expect(screen.getByText(/6d/)).toBeInTheDocument();
    });

    it('should update countdown every second', () => {
      const now = new Date();
      const trialStartDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 7,
        freeTrialStartDate: trialStartDate,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      render(<FreeTrialTimer course={course} />);


      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Timer should still be visible and updated
      expect(screen.getByText(/6d/)).toBeInTheDocument();
    });

    it('should show warning styling when less than 24 hours remain', () => {
      const now = new Date();
      const trialStartDate = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000); // 6.5 days ago
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 7,
        freeTrialStartDate: trialStartDate,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      const { container } = render(<FreeTrialTimer course={course} />);

      // Should have warning styling (red colors)
      const timerElement = container.querySelector('.bg-red-500\\/10');
      expect(timerElement).toBeInTheDocument();
    });

    it('should not render when trial has expired', () => {
      const now = new Date();
      const trialStartDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 7,
        freeTrialStartDate: trialStartDate,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      const { container } = render(<FreeTrialTimer course={course} />);

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should not render when no trial is set', () => {
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      const { container } = render(<FreeTrialTimer course={course} />);

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('should display hours and minutes for trials with less than 1 day remaining', () => {
      const now = new Date();
      const trialStartDate = new Date(now.getTime() - 6.9 * 24 * 60 * 60 * 1000); // 6.9 days ago (2.4 hours left)
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 7,
        freeTrialStartDate: trialStartDate,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      render(<FreeTrialTimer course={course} />);

      // Should show hours and minutes (no days)
      expect(screen.getByText(/h/)).toBeInTheDocument();
      expect(screen.getByText(/m/)).toBeInTheDocument();
    });

    it('should handle trial with 0 days correctly', () => {
      const now = new Date();
      
      const course: Course = {
        id: 'course-123',
        title: 'Test Course',
        description: 'Test description',
        modules: 10,
        isFree: false,
        freeTrialDays: 0,
        freeTrialStartDate: now,
        priceAfterTrial: 5000,
        currency: 'NGN',
      };

      const { container } = render(<FreeTrialTimer course={course} />);

      // Should not render anything for 0 day trial
      expect(container.firstChild).toBeNull();
    });
  });
});
