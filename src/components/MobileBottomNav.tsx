import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, BarChart3, CreditCard, PieChart, MoreHorizontal, ShoppingBag, Settings, X } from 'lucide-react';
import { useCapacitor } from '../hooks/useCapacitor';

interface MobileBottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'budget', label: 'Budget', icon: Calculator },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

const moreNavigation = [
  { id: 'exchange', label: 'Exchange', icon: TrendingUp },
  { id: 'insights', label: 'Insights', icon: PieChart },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeSection, onSectionChange }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { isNative, isIOS } = useCapacitor();

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
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowMoreMenu(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`fixed bottom-0 left-0 right-0 bg-light-surface dark:bg-dark-surface rounded-t-2xl shadow-2xl z-50 ${
                isNative ? 'pb-safe' : 'mb-20'
              }`}
            >
              {/* Handle bar for iOS-style interaction */}
              {isIOS && (
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1 bg-light-border dark:bg-dark-border rounded-full" />
                </div>
              )}
              
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text font-editorial">More Options</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowMoreMenu(false)}
                    className="p-2 hover:bg-light-glass dark:hover:bg-dark-glass rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {moreNavigation.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoreItemClick(item.id)}
                      className={`flex flex-col items-center space-y-3 p-6 rounded-xl border-2 transition-all min-h-[100px] ${
                        activeSection === item.id
                          ? 'border-lime-accent bg-lime-accent/10 text-lime-accent'
                          : 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass text-light-text dark:text-dark-text hover:border-lime-accent/30'
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`fixed bottom-0 left-0 right-0 bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-glass border-t border-light-border dark:border-dark-border z-40 ${
          isNative ? 'pb-safe' : ''
        }`}
      >
        {/* Safe area indicator for iOS */}
        {isIOS && (
          <div className="absolute bottom-0 left-0 right-0 h-safe bg-light-surface dark:bg-dark-surface" />
        )}
        
        <div className={`flex items-center justify-around px-2 ${
          isNative ? 'py-3' : 'py-2'
        }`}>
          {navigation.map((item) => {
            const isActive = activeSection === item.id || 
              (item.id === 'more' && moreNavigation.some(moreItem => moreItem.id === activeSection));
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={item.id === 'more' ? handleMoreClick : () => onSectionChange(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all min-w-0 min-h-[44px] ${
                  isActive
                    ? 'text-lime-accent bg-lime-accent/10'
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-lime-accent hover:bg-lime-accent/5'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isNative ? 'w-6 h-6' : ''}`} />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-lime-accent rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
                <span className={`text-xs font-medium truncate ${isNative ? 'text-sm' : ''}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};