import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  LogOut, 
  Download, 
  Edit3, 
  Plus,
  Menu,
  X
} from 'lucide-react';
import { NotificationCenter, useNotifications } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';

interface MobileDashboardHeaderProps {
  onSignOut: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  onCreateNew?: () => void;
  isExporting?: boolean;
  isSigningOut?: boolean;
  showActions?: boolean;
}

export const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({
  onSignOut,
  onExport,
  onEdit,
  onCreateNew,
  isExporting = false,
  isSigningOut = false,
  showActions = true
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <>
      {/* Mobile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="md:hidden bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-b border-light-border dark:border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300"
      >
        {/* Left section - Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-lime-accent rounded-full flex items-center justify-center">
            <span className="text-light-base dark:text-dark-base font-bold text-sm">FH</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-lime-accent font-editorial">FinanceHub</h1>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            <Bell className="w-5 h-5 text-light-text dark:text-dark-text" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-lime-accent text-light-base dark:text-dark-base text-xs font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </motion.button>

          {/* Menu Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
          >
            {showMenu ? (
              <X className="w-5 h-5 text-light-text dark:text-dark-text" />
            ) : (
              <Menu className="w-5 h-5 text-light-text dark:text-dark-text" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Menu Dropdown */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border shadow-lg z-40"
        >
          <div className="p-4 space-y-3">
            {/* Theme Controls */}
            <div className="flex items-center justify-between p-3 bg-light-glass dark:bg-dark-glass rounded-lg">
              <span className="text-sm font-medium text-light-text dark:text-dark-text">Theme</span>
              <ThemeToggle />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-light-glass dark:bg-dark-glass rounded-lg">
              <span className="text-sm font-medium text-light-text dark:text-dark-text">Color</span>
              <ColorPicker />
            </div>

            {/* Action Buttons */}
            {showActions && (
              <>
                {onExport && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onExport();
                      setShowMenu(false);
                    }}
                    disabled={isExporting}
                    className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg text-light-text dark:text-dark-text hover:bg-lime-accent/10 transition-all disabled:opacity-50"
                  >
                    {isExporting ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
                  </motion.button>
                )}

                {onEdit && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-light-glass dark:bg-dark-glass rounded-lg text-light-text dark:text-dark-text hover:bg-lime-accent/10 transition-all"
                  >
                    <Edit3 className="w-5 h-5" />
                    <span>Edit Budget</span>
                  </motion.button>
                )}

                {onCreateNew && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onCreateNew();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-3 bg-lime-accent text-light-base dark:text-dark-base rounded-lg font-medium hover:shadow-glow transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Budget</span>
                  </motion.button>
                )}
              </>
            )}

            {/* Sign Out */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSignOut();
                setShowMenu(false);
              }}
              disabled={isSigningOut}
              className="w-full flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              {isSigningOut ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
      />
    </>
  );
};