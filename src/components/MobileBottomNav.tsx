import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, BarChart3, Settings, Palette, CreditCard, PieChart, MoreHorizontal, ShoppingBag } from 'lucide-react';
import { THEME_COLORS, applyThemeColor } from '../constants/colors';

interface MobileBottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'budget', label: 'Budget', icon: Calculator },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'exchange', label: 'Exchange', icon: TrendingUp },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeSection, onSectionChange }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  const handleColorChange = (color: typeof THEME_COLORS[0]) => {
    setSelectedColor(color);
    applyThemeColor(color);
    setShowColorPicker(false);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleMoreItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Modal */}
      <AnimatePresence>
        {false && showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setShowMoreMenu(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-light-surface dark:bg-dark-surface rounded-t-2xl p-6 w-full max-w-md mx-4 mb-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">More Options</h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="text-light-text-secondary dark:text-dark-text-secondary text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoreItemClick('shopping')}
                  className={`flex flex-col items-center space-y-3 p-4 rounded-xl border-2 transition-all ${
                    activeSection === 'shopping'
                      ? 'border-lime-accent bg-lime-accent/10 text-lime-accent'
                      : 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text hover:border-lime-accent/30'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="font-medium">Shopping</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoreItemClick('exchange')}
                  className={`flex flex-col items-center space-y-3 p-4 rounded-xl border-2 transition-all ${
                    activeSection === 'exchange'
                      ? 'border-lime-accent bg-lime-accent/10 text-lime-accent'
                      : 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text hover:border-lime-accent/30'
                  }`}
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-medium">Exchange</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoreItemClick('settings')}
                  className={`flex flex-col items-center space-y-3 p-4 rounded-xl border-2 transition-all ${
                    activeSection === 'settings'
                      ? 'border-lime-accent bg-lime-accent/10 text-lime-accent'
                      : 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text hover:border-lime-accent/30'
                  }`}
                >
                  <Settings className="w-6 h-6" />
                  <span className="font-medium">Settings</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-light-surface dark:bg-dark-surface backdrop-blur-glass border-t border-light-border dark:border-dark-border z-40"
      >
        <div className="flex items-center justify-around px-1 py-2 pb-safe">
          {navigation.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex flex-col items-center space-y-1 p-1 rounded-lg transition-all relative min-w-0 flex-1 ${
                activeSection === item.id
                  ? 'text-lime-accent'
                  : 'text-light-text-secondary dark:text-dark-text-secondary'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicatorMobile"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-lime-accent rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </motion.button>
          ))}
          
          {/* More Button */}
          <motion.button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex flex-col items-center space-y-1 p-1 rounded-lg transition-all relative min-w-0 flex-1 text-light-text-secondary dark:text-dark-text-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </motion.button>
        </div>
        
        {/* More Menu */}
        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-0 right-0 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border p-4"
            >
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSectionChange('insights');
                    setShowMoreMenu(false);
                  }}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                    activeSection === 'insights'
                      ? 'bg-lime-accent/10 text-lime-accent'
                      : 'bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text'
                  }`}
                >
                  <PieChart className="w-5 h-5" />
                  <span className="text-xs font-medium">Insights</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSectionChange('shopping');
                    setShowMoreMenu(false);
                  }}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                    activeSection === 'shopping'
                      ? 'bg-lime-accent/10 text-lime-accent'
                      : 'bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-xs font-medium">Shopping</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSectionChange('settings');
                    setShowMoreMenu(false);
                  }}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all ${
                    activeSection === 'settings'
                      ? 'bg-lime-accent/10 text-lime-accent'
                      : 'bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text'
                  }`}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Settings</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};