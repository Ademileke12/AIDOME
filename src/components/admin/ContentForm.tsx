import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignItem, CinematicImage } from '../../data';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
  thumbnail?: string;
  freeTrialDays?: number;
  freeTrialStartDate?: Date;
  priceAfterTrial?: number;
  currency?: string;
}

type ContentType = 'design' | 'cinematic' | 'course';

interface ContentFormProps {
  type: ContentType;
  initialData?: Partial<DesignItem | CinematicImage | Course>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ContentForm({ type, initialData, onSubmit, onCancel }: ContentFormProps) {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      // Ensure colors array exists for cinematics
      if (type === 'cinematic' && 'colors' in initialData) {
        const colors = Array.isArray(initialData.colors) && initialData.colors.length > 0 
          ? initialData.colors 
          : [''];
        setFormData({ ...initialData, colors });
      } else {
        setFormData(initialData);
      }
      
      if ('image' in initialData && initialData.image) {
        setImagePreview(initialData.image as string);
      }
    } else {
      // Set default values based on type
      if (type === 'design') {
        setFormData({ title: '', category: '', image: '', isPremium: false, prompt: '' });
      } else if (type === 'cinematic') {
        setFormData({ title: '', image: '', prompt: '', colors: [''], lighting: '' });
      } else if (type === 'course') {
        setFormData({ 
          title: '', 
          description: '', 
          modules: 1, 
          isFree: false, 
          videoUrl: '', 
          thumbnail: '',
          freeTrialDays: 0,
          freeTrialHours: 0,
          freeTrialMinutes: 0,
          priceAfterTrial: 0,
          currency: 'USD'
        });
      }
    }
  }, [initialData, type]);

  // Real-time validation
  const validateField = (name: string, value: any): string => {
    // Required text fields
    if (['title', 'category', 'prompt', 'lighting', 'description'].includes(name)) {
      if (!value || value.toString().trim().length < 3) {
        return 'This field must be at least 3 characters';
      }
    }

    // URL validation
    if (name === 'image' || name === 'videoUrl' || name === 'thumbnail') {
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          return 'Please enter a valid URL';
        }
      } else if (name === 'image') {
        return 'Image URL is required';
      }
    }

    // Hex color validation
    if (name === 'colors') {
      if (Array.isArray(value)) {
        for (const color of value) {
          if (color && color.trim() && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color.trim())) {
            return 'All colors must be valid hex codes (e.g., #FF0055 or #F05)';
          }
        }
      }
    }

    // Number validation
    if (name === 'modules') {
      if (!value || value < 1) {
        return 'Modules must be at least 1';
      }
    }

    // Free trial days validation
    if (name === 'freeTrialDays') {
      if (value && value < 0) {
        return 'Free trial days cannot be negative';
      }
    }

    // Price validation
    if (name === 'priceAfterTrial') {
      if (value && value < 0) {
        return 'Price cannot be negative';
      }
    }

    // Currency validation
    if (name === 'currency') {
      if (value && value.trim() && value.trim().length !== 3) {
        return 'Currency must be a 3-letter code (e.g., USD, EUR, NGN)';
      }
    }

    return '';
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [name]: value };
      
      // If setting any trial duration > 0 and no freeTrialStartDate exists, set it to now
      const hasTrial = (name === 'freeTrialDays' && value > 0) || 
                       (name === 'freeTrialHours' && value > 0) || 
                       (name === 'freeTrialMinutes' && value > 0) ||
                       (prev.freeTrialDays > 0) ||
                       (prev.freeTrialHours > 0) ||
                       (prev.freeTrialMinutes > 0);
      
      if (hasTrial && !prev.freeTrialStartDate) {
        updated.freeTrialStartDate = new Date();
      }
      
      // If setting all trial durations to 0, clear the freeTrialStartDate
      if (name === 'freeTrialDays' && value === 0 && !updated.freeTrialHours && !updated.freeTrialMinutes) {
        updated.freeTrialStartDate = null;
      }
      if (name === 'freeTrialHours' && value === 0 && !updated.freeTrialDays && !updated.freeTrialMinutes) {
        updated.freeTrialStartDate = null;
      }
      if (name === 'freeTrialMinutes' && value === 0 && !updated.freeTrialDays && !updated.freeTrialHours) {
        updated.freeTrialStartDate = null;
      }
      
      return updated;
    });
    
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });

    // Update image preview
    if ((name === 'image' || name === 'thumbnail') && value) {
      try {
        new URL(value);
        setImagePreview(value);
      } catch {
        setImagePreview('');
      }
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...(formData.colors || [''])];
    newColors[index] = value;
    handleChange('colors', newColors);
  };

  const addColor = () => {
    const newColors = [...(formData.colors || []), ''];
    handleChange('colors', newColors);
  };

  const removeColor = (index: number) => {
    const newColors = (formData.colors || ['']).filter((_: any, i: number) => i !== index);
    handleChange('colors', newColors.length > 0 ? newColors : ['']);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate all fields based on type
    if (type === 'design') {
      ['title', 'category', 'image', 'prompt'].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    } else if (type === 'cinematic') {
      ['title', 'image', 'prompt', 'lighting'].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
      const colorError = validateField('colors', formData.colors);
      if (colorError) newErrors.colors = colorError;
    } else if (type === 'course') {
      ['title', 'description', 'modules'].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
      if (formData.videoUrl) {
        const urlError = validateField('videoUrl', formData.videoUrl);
        if (urlError) newErrors.videoUrl = urlError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-theme-primary">
            {initialData ? 'Edit' : 'Create'} {type === 'design' ? 'Design' : type === 'cinematic' ? 'Cinematic' : 'Course'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-elevated transition-colors text-theme-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Design Fields */}
          {type === 'design' && (
            <>
              <div>
                <label className="block editable-label mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('title', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, title: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.title ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="Enter title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('category', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, category: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.category ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="e.g., Dashboard, Landing Page"
                />
                {errors.category && (
                  <p className="mt-2 text-sm text-red-400">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('image', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, image: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.image ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && (
                  <p className="mt-2 text-sm text-red-400">{errors.image}</p>
                )}
                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-theme">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPremium || false}
                    onChange={(e) => handleChange('isPremium', e.target.checked)}
                    className="w-5 h-5 rounded border-theme bg-theme-elevated checked:bg-theme-primary checked:border-theme-primary"
                  />
                  <span className="editable-label">Premium Content</span>
                </label>
              </div>

              <div>
                <label className="block editable-label mb-2">Prompt *</label>
                <textarea
                  value={formData.prompt || ''}
                  onChange={(e) => handleChange('prompt', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('prompt', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, prompt: error }));
                  }}
                  rows={4}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.prompt ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors resize-none text-theme-primary placeholder-theme-tertiary`}
                  placeholder="Describe the design prompt..."
                />
                {errors.prompt && (
                  <p className="mt-2 text-sm text-red-400">{errors.prompt}</p>
                )}
              </div>
            </>
          )}

          {/* Cinematic Fields */}
          {type === 'cinematic' && (
            <>
              <div>
                <label className="block editable-label mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('title', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, title: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.title ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="Enter title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Image URL *</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => handleChange('image', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('image', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, image: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.image ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && (
                  <p className="mt-2 text-sm text-red-400">{errors.image}</p>
                )}
                {imagePreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-theme">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Prompt *</label>
                <textarea
                  value={formData.prompt || ''}
                  onChange={(e) => handleChange('prompt', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('prompt', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, prompt: error }));
                  }}
                  rows={4}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.prompt ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors resize-none`}
                  placeholder="Describe the cinematic prompt..."
                />
                {errors.prompt && (
                  <p className="mt-2 text-sm text-red-400">{errors.prompt}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Colors (Hex Codes)</label>
                <div className="space-y-3">
                  {(formData.colors || ['']).map((color: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-theme-elevated border border-theme rounded-lg focus:outline-none focus:border-theme-strong transition-colors"
                        placeholder="#FF0055"
                      />
                      {color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) && (
                        <div
                          className="w-10 h-10 rounded-lg border border-theme"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      {(formData.colors || ['']).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(index)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-theme-elevated transition-colors text-theme-tertiary hover-theme-secondary"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.colors && (
                  <p className="mt-2 text-sm text-red-400">{errors.colors}</p>
                )}
                <button
                  type="button"
                  onClick={addColor}
                  className="mt-3 px-4 py-2 bg-white/5 hover:bg-theme-elevated border border-theme rounded-lg transition-colors editable-label"
                >
                  + Add Color
                </button>
              </div>

              <div>
                <label className="block editable-label mb-2">Lighting Description *</label>
                <textarea
                  value={formData.lighting || ''}
                  onChange={(e) => handleChange('lighting', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('lighting', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, lighting: error }));
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.lighting ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors resize-none`}
                  placeholder="Describe the lighting setup..."
                />
                {errors.lighting && (
                  <p className="mt-2 text-sm text-red-400">{errors.lighting}</p>
                )}
              </div>
            </>
          )}

          {/* Course Fields */}
          {type === 'course' && (
            <>
              <div>
                <label className="block editable-label mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('title', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, title: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.title ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('description', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, description: error }));
                  }}
                  rows={3}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.description ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors resize-none`}
                  placeholder="Describe the course..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-400">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Thumbnail Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.thumbnail || ''}
                  onChange={(e) => handleChange('thumbnail', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('thumbnail', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, thumbnail: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.thumbnail ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="https://example.com/thumbnail.jpg"
                />
                {errors.thumbnail && (
                  <p className="mt-2 text-sm text-red-400">{errors.thumbnail}</p>
                )}
                {formData.thumbnail && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-theme">
                    <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block editable-label mb-2">Number of Modules *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.modules || 1}
                  onChange={(e) => handleChange('modules', parseInt(e.target.value))}
                  onBlur={(e) => {
                    const error = validateField('modules', parseInt(e.target.value));
                    if (error) setErrors((prev) => ({ ...prev, modules: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.modules ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                />
                {errors.modules && (
                  <p className="mt-2 text-sm text-red-400">{errors.modules}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFree || false}
                    onChange={(e) => handleChange('isFree', e.target.checked)}
                    className="w-5 h-5 rounded border-theme bg-white/5 checked:bg-theme-primary checked:border-theme-primary"
                  />
                  <span className="editable-label">Free Course</span>
                </label>
              </div>

              <div>
                <label className="block editable-label mb-2">Video URL (Optional)</label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => handleChange('videoUrl', e.target.value)}
                  onBlur={(e) => {
                    const error = validateField('videoUrl', e.target.value);
                    if (error) setErrors((prev) => ({ ...prev, videoUrl: error }));
                  }}
                  className={`w-full px-4 py-3 bg-theme-elevated border ${errors.videoUrl ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                  placeholder="https://youtube.com/watch?v=... or https://x.com/user/status/..."
                />
                <p className="mt-2 text-xs text-theme-tertiary">
                  Supported: YouTube, Vimeo, X (Twitter), or direct video files (.mp4, .webm, .ogg)
                </p>
                <p className="mt-1 text-xs text-yellow-400/60">
                  Note: X/Twitter broadcasts may require users to sign in to X to view
                </p>
                {errors.videoUrl && (
                  <p className="mt-2 text-sm text-red-400">{errors.videoUrl}</p>
                )}
              </div>

              {/* Monetization Fields */}
              <div className="pt-4 border-t border-theme">
                <h3 className="text-lg font-semibold mb-4">Monetization Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block editable-label mb-3">Free Trial Duration (Optional)</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-theme-secondary mb-2">Days</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.freeTrialDays || 0}
                          onChange={(e) => handleChange('freeTrialDays', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-theme-elevated border border-theme rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-theme-secondary mb-2">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={formData.freeTrialHours || 0}
                          onChange={(e) => handleChange('freeTrialHours', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-theme-elevated border border-theme rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-theme-secondary mb-2">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={formData.freeTrialMinutes || 0}
                          onChange={(e) => handleChange('freeTrialMinutes', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-theme-elevated border border-theme rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-theme-tertiary">
                      Set all to 0 for no trial. Trial starts when you save this form.
                    </p>
                    {formData.freeTrialStartDate && (formData.freeTrialDays > 0 || formData.freeTrialHours > 0 || formData.freeTrialMinutes > 0) && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-300">
                          Trial started: {(() => {
                            try {
                              // Handle Firestore Timestamp objects
                              const date = formData.freeTrialStartDate?.toDate 
                                ? formData.freeTrialStartDate.toDate() 
                                : new Date(formData.freeTrialStartDate);
                              return date.toLocaleString();
                            } catch {
                              return 'Invalid Date';
                            }
                          })()}
                        </p>
                        <p className="text-sm text-blue-300">
                          Duration: {formData.freeTrialDays || 0}d {formData.freeTrialHours || 0}h {formData.freeTrialMinutes || 0}m
                        </p>
                        <p className="text-sm text-blue-300">
                          Expires: {(() => {
                            try {
                              // Handle Firestore Timestamp objects
                              const startDate = formData.freeTrialStartDate?.toDate 
                                ? formData.freeTrialStartDate.toDate() 
                                : new Date(formData.freeTrialStartDate);
                              const expirationDate = new Date(startDate);
                              if (formData.freeTrialDays) expirationDate.setDate(expirationDate.getDate() + formData.freeTrialDays);
                              if (formData.freeTrialHours) expirationDate.setHours(expirationDate.getHours() + formData.freeTrialHours);
                              if (formData.freeTrialMinutes) expirationDate.setMinutes(expirationDate.getMinutes() + formData.freeTrialMinutes);
                              return expirationDate.toLocaleString();
                            } catch {
                              return 'Invalid Date';
                            }
                          })()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block editable-label mb-2">Price After Trial (Optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.priceAfterTrial || 0}
                      onChange={(e) => handleChange('priceAfterTrial', parseFloat(e.target.value) || 0)}
                      onBlur={(e) => {
                        const error = validateField('priceAfterTrial', parseFloat(e.target.value) || 0);
                        if (error) setErrors((prev) => ({ ...prev, priceAfterTrial: error }));
                      }}
                      className={`w-full px-4 py-3 bg-theme-elevated border ${errors.priceAfterTrial ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                      placeholder="0.00"
                    />
                    <p className="mt-2 text-xs text-theme-tertiary">
                      Price to charge after free trial expires (set to 0 for free)
                    </p>
                    {errors.priceAfterTrial && (
                      <p className="mt-2 text-sm text-red-400">{errors.priceAfterTrial}</p>
                    )}
                  </div>

                  <div>
                    <label className="block editable-label mb-2">Currency (Optional)</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={formData.currency || 'USD'}
                      onChange={(e) => handleChange('currency', e.target.value.toUpperCase())}
                      onBlur={(e) => {
                        const error = validateField('currency', e.target.value);
                        if (error) setErrors((prev) => ({ ...prev, currency: error }));
                      }}
                      className={`w-full px-4 py-3 bg-theme-elevated border ${errors.currency ? 'border-red-500/50' : 'border-theme'} rounded-lg focus:outline-none focus:border-theme-strong transition-colors text-theme-primary placeholder-theme-tertiary`}
                      placeholder="USD"
                    />
                    <p className="mt-2 text-xs text-theme-tertiary">
                      3-letter currency code (e.g., USD, EUR, NGN)
                    </p>
                    {errors.currency && (
                      <p className="mt-2 text-sm text-red-400">{errors.currency}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-theme">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-white/5 hover:bg-theme-elevated border border-theme rounded-lg transition-colors editable-label text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:flex-1 px-5 sm:px-6 py-2.5 sm:py-3 bg-theme-primary text-theme-surface rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                initialData ? 'Save Changes' : 'Create'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
