import { AnimatePresence } from 'framer-motion';
import Toast, { ToastType } from './Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
