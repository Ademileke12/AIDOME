import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from './Comments';
import * as AuthContext from '../contexts/AuthContext';
import * as ToastContext from '../contexts/ToastContext';
import * as firestoreService from '../services/firestore';

// Mock the contexts and services
vi.mock('../contexts/AuthContext');
vi.mock('../contexts/ToastContext');
vi.mock('../services/firestore');

describe('Comments Component', () => {
  const mockCourseId = 'test-course-123';
  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  };

  const mockComments = [
    {
      id: 'comment-1',
      courseId: mockCourseId,
      userId: 'user-123',
      userName: 'Test User',
      userPhotoURL: 'https://example.com/photo.jpg',
      text: 'This is a test comment',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'comment-2',
      courseId: mockCourseId,
      userId: 'user-456',
      userName: 'Another User',
      userPhotoURL: 'https://example.com/photo2.jpg',
      text: 'Another test comment',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  ];

  const mockSuccess = vi.fn();
  const mockError = vi.fn();
  const mockUnsubscribe = vi.fn();

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

    // Mock useToast
    vi.mocked(ToastContext.useToast).mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
    });

    // Mock getComments to return unsubscribe function
    vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
      callback(mockComments);
      return mockUnsubscribe;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State Display', () => {
    it('should display empty state message when there are no comments', async () => {
      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        callback([]);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
      });
    });

    it('should not display empty state when comments exist', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.queryByText('No comments yet. Be the first to comment!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Comment Display', () => {
    it('should display all comments', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
        expect(screen.getByText('Another test comment')).toBeInTheDocument();
      });
    });

    it('should display comment author names', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Another User')).toBeInTheDocument();
      });
    });

    it('should display relative timestamps', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        const timestamps = screen.getAllByText(/ago|just now/);
        expect(timestamps.length).toBeGreaterThan(0);
      });
    });

    it('should display user profile photos', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        const commentImages = images.filter(img => 
          img.getAttribute('src')?.includes('example.com/photo')
        );
        expect(commentImages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Comment Submission', () => {
    it('should allow authenticated users to submit comments', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.createComment).mockResolvedValue('new-comment-id');

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New test comment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(firestoreService.createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            courseId: mockCourseId,
            userId: mockUser.uid,
            userName: mockUser.displayName,
            userPhotoURL: mockUser.photoURL,
            text: 'New test comment',
          })
        );
      });
    });

    it('should show success message after submitting comment', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.createComment).mockResolvedValue('new-comment-id');

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New test comment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('Comment posted successfully');
      });
    });

    it('should clear textarea after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.createComment).mockResolvedValue('new-comment-id');

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...') as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New test comment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });

    it('should not allow empty comment submission', async () => {
      const user = userEvent.setup();

      render(<Comments courseId={mockCourseId} />);

      const submitButton = screen.getByRole('button', { name: /post comment/i });
      
      // Button should be disabled when textarea is empty
      expect(submitButton).toBeDisabled();
      
      // Try to click anyway (won't trigger submit due to disabled state)
      await user.click(submitButton);

      // Verify createComment was not called
      expect(firestoreService.createComment).not.toHaveBeenCalled();
    });

    it('should trim whitespace from comments', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.createComment).mockResolvedValue('new-comment-id');

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, '  Comment with spaces  ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(firestoreService.createComment).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'Comment with spaces',
          })
        );
      });
    });

    it('should show error message when comment submission fails', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.createComment).mockRejectedValue(new Error('Network error'));

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New test comment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to post comment');
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      let resolveCreate: (value: string) => void;
      const createPromise = new Promise<string>((resolve) => {
        resolveCreate = resolve;
      });
      vi.mocked(firestoreService.createComment).mockReturnValue(createPromise);

      render(<Comments courseId={mockCourseId} />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      const submitButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New test comment');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /posting/i })).toBeDisabled();

      resolveCreate!('new-comment-id');
    });

    it('should show sign in message for unauthenticated users', async () => {
      vi.mocked(AuthContext.useAuth).mockReturnValue({
        user: null,
        isAdmin: false,
        loading: false,
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
      });

      render(<Comments courseId={mockCourseId} />);

      expect(screen.getByText('Please sign in to comment')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument();
    });
  });

  describe('Comment Deletion', () => {
    it('should show delete button only for user\'s own comments', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons).toHaveLength(1);
      });
    });

    it('should not show delete button for other users\' comments', async () => {
      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        const commentElements = screen.getAllByText(/test comment/i);
        expect(commentElements).toHaveLength(2);
        
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons).toHaveLength(1);
      });
    });

    it('should delete comment when delete button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.deleteComment).mockResolvedValue();

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(firestoreService.deleteComment).toHaveBeenCalledWith('comment-1');
      });
    });

    it('should show success message after deleting comment', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.deleteComment).mockResolvedValue();

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockSuccess).toHaveBeenCalledWith('Comment deleted successfully');
      });
    });

    it('should show error message when deletion fails', async () => {
      const user = userEvent.setup();
      vi.mocked(firestoreService.deleteComment).mockRejectedValue(new Error('Network error'));

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith('Failed to delete comment');
      });
    });

    it('should disable delete button while deleting', async () => {
      const user = userEvent.setup();
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(firestoreService.deleteComment).mockReturnValue(deletePromise);

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();

      resolveDelete!();
    });
  });

  describe('Real-time Updates', () => {
    it('should set up real-time listener on mount', () => {
      render(<Comments courseId={mockCourseId} />);

      expect(firestoreService.getComments).toHaveBeenCalledWith(
        mockCourseId,
        expect.any(Function)
      );
    });

    it('should update comments when listener receives new data', async () => {
      let updateCallback: (comments: any[]) => void;
      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        updateCallback = callback;
        callback(mockComments);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      });

      const newComments = [
        ...mockComments,
        {
          id: 'comment-3',
          courseId: mockCourseId,
          userId: 'user-789',
          userName: 'New User',
          userPhotoURL: 'https://example.com/photo3.jpg',
          text: 'Brand new comment',
          timestamp: new Date('2024-01-01T14:00:00Z'),
        },
      ];

      updateCallback!(newComments);

      await waitFor(() => {
        expect(screen.getByText('Brand new comment')).toBeInTheDocument();
      });
    });

    it('should clean up listener on unmount', () => {
      const { unmount } = render(<Comments courseId={mockCourseId} />);

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should update listener when courseId changes', () => {
      const { rerender } = render(<Comments courseId={mockCourseId} />);

      expect(firestoreService.getComments).toHaveBeenCalledWith(
        mockCourseId,
        expect.any(Function)
      );

      rerender(<Comments courseId="different-course-id" />);

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(firestoreService.getComments).toHaveBeenCalledWith(
        'different-course-id',
        expect.any(Function)
      );
    });
  });

  describe('Relative Time Display', () => {
    it('should display "just now" for recent comments', async () => {
      const recentComment = {
        ...mockComments[0],
        timestamp: new Date(Date.now() - 30000), // 30 seconds ago
      };

      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        callback([recentComment]);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('just now')).toBeInTheDocument();
      });
    });

    it('should display minutes for comments less than an hour old', async () => {
      const minutesAgoComment = {
        ...mockComments[0],
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        callback([minutesAgoComment]);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
      });
    });

    it('should display hours for comments less than a day old', async () => {
      const hoursAgoComment = {
        ...mockComments[0],
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      };

      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        callback([hoursAgoComment]);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText(/3 hours ago/)).toBeInTheDocument();
      });
    });

    it('should display days for comments less than a week old', async () => {
      const daysAgoComment = {
        ...mockComments[0],
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      };

      vi.mocked(firestoreService.getComments).mockImplementation((courseId, callback) => {
        callback([daysAgoComment]);
        return mockUnsubscribe;
      });

      render(<Comments courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
      });
    });
  });
});
