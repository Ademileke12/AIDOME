import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastType } from '../components/Toast';
import { ToastData } from '../components/ToastContainer';

interface ToastContextType {
  toasts: ToastData[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    addToast('success', message);
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast('error', message);
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast('info', message);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
