import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { X, CreditCard, Info } from 'lucide-react';
import { Course } from '../services/firestore';
import { initializePaystackPayment, convertToSmallestUnit, calculateTotalWithFees, PaystackResponse } from '../services/paystack';
import { recordCoursePurchase } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  course: Course;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ course, onSuccess, onClose }: PaymentModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate total amount including Paystack fees
  const paymentBreakdown = useMemo(() => {
    if (!course.priceAfterTrial || course.priceAfterTrial <= 0) {
      return null;
    }
    return calculateTotalWithFees(course.priceAfterTrial);
  }, [course.priceAfterTrial]);

  const handlePayment = async () => {
    if (!user) {
      setError('You must be signed in to make a purchase');
      return;
    }

    if (!course.priceAfterTrial || course.priceAfterTrial <= 0) {
      setError('Invalid course price');
      return;
    }

    if (!paymentBreakdown) {
      setError('Failed to calculate payment amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use total amount (course price + fees) for payment
      const amountInSmallestUnit = convertToSmallestUnit(paymentBreakdown.totalAmount);
      
      // Initialize Paystack payment
      initializePaystackPayment({
        email: user.email,
        amount: amountInSmallestUnit,
        currency: course.currency || 'NGN',
        metadata: {
          courseId: course.id,
          courseTitle: course.title,
          userId: user.uid,
          userName: user.displayName,
          coursePrice: course.priceAfterTrial,
          paystackFee: paymentBreakdown.paystackFee,
          totalAmount: paymentBreakdown.totalAmount,
        },
        onSuccess: async (response: PaystackResponse) => {
          try {
            // Record purchase in Firestore with total amount paid
            await recordCoursePurchase({
              userId: user.uid,
              courseId: course.id,
              purchaseDate: new Date(),
              paymentReference: response.reference,
              amount: paymentBreakdown.totalAmount, // Store total amount paid
              currency: course.currency || 'NGN',
            });

            setSuccess(true);
            setLoading(false);

            // Wait a moment to show success message, then call onSuccess
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } catch (err) {
            console.error('Error recording purchase:', err);
            setError('Payment successful but failed to record purchase. Please contact support.');
            setLoading(false);
          }
        },
        onCancel: () => {
          setLoading(false);
          setError('Payment was cancelled');
        },
      });
    } catch (err: any) {
      console.error('Error initializing payment:', err);
      setError(err.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md backdrop-blur-xl glass-panel rounded-2xl shadow-2xl p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-theme-secondary hover-theme-primary transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-theme-elevated border border-theme">
                  <CreditCard className="w-6 h-6 text-theme-secondary" />
                </div>
                <h2 className="text-2xl font-light tracking-tight text-theme-primary">Purchase Course</h2>
              </div>
              <p className="text-theme-secondary text-sm">
                Get lifetime access to this course
              </p>
            </div>

            {/* Course details */}
            <div className="p-4 rounded-lg bg-theme-elevated border border-theme space-y-3">
              <h3 className="font-medium text-lg text-theme-primary">{course.title}</h3>
              <p className="text-theme-secondary text-sm line-clamp-2">{course.description}</p>
              
              {/* Price breakdown */}
              {paymentBreakdown && (
                <div className="space-y-2 pt-3 border-t border-theme">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-secondary">Course Price</span>
                    <span className="text-theme-primary">
                      {course.currency || 'NGN'} {paymentBreakdown.coursePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-secondary flex items-center gap-1">
                      Transaction Fee
                      <div className="group relative">
                        <Info className="w-3 h-3 text-theme-tertiary hover-theme-secondary cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 glass-panel rounded text-xs text-theme-secondary z-10">
                          Paystack fee: 1.5% + ₦100 (capped at ₦2,000)
                        </div>
                      </div>
                    </span>
                    <span className="text-theme-primary">
                      {course.currency || 'NGN'} {paymentBreakdown.paystackFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-theme">
                    <span className="text-theme-primary font-medium">Total Amount</span>
                    <span className="text-xl font-light text-theme-primary">
                      {course.currency || 'NGN'} {paymentBreakdown.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Info message about fees */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Transaction fees are automatically included in the total amount. You'll be charged {course.currency || 'NGN'} {paymentBreakdown?.totalAmount.toFixed(2)} which includes the course price and payment processing fees.
              </p>
            </div>

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
              >
                Payment successful! You now have access to this course.
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Payment button */}
            <button
              onClick={handlePayment}
              disabled={loading || success}
              className="w-full py-3 px-6 bg-theme-primary text-theme-surface rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  Processing...
                </>
              ) : success ? (
                'Payment Successful'
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay with Paystack
                </>
              )}
            </button>

            {/* Info text */}
            <p className="text-theme-tertiary text-xs text-center">
              Secure payment powered by Paystack
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
