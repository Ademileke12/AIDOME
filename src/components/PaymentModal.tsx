import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { Course } from '../services/firestore';
import { initializePaystackPayment, convertToSmallestUnit, PaystackResponse } from '../services/paystack';
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

  const handlePayment = async () => {
    if (!user) {
      setError('You must be signed in to make a purchase');
      return;
    }

    if (!course.priceAfterTrial || course.priceAfterTrial <= 0) {
      setError('Invalid course price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInSmallestUnit = convertToSmallestUnit(course.priceAfterTrial);
      
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
        },
        onSuccess: async (response: PaystackResponse) => {
          try {
            // Record purchase in Firestore
            await recordCoursePurchase({
              userId: user.uid,
              courseId: course.id,
              purchaseDate: new Date(),
              paymentReference: response.reference,
              amount: course.priceAfterTrial!,
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
          className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-white/5 border border-white/10">
                  <CreditCard className="w-6 h-6 text-white/80" />
                </div>
                <h2 className="text-2xl font-light tracking-tight">Purchase Course</h2>
              </div>
              <p className="text-white/60 text-sm">
                Get lifetime access to this course
              </p>
            </div>

            {/* Course details */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
              <h3 className="font-medium text-lg">{course.title}</h3>
              <p className="text-white/60 text-sm line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white/60 text-sm">Price</span>
                <span className="text-xl font-light">
                  {course.currency || 'NGN'} {course.priceAfterTrial?.toFixed(2)}
                </span>
              </div>
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
              className="w-full py-3 px-6 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
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
            <p className="text-white/40 text-xs text-center">
              Secure payment powered by Paystack
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
