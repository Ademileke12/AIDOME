import { motion } from 'motion/react';
import { DesignItem, CinematicImage } from '../../data';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  isFree: boolean;
  videoUrl?: string;
}

type ContentType = 'design' | 'cinematic' | 'course';
type ContentItem = DesignItem | CinematicImage | Course;

interface ContentTableProps {
  items: ContentItem[];
  type: ContentType;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onCreate: () => void;
}

export default function ContentTable({ items, type, onEdit, onDelete, onCreate }: ContentTableProps) {
  const getColumns = () => {
    switch (type) {
      case 'design':
        return ['Title', 'Category', 'Premium', 'Actions'];
      case 'cinematic':
        return ['Title', 'Colors', 'Actions'];
      case 'course':
        return ['Title', 'Modules', 'Free', 'Actions'];
      default:
        return [];
    }
  };

  const renderCellContent = (item: ContentItem, column: string) => {
    switch (column) {
      case 'Title':
        return <span className="font-medium">{item.title}</span>;
      
      case 'Category':
        return 'category' in item ? (
          <span className="text-white/60">{item.category}</span>
        ) : null;
      
      case 'Premium':
        return 'isPremium' in item ? (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.isPremium 
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {item.isPremium ? 'Premium' : 'Free'}
          </span>
        ) : null;
      
      case 'Colors':
        return 'colors' in item ? (
          <div className="flex items-center gap-1.5">
            {item.colors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded border border-white/20"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {item.colors.length > 4 && (
              <span className="text-xs text-white/40 ml-1">+{item.colors.length - 4}</span>
            )}
          </div>
        ) : null;
      
      case 'Modules':
        return 'modules' in item ? (
          <span className="text-white/60">{item.modules} modules</span>
        ) : null;
      
      case 'Free':
        return 'isFree' in item ? (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.isFree 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-white/5 text-white/40 border border-white/10'
          }`}>
            {item.isFree ? 'Free' : 'Premium'}
          </span>
        ) : null;
      
      case 'Actions':
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors text-xs sm:text-sm font-medium text-red-300 whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const columns = getColumns();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight">
          {type === 'design' ? 'Designs' : type === 'cinematic' ? 'Cinematics' : 'Courses'}
        </h3>
        <button
          onClick={onCreate}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-lg sm:rounded-xl overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-white/40 text-base sm:text-lg">No {type}s yet</p>
            <p className="text-white/30 text-xs sm:text-sm mt-2">Click "Create New" to add your first {type}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-white/60 tracking-wide uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={column} className="px-4 sm:px-6 py-3 sm:py-4 text-sm">
                        {renderCellContent(item, column)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Count */}
      {items.length > 0 && (
        <p className="text-sm text-white/40 text-center">
          Showing {items.length} {type}{items.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
