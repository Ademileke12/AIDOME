import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentModal from '../components/PaymentModal';
import * as AuthContext from '../contexts/AuthContext';
import * as paystackService from '../services/paystack';
import * as firestoreService from '../services/firestore';

// Mock the dependencies
vi.mock('../contexts/AuthContext');
vi.mock('../services/paystack');
vi.mock('../services/firestore');

describe('Payment Flow End-to-End Tests', () => {
  const mockCourse: firestoreService.Course = {
    id: 'course-123',
    title: 'Test Course',
    description: 'A test course for payment',
    modules: 10,
    isFree: false,
    priceAfterTrial: 5000,
    currency: 'NGN',
  };

  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAuth
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      isAdmin: false,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });
  });

  describe('27.1 Test payment flow end-to-end', () => {
    it('should initialize Paystack payment with correct parameters', async () => {
      const user = userEvent.setup();
      const mockInitializePayment = vi.fn();
      vi.mocked(paystackService.initializePaystackPayment).mockImplementation(mockInitializePayment);
      vi.mocked(paystackService.convertToSmallestUnit).mockReturnValue(500000);

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(mockInitializePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            email: mockUser.email,
            amount: 500000, // 5000 * 100 (converted to kobo)
            currency: 'NGN',
            metadata: expect.objectContaining({
              courseId: mockCourse.id,
              courseTitle: mockCourse.title,
              userId: mockUser.uid,
              userName: mockUser.displayName,
            }),
          })
        );
      });
    });

    it('should record purchase in Firestore after successful payment', async () => {
      const user = userEvent.setup();
      let paymentSuccessCallback: (response: any) => void;

      vi.mocked(paystackService.initializePaystackPayment).mockImplementation((options) => {
        paymentSuccessCallback = options.onSuccess;
      });

      vi.mocked(firestoreService.recordCoursePurchase).mockResolvedValue('purchase-123');

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      // Simulate successful payment
      await waitFor(() => {
        expect(paymentSuccessCallback!).toBeDefined();
      });

      paymentSuccessCallback!({
        reference: 'ps_test_123',
        status: 'success',
        trans: 'trans_123',
        transaction: 'trans_123',
        trxref: 'ps_test_123',
      });

      await waitFor(() => {
        expect(firestoreService.recordCoursePurchase).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUser.uid,
            courseId: mockCourse.id,
            paymentReference: 'ps_test_123',
            amount: mockCourse.priceAfterTrial,
            currency: mockCourse.currency,
          })
        );
      });
    });

    it('should call onSuccess callback after purchase is recorded', async () => {
      const user = userEvent.setup();
      let paymentSuccessCallback: (response: any) => void;

      vi.mocked(paystackService.initializePaystackPayment).mockImplementation((options) => {
        paymentSuccessCallback = options.onSuccess;
      });

      vi.mocked(firestoreService.recordCoursePurchase).mockResolvedValue('purchase-123');

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(paymentSuccessCallback!).toBeDefined();
      });

      paymentSuccessCallback!({
        reference: 'ps_test_123',
        status: 'success',
        trans: 'trans_123',
        transaction: 'trans_123',
        trxref: 'ps_test_123',
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should handle payment cancellation', async () => {
      const user = userEvent.setup();
      let paymentCancelCallback: () => void;

      vi.mocked(paystackService.initializePaystackPayment).mockImplementation((options) => {
        paymentCancelCallback = options.onCancel;
      });

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(paymentCancelCallback!).toBeDefined();
      });

      paymentCancelCallback!();

      await waitFor(() => {
        expect(screen.getByText(/payment was cancelled/i)).toBeInTheDocument();
      });
    });

    it('should handle payment initialization failure', async () => {
      const user = userEvent.setup();
      vi.mocked(paystackService.initializePaystackPayment).mockImplementation(() => {
        throw new Error('Paystack initialization failed');
      });

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByText(/paystack initialization failed/i)).toBeInTheDocument();
      });
    });

    it('should handle Firestore recording failure after successful payment', async () => {
      const user = userEvent.setup();
      let paymentSuccessCallback: (response: any) => void;

      vi.mocked(paystackService.initializePaystackPayment).mockImplementation((options) => {
        paymentSuccessCallback = options.onSuccess;
      });

      vi.mocked(firestoreService.recordCoursePurchase).mockRejectedValue(
        new Error('Firestore error')
      );

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(paymentSuccessCallback!).toBeDefined();
      });

      paymentSuccessCallback!({
        reference: 'ps_test_123',
        status: 'success',
        trans: 'trans_123',
        transaction: 'trans_123',
        trxref: 'ps_test_123',
      });

      await waitFor(() => {
        expect(screen.getByText(/payment successful but failed to record purchase/i)).toBeInTheDocument();
      });
    });

    it('should prevent payment if user is not signed in', async () => {
      const user = userEvent.setup();
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        isAdmin: false,
        loading: false,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      });

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByText(/you must be signed in to make a purchase/i)).toBeInTheDocument();
      });

      expect(paystackService.initializePaystackPayment).not.toHaveBeenCalled();
    });

    it('should prevent payment if course price is invalid', async () => {
      const user = userEvent.setup();
      const invalidCourse = { ...mockCourse, priceAfterTrial: 0 };

      render(
        <PaymentModal
          course={invalidCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid course price/i)).toBeInTheDocument();
      });

      expect(paystackService.initializePaystackPayment).not.toHaveBeenCalled();
    });

    it('should display course details correctly', () => {
      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
      expect(screen.getByText(mockCourse.description)).toBeInTheDocument();
      expect(screen.getByText(/NGN 5000\.00/)).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable payment button while processing', async () => {
      const user = userEvent.setup();
      let resolvePayment: (value: string) => void;
      const paymentPromise = new Promise<string>((resolve) => {
        resolvePayment = resolve;
      });

      vi.mocked(paystackService.initializePaystackPayment).mockImplementation(() => {});
      vi.mocked(firestoreService.recordCoursePurchase).mockReturnValue(paymentPromise);

      render(
        <PaymentModal
          course={mockCourse}
          onSuccess={mockOnSuccess}
          onClose={mockOnClose}
        />
      );

      const payButton = screen.getByRole('button', { name: /pay with paystack/i });
      await user.click(payButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
      });

      resolvePayment!('purchase-123');
    });
  });
});
