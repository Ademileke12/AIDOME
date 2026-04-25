import { useState, useEffect, useRef } from 'react';
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
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🔍 Setting up comments listener for course:', courseId);
    console.log('👤 Current user:', user?.uid);
    
    // Set up real-time listener for comments
    try {
      const unsubscribe = getComments(courseId, (updatedComments) => {
        console.log('📝 Received comments update:', updatedComments.length, 'comments');
        console.log('📋 Comments data:', updatedComments);
        
        // Filter out any optimistic comments that have been replaced
        setComments(prevComments => {
          const optimisticIds = prevComments
            .filter(c => c.id.startsWith('temp-'))
            .map(c => c.id);
          
          // If we have optimistic comments and real comments came in,
          // remove optimistic ones that match the new real comments
          if (optimisticIds.length > 0 && updatedComments.length > 0) {
            console.log('🔄 Replacing optimistic comments with real ones');
            return updatedComments;
          }
          
          return updatedComments;
        });
        
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

  // Auto-scroll to new comments
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleSubmitComment = async (e: React.FormEvent) => {
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
    
    // Create optimistic comment for immediate UI update
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`, // Temporary ID
      courseId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhotoURL: user.photoURL || '',
      text: commentText.trim(),
      timestamp: new Date(),
    };
    
    // Add optimistic comment to UI immediately
    setComments(prev => [optimisticComment, ...prev]);
    const commentTextToPost = commentText.trim();
    setCommentText('');
    
    try {
      console.log('📝 Creating comment:', optimisticComment);
      const commentId = await createComment({
        courseId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        text: commentTextToPost,
        timestamp: new Date(),
      });
      console.log('✅ Comment created with ID:', commentId);
      
      // Update the optimistic comment with the real ID
      setComments(prev => prev.map(c => 
        c.id === optimisticComment.id ? { ...c, id: commentId } : c
      ));
      
      success('Comment posted successfully');
    } catch (error: any) {
      console.error('❌ Error posting comment:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      
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
    <div className="w-full max-w-4xl mx-auto mt-8 sm:mt-12 px-2 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-light mb-4 sm:mb-6 text-white/90">Comments</h2>

      {/* Index Error Message */}
      {indexError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-300 font-medium mb-2 text-sm sm:text-base">Database Index Required</h3>
              <p className="text-red-200/80 text-xs sm:text-sm mb-3">
                Comments need a Firestore index to display. This is a one-time setup.
              </p>
              <div className="bg-black/30 rounded-lg p-2 sm:p-3 mb-3">
                <p className="text-red-200/60 text-[10px] sm:text-xs font-mono break-all">
                  {indexError}
                </p>
              </div>
              <div className="text-red-200/80 text-xs sm:text-sm space-y-2">
                <p className="font-medium">To fix:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-xs sm:text-sm">
                  <li>Look for a link in the error above</li>
                  <li>Click the link to open Firebase Console</li>
                  <li>Click "Create Index"</li>
                  <li>Wait 1-2 minutes</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-3 text-[10px] sm:text-xs">
                  Or run: <code className="bg-black/30 px-2 py-1 rounded">firebase deploy --only firestore:indexes</code>
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
          className="mb-6 sm:mb-8 backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
        >
          <div className="flex gap-3 sm:gap-4">
            <img
              src={user.photoURL || ''}
              alt={user.displayName || 'User'}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white/90 placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2 sm:mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white/90 rounded-lg transition-colors duration-200 border border-white/10"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <div className="mb-6 sm:mb-8 backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 text-center text-white/60 text-sm sm:text-base">
          Please sign in to comment
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 text-center text-white/60 text-sm sm:text-base"
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
                className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
              >
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={comment.userPhotoURL || ''}
                    alt={comment.userName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 sm:mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-white/90 font-medium text-sm sm:text-base block truncate">
                          {comment.userName}
                        </span>
                        <span className="text-white/40 text-xs sm:text-sm block">
                          {getRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      {user && user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="text-white/40 hover:text-red-400 transition-colors duration-200 text-xs sm:text-sm disabled:opacity-50 flex-shrink-0"
                        >
                          {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <p className="text-white/70 whitespace-pre-wrap text-sm sm:text-base break-words">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
}
