import { useState } from 'react';
import { motion } from 'motion/react';
import DesignManager from '../components/admin/DesignManager';
import CinematicManager from '../components/admin/CinematicManager';
import CourseManager from '../components/admin/CourseManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'designs' | 'cinematics' | 'courses'>('designs');

  const tabs = [
    { id: 'designs' as const, label: 'Designs' },
    { id: 'cinematics' as const, label: 'Cinematics' },
    { id: 'courses' as const, label: 'Courses' },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 sm:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3 sm:mb-4">
          Admin <span className="font-serif italic text-white/40">Dashboard</span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg">Manage your content across all collections</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 sm:mb-12 overflow-x-auto"
      >
        <div className="glass-panel rounded-xl p-2 inline-flex gap-2 min-w-full sm:min-w-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium tracking-tight transition-all duration-300 text-sm sm:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-black'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {activeTab === 'designs' && <DesignManager />}
        {activeTab === 'cinematics' && <CinematicManager />}
        {activeTab === 'courses' && <CourseManager />}
      </motion.div>
    </div>
  );
}
