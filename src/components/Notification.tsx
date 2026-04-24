/**
 * Notification component - wrapper around the toast notification system
 * Provides a consistent interface for displaying notifications throughout the app
 * Uses the existing ToastContext for actual notification display
 */

import { useToast } from '../contexts/ToastContext';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationOptions {
  type: NotificationType;
  message: string;
}

/**
 * Hook to show notifications using the toast system
 * @returns Object with methods to show different types of notifications
 */
export function useNotification() {
  const toast = useToast();

  const showNotification = ({ type, message }: NotificationOptions) => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast.info(message);
        break;
    }
  };

  return {
    showNotification,
    success: toast.success,
    error: toast.error,
    info: toast.info,
  };
}
