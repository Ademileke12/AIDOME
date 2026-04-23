import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, getCourses, createCourse, updateCourse, deleteCourse } from '../../services/firestore';
import { useToast } from '../../contexts/ToastContext';
import ContentTable from './ContentTable';
import ContentForm from './ContentForm';

export default function CourseManager() {
  const { success, error: showError } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = (course: Course) => {
    setDeletingCourse(course);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingCourse) return;

    try {
      setOperationLoading(true);
      await deleteCourse(deletingCourse.id);
      setCourses(courses.filter(c => c.id !== deletingCourse.id));
      setShowDeleteConfirm(false);
      setDeletingCourse(null);
      success('Course deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setOperationLoading(true);
      
      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse.id, data);
        setCourses(courses.map(c => 
          c.id === editingCourse.id ? { ...c, ...data } : c
        ));
        success('Course updated successfully');
      } else {
        // Create new course
        const newId = await createCourse(data);
        setCourses([...courses, { id: newId, ...data }]);
        success('Course created successfully');
      }
      
      setShowForm(false);
      setEditingCourse(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      setError(errorMessage);
      showError(errorMessage);
      throw err; // Re-throw to let form handle it
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={fetchCourses}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
        >
          {error}
        </motion.div>
      )}

      <ContentTable
        items={courses}
        type="course"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ContentForm
            type="course"
            initialData={editingCourse || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && deletingCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => !operationLoading && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight text-center mb-3">
                Delete Course?
              </h3>
              
              <p className="text-white/60 text-center mb-2">
                Are you sure you want to delete "{deletingCourse.title}"?
              </p>
              
              <p className="text-white/40 text-sm text-center mb-8">
                This action cannot be undone.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={operationLoading}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={operationLoading}
                  className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-300/20 border-t-red-300 rounded-full animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
