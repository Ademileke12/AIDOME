import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignItem } from '../../data';
import { getDesigns, createDesign, updateDesign, deleteDesign } from '../../services/firestore';
import { useToast } from '../../contexts/ToastContext';
import ContentTable from './ContentTable';
import ContentForm from './ContentForm';

export default function DesignManager() {
  const { success, error: showError } = useToast();
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDesign, setDeletingDesign] = useState<DesignItem | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Fetch designs on mount
  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDesigns();
      setDesigns(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch designs';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDesign(null);
    setShowForm(true);
  };

  const handleEdit = (design: DesignItem) => {
    setEditingDesign(design);
    setShowForm(true);
  };

  const handleDelete = (design: DesignItem) => {
    setDeletingDesign(design);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingDesign) return;

    try {
      setOperationLoading(true);
      await deleteDesign(deletingDesign.id);
      setDesigns(designs.filter(d => d.id !== deletingDesign.id));
      setShowDeleteConfirm(false);
      setDeletingDesign(null);
      success('Design deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete design';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setOperationLoading(true);
      
      if (editingDesign) {
        // Update existing design
        await updateDesign(editingDesign.id, data);
        setDesigns(designs.map(d => 
          d.id === editingDesign.id ? { ...d, ...data } : d
        ));
        success('Design updated successfully');
      } else {
        // Create new design
        const newId = await createDesign(data);
        setDesigns([...designs, { id: newId, ...data }]);
        success('Design created successfully');
      }
      
      setShowForm(false);
      setEditingDesign(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save design';
      setError(errorMessage);
      showError(errorMessage);
      throw err; // Re-throw to let form handle it
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDesign(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60">Loading designs...</p>
        </div>
      </div>
    );
  }

  if (error && designs.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={fetchDesigns}
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
        items={designs}
        type="design"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
      />

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ContentForm
            type="design"
            initialData={editingDesign || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && deletingDesign && (
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
                Delete Design?
              </h3>
              
              <p className="text-white/60 text-center mb-2">
                Are you sure you want to delete "{deletingDesign.title}"?
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
