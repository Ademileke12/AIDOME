import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
  duration?: number;
}

const Toast = ({ id, type, message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className={colors[type]}>{icons[type]}</div>
        <p className="flex-1 text-sm text-white/90">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="text-white/60 hover:text-white/90 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;
