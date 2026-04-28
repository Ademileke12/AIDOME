import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Comment, getComments, createComment, deleteComment } from '../services/firestore';
import { useToast } from '../contexts/ToastContext';

interface CommentsProps {
  courseId: string;
}

export default function Comments({ courseId }: CommentsProps) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Setting up comments listener for course:', courseId);
    console.log('👤 Current user:', user?.uid);
    
    // Set up real-time listener for comments
    try {
      const unsubscribe = getComments(courseId, (updatedComments) => {
        console.log('📝 Received comments update:', updatedComments.length, 'comments');
        console.log('📋 Comments data:', updatedComments);
        
        setComments(updatedComments);
        setIndexError(null); // Clear any previous errors
      });

      // Cleanup listener on unmount
      return () => {
        console.log('🧹 Cleaning up comments listener');
        unsubscribe();
      };
    } catch (error: any) {
      console.error('❌ Error setting up comments listener:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check if it's an index error
      if (error.message && error.message.includes('index')) {
        setIndexError(error.message);
        showError('Comments require a database index. Check console for details.');
      } else {
        showError('Failed to load comments. Please refresh the page.');
      }
    }
  }, [courseId, showError]);

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      showError('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      showError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    const commentTextToPost = commentText.trim();
    setCommentText(''); // Clear input immediately for better UX
    
    try {
      console.log('📝 Creating comment');
      const commentId = await createComment({
        courseId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        text: commentTextToPost,
        timestamp: new Date(),
      });
      console.log('✅ Comment created with ID:', commentId);
      
      success('Comment posted successfully');
    } catch (error: any) {
      console.error('❌ Error posting comment:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Restore comment text so user can try again
      setCommentText(commentTextToPost);
      
      showError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
      success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showError('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const getRelativeTime = (timestamp: Date): string => {
    const now = new Date();
    const commentDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return commentDate.toLocaleDateString();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 sm:mt-12">
      <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 text-gray-900 dark:text-white px-2 sm:px-0">Comments</h2>

      {/* Index Error Message */}
      {indexError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 backdrop-blur-xl bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-700 dark:text-red-400 font-medium mb-2 text-sm sm:text-base">Database Index Required</h3>
              <p className="text-red-600 dark:text-red-300/80 text-xs sm:text-sm mb-3">
                Comments need a Firestore index to display. This is a one-time setup.
              </p>
              <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-2 sm:p-3 mb-3 overflow-x-auto">
                <p className="text-red-600 dark:text-red-300/70 text-[10px] sm:text-xs font-mono break-all">
                  {indexError}
                </p>
              </div>
              <div className="text-red-600 dark:text-red-300/80 text-xs sm:text-sm space-y-2">
                <p className="font-medium">To fix:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-[11px] sm:text-xs">
                  <li>Look for a link in the error above</li>
                  <li>Click the link to open Firebase Console</li>
                  <li>Click "Create Index"</li>
                  <li>Wait 1-2 minutes</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-3 text-[10px] sm:text-xs">
                  Or run: <code className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">firebase deploy --only firestore:indexes</code>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comment Input */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="mb-6 sm:mb-8 backdrop-blur-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-2 sm:mx-0 shadow-lg"
        >
          <div className="flex gap-3 sm:gap-4">
            <img
              src={user.photoURL || ''}
              alt={user.displayName || 'User'}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 border-2 border-gray-300 dark:border-white/20"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/10 resize-none transition-all duration-200"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-all duration-200 border border-gray-300 dark:border-white/20 font-medium"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <div className="mb-6 sm:mb-8 backdrop-blur-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center text-gray-600 dark:text-white/60 text-sm sm:text-base mx-2 sm:mx-0">
          Please sign in to comment
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-gray-600 dark:text-white/60 text-sm sm:text-base"
          >
            No comments yet. Be the first to comment!
          </motion.div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="backdrop-blur-xl bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-400 dark:hover:border-white/15 transition-all duration-200"
              >
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={comment.userPhotoURL || ''}
                    alt={comment.userName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 border-2 border-gray-300 dark:border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-gray-900 dark:text-white font-semibold text-sm sm:text-base block truncate">
                          {comment.userName}
                        </span>
                        <span className="text-gray-500 dark:text-white/40 text-xs sm:text-sm">
                          {getRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      {user && user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="text-gray-500 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-xs sm:text-sm disabled:opacity-50 flex-shrink-0 font-medium"
                        >
                          {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-white/70 whitespace-pre-wrap text-sm sm:text-base break-words leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
