import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, BarChart3, Settings, CreditCard, PieChart, MoreHorizontal, ShoppingBag } from 'lucide-react';
import { THEME_COLORS, applyThemeColor } from '../constants/colors';

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
                <item.icon className="w-5 h-5" />
      </motion.div>
    </>
  );
};