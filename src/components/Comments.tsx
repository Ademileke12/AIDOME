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
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up real-time listener for comments
    const unsubscribe = getComments(courseId, (updatedComments) => {
      setComments(updatedComments);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [courseId]);

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
    try {
      await createComment({
        courseId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
        text: commentText.trim(),
        timestamp: new Date(),
      });

      setCommentText('');
      success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      showError('Failed to post comment');
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
    <div className="w-full max-w-4xl mx-auto mt-12">
      <h2 className="text-2xl font-light mb-6 text-white/90">Comments</h2>

      {/* Comment Input */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="mb-8 backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex gap-4">
            <img
              src={user.photoURL || ''}
              alt={user.displayName || 'User'}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/90 placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white/90 rounded-lg transition-colors duration-200 border border-white/10"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <div className="mb-8 backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 text-center text-white/60">
          Please sign in to comment
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 text-center text-white/60"
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
                className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10"
              >
                <div className="flex gap-4">
                  <img
                    src={comment.userPhotoURL || ''}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white/90 font-medium">
                          {comment.userName}
                        </span>
                        <span className="text-white/40 text-sm ml-3">
                          {getRelativeTime(comment.timestamp)}
                        </span>
                      </div>
                      {user && user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="text-white/40 hover:text-red-400 transition-colors duration-200 text-sm disabled:opacity-50"
                        >
                          {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <p className="text-white/70 whitespace-pre-wrap">{comment.text}</p>
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
