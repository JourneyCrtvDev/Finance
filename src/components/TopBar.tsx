import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Globe, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ColorPicker } from './ColorPicker';
import { NotificationCenter, useNotifications } from './NotificationCenter';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface TopBarProps {
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSignOut }) => {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setTimeout(() => {
      setIsSigningOut(false);
      onSignOut();
    }, 500);
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-glass border-b border-light-border dark:border-dark-border px-8 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300"
    >
      {/* Left section */}
      <div className="flex items-center space-x-6">
        {/* Search input removed */}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Demo Mode Indicator */}
        {!isSupabaseConfigured && (
          <div className="hidden sm:flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <span className="text-xs text-orange-400 font-medium">Demo Mode</span>
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Color Picker */}
        <div className="hidden sm:block">
          <ColorPicker />
        </div>
        
        {/* Trust indicators */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-light-glass dark:bg-dark-glass px-3 py-2 rounded-full transition-colors duration-300"
          >
            <Globe className="w-4 h-4 text-lime-accent" />
            <span className="text-xs text-light-text dark:text-dark-text">Encrypted</span>
          </motion.div>
        </div>

        {/* Notifications */}
        <div className="relative hidden sm:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-lime-accent/10 transition-colors duration-300"
            title={`${unreadCount} new notifications - Payment reminders, budget alerts, and updates`}
          >
            <Bell className="w-5 h-5 text-light-text dark:text-dark-text" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-lime-accent text-light-base dark:text-dark-base text-xs font-bold rounded-full flex items-center justify-center"
                title={`${unreadCount} new notifications`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </motion.button>
          
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
          />
        </div>

        {/* Sign Out Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="hidden sm:flex items-center space-x-2 p-2 bg-light-glass dark:bg-dark-glass rounded-full hover:bg-red-400/10 hover:text-red-400 transition-colors duration-300 disabled:opacity-50"
        >
          {isSigningOut ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 text-light-text dark:text-dark-text" />
          )}
        </motion.button>

        {/* User avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-8 h-8 md:w-10 md:h-10 bg-lime-accent rounded-full flex items-center justify-center cursor-pointer shadow-glow"
        >
          <span className="text-light-base dark:text-dark-base font-bold text-xs md:text-sm">JD</span>
        </motion.div>
      </div>
    </motion.div>
  );
};