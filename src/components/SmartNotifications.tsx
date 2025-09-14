import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  DollarSign,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface SmartNotification {
  id: string;
  type: 'payment_due' | 'budget_exceeded' | 'goal_milestone' | 'savings_opportunity' | 'unusual_spending';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actionText?: string;
  actionCallback?: () => void;
  timestamp: Date;
  isRead: boolean;
}

interface SmartNotificationsProps {
  currentUserId: string | null;
  onNavigateToSection?: (section: string) => void;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({ 
  currentUserId, 
  onNavigateToSection 
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      type: 'payment_due',
      title: 'Rent Payment Due Tomorrow',
      message: 'Your rent payment of 2,500 LEI is due tomorrow. Don\'t forget to pay!',
      priority: 'high',
      actionable: true,
      actionText: 'View Payments',
      actionCallback: () => onNavigateToSection?.('payments'),
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false
    },
    {
      id: '2',
      type: 'budget_exceeded',
      title: 'Food Budget Exceeded',
      message: 'You\'ve spent 120% of your food budget this month. Consider adjusting your spending.',
      priority: 'medium',
      actionable: true,
      actionText: 'Review Budget',
      actionCallback: () => onNavigateToSection?.('budget'),
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false
    },
    {
      id: '3',
      type: 'goal_milestone',
      title: 'Goal Milestone Reached!',
      message: 'Congratulations! You\'ve reached 75% of your Emergency Fund goal.',
      priority: 'low',
      actionable: true,
      actionText: 'View Goals',
      actionCallback: () => onNavigateToSection?.('dashboard'),
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      isRead: true
    },
    {
      id: '4',
      type: 'savings_opportunity',
      title: 'Savings Opportunity',
      message: 'You have 1,200 LEI leftover this month. Consider allocating it to your investment goal.',
      priority: 'medium',
      actionable: true,
      actionText: 'Allocate Funds',
      actionCallback: () => onNavigateToSection?.('budget'),
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      isRead: false
    }
  ]);

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'payment_due':
        return <Calendar className="w-5 h-5 text-orange-400" />;
      case 'budget_exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'goal_milestone':
        return <Target className="w-5 h-5 text-lime-accent" />;
      case 'savings_opportunity':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'unusual_spending':
        return <DollarSign className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />;
    }
  };

  const getPriorityColor = (priority: SmartNotification['priority']) => {
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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const highPriorityCount = unreadNotifications.filter(n => n.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-light-surface/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-glass"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-lime-accent" />
            {unreadNotifications.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"
              />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text font-editorial">
              Smart Alerts
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {unreadNotifications.length} unread
              {highPriorityCount > 0 && ` • ${highPriorityCount} urgent`}
            </p>
          </div>
        </div>
        
        {unreadNotifications.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
            className="text-sm text-lime-accent hover:text-lime-accent/80 transition-colors"
          >
            Mark all read
          </motion.button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-lime-accent mx-auto mb-3 opacity-50" />
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              All caught up! No new notifications.
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-5 rounded-xl border transition-all ${
                notification.isRead 
                  ? 'bg-light-glass dark:bg-dark-glass border-light-border dark:border-dark-border opacity-70' 
                  : getPriorityColor(notification.priority)
              }`}
            >
              <div className="flex items-start space-x-4">
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
                    <div className="flex items-center space-x-3 ml-3">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-lime-accent rounded-full" />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dismissNotification(notification.id)}
                        className="p-1 hover:bg-red-400/10 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-red-400" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <p className={`text-sm mt-2 ${
                    notification.isRead 
                      ? 'text-light-text-secondary dark:text-dark-text-secondary' 
                      : 'text-light-text dark:text-dark-text'
                  }`}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    
                    {notification.actionable && notification.actionText && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          notification.actionCallback?.();
                          markAsRead(notification.id);
                        }}
                        className="text-xs bg-lime-accent text-light-base dark:text-dark-base px-3 py-1 rounded-full font-medium hover:shadow-glow transition-all"
                      >
                        {notification.actionText}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};