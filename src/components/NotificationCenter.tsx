import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Clock,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'payment_reminder' | 'budget_alert' | 'monthly_report' | 'system_update';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_reminder':
        return <Calendar className="w-5 h-5 text-orange-400" />;
      case 'budget_alert':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'monthly_report':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'system_update':
        return <Settings className="w-5 h-5 text-lime-accent" />;
      default:
        return <Info className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-light-border dark:border-dark-border bg-light-glass dark:bg-dark-glass';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-lime-accent" />
                  <h2 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="bg-lime-accent text-light-base dark:text-dark-base text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-light-glass dark:hover:bg-dark-glass rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
                </motion.button>
              </div>
              
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onMarkAllAsRead}
                  className="text-sm text-lime-accent hover:text-lime-accent/80 transition-colors"
                >
                  Mark all as read
                </motion.button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                  <Bell className="w-16 h-16 text-light-text-secondary dark:text-dark-text-secondary mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                    No notifications
                  </h3>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    You're all caught up! We'll notify you when something important happens.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        notification.isRead 
                          ? 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border opacity-70' 
                          : getPriorityColor(notification.priority)
                      }`}
                      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-semibold text-sm ${
                              notification.isRead 
                                ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                                : 'text-light-text dark:text-dark-text'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-lime-accent rounded-full" />
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notification.id);
                                }}
                                className="p-1 hover:bg-red-400/10 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3 text-red-400" />
                              </motion.button>
                            </div>
                          </div>
                          
                          <p className={`text-sm mt-1 ${
                            notification.isRead 
                              ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                              : 'text-light-text dark:text-dark-text'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.priority === 'high' && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'payment_reminder',
      title: 'Rent Payment Due Soon',
      message: 'Your rent payment of 2,500 LEI is due in 2 days (July 10th)',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'budget_alert',
      title: 'Budget Limit Exceeded',
      message: 'You have exceeded your Food & Groceries budget by 15% this month',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'monthly_report',
      title: 'June Budget Summary Ready',
      message: 'Your monthly budget report is ready. You saved 18% of your income!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'system_update',
      title: 'New Feature: Payment Tracker',
      message: 'Track your monthly bills and due dates with our new Payment Tracker feature',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      isRead: false,
      priority: 'low'
    }
  ]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};